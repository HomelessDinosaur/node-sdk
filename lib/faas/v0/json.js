"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jsonResponse = exports.json = void 0;
const decodeData = (data) => {
    if (typeof data !== 'string') {
        return new TextDecoder('utf-8').decode(data);
    }
    return data;
};
/**
 * HttpMiddleware that takes a ctx.req containing raw data (string | Uint8Array) and parses it as JSON into ctx.body
 * @param ctx HttpContext containing the raw request data.
 * @returns HttpContext with body property added containing a decoded JSON object from the req data.
 */
exports.json = () => (ctx, next) => {
    ctx.req.body = JSON.parse(decodeData(ctx.req.data));
    return next(ctx);
};
/**
 * Helper method to encode to JSON string for JSON http responses
 * @param ctx HttpContext
 * @returns HttpContext with body property set with an encoded JSON string and json headers set.
 */
exports.jsonResponse = (ctx) => (data) => {
    ctx.res.body = new TextEncoder().encode(JSON.stringify(data));
    ctx.res.headers['Content-Type'] = ['application/json'];
    return ctx;
};
