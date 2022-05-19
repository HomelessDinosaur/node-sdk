"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.start = exports.event = exports.http = exports.Faas = void 0;
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
const grpc = tslib_1.__importStar(require("@grpc/grpc-js"));
const constants_1 = require("../../constants");
const faas_grpc_pb_1 = require("@nitric/api/proto/faas/v1/faas_grpc_pb");
const faas_pb_1 = require("@nitric/api/proto/faas/v1/faas_pb");
const _1 = require(".");
const resources_1 = require("../../resources");
class FaasWorkerOptions {
}
/**
 *
 */
class Faas {
    constructor(opts) {
        this.options = opts;
    }
    /**
     * Add an event handler to this Faas server
     */
    event(...handlers) {
        this.eventHandler = _1.createHandler(...handlers);
        return this;
    }
    /**
     * Add a http handler to this Faas server
     */
    http(...handlers) {
        this.httpHandler = _1.createHandler(...handlers);
        return this;
    }
    /**
     * Get http handler for this server
     */
    getHttpHandler() {
        return this.httpHandler || this.anyHandler;
    }
    /**
     * Get event handler for this server
     */
    getEventHandler() {
        return this.eventHandler || this.anyHandler;
    }
    /**
     * Start the Faas server
     */
    start(...handlers) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.anyHandler = handlers.length && _1.createHandler(...handlers);
            if (!this.httpHandler && !this.eventHandler && !this.anyHandler) {
                throw new Error('A handler function must be provided.');
            }
            // Actually start the server...
            const faasClient = new faas_grpc_pb_1.FaasServiceClient(constants_1.SERVICE_BIND, grpc.ChannelCredentials.createInsecure());
            // Begin Bi-Di streaming
            const faasStream = faasClient.triggerStream();
            faasStream.on('data', (message) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                // We have an init response from the membrane
                if (message.hasInitResponse()) {
                    console.log('Function connected with membrane');
                    // We got an init response from the membrane
                    // The client can configure itself with any information provided by the membrane..
                }
                else if (message.hasTriggerRequest()) {
                    // We want to handle a function here...
                    const triggerRequest = message.getTriggerRequest();
                    const responseMessage = new faas_pb_1.ClientMessage();
                    responseMessage.setId(message.getId());
                    try {
                        const ctx = _1.TriggerContext.fromGrpcTriggerRequest(triggerRequest);
                        let handler = undefined;
                        let triggerType = 'Unknown';
                        if (ctx.http) {
                            triggerType = 'HTTP';
                            handler = this.getHttpHandler();
                        }
                        else if (ctx.event) {
                            triggerType = 'Event';
                            handler = this.getEventHandler();
                        }
                        else {
                            console.error(`received an unexpected trigger type, are you using an outdated version of the SDK?`);
                        }
                        if (!handler) {
                            // No handler defined for the trigger type received.
                            console.error(`no handler defined for ${triggerType} triggers`);
                            faasStream.cancel();
                            return;
                        }
                        const result = (yield handler(ctx, (ctx) => tslib_1.__awaiter(this, void 0, void 0, function* () { return ctx; }))) || ctx;
                        responseMessage.setTriggerResponse(_1.TriggerContext.toGrpcTriggerResponse(result));
                    }
                    catch (e) {
                        // generic error handling
                        console.error(e);
                        const triggerResponse = new faas_pb_1.TriggerResponse();
                        responseMessage.setTriggerResponse(triggerResponse);
                        triggerResponse.setData(new TextEncoder().encode('Internal Server Error'));
                        if (triggerRequest.hasHttp()) {
                            const httpResponse = new faas_pb_1.HttpResponseContext();
                            triggerResponse.setHttp(httpResponse);
                            httpResponse.setStatus(500);
                            const headersOld = httpResponse.getHeadersOldMap();
                            headersOld.set('Content-Type', 'text/plain');
                            const headers = httpResponse.getHeadersMap();
                            const contentTypeHeader = new faas_pb_1.HeaderValue();
                            contentTypeHeader.addValue('text/plain');
                            headers.set('Content-Type', contentTypeHeader);
                        }
                        else if (triggerRequest.hasTopic()) {
                            const topicResponse = new faas_pb_1.TopicResponseContext();
                            topicResponse.setSuccess(false);
                            triggerResponse.setTopic(topicResponse);
                        }
                    }
                    // Send the response back to the membrane
                    faasStream.write(responseMessage);
                }
            }));
            // Let the membrane know we're ready to start
            const initRequest = new faas_pb_1.InitRequest();
            const initMessage = new faas_pb_1.ClientMessage();
            if (this.options instanceof resources_1.ApiWorkerOptions) {
                const apiWorker = new faas_pb_1.ApiWorker();
                apiWorker.setApi(this.options.api);
                apiWorker.setMethodsList(this.options.methods);
                apiWorker.setPath(this.options.route);
                const opts = new faas_pb_1.ApiWorkerOptions();
                if (this.options.opts && this.options.opts.security) {
                    if (Object.keys(this.options.opts.security).length == 0) {
                        // disable security if empty security is explicitly set
                        opts.setSecurityDisabled(true);
                    }
                    else {
                        const methodOpts = this.options.opts;
                        Object.keys(methodOpts.security).forEach(k => {
                            const scopes = new faas_pb_1.ApiWorkerScopes();
                            scopes.setScopesList(methodOpts.security[k]);
                            opts.getSecurityMap().set(k, scopes);
                        });
                    }
                }
                apiWorker.setOptions(opts);
                initRequest.setApi(apiWorker);
            }
            else if (this.options instanceof resources_1.RateWorkerOptions) {
                const scheduleWorker = new faas_pb_1.ScheduleWorker();
                scheduleWorker.setKey(this.options.description);
                const rate = new faas_pb_1.ScheduleRate();
                rate.setRate(`${this.options.rate} ${this.options.frequency}`);
                scheduleWorker.setRate(rate);
                initRequest.setSchedule(scheduleWorker);
            }
            else if (this.options instanceof resources_1.SubscriptionWorkerOptions) {
                const subscriptionWorker = new faas_pb_1.SubscriptionWorker();
                subscriptionWorker.setTopic(this.options.topic);
                initRequest.setSubscription(subscriptionWorker);
            }
            // Original faas workers should return a blank InitRequest for compatibility.
            initMessage.setInitRequest(initRequest);
            faasStream.write(initMessage);
            // Block until the stream has closed...
            yield new Promise((res) => {
                // The server has determined this stream must close
                faasStream.on('end', () => {
                    console.log('Membrane has terminated the trigger stream');
                    res();
                });
            });
        });
    }
}
exports.Faas = Faas;
// Faas Singleton
let INSTANCE = undefined;
const getFaasInstance = () => {
    INSTANCE = INSTANCE || new Faas(new FaasWorkerOptions());
    return INSTANCE;
};
/**
 * Register a HTTP handler
 */
exports.http = (...handlers) => getFaasInstance().http(...handlers);
/**
 * Register an event handler
 */
exports.event = (...handlers) => getFaasInstance().event(...handlers);
/**
 * Start the FaaS server with a universal handler
 */
exports.start = (...handlers) => tslib_1.__awaiter(void 0, void 0, void 0, function* () { return yield getFaasInstance().start(...handlers); });
