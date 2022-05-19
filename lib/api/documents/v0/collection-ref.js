"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollectionRef = void 0;
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
const document_pb_1 = require("@nitric/api/proto/document/v1/document_pb");
const query_1 = require("./query");
const document_ref_1 = require("./document-ref");
const collection_group_ref_1 = require("./collection-group-ref");
/**
 * CollectionRef
 *
 * Provides a Document API CollectionRef class.
 */
class CollectionRef {
    constructor(documentClient, name, parent) {
        this.documentClient = documentClient;
        this.name = name;
        this.parent = parent;
    }
    /**
     * Return a reference to a subcollection within the documents of this collection.
     *
     * Useful when querying subcollection documents across all/many parent documents. E.g. Querying landmarks from multiple cities.
     * @param name
     */
    collection(name) {
        return collection_group_ref_1.CollectionGroupRef.fromCollectionRef(this, this.documentClient).collection(name);
    }
    /**
     * Return a reference to a document in the collection.
     * @param documentId id the document unique id (required)
     * @returns new collection document reference
     */
    doc(id) {
        return new document_ref_1.DocumentRef(this.documentClient, this, id);
    }
    /**
     * Create a new collection query object
     * @returns a new collection query object
     */
    query() {
        return new query_1.Query(this.documentClient, this);
    }
    toWire() {
        const col = new document_pb_1.Collection();
        col.setName(this.name);
        if (this.parent) {
            col.setParent(this.parent["toWire"]());
        }
        return col;
    }
}
exports.CollectionRef = CollectionRef;
