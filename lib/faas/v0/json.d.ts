import { HttpContext, HttpMiddleware } from '.';
/**
 * HttpMiddleware that takes a ctx.req containing raw data (string | Uint8Array) and parses it as JSON into ctx.body
 * @param ctx HttpContext containing the raw request data.
 * @returns HttpContext with body property added containing a decoded JSON object from the req data.
 */
export declare const json: () => HttpMiddleware;
/**
 * Helper method to encode to JSON string for JSON http responses
 * @param ctx HttpContext
 * @returns HttpContext with body property set with an encoded JSON string and json headers set.
 */
export declare const jsonResponse: (ctx: HttpContext) => (data: string | number | boolean | Record<string, any>) => HttpContext;
