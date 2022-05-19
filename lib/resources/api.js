"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwt = exports.api = exports.ApiWorkerOptions = void 0;
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
const resource_pb_1 = require("@nitric/api/proto/resource/v1/resource_pb");
const errors_1 = require("../api/errors");
const client_1 = tslib_1.__importDefault(require("./client"));
const common_1 = require("./common");
class ApiWorkerOptions {
    constructor(api, route, methods, opts = {}) {
        this.api = api;
        this.route = route;
        this.methods = methods;
        this.opts = opts;
    }
}
exports.ApiWorkerOptions = ApiWorkerOptions;
class Method {
    constructor(route, methods, opts, ...middleware) {
        this.route = route;
        this.methods = methods;
        this.faas = new faas_1.Faas(new ApiWorkerOptions(route.api.name, route.path, methods, opts));
        this.faas.http(...middleware);
    }
    start() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.faas.start();
        });
    }
}
class Route {
    constructor(api, path, opts = {}) {
        this.api = api;
        this.path = path;
        const { middleware = [] } = opts;
        this.middleware = Array.isArray(middleware) ? middleware : [middleware];
    }
    method(methods, opts, ...middleware) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const getHandler = new Method(this, methods, opts, ...this.middleware, ...middleware);
            return getHandler['start']();
        });
    }
    /**
     * Register a handler function for GET requests to this route
     */
    get(opts, ...middleware) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.method(['GET'], opts, ...middleware);
        });
    }
    /**
     * Register a handler function for POST requests to this route
     */
    post(opts, ...middleware) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.method(['POST'], opts, ...middleware);
        });
    }
    /**
     * Register a handler function for PUT requests to this route
     */
    put(opts, ...middleware) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.method(['PUT'], opts, ...middleware);
        });
    }
    /**
     * Register a handler function for PATCH requests to this route
     */
    patch(opts, ...middleware) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.method(['PATCH'], opts, ...middleware);
        });
    }
    /**
     * Register a handler function for DELETE requests to this route
     */
    delete(opts, ...middleware) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.method(['DELETE'], opts, ...middleware);
        });
    }
    /**
     * Register a handler function for OPTIONS requests to this route
     */
    options(opts, ...middleware) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.method(['OPTIONS'], opts, ...middleware);
        });
    }
    /**
     * Register a handler function for GET, POST, PATCH, PUT and DELETE requests to this route.
     *
     * Most useful when routing isn't important or you're doing you own internal routing.
     */
    all(opts, ...middleware) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.method(['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'], opts, ...middleware);
        });
    }
}
class JwtSecurityDefinition {
    constructor(issuer, audiences) {
        this.issuer = issuer;
        this.audiences = audiences;
    }
}
/**
 * API Resource
 *
 * Represents an HTTP API, capable of routing and securing incoming HTTP requests to handlers.
 */
class Api extends common_1.Resource {
    constructor(name, options = {}) {
        super(name);
        const { middleware, path = '/', securityDefinitions = null, security = {} } = options;
        // this.name = name;
        this.path = path;
        this.middleware = Array.isArray(middleware) ? middleware : [middleware];
        this.securityDefinitions = securityDefinitions;
        this.security = security;
        this.routes = [];
    }
    /**
     * Register a new route in this API.
     *
     * Used to define Method handlers. e.g.
     *
     * ```
     * // Create a route
     * const home = api.route('/home')
     *
     * // Register a handler for Http GET request to this route
     * home.get(homeHandler)
     * ```
     *
     * @param match the route path matcher e.g. '/home'. Supports path params via colon prefix e.g. '/customers/:customerId'
     * @param options route options such as setting middleware which applies to all methods in the route
     * @returns the route object, which can be used to register method handlers
     */
    route(match, options) {
        const r = new Route(this, match, options);
        this.routes.push(r);
        return r;
    }
    /*  === Quick Register Functions ===
     *
     * Convenience methods that enable quick registration of method handlers, without defining the route first.
     * makes for more succinct code in straightforward cases.
     *
     * e.g. api.route('/home').get(ctx => ctx) becomes api.get('/home', ctx => ctx)
     */
    /**
     * Registers a new route with a GET handler in a single method.
     * @param match the route path matcher e.g. '/home'. Supports path params via colon prefix e.g. '/customers/:customerId'
     * @param middleware the middleware/handler to register for calls to GET
     * @returns {Promise} that resolves when the handler terminates.
     */
    get(match, middleware, opts) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const r = this.route(match);
            return r.get(opts, middleware);
        });
    }
    /**
     * Registers a new route with a POST handler in a single method.
     * @param match the route path matcher e.g. '/home'. Supports path params via colon prefix e.g. '/customers/:customerId'
     * @param middleware the middleware/handler to register for calls to POST
     * @returns {Promise} that resolves when the handler terminates.
     */
    post(match, middleware, opts) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const r = this.route(match);
            return r.post(opts, middleware);
        });
    }
    /**
     * Registers a new route with a PUT handler in a single method.
     * @param match the route path matcher e.g. '/home'. Supports path params via colon prefix e.g. '/customers/:customerId'
     * @param middleware the middleware/handler to register for calls to PUT
     * @returns {Promise} that resolves when the handler terminates.
     */
    put(match, middleware, opts) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const r = this.route(match);
            return r.put(opts, middleware);
        });
    }
    /**
     * Registers a new route with a PATCH handler in a single method.
     * @param match the route path matcher e.g. '/home'. Supports path params via colon prefix e.g. '/customers/:customerId'
     * @param middleware the middleware/handler to register for calls to PATCH
     * @returns {Promise} that resolves when the handler terminates.
     */
    patch(match, middleware, opts) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const r = this.route(match);
            return r.patch(opts, middleware);
        });
    }
    /**
     * Registers a new route with a DELETE handler in a single method.
     * @param match the route path matcher e.g. '/home'. Supports path params via colon prefix e.g. '/customers/:customerId'
     * @param middleware the middleware/handler to register for calls to DELETE
     * @returns {Promise} that resolves when the handler terminates.
     */
    delete(match, middleware, opts) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const r = this.route(match);
            return r.delete(opts, middleware);
        });
    }
    /**
     * Registers a new route with a OPTIONS handler in a single method.
     * @param match the route path matcher e.g. '/home'. Supports path params via colon prefix e.g. '/customers/:customerId'
     * @param middleware the middleware/handler to register for calls to DELETE
     * @returns {Promise} that resolves when the handler terminates.
     */
    options(match, middleware, opts) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const r = this.route(match);
            return r.options(opts, middleware);
        });
    }
    /**
     * Register this bucket as a required resource for the calling function/container
     * @returns a promise that resolves when the registration is complete
     */
    register() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const req = new resource_pb_1.ResourceDeclareRequest();
            const resource = new resource_pb_1.Resource();
            const apiResource = new resource_pb_1.ApiResource();
            const { security } = this;
            if (security) {
                Object.keys(security).forEach(k => {
                    const scopes = new resource_pb_1.ApiScopes();
                    scopes.setScopesList(security[k]);
                    apiResource.getSecurityMap().set(k, scopes);
                });
            }
            resource.setName(this.name);
            resource.setType(resource_pb_1.ResourceType.API);
            Object.keys(this.securityDefinitions).forEach(k => {
                const def = this.securityDefinitions[k];
                const definition = new resource_pb_1.ApiSecurityDefinition();
                if (def instanceof JwtSecurityDefinition) {
                    // Set it to a JWT definition
                    const secDef = new resource_pb_1.ApiSecurityDefinitionJwt();
                    secDef.setIssuer(def.issuer);
                    secDef.setAudiencesList(def.audiences);
                    definition.setJwt(secDef);
                }
                apiResource.getSecurityDefinitionsMap().set(k, definition);
            });
            req.setApi(apiResource);
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
}
/**
 * Register a new API Resource.
 *
 * The returned API object can be used to register Routes and Methods, with Handlers.
 * e.g. api.route('/customers').get(getCustomerHandler)
 *
 * @param name
 * @param options
 * @returns
 */
exports.api = common_1.make(Api);
/**
 * Create a jwt security definition
 * @returns
 */
exports.jwt = (opts) => {
    return new JwtSecurityDefinition(opts.issuer, opts.audiences);
};
