"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentRef = void 0;
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
const struct_pb_1 = require("google-protobuf/google/protobuf/struct_pb");
const document_pb_1 = require("@nitric/api/proto/document/v1/document_pb");
const errors_1 = require("../../errors");
const collection_ref_1 = require("./collection-ref");
const constants_1 = require("./constants");
/**
 * Document Ref
 *
 * Provides a Document Reference class.
 * Used to create references to collections.
 */
class DocumentRef {
    constructor(documentClient, parent, id) {
        this.documentClient = documentClient;
        this.parent = parent;
        this.id = id;
    }
    /**
     * Return the collection document reference value.
     * @returns the collection document reference value, or null if not found
     */
    get() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const request = new document_pb_1.DocumentGetRequest();
            request.setKey(this.toWire());
            return new Promise((resolve, reject) => {
                this.documentClient.get(request, (error, response) => {
                    if (error) {
                        reject(errors_1.fromGrpcError(error));
                    }
                    else if (response.hasDocument()) {
                        const document = response.getDocument();
                        const content = document.getContent().toJavaScript();
                        resolve(content);
                    }
                    else {
                        resolve(null);
                    }
                });
            });
        });
    }
    /**
     * Set the document content for this document reference in the database. If the
     * document does not exist an new item will be created, otherwise an
     * existing document will be update with the new value.
     * @param value content the document content to store (required)
     */
    set(value) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const request = new document_pb_1.DocumentSetRequest();
            request.setKey(this.toWire());
            request.setContent(struct_pb_1.Struct.fromJavaScript(value));
            return new Promise((resolve, reject) => {
                this.documentClient.set(request, (error) => {
                    if (error) {
                        reject(errors_1.fromGrpcError(error));
                    }
                    else {
                        resolve();
                    }
                });
            });
        });
    }
    /**
     * Delete this document reference from the database if it exists.
     */
    delete() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const request = new document_pb_1.DocumentDeleteRequest();
            request.setKey(this.toWire());
            return new Promise((resolve, reject) => {
                this.documentClient.delete(request, (error) => {
                    if (error) {
                        reject(errors_1.fromGrpcError(error));
                    }
                    else {
                        resolve();
                    }
                });
            });
        });
    }
    toWire() {
        const key = new document_pb_1.Key();
        key.setCollection(this.parent["toWire"]());
        key.setId(this.id);
        return key;
    }
    depth() {
        const parent = this.parent.parent;
        if (parent) {
            return parent.depth() + 1;
        }
        return 0;
    }
    /**
     * Gets a Collection instance that refers to the collection at the specified path.
     * @param name The name of the collection (required)
     * @returns The Collection instance
     */
    collection(name) {
        if (this.depth() >= constants_1.MAX_COLLECTION_DEPTH) {
            throw new errors_1.InvalidArgumentError(`Maximum collection depth ${constants_1.MAX_COLLECTION_DEPTH} exceeded`);
        }
        return new collection_ref_1.CollectionRef(this.documentClient, name, this);
    }
}
exports.DocumentRef = DocumentRef;
