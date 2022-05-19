import { Resource } from '@nitric/api/proto/resource/v1/resource_pb';
import { SecureResource } from './common';
import { DocumentStructure } from '../api/documents/v0/document-ref';
declare type CollectionPermission = 'reading' | 'writing' | 'deleting';
/**
 * A document collection resources, such as a collection/table in a document database.
 */
export declare class CollectionResource<T extends DocumentStructure> extends SecureResource<CollectionPermission> {
    /**
     * Register this collection as a required resource for the calling function/container
     * @returns a promise that resolves when the registration is complete
     */
    protected register(): Promise<Resource>;
    protected permsToActions(...perms: CollectionPermission[]): any[];
    /**
     * Return a collection reference and register the permissions required by the currently scoped function for this resource.
     *
     * e.g. const customers = resources.collection('customers').for('reading', 'writing')
     *
     * @param perms the required permission set
     * @returns a usable collection reference
     */
    for(...perms: CollectionPermission[]): import("../api/documents/v0/collection-ref").CollectionRef<T>;
}
export declare function collection<T extends DocumentStructure>(name: string): CollectionResource<T>;
export {};
