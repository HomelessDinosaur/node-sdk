import { DocumentServiceClient } from '@nitric/api/proto/document/v1/document_grpc_pb';
import { CollectionRef } from './collection-ref';
export declare type DocumentStructure = Record<string, any>;
/**
 * Document Ref
 *
 * Provides a Document Reference class.
 * Used to create references to collections.
 */
export declare class DocumentRef<T extends DocumentStructure> {
    private documentClient;
    readonly parent: CollectionRef<T>;
    readonly id: string;
    constructor(documentClient: DocumentServiceClient, parent: CollectionRef<T>, id: string);
    /**
     * Return the collection document reference value.
     * @returns the collection document reference value, or null if not found
     */
    get(): Promise<T>;
    /**
     * Set the document content for this document reference in the database. If the
     * document does not exist an new item will be created, otherwise an
     * existing document will be update with the new value.
     * @param value content the document content to store (required)
     */
    set(value: T): Promise<void>;
    /**
     * Delete this document reference from the database if it exists.
     */
    delete(): Promise<void>;
    private toWire;
    private depth;
    /**
     * Gets a Collection instance that refers to the collection at the specified path.
     * @param name The name of the collection (required)
     * @returns The Collection instance
     */
    collection<T extends DocumentStructure>(name: string): CollectionRef<T>;
}
