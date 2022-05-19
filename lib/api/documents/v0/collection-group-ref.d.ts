import { DocumentServiceClient } from '@nitric/api/proto/document/v1/document_grpc_pb';
import { CollectionRef } from './collection-ref';
import { DocumentStructure } from './document-ref';
import { Query } from './query';
/**
 * CollectionGroupRef
 *
 * Provides a Document API CollectionGroupRef class.
 */
export declare class CollectionGroupRef<T extends DocumentStructure> {
    private documentClient;
    readonly parent: CollectionGroupRef<any>;
    readonly name: string;
    constructor(documentClient: DocumentServiceClient, name: string, parent?: CollectionGroupRef<any>);
    /**
     * Create a CollectionGroupRef referencing a sub-collection of this collection
     * @param name
     */
    collection<T extends DocumentStructure>(name: string): CollectionGroupRef<T>;
    /**
     * Create a new collection query object
     * @returns a new collection query object
     */
    query(): Query<T>;
    private depth;
    private toCollectionRef;
    /**
     * Creates a collection group reference from a collection reference
     * @param ref
     * @param dc
     */
    static fromCollectionRef(ref: CollectionRef<any>, dc: DocumentServiceClient): CollectionGroupRef<any>;
}
