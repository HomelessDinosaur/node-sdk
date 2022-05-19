import { CollectionRef } from './collection-ref';
import { DocumentStructure } from './document-ref';
/**
 * Documents
 *
 * Provides a Document API client.
 * Used to create references to collections.
 */
export declare class Documents {
    private documentClient;
    constructor();
    /**
     * Gets a Collection instance that refers to the collection at the specified path.
     * @param name The name of the collection (required)
     * @returns The Collection instance
     */
    collection<T extends DocumentStructure>(name: string): CollectionRef<T>;
}
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
export declare const documents: () => Documents;
