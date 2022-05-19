"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.topic = exports.TopicResource = exports.SubscriptionWorkerOptions = void 0;
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
const faas_1 = require("../faas");
const api_1 = require("../api/");
const client_1 = tslib_1.__importDefault(require("./client"));
const resource_pb_1 = require("@nitric/api/proto/resource/v1/resource_pb");
const common_1 = require("./common");
const errors_1 = require("../api/errors");
class SubscriptionWorkerOptions {
    constructor(topic) {
        this.topic = topic;
    }
}
exports.SubscriptionWorkerOptions = SubscriptionWorkerOptions;
/**
 * Creates a subscription worker
 */
class Subscription {
    constructor(name, ...mw) {
        this.faas = new faas_1.Faas(new SubscriptionWorkerOptions(name));
        this.faas.event(...mw);
    }
    start() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.faas.start();
        });
    }
}
/**
 * Topic resource for pub/sub async messaging.
 */
class TopicResource extends common_1.SecureResource {
    /**
     * Register this topic as a required resource for the calling function/container
     * @returns a promise that resolves when the registration is complete
     */
    register() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const req = new resource_pb_1.ResourceDeclareRequest();
            const resource = new resource_pb_1.Resource();
            resource.setName(this.name);
            resource.setType(resource_pb_1.ResourceType.TOPIC);
            req.setResource(resource);
            return new Promise((resolve, reject) => {
                client_1.default.declare(req, (error, response) => {
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
        return perms.reduce((actions, p) => {
            switch (p) {
                case 'publishing':
                    return [
                        ...actions,
                        resource_pb_1.Action.TOPICEVENTPUBLISH,
                        resource_pb_1.Action.TOPICLIST,
                        resource_pb_1.Action.TOPICDETAIL,
                    ];
                default:
                    throw new Error(`unknown permission ${p}, supported permissions is publishing.}
            )}`);
            }
        }, []);
    }
    /**
     * Register and start a subscription handler that will be called for all events from this topic.
     * @param mw handler middleware which will be run for every incoming event
     * @returns Promise which resolves when the handler server terminates
     */
    subscribe(...mw) {
        const sub = new Subscription(this.name, ...mw);
        return sub['start']();
    }
    /**
     * Return a topic reference and register the permissions required by the currently scoped function for this resource.
     *
     * e.g. const updates = resources.topic('updates').for('publishing')
     *
     * @param perms the required permission set
     * @returns a usable topic reference
     */
    for(...perms) {
        this.registerPolicy(...perms);
        return api_1.events().topic(this.name);
    }
}
exports.TopicResource = TopicResource;
exports.topic = common_1.make(TopicResource);
