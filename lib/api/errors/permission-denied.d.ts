/**
 * PermissionDeniedError
 *
 * The client is authenticated but does not have permission to
 * perform the requested operation
 */
export declare class PermissionDeniedError extends Error {
    constructor(message: string);
}
