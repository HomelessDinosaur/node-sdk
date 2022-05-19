"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = exports.File = exports.FileMode = exports.Bucket = exports.Storage = void 0;
const tslib_1 = require("tslib");
// Copyright 2021, Nitric Technologies Pty Ltd.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
const constants_1 = require("../../../constants");
const storage_grpc_pb_1 = require("@nitric/api/proto/storage/v1/storage_grpc_pb");
const storage_pb_1 = require("@nitric/api/proto/storage/v1/storage_pb");
const grpc = tslib_1.__importStar(require("@grpc/grpc-js"));
const errors_1 = require("../../errors");
/**
 * Nitric storage client, facilitates writing and reading from blob storage (buckets).
 */
class Storage {
    constructor() {
        this.StorageServiceClient = new storage_grpc_pb_1.StorageServiceClient(constants_1.SERVICE_BIND, grpc.ChannelCredentials.createInsecure());
    }
    /**
     * Create a bucket reference.
     *
     * @param name of the bucket to reference
     * @returns a bucket reference
     */
    bucket(name) {
        if (!name) {
            throw new errors_1.InvalidArgumentError('A bucket name is required to use a Bucket.');
        }
        return new Bucket(this, name);
    }
    ;
}
exports.Storage = Storage;
/**
 * A reference to a storage bucket.
 */
class Bucket {
    constructor(storage, name) {
        this.storage = storage;
        this.name = name;
    }
    /**
     * Retrieve a list of files on the bucket
     * @returns An array of file references
     */
    files() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const request = new storage_pb_1.StorageListFilesRequest();
            request.setBucketName(this.name);
            return yield new Promise((res, rej) => {
                this.storage.StorageServiceClient.listFiles(request, (err, data) => {
                    if (err) {
                        rej(errors_1.fromGrpcError(err));
                    }
                    res(data.getFilesList().map(f => {
                        return new File(this.storage, this, f.getKey());
                    }));
                });
            });
        });
    }
    file(name) {
        if (!name) {
            throw new errors_1.InvalidArgumentError('A file name/path is required to use a File.');
        }
        return new File(this.storage, this, name);
    }
    ;
}
exports.Bucket = Bucket;
var FileMode;
(function (FileMode) {
    FileMode[FileMode["Read"] = 0] = "Read";
    FileMode[FileMode["Write"] = 1] = "Write";
})(FileMode = exports.FileMode || (exports.FileMode = {}));
const DEFAULT_SIGN_URL_OPTS = {
    expiry: 600,
};
/**
 * A reference to a file in a bucket.
 */
class File {
    constructor(storage, bucket, name) {
        this.storage = storage;
        this.bucket = bucket;
        this.name = name;
    }
    /**
     * Get a pre-signed download URL for the file
     * @param opts the option passed to the signUrl function.
     * @returns a download URL string
     */
    getDownloadUrl(opts) {
        return this.signUrl(FileMode.Read, opts);
    }
    /**
     * Get a pre-signed upload URL for the file.
     * @param opts the option passed to the signUrl function.
     * @returns a upload URL string
     */
    getUploadUrl(opts) {
        return this.signUrl(FileMode.Write, opts);
    }
    /**
     * Create a presigned url for reading or writing for the given file reference
     * @param mode the mode the url will access the file with. E.g. reading or writing.
     * @param opts.expiry how long the URL should be valid for in seconds.
     * @deprecated for simplicity we suggest using getUploadUrl or getDownloadUrl
     */
    signUrl(mode, opts = DEFAULT_SIGN_URL_OPTS) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { expiry } = Object.assign(Object.assign({}, DEFAULT_SIGN_URL_OPTS), opts);
            const request = new storage_pb_1.StoragePreSignUrlRequest();
            request.setBucketName(this.bucket.name);
            request.setKey(this.name);
            request.setOperation(mode);
            request.setExpiry(expiry);
            return new Promise((resolve, reject) => {
                this.storage.StorageServiceClient.preSignUrl(request, (error, response) => {
                    if (error) {
                        reject(errors_1.fromGrpcError(error));
                    }
                    else {
                        resolve(response.getUrl());
                    }
                });
            });
        });
    }
    ;
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
    write(body) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const request = new storage_pb_1.StorageWriteRequest();
            request.setBucketName(this.bucket.name);
            request.setKey(this.name);
            request.setBody(body);
            return new Promise((resolve, reject) => {
                this.storage.StorageServiceClient.write(request, (error) => {
                    if (error) {
                        reject(errors_1.fromGrpcError(error));
                    }
                    else {
                        resolve();
                    }
                });
            });
        });
    }
    ;
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
    read() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const request = new storage_pb_1.StorageReadRequest();
            request.setBucketName(this.bucket.name);
            request.setKey(this.name);
            return new Promise((resolve, reject) => {
                this.storage.StorageServiceClient.read(request, (error, response) => {
                    if (error) {
                        reject(errors_1.fromGrpcError(error));
                    }
                    else {
                        resolve(response.getBody_asU8());
                    }
                });
            });
        });
    }
    ;
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
    delete() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const request = new storage_pb_1.StorageDeleteRequest();
            request.setBucketName(this.bucket.name);
            request.setKey(this.name);
            return new Promise((resolve, reject) => {
                this.storage.StorageServiceClient.delete(request, (error) => {
                    if (error) {
                        reject(errors_1.fromGrpcError(error));
                    }
                    else {
                        resolve();
                    }
                });
            });
        });
    }
    ;
}
exports.File = File;
// Storage client singleton
let STORAGE = undefined;
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
exports.storage = () => {
    if (!STORAGE) {
        STORAGE = new Storage();
    }
    return STORAGE;
};
