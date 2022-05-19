"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.collection = exports.CollectionResource = void 0;
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
const errors_1 = require("../api/errors");
const documents_1 = require("../api/documents");
const client_1 = tslib_1.__importDefault(require("./client"));
const common_1 = require("./common");
const everything = ['reading', 'writing', 'deleting'];
/**
 * A document collection resources, such as a collection/table in a document database.
 */
class CollectionResource extends common_1.SecureResource {
    /**
     * Register this collection as a required resource for the calling function/container
     * @returns a promise that resolves when the registration is complete
     */
    register() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const req = new resource_pb_1.ResourceDeclareRequest();
            const resource = new resource_pb_1.Resource();
            resource.setName(this.name);
            resource.setType(resource_pb_1.ResourceType.COLLECTION);
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
        let actions = perms.reduce((actions, perm) => {
            switch (perm) {
                case 'reading':
                    return [
                        ...actions,
                        resource_pb_1.Action.COLLECTIONDOCUMENTREAD,
                        resource_pb_1.Action.COLLECTIONQUERY,
                    ];
                case 'writing':
                    return [...actions, resource_pb_1.Action.COLLECTIONDOCUMENTWRITE];
                case 'deleting':
                    return [...actions, resource_pb_1.Action.COLLECTIONDOCUMENTDELETE];
                default:
                    throw new Error(`unknown collection permission ${perm}, supported permissions are ${everything.join(', ')}`);
            }
        }, []);
        if (actions.length > 0) {
            actions = [...actions, resource_pb_1.Action.COLLECTIONLIST];
        }
        return actions;
    }
    /**
     * Return a collection reference and register the permissions required by the currently scoped function for this resource.
     *
     * e.g. const customers = resources.collection('customers').for('reading', 'writing')
     *
     * @param perms the required permission set
     * @returns a usable collection reference
     */
    for(...perms) {
        this.registerPolicy(...perms);
        return documents_1.documents().collection(this.name);
    }
}
exports.CollectionResource = CollectionResource;
const newCollection = common_1.make(CollectionResource);
function collection(name) {
    return newCollection(name);
}
exports.collection = collection;
