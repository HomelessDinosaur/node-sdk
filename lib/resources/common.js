"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.make = exports.SecureResource = exports.Resource = void 0;
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
const errors_1 = require("../api/errors");
class Resource {
    constructor(name) {
        this.name = name;
    }
    get registerPromise() {
        return this._registerPromise;
    }
    set registerPromise(promise) {
        this._registerPromise = promise;
    }
}
exports.Resource = Resource;
class SecureResource extends Resource {
    registerPolicy(...perms) {
        const req = new resource_pb_1.ResourceDeclareRequest();
        const policyResource = new resource_pb_1.Resource();
        policyResource.setType(resource_pb_1.ResourceType.POLICY);
        // Send an unnamed function as the principle. This is interpreted to mean the currently running function, making the request.
        const policy = new resource_pb_1.PolicyResource();
        const defaultPrincipal = new resource_pb_1.Resource();
        defaultPrincipal.setType(resource_pb_1.ResourceType.FUNCTION);
        policy.setPrincipalsList([defaultPrincipal]);
        // Convert the permissions to an action set.
        const actions = this.permsToActions(...perms);
        policy.setActionsList(actions);
        req.setResource(policyResource);
        req.setPolicy(policy);
        this.registerPromise.then((resource) => {
            policy.setResourcesList([resource]);
            client_1.default.declare(req, (error) => {
                if (error) {
                    throw errors_1.fromGrpcError(error);
                }
            });
        });
    }
}
exports.SecureResource = SecureResource;
// This singleton helps avoid duplicate references to bucket('name')
// will return the same bucket resource
const cache = {};
/**
 * Provides a new resource instance.
 *
 * @param name the _unique_ name of the resource within the stack
 * @returns the resource
 */
exports.make = (T) => {
    const typename = T.name;
    return (name, ...args) => {
        if (!cache[typename]) {
            cache[typename] = {};
        }
        if (!cache[typename][name]) {
            cache[typename][name] = new T(name, ...args);
            const prom = cache[typename][name]['register']();
            cache[typename][name]['registerPromise'] = prom;
            prom.catch((err) => {
                console.log(err);
            });
        }
        return cache[typename][name];
    };
};
