"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.events = exports.Eventing = exports.Topic = void 0;
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
const constants_1 = require("../../../constants");
const event_grpc_pb_1 = require("@nitric/api/proto/event/v1/event_grpc_pb");
const event_pb_1 = require("@nitric/api/proto/event/v1/event_pb");
const struct_pb_1 = require("google-protobuf/google/protobuf/struct_pb");
const grpc = tslib_1.__importStar(require("@grpc/grpc-js"));
const errors_1 = require("../../errors");
function newEventServiceClients() {
    const channel = grpc.ChannelCredentials.createInsecure();
    return {
        event: new event_grpc_pb_1.EventServiceClient(constants_1.SERVICE_BIND, channel),
        topic: new event_grpc_pb_1.TopicServiceClient(constants_1.SERVICE_BIND, channel),
    };
}
class Topic {
    constructor(eventing, name) {
        this.eventing = eventing;
        this.name = name;
    }
    /**
     * Publishes an event to a nitric topic
     * @param event The event to publish
     * @returns NitricEvent containing the unique id of the event (if not provided it will be generated)
     *
     * @example
     * ```typescript
     * import { Eventing } from "@nitric/sdk";
     *
     * const eventing = Eventing();
     *
     * async function publishEvent(): NitricEvent {
     *   const topic = eventing.topic("my-topic");
     *   const event = {
     *     payloadType: "my-payload",
     *     payload: {
     *       value: "Hello World!"
     *     }
     *   };
     *
     *   return await topic.publish(event);
     * }
     * ```
     */
    publish(event) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { id, payloadType = 'none', payload } = event;
            const request = new event_pb_1.EventPublishRequest();
            const evt = new event_pb_1.NitricEvent();
            evt.setId(id);
            evt.setPayload(struct_pb_1.Struct.fromJavaScript(payload));
            evt.setPayloadType(payloadType);
            request.setTopic(this.name);
            request.setEvent(evt);
            return new Promise((resolve, reject) => {
                this.eventing.EventServiceClient.publish(request, (error, response) => {
                    if (error) {
                        reject(errors_1.fromGrpcError(error));
                    }
                    else {
                        resolve(Object.assign(Object.assign({}, event), { id: response.getId() }));
                    }
                });
            });
        });
    }
    ;
}
exports.Topic = Topic;
/**
 * Eventing object encapsulating the Nitric gRPC clients for Event and Topic services.
 *
 * Used to created references to Topics and perform Event publishing operations.
 *
 * @example
 * ```typescript
 * import { Eventing } from "@nitric/sdk";
 * const eventing = new Eventing();
 * const topic = eventing.topic('notifications');
 * ```
 */
class Eventing {
    constructor() {
        this._clients = undefined;
    }
    get EventServiceClient() {
        if (!this._clients) {
            this._clients = newEventServiceClients();
        }
        return this._clients.event;
    }
    get TopicServiceClient() {
        if (!this._clients) {
            this._clients = newEventServiceClients();
        }
        return this._clients.topic;
    }
    /**
     * Get a reference to a Topic.
     *
     * @param name Name of the topic, as defined in nitric.yaml.
     *
     * @example
     * ```typescript
     * import { Eventing } from "@nitric/sdk";
     * const eventing = new Eventing();
     * const topic = eventing.topic('notifications');
     * ```
     *
     */
    topic(name) {
        if (!name) {
            throw new errors_1.InvalidArgumentError('A topic name is needed to use a Topic.');
        }
        return new Topic(this, name);
    }
    ;
    /**
     * Retrieve all available topic references by querying for available topics.
     *
     * @retuns A promise containing the list of available nitric topics
     *
     * Example:
     * ```typescript
     * import { Eventing } from "@nitric/sdk";
     *
     * const eventing = new Eventing();
     *
     * const topics = await eventing.topics();
     * ```
     */
    topics() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.TopicServiceClient.list(null, (error, response) => {
                    if (error) {
                        reject(errors_1.fromGrpcError(error));
                    }
                    else {
                        resolve(response.getTopicsList().map((topic) => this.topic(topic.getName())));
                    }
                });
            });
        });
    }
    ;
}
exports.Eventing = Eventing;
// Events client singleton
let EVENTS = undefined;
/**
 * Events
 * @returns an Events API client.
 * @example
 * ```typescript
 * import { events } from "@nitric/sdk";
 *
 * async function publishEvent() {
 *  const topic = events().topic('notifications');
 *
 *  await topic.publish({
 *    payload: {
 *     amazing: 'thing happened!',
 *    },
 *  });
 *
 *  return 'Successfully published notification';
 * }
 * ```
 */
exports.events = () => {
    if (!EVENTS) {
        EVENTS = new Eventing();
    }
    return EVENTS;
};
