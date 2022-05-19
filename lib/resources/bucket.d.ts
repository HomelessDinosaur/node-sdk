import { Resource } from '@nitric/api/proto/resource/v1/resource_pb';
import { Bucket } from '../api/storage';
import { ActionsList, SecureResource } from './common';
declare type BucketPermission = 'reading' | 'writing' | 'deleting';
/**
 * Cloud storage bucket resource for large file storage.
 */
export declare class BucketResource extends SecureResource<BucketPermission> {
    /**
     * Register this bucket as a required resource for the calling function/container
     * @returns a promise that resolves when the registration is complete
     */
    protected register(): Promise<Resource>;
    protected permsToActions(...perms: BucketPermission[]): ActionsList;
    /**
     * Return a bucket reference and register the permissions required by the currently scoped function for this resource.
     *
     * e.g. const imgs = resources.bucket('image').for('writing')
     *
     * @param perms the required permission set
     * @returns a usable bucket reference
     */
    for(...perms: BucketPermission[]): Bucket;
}
export declare const bucket: import("./common").newer<BucketResource>;
export {};
