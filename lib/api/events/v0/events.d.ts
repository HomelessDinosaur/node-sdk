import { EventServiceClient, TopicServiceClient } from '@nitric/api/proto/event/v1/event_grpc_pb';
import type { NitricEvent } from '../../../types';
export declare class Topic {
    eventing: Eventing;
    name: string;
    constructor(eventing: Eventing, name: string);
    /**
     * Publishes an event to a nitric topic
     * @param event The event to publish
     * @returns NitricEvent containing the unique id of the event (if not provided it will be generated)
     *
     * @example
     * ```typescript
     * import { Eventing } from "@nitric/sdk";
     *
     * const eventing = Eventing();
     *
     * async function publishEvent(): NitricEvent {
     *   const topic = eventing.topic("my-topic");
     *   const event = {
     *     payloadType: "my-payload",
     *     payload: {
     *       value: "Hello World!"
     *     }
     *   };
     *
     *   return await topic.publish(event);
     * }
     * ```
     */
    publish(event: NitricEvent): Promise<NitricEvent>;
}
/**
 * Eventing object encapsulating the Nitric gRPC clients for Event and Topic services.
 *
 * Used to created references to Topics and perform Event publishing operations.
 *
 * @example
 * ```typescript
 * import { Eventing } from "@nitric/sdk";
 * const eventing = new Eventing();
 * const topic = eventing.topic('notifications');
 * ```
 */
export declare class Eventing {
    private _clients;
    get EventServiceClient(): EventServiceClient;
    get TopicServiceClient(): TopicServiceClient;
    /**
     * Get a reference to a Topic.
     *
     * @param name Name of the topic, as defined in nitric.yaml.
     *
     * @example
     * ```typescript
     * import { Eventing } from "@nitric/sdk";
     * const eventing = new Eventing();
     * const topic = eventing.topic('notifications');
     * ```
     *
     */
    topic(name: string): Topic;
    /**
     * Retrieve all available topic references by querying for available topics.
     *
     * @retuns A promise containing the list of available nitric topics
     *
     * Example:
     * ```typescript
     * import { Eventing } from "@nitric/sdk";
     *
     * const eventing = new Eventing();
     *
     * const topics = await eventing.topics();
     * ```
     */
    topics(): Promise<Topic[]>;
}
/**
 * Events
 * @returns an Events API client.
 * @example
 * ```typescript
 * import { events } from "@nitric/sdk";
 *
 * async function publishEvent() {
 *  const topic = events().topic('notifications');
 *
 *  await topic.publish({
 *    payload: {
 *     amazing: 'thing happened!',
 *    },
 *  });
 *
 *  return 'Successfully published notification';
 * }
 * ```
 */
export declare const events: () => Eventing;
