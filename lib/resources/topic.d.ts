import { EventMiddleware } from '../faas';
import { Topic } from '../api/';
import { Resource } from '@nitric/api/proto/resource/v1/resource_pb';
import { ActionsList, SecureResource } from './common';
declare type TopicPermission = 'publishing';
export declare class SubscriptionWorkerOptions {
    readonly topic: string;
    constructor(topic: string);
}
/**
 * Topic resource for pub/sub async messaging.
 */
export declare class TopicResource extends SecureResource<TopicPermission> {
    /**
     * Register this topic as a required resource for the calling function/container
     * @returns a promise that resolves when the registration is complete
     */
    protected register(): Promise<Resource>;
    protected permsToActions(...perms: TopicPermission[]): ActionsList;
    /**
     * Register and start a subscription handler that will be called for all events from this topic.
     * @param mw handler middleware which will be run for every incoming event
     * @returns Promise which resolves when the handler server terminates
     */
    subscribe(...mw: EventMiddleware[]): Promise<void>;
    /**
     * Return a topic reference and register the permissions required by the currently scoped function for this resource.
     *
     * e.g. const updates = resources.topic('updates').for('publishing')
     *
     * @param perms the required permission set
     * @returns a usable topic reference
     */
    for<T>(...perms: TopicPermission[]): Topic;
}
export declare const topic: import("./common").newer<TopicResource>;
export {};
