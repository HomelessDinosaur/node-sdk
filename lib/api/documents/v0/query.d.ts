/// <reference types="node" />
import { DocumentQueryStreamRequest } from '@nitric/api/proto/document/v1/document_pb';
import { DocumentServiceClient } from '@nitric/api/proto/document/v1/document_grpc_pb';
import { WhereQueryOperator, WhereValueExpression } from '../../../types';
import { DocumentStructure } from './document-ref';
import { CollectionRef } from './collection-ref';
import { DocumentSnapshot } from './document-snapshot';
declare type PagingToken = Map<string, string>;
interface ReadableStream<T> extends NodeJS.ReadableStream {
    on(event: string | symbol, listener: (...args: T[]) => void): this;
}
export interface FetchResponse<T> {
    documents: DocumentSnapshot<T>[];
    pagingToken: Map<string, string>;
}
/**
 * Documents
 *
 * Provides a Document API client.
 * Used to create references to collections.
 */
export declare class Query<T extends DocumentStructure> {
    private documentClient;
    readonly collection: CollectionRef<T>;
    private expressions;
    private pagingToken;
    private fetchLimit;
    constructor(documentClient: DocumentServiceClient, collection: CollectionRef<T>);
    /**
     * Add a where expression to the query.
     *
     * @param field operand the left hand side expression operand
     * @param operator the query expression operator
     * @param value right hand side operand
     * @returns the Query operation
     */
    where(field: string, operator: WhereQueryOperator, value: WhereValueExpression): Query<T>;
    /**
     * Set the query paging continuation token.
     *
     * @param pagingToken
     * @returns the Query operation
     */
    pagingFrom(pagingToken: PagingToken): Query<T>;
    /**
     * Set the query fetch limit.
     *
     * @param limit
     * @returns the Query operation
     */
    limit(limit: number): Query<T>;
    fetch(): Promise<FetchResponse<T>>;
    protected getStreamRequest(): DocumentQueryStreamRequest;
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
    stream(): ReadableStream<DocumentSnapshot<T>>;
}
export {};
