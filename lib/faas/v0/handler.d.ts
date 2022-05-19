import { TriggerContext, HttpContext, EventContext } from '.';
export declare type GenericHandler<Ctx> = (ctx: Ctx) => Promise<Ctx> | Ctx;
export declare type TriggerHandler = GenericHandler<TriggerContext>;
export declare type HttpHandler = GenericHandler<HttpContext>;
export declare type EventHandler = GenericHandler<EventContext>;
export declare type GenericMiddleware<Ctx> = (ctx: Ctx, next?: GenericHandler<Ctx>) => Promise<Ctx | void> | Ctx | void;
export declare type TriggerMiddleware = GenericMiddleware<TriggerContext>;
export declare type HttpMiddleware = GenericMiddleware<HttpContext>;
export declare type EventMiddleware = GenericMiddleware<EventContext>;
/**
 * createHandler
 *
 * Used to compose multiple handler functions into a single function that calls each of the provided handlers in order.
 *
 * The handlers are passed to each other via the 'next' argument.
 *
 * @param handlers one or more handler functions to be chained together into a single root function.
 *
 * @returns - A root function composed of a chain of user provided functions
 */
export declare const createHandler: <Ctx extends TriggerContext<import("./context").AbstractRequest, any> = TriggerContext<import("./context").AbstractRequest, any>>(...handlers: GenericMiddleware<Ctx>[]) => GenericMiddleware<Ctx>;
