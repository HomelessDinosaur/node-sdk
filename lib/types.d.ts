export interface NitricEvent {
    /**
     * Uniquely identifies the event.
     *
     * Within your app you must ensure the ID is unique.
     * Subscribers can assume events with the same ID are duplicates and avoid reprocessing them
     */
    id?: string;
    /**
     * An optional description of the event type.
     *
     * Can be useful for de-serialization, routing or observability. The format of this value is determined by the producer.
     */
    payloadType?: string;
    /**
     * The event's payload data, with details of the event.
     */
    payload: Record<string, any>;
}
export interface Task {
    /**
     * Uniquely identifies the task.
     *
     * Within your app you must ensure the ID is unique.
     */
    id?: string;
    /**
     * The ID for the current lease of this task.
     *
     * A task may be leased multiple times, resulting in new lease IDs.
     */
    leaseId?: string;
    /**
     * An optional description of the task type.
     *
     * Can be useful for de-serialization, routing or observability. The format of this value is determined by the producer.
     */
    payloadType?: string;
    /**
     * The task's payload data, with details of the task or work to be done.
     */
    payload?: Record<string, any>;
}
export interface PublishOptions {
    /**
     * The name of the topic to publish to.
     */
    topicName: string;
    /**
     * The event to publish.
     */
    event: NitricEvent;
}
export declare type WhereQueryOperator = '<' | '<=' | '==' | '!=' | '>=' | '>' | 'startsWith';
export declare type WhereValueExpression = string | number | boolean;
export declare type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE' | 'OPTIONS';
