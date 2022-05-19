/**
 * OutOfRangeError
 *
 * The operation was attempted outside of valid range
 * e.g. seeking past the end of a file or array, or specifying invalid offsets
 */
export declare class OutOfRangeError extends Error {
    constructor(message: string);
}
