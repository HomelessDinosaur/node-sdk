"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollectionGroupRef = void 0;
const errors_1 = require("../../errors");
const collection_ref_1 = require("./collection-ref");
const constants_1 = require("./constants");
const document_ref_1 = require("./document-ref");
const query_1 = require("./query");
const NIL_DOC_ID = '';
/**
 * CollectionGroupRef
 *
 * Provides a Document API CollectionGroupRef class.
 */
class CollectionGroupRef {
    constructor(documentClient, name, parent) {
        this.documentClient = documentClient;
        this.name = name;
        this.parent = parent;
    }
    /**
     * Create a CollectionGroupRef referencing a sub-collection of this collection
     * @param name
     */
    collection(name) {
        if (this.depth() >= constants_1.MAX_COLLECTION_DEPTH) {
            throw new errors_1.InvalidArgumentError(`Maximum collection depth ${constants_1.MAX_COLLECTION_DEPTH} exceeded`);
        }
        return new CollectionGroupRef(this.documentClient, name, this);
    }
    /**
     * Create a new collection query object
     * @returns a new collection query object
     */
    query() {
        return new query_1.Query(this.documentClient, this.toCollectionRef());
    }
    depth() {
        if (this.parent) {
            return this.parent.depth() + 1;
        }
        return 0;
    }
    toCollectionRef() {
        if (this.parent) {
            return new collection_ref_1.CollectionRef(this.documentClient, this.name, new document_ref_1.DocumentRef(this.documentClient, this.parent.toCollectionRef(), NIL_DOC_ID));
        }
        return new collection_ref_1.CollectionRef(this.documentClient, this.name);
    }
    /**
     * Creates a collection group reference from a collection reference
     * @param ref
     * @param dc
     */
    static fromCollectionRef(ref, dc) {
        if (ref.parent) {
            return new CollectionGroupRef(dc, ref.name, CollectionGroupRef.fromCollectionRef(ref.parent.parent, dc));
        }
        return new CollectionGroupRef(dc, ref.name);
    }
}
exports.CollectionGroupRef = CollectionGroupRef;
