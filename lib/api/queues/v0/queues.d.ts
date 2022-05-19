import { QueueServiceClient } from '@nitric/api/proto/queue/v1/queue_grpc_pb';
import type { Task } from '../../../types';
/**
 * A message that has failed to be enqueued
 */
interface FailedMessage {
    task: Task;
    message: string;
}
/**
 * Nitric queue client, facilitates pushing and popping to distributed queues.
 */
export declare class Queueing {
    QueueServiceClient: QueueServiceClient;
    constructor();
    queue: (name: string) => Queue;
}
export declare class Queue {
    queueing: Queueing;
    name: string;
    constructor(queueing: Queueing, name: string);
    /**
     * Send an task to a queue, which can be retrieved by other services.
     *
     * If an array of tasks is provided the returns promise will resolve to an array containing
     * any tasks that failed to be sent to the queue.
     *
     * When a single task is provided a void promise will be returned, which rejects if the
     * task fails to be sent to the queue.
     *
     * @param tasks one or more tasks to push to the queue
     * @returns A void promise for a single task or a list of failed tasks when sending an array of tasks.
     *
     * Example:
     * ```typescript
     * import { Queueing } from "@nitric/sdk";
     *
     * const queueing = new Queueing();
     * const queue = queueing.queue("my-queue")
     * await queue.send({
     *   id: "1234";
     *   payloadType: "my-payload";
     *   payload: {
     *     value: "test"
     *   };
     * });
     */
    send(tasks: Task[]): Promise<FailedMessage[]>;
    send(tasks: Task): Promise<void>;
    /**
     * Pop 1 or more queue items from the specified queue up to the depth limit.
     *
     * Nitric Tasks are leased for a limited period of time, where they may be worked on.
     * Once complete or failed they must be acknowledged using request specified leaseId.
     *
     * If the lease on a queue item expires before it is acknowledged or the lease is extended the task will be returned to the queue for reprocessing.
     *
     * @param depth the maximum number of items to return. Default 1, Min 1.
     * @returns The list of received tasks
     *
     * Example:
     * ```typescript
     * import { Queueing } from "@nitric/sdk"
     *
     * const queueing = new Queueing();
     *
     * const [task] = await queueing.queue("my-queue").receive();
     *
     * // do something with task
     * ```
     */
    receive(depth?: number): Promise<ReceivedTask[]>;
}
export declare class ReceivedTask implements Task {
    id: string;
    leaseId: string;
    payloadType?: string;
    payload?: Record<string, any>;
    queue: Queue;
    constructor({ id, leaseId, payload, payloadType, queue, }: Task & {
        id: string;
        leaseId: string;
        queue: Queue;
    });
    /**
     * Marks a queue item as successfully completed and removes it from the queue.
     *
     * @returns A void promise
     *
     * Example:
     * ```typescript
     * import { Queueing } from "@nitric/sdk"
     *
     * const queueing = new Queueing();
     *
     * const [task] = await queueing.queue("my-queue").receive();
     *
     * // do something with task
     *
     * // complete the task
     * await task.complete();
     * ```
     */
    complete(): Promise<void>;
}
/**
 * Queues
 * @returns a Queues API client.
 * @example
 * ```typescript
 * import { queues } from "@nitric/sdk";
 *
 * async function publishToQueue() {
 *  await queues()
 *  .queue('my-queue')
 *  .send({
 *    payload: {
 *      example: 'payload',
 *    },
 *  });
 * }
 * ```
 */
export declare const queues: () => Queueing;
export {};
