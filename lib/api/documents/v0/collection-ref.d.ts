import { DocumentServiceClient } from '@nitric/api/proto/document/v1/document_grpc_pb';
import { Query } from './query';
import { DocumentRef, DocumentStructure } from './document-ref';
import { CollectionGroupRef } from './collection-group-ref';
/**
 * CollectionRef
 *
 * Provides a Document API CollectionRef class.
 */
export declare class CollectionRef<T extends DocumentStructure> {
    private documentClient;
    readonly name: string;
    readonly parent?: DocumentRef<any>;
    constructor(documentClient: DocumentServiceClient, name: string, parent?: DocumentRef<any>);
    /**
     * Return a reference to a subcollection within the documents of this collection.
     *
     * Useful when querying subcollection documents across all/many parent documents. E.g. Querying landmarks from multiple cities.
     * @param name
     */
    collection(name: string): CollectionGroupRef<T>;
    /**
     * Return a reference to a document in the collection.
     * @param documentId id the document unique id (required)
     * @returns new collection document reference
     */
    doc(id: string): DocumentRef<T>;
    /**
     * Create a new collection query object
     * @returns a new collection query object
     */
    query(): Query<T>;
    private toWire;
}
