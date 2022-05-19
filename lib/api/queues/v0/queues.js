"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queues = exports.ReceivedTask = exports.Queue = exports.Queueing = void 0;
const tslib_1 = require("tslib");
// Copyright 2021, Nitric Technologies Pty Ltd.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
const queue_grpc_pb_1 = require("@nitric/api/proto/queue/v1/queue_grpc_pb");
const queue_pb_1 = require("@nitric/api/proto/queue/v1/queue_pb");
const constants_1 = require("../../../constants");
const grpc = tslib_1.__importStar(require("@grpc/grpc-js"));
const struct_pb_1 = require("google-protobuf/google/protobuf/struct_pb");
const errors_1 = require("../../errors");
/** @internal */
function taskToWire(task) {
    const wireTask = new queue_pb_1.NitricTask();
    wireTask.setId(task.id);
    wireTask.setPayloadType(task.payloadType);
    wireTask.setPayload(struct_pb_1.Struct.fromJavaScript(task.payload));
    return wireTask;
}
function newQueueServiceClient() {
    return new queue_grpc_pb_1.QueueServiceClient(constants_1.SERVICE_BIND, grpc.ChannelCredentials.createInsecure());
}
/**
 * Nitric queue client, facilitates pushing and popping to distributed queues.
 */
class Queueing {
    constructor() {
        this.queue = (name) => {
            if (!name) {
                throw new errors_1.InvalidArgumentError('A queue name is needed to use a Queue.');
            }
            return new Queue(this, name);
        };
        this.QueueServiceClient = newQueueServiceClient();
    }
}
exports.Queueing = Queueing;
class Queue {
    constructor(queueing, name) {
        this.queueing = queueing;
        this.name = name;
    }
    send(tasks) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const request = new queue_pb_1.QueueSendBatchRequest();
                request.setTasksList(Array.isArray(tasks)
                    ? tasks.map((task) => taskToWire(task))
                    : [taskToWire(tasks)]);
                request.setQueue(this.name);
                this.queueing.QueueServiceClient.sendBatch(request, (error, response) => {
                    if (error) {
                        reject(errors_1.fromGrpcError(error));
                        return;
                    }
                    const failedTasks = response.getFailedtasksList().map((m) => ({
                        task: {
                            id: m.getTask().getId(),
                            payload: m.getTask().getPayload().toJavaScript(),
                            payloadType: m.getTask().getPayloadType(),
                        },
                        message: m.getMessage(),
                    }));
                    if (!Array.isArray(tasks)) {
                        // Single Task returns
                        if (failedTasks.length > 0) {
                            reject(new errors_1.InternalError(failedTasks[0].message));
                        }
                        resolve();
                    }
                    else {
                        // Array of Tasks return
                        resolve(failedTasks);
                    }
                });
            });
        });
    }
    /**
     * Pop 1 or more queue items from the specified queue up to the depth limit.
     *
     * Nitric Tasks are leased for a limited period of time, where they may be worked on.
     * Once complete or failed they must be acknowledged using request specified leaseId.
     *
     * If the lease on a queue item expires before it is acknowledged or the lease is extended the task will be returned to the queue for reprocessing.
     *
     * @param depth the maximum number of items to return. Default 1, Min 1.
     * @returns The list of received tasks
     *
     * Example:
     * ```typescript
     * import { Queueing } from "@nitric/sdk"
     *
     * const queueing = new Queueing();
     *
     * const [task] = await queueing.queue("my-queue").receive();
     *
     * // do something with task
     * ```
     */
    receive(depth) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const request = new queue_pb_1.QueueReceiveRequest();
                // Set the default and min depth to 1.
                if (Number.isNaN(depth) || depth < 1) {
                    depth = 1;
                }
                request.setQueue(this.name);
                request.setDepth(depth);
                this.queueing.QueueServiceClient.receive(request, (error, response) => {
                    if (error) {
                        reject(errors_1.fromGrpcError(error));
                    }
                    else {
                        resolve(response.getTasksList().map((m) => {
                            return new ReceivedTask({
                                id: m.getId(),
                                payload: m.getPayload().toJavaScript(),
                                payloadType: m.getPayloadType(),
                                leaseId: m.getLeaseId(),
                                queue: this,
                            });
                        }));
                    }
                });
            });
        });
    }
    ;
}
exports.Queue = Queue;
class ReceivedTask {
    constructor({ id, leaseId, payload, payloadType, queue, }) {
        this.id = id;
        this.leaseId = leaseId;
        this.payloadType = payloadType;
        this.payload = payload;
        this.queue = queue;
    }
    /**
     * Marks a queue item as successfully completed and removes it from the queue.
     *
     * @returns A void promise
     *
     * Example:
     * ```typescript
     * import { Queueing } from "@nitric/sdk"
     *
     * const queueing = new Queueing();
     *
     * const [task] = await queueing.queue("my-queue").receive();
     *
     * // do something with task
     *
     * // complete the task
     * await task.complete();
     * ```
     */
    complete() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const request = new queue_pb_1.QueueCompleteRequest();
                request.setQueue(this.queue.name);
                request.setLeaseId(this.leaseId);
                return yield new Promise((resolve, reject) => {
                    this.queue.queueing.QueueServiceClient.complete(request, (error) => {
                        if (error) {
                            reject(errors_1.fromGrpcError(error));
                        }
                        else {
                            resolve();
                        }
                    });
                });
            }
            catch (error) {
                throw error;
            }
        });
    }
    ;
}
exports.ReceivedTask = ReceivedTask;
// Queues client singleton
let QUEUES = undefined;
/**
 * Queues
 * @returns a Queues API client.
 * @example
 * ```typescript
 * import { queues } from "@nitric/sdk";
 *
 * async function publishToQueue() {
 *  await queues()
 *  .queue('my-queue')
 *  .send({
 *    payload: {
 *      example: 'payload',
 *    },
 *  });
 * }
 * ```
 */
exports.queues = () => {
    if (!QUEUES) {
        QUEUES = new Queueing();
    }
    return QUEUES;
};
