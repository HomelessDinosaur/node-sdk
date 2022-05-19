/**
 * FailedPreconditionError
 *
 * Operation was rejected due to the system being not being
 * in a state required for the requested operation.
 */
export declare class FailedPreconditionError extends Error {
    constructor(message: string);
}
