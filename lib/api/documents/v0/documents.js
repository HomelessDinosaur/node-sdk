"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.documents = exports.Documents = void 0;
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
const document_grpc_pb_1 = require("@nitric/api/proto/document/v1/document_grpc_pb");
const grpc = tslib_1.__importStar(require("@grpc/grpc-js"));
const collection_ref_1 = require("./collection-ref");
/**
 * Documents
 *
 * Provides a Document API client.
 * Used to create references to collections.
 */
class Documents {
    constructor() {
        this.documentClient = new document_grpc_pb_1.DocumentServiceClient(constants_1.SERVICE_BIND, grpc.ChannelCredentials.createInsecure());
    }
    /**
     * Gets a Collection instance that refers to the collection at the specified path.
     * @param name The name of the collection (required)
     * @returns The Collection instance
     */
    collection(name) {
        return new collection_ref_1.CollectionRef(this.documentClient, name);
    }
}
exports.Documents = Documents;
// Documents client singleton
let DOCUMENTS = undefined;
/**
 * Documents
 * @returns a Documents API client.
 * @example
 * ```typescript
 * import { documents } from "@nitric/sdk";
 *
 * async function setCustomer() {
 *  const collection = documents().collection('customers');
 *
 *  collection.doc('id').set({
 *    name: 'David',
 *  });
 * }
 * ```
 */
exports.documents = () => {
    if (!DOCUMENTS) {
        DOCUMENTS = new Documents();
    }
    return DOCUMENTS;
};
