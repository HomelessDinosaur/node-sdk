"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventContext = exports.HttpContext = exports.EventRequest = exports.HttpResponse = exports.HttpRequest = exports.AbstractRequest = exports.TriggerContext = void 0;
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
const faas_pb_1 = require("@nitric/api/proto/faas/v1/faas_pb");
const json_1 = require("./json");
class TriggerContext {
    /**
     *
     */
    get http() {
        return undefined;
    }
    /**
     *
     */
    get event() {
        return undefined;
    }
    /**
     *
     */
    get req() {
        return this.request;
    }
    /**
     *
     */
    get res() {
        return this.response;
    }
    // Instantiate a concrete TriggerContext from the gRPC trigger model
    static fromGrpcTriggerRequest(trigger) {
        // create context
        if (trigger.hasHttp()) {
            return HttpContext.fromGrpcTriggerRequest(trigger);
        }
        else if (trigger.hasTopic()) {
            return EventContext.fromGrpcTriggerRequest(trigger);
        }
        throw new Error('Unsupported trigger request type');
    }
    static toGrpcTriggerResponse(ctx) {
        if (ctx.http) {
            return HttpContext.toGrpcTriggerResponse(ctx);
        }
        else if (ctx.event) {
            return EventContext.toGrpcTriggerResponse(ctx);
        }
        throw new Error('Unsupported trigger context type');
    }
}
exports.TriggerContext = TriggerContext;
class AbstractRequest {
    constructor(data) {
        this.data = data;
    }
    text() {
        const stringPayload = typeof this.data === 'string'
            ? this.data
            : new TextDecoder('utf-8').decode(this.data);
        return stringPayload;
    }
    json() {
        // attempt to deserialize as a JSON object
        return JSON.parse(this.text());
    }
}
exports.AbstractRequest = AbstractRequest;
class HttpRequest extends AbstractRequest {
    constructor({ data, method, path, params, query, headers }) {
        super(data);
        this.method = method;
        this.path = path;
        this.params = params;
        this.query = query;
        this.headers = headers;
    }
}
exports.HttpRequest = HttpRequest;
class HttpResponse {
    constructor({ status, headers, body, ctx }) {
        this.status = status;
        this.headers = headers;
        this.body = body;
        this.ctx = ctx;
    }
    /**
     * Helper method to encode to JSON string for JSON http responses
     * @returns HttpContext with body property set with an encoded JSON string and json headers set.
     */
    get json() {
        return json_1.jsonResponse(this.ctx);
    }
}
exports.HttpResponse = HttpResponse;
class EventRequest extends AbstractRequest {
    constructor(data, topic) {
        super(data);
        this.topic = topic;
    }
}
exports.EventRequest = EventRequest;
class HttpContext extends TriggerContext {
    get http() {
        return this;
    }
    static fromGrpcTriggerRequest(trigger) {
        const http = trigger.getHttp();
        const ctx = new HttpContext();
        const headers = http
            .getHeadersMap()
            // getEntryList claims to return [string, faas.HeaderValue][], but really returns [string, string[][]][]
            // we force the type to match the real return type.
            .getEntryList().reduce((acc, [key, [val]]) => (Object.assign(Object.assign({}, acc), { [key.toLowerCase()]: val.length === 1 ? val[0] : val })), {});
        const query = http
            .getQueryParamsMap()
            // getEntryList claims to return [string, faas.HeaderValue][], but really returns [string, string[][]][]
            // we force the type to match the real return type.
            .getEntryList().reduce((acc, [key, [val]]) => (Object.assign(Object.assign({}, acc), { [key.toLowerCase()]: val.length === 1 ? val[0] : val })), {});
        const params = http
            .getPathParamsMap()
            // getEntryList claims to return [string, faas.HeaderValue][], but really returns [string, string[][]][]
            // we force the type to match the real return type.
            .getEntryList()
            .reduce((acc, [key, val]) => (Object.assign(Object.assign({}, acc), { [key.toLowerCase()]: val.length === 1 ? val[0] : val })), {});
        const oldQuery = http
            .getQueryParamsOldMap()
            .toArray()
            .reduce((acc, [key, val]) => (Object.assign(Object.assign({}, acc), { [key.toLowerCase()]: val })), {});
        const oldHeaders = http
            .getHeadersOldMap()
            .toArray()
            .reduce((acc, [key, val]) => (Object.assign(Object.assign({}, acc), { [key.toLowerCase()]: val })), {});
        ctx.request = new HttpRequest({
            data: trigger.getData(),
            path: http.getPath(),
            params,
            // TODO: remove after 1.0
            // check for old query if new query is unpopulated. This is for backwards compatibility.
            query: Object.keys(query).length ? query : oldQuery,
            // TODO: remove after 1.0
            // check for old headers if new headers is unpopulated. This is for backwards compatibility.
            headers: Object.keys(headers).length ? headers : oldHeaders,
            method: http.getMethod(),
        });
        ctx.response = new HttpResponse({
            status: 200,
            headers: {},
            body: '',
            ctx,
        });
        if (!ctx) {
            throw new Error('failed to create context');
        }
        return ctx;
    }
    static toGrpcTriggerResponse(ctx) {
        const httpCtx = ctx.http;
        const resp = new faas_pb_1.TriggerResponse();
        resp.setHttp(new faas_pb_1.HttpResponseContext());
        // Convert the body content to bytes
        let body;
        let bodyContentType = 'application/octet-stream';
        if (typeof httpCtx.response.body === 'string') {
            body = new TextEncoder().encode(httpCtx.response.body);
            bodyContentType = 'text/plain';
        }
        else if (httpCtx.response.body instanceof Uint8Array) {
            body = httpCtx.response.body;
            bodyContentType = 'application/octet-stream';
        }
        else {
            body = new TextEncoder().encode(JSON.stringify(httpCtx.response.body));
            bodyContentType = 'application/json';
        }
        resp.setData(body);
        resp.getHttp().setStatus(httpCtx.response.status);
        Object.entries(httpCtx.response.headers).forEach(([k, v]) => {
            const headerVal = new faas_pb_1.HeaderValue();
            headerVal.setValueList(v);
            resp.getHttp().getHeadersMap().set(k.toLowerCase(), headerVal);
            resp.getHttp().getHeadersOldMap().set(k.toLowerCase(), v[0]);
        });
        // Automatically set the content-type header if it's missing
        const contentHeader = resp.getHttp().getHeadersMap().get('content-type');
        if (!contentHeader || contentHeader.getValueList().length === 0) {
            const headerVal = new faas_pb_1.HeaderValue();
            headerVal.setValueList([bodyContentType]);
            resp.getHttp().getHeadersMap().set('content-type', headerVal);
            resp.getHttp().getHeadersOldMap().set('content-type', bodyContentType);
        }
        return resp;
    }
}
exports.HttpContext = HttpContext;
class EventContext extends TriggerContext {
    get event() {
        return this;
    }
    static fromGrpcTriggerRequest(trigger) {
        const topic = trigger.getTopic();
        const ctx = new EventContext();
        ctx.request = new EventRequest(trigger.getData_asU8(), topic.getTopic());
        ctx.response = {
            success: true,
        };
        return ctx;
    }
    static toGrpcTriggerResponse(ctx) {
        const evtCtx = ctx.event;
        const triggerResponse = new faas_pb_1.TriggerResponse();
        const topicResponse = new faas_pb_1.TopicResponseContext();
        topicResponse.setSuccess(evtCtx.res.success);
        triggerResponse.setTopic(topicResponse);
        return triggerResponse;
    }
}
exports.EventContext = EventContext;
