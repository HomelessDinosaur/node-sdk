import { StorageServiceClient } from '@nitric/api/proto/storage/v1/storage_grpc_pb';
/**
 * Nitric storage client, facilitates writing and reading from blob storage (buckets).
 */
export declare class Storage {
    StorageServiceClient: StorageServiceClient;
    constructor();
    /**
     * Create a bucket reference.
     *
     * @param name of the bucket to reference
     * @returns a bucket reference
     */
    bucket(name: string): Bucket;
}
/**
 * A reference to a storage bucket.
 */
export declare class Bucket {
    storage: Storage;
    name: string;
    constructor(storage: Storage, name: string);
    /**
     * Retrieve a list of files on the bucket
     * @returns An array of file references
     */
    files(): Promise<File[]>;
    file(name: string): File;
}
export declare enum FileMode {
    Read = 0,
    Write = 1
}
export interface SignUrlOptions {
    /**
     * The number of seconds the signed URL remains valid.
     * The minimum value is 1 and the maximum value is 604800 (7 days).
     */
    expiry?: number;
}
/**
 * A reference to a file in a bucket.
 */
export declare class File {
    storage: Storage;
    bucket: Bucket;
    name: string;
    constructor(storage: Storage, bucket: Bucket, name: string);
    /**
     * Get a pre-signed download URL for the file
     * @param opts the option passed to the signUrl function.
     * @returns a download URL string
     */
    getDownloadUrl(opts?: SignUrlOptions): Promise<string>;
    /**
     * Get a pre-signed upload URL for the file.
     * @param opts the option passed to the signUrl function.
     * @returns a upload URL string
     */
    getUploadUrl(opts?: SignUrlOptions): Promise<string>;
    /**
     * Create a presigned url for reading or writing for the given file reference
     * @param mode the mode the url will access the file with. E.g. reading or writing.
     * @param opts.expiry how long the URL should be valid for in seconds.
     * @deprecated for simplicity we suggest using getUploadUrl or getDownloadUrl
     */
    signUrl(mode: FileMode, opts?: SignUrlOptions): Promise<string>;
    /**
     * Write an array of bytes to the file
     * @param body The file contents to write
     * @returns A void promise
     *
     * Example:
     * ```typescript
     * import { Storage } from "@nitric/sdk";
     *
     * const storage = new Storage();
     *
     * const buf = Buffer.from("My Test File...");
     * await storage.bucket("my-bucket").file("my-item").write(buf);
     * ```
     */
    write(body: Uint8Array): Promise<void>;
    /**
     * Read the contents of this file as an array of bytes
     * @returns A byte array of the contents of the read blob
     *
     * Example:
     * ```typescript
     * import { Storage } from "@nitric/sdk";
     *
     * const storage = new Storage();
     *
     * const bytes = await storage.bucket("my-bucket").file("my-item").read();
     * ```
     */
    read(): Promise<Uint8Array>;
    /**
     * Delete this file from the bucket
     * @returns A void promise
     *
     * Example:
     * ```typescript
     * import { Storage } from "@nitric/sdk";
     *
     * const storage = new Storage();
     *
     * const bytes = await storage.bucket("my-bucket").file("my-item").delete();
     * ```
     */
    delete(): Promise<void>;
}
/**
 * Storage
 * @returns a Storage API client.
 * @example
 * ```typescript
 * import { storage } from "@nitric/sdk";
 *
 * async function writeToStorage() {
 *  const bucket = storage().bucket('bucket');
 *  const file = bucket.file('test-file');
 *  await file.write(contents)
 * }
 * ```
 */
export declare const storage: () => Storage;
