"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Query = void 0;
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
const stream_1 = require("stream");
const document_pb_1 = require("@nitric/api/proto/document/v1/document_pb");
const document_ref_1 = require("./document-ref");
const document_snapshot_1 = require("./document-snapshot");
const errors_1 = require("../../errors");
/**
 * Convenience method to convert ProtobufMap objects to standard JavaScript Maps
 * @param protoMap map to convert
 * @returns the map
 */
function protoMapToMap(protoMap) {
    const jsMap = new Map();
    protoMap.forEach((value, key) => {
        jsMap.set(key, value);
    });
    return jsMap;
}
/**
 * Documents
 *
 * Provides a Document API client.
 * Used to create references to collections.
 */
class Query {
    constructor(documentClient, collection) {
        this.documentClient = documentClient;
        this.collection = collection;
        this.expressions = [];
    }
    /**
     * Add a where expression to the query.
     *
     * @param field operand the left hand side expression operand
     * @param operator the query expression operator
     * @param value right hand side operand
     * @returns the Query operation
     */
    where(field, operator, value) {
        const expression = new document_pb_1.Expression();
        const expressionValue = new document_pb_1.ExpressionValue();
        expression.setOperand(field);
        expression.setOperator(operator);
        switch (typeof value) {
            case 'string':
                expressionValue.setStringValue(value);
                break;
            case 'number':
                if (Number.isInteger(value)) {
                    expressionValue.setIntValue(value);
                }
                else {
                    expressionValue.setDoubleValue(value);
                }
                break;
            case 'boolean':
                expressionValue.setBoolValue(value);
                break;
        }
        expression.setValue(expressionValue);
        this.expressions.push(expression);
        return this;
    }
    /**
     * Set the query paging continuation token.
     *
     * @param pagingToken
     * @returns the Query operation
     */
    pagingFrom(pagingToken) {
        this.pagingToken = pagingToken;
        return this;
    }
    /**
     * Set the query fetch limit.
     *
     * @param limit
     * @returns the Query operation
     */
    limit(limit) {
        if (typeof limit !== 'number' || limit < 0) {
            throw new errors_1.InvalidArgumentError('limit must be a positive integer or 0 for unlimited.');
        }
        this.fetchLimit = limit;
        return this;
    }
    fetch() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const request = new document_pb_1.DocumentQueryRequest();
            request.setCollection(this.collection['toWire']());
            request.setLimit(this.fetchLimit);
            if (this.expressions.length) {
                request.setExpressionsList(this.expressions);
            }
            if (this.pagingToken != null) {
                if (!(this.pagingToken instanceof Map)) {
                    throw new errors_1.InvalidArgumentError('Invalid paging token provided!');
                }
                const map = request.getPagingTokenMap();
                this.pagingToken.forEach((value, key) => {
                    map.set(key, value);
                });
            }
            return new Promise((resolve, reject) => {
                this.documentClient.query(request, (error, response) => {
                    if (error) {
                        reject(errors_1.fromGrpcError(error));
                    }
                    else {
                        const pagingTokenMap = protoMapToMap(response.getPagingTokenMap());
                        // clear paging token map
                        request.clearPagingTokenMap();
                        const documents = response
                            .getDocumentsList()
                            .map((doc) => new document_snapshot_1.DocumentSnapshot(new document_ref_1.DocumentRef(this.documentClient, this.collection, doc.getKey().getId()), doc.getContent().toJavaScript()));
                        resolve({
                            documents,
                            pagingToken: pagingTokenMap.size > 0 ? pagingTokenMap : null,
                        });
                    }
                });
            });
        });
    }
    getStreamRequest() {
        const request = new document_pb_1.DocumentQueryStreamRequest();
        request.setCollection(this.collection['toWire']());
        request.setLimit(this.fetchLimit);
        request.setExpressionsList(this.expressions);
        return request;
    }
    /**
     * Queries the collection and returns a readable stream.
     * @returns all query results as a stream
     * @example
     * ```typescript
     * import { documents } from "@nitric/sdk";
     *
     * const docs = documents();
     *
     * async function getDocs() {
     *   const docs = [];
     *   const stream = docs
     *     .collection('customers')
     *     .query()
     *     .where('name', '==', 'david')
     *     .stream();
     *
     *   for await (const chunk of stream) {
     *     docs.push(chunk);
     *   }
     *
     *   return docs;
     * }
     * ```
     *
     */
    stream() {
        const responseStream = this.documentClient.queryStream(this.getStreamRequest());
        const transform = new stream_1.Transform({
            objectMode: true,
            transform: (result, encoding, callback) => {
                const doc = result.getDocument();
                callback(undefined, new document_snapshot_1.DocumentSnapshot(new document_ref_1.DocumentRef(this.documentClient, this.collection, doc.getKey().getId()), doc.getContent().toJavaScript()));
            },
        });
        responseStream.on('error', (e) => transform.destroy(errors_1.fromGrpcError(e)));
        responseStream.pipe(transform);
        return transform;
    }
}
exports.Query = Query;
