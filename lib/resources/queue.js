"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queue = exports.QueueResource = void 0;
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
const resource_pb_1 = require("@nitric/api/proto/resource/v1/resource_pb");
const client_1 = tslib_1.__importDefault(require("./client"));
const api_1 = require("../api/");
const errors_1 = require("../api/errors");
const common_1 = require("./common");
/**
 * Queue resource for async send/receive messaging
 */
class QueueResource extends common_1.SecureResource {
    /**
     * Register this queue as a required resource for the calling function/container
     * @returns a promise that resolves when the registration is complete
     */
    register() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const req = new resource_pb_1.ResourceDeclareRequest();
            const resource = new resource_pb_1.Resource();
            resource.setName(this.name);
            resource.setType(resource_pb_1.ResourceType.QUEUE);
            req.setResource(resource);
            return new Promise((resolve, reject) => {
                client_1.default.declare(req, (error) => {
                    if (error) {
                        reject(errors_1.fromGrpcError(error));
                    }
                    else {
                        resolve(resource);
                    }
                });
            });
        });
    }
    permsToActions(...perms) {
        let actions = perms.reduce((actions, p) => {
            switch (p) {
                case "sending":
                    return [
                        ...actions,
                        resource_pb_1.Action.QUEUESEND,
                    ];
                case "receiving":
                    return [
                        ...actions,
                        resource_pb_1.Action.QUEUERECEIVE,
                    ];
                default:
                    throw new Error(`unknown permission ${p}, supported permissions is publishing.}
            )}`);
            }
        }, []);
        if (actions.length > 0) {
            actions = [...actions, resource_pb_1.Action.QUEUELIST, resource_pb_1.Action.QUEUEDETAIL];
        }
        return actions;
    }
    /**
     * Return a queue reference and register the permissions required by the currently scoped function for this resource.
     *
     * e.g. const taskQueue = resources.queue('work').for('sending')
     *
     * @param perm
     * @param perms
     * @returns
     */
    for(...perms) {
        this.registerPolicy(...perms);
        return api_1.queues().queue(this.name);
    }
}
exports.QueueResource = QueueResource;
exports.queue = common_1.make(QueueResource);
