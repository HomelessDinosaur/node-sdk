"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHandler = void 0;
const tslib_1 = require("tslib");
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
exports.createHandler = (...handlers) => {
    const reversedHandlers = handlers.slice().reverse();
    return (ctx, finalNext = ctx => ctx) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        if (handlers.length < 1) {
            throw new Error('at least one handler or middleware function must be provided');
        }
        if (handlers.some((handler) => typeof handler !== 'function')) {
            throw new Error('all handlers and middleware must be functions');
        }
        // Chain the provided handlers together, passing each as 'next' to the following handler in the chain.
        const composedHandler = reversedHandlers.reduce((next, h) => {
            const nextNext = (ctx) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
                // Actual function written by user that calls next and returns context
                return (yield h(ctx, next)) || ctx;
            });
            return nextNext;
        }, finalNext);
        // Call the root user function from this function
        return yield composedHandler(ctx);
    });
};
