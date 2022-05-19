import { Resource } from '@nitric/api/proto/resource/v1/resource_pb';
import { Queue } from '../api/';
import { ActionsList, SecureResource } from './common';
export declare type QueuePermission = 'sending' | 'receiving';
/**
 * Queue resource for async send/receive messaging
 */
export declare class QueueResource extends SecureResource<QueuePermission> {
    /**
     * Register this queue as a required resource for the calling function/container
     * @returns a promise that resolves when the registration is complete
     */
    protected register(): Promise<Resource>;
    protected permsToActions(...perms: QueuePermission[]): ActionsList;
    /**
     * Return a queue reference and register the permissions required by the currently scoped function for this resource.
     *
     * e.g. const taskQueue = resources.queue('work').for('sending')
     *
     * @param perm
     * @param perms
     * @returns
     */
    for(...perms: QueuePermission[]): Queue;
}
export declare const queue: import("./common").newer<QueueResource>;
