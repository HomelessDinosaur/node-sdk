/**
 * ResourceExhaustedError
 *
 * The requested user resource has been exhausted.
 * Examples include API quotas being exceeded or diskspace running out
 */
export declare class ResourceExhaustedError extends Error {
    constructor(message: string);
}
