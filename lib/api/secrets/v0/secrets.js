"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.secrets = exports.Secret = exports.Secrets = void 0;
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
const secret_grpc_pb_1 = require("@nitric/api/proto/secret/v1/secret_grpc_pb");
const secret_pb_1 = require("@nitric/api/proto/secret/v1/secret_pb");
const grpc = tslib_1.__importStar(require("@grpc/grpc-js"));
const errors_1 = require("../../errors");
const ENCODER = new TextEncoder();
const DECODER = new TextDecoder();
/**
 * Nitric secret client, facilitates writing and and accessing secrets.cd ../
 */
class Secrets {
    constructor() {
        /**
         * Get a reference to a secret
         * @retuns A Secret reference
         *
         * Example:
         * ```typescript
         * import { secrets } from "@nitric/sdk";
         *
         * const secret = secrets().secret("my-secret");
         * ```
         */
        this.secret = (name) => {
            if (!name) {
                throw new errors_1.InvalidArgumentError('A name is required to use a Secret.');
            }
            return new Secret(this, name);
        };
        this.SecretServiceClient = new secret_grpc_pb_1.SecretServiceClient(constants_1.SERVICE_BIND, grpc.ChannelCredentials.createInsecure());
    }
}
exports.Secrets = Secrets;
/**
 * A reference to a secret.
 */
class Secret {
    constructor(secrets, name) {
        this.secrets = secrets;
        this.name = name;
    }
    /**
     * Creates a new SecretVersion containing the given value
     *
     * @param secret - The secret value to store
     * @returns Promise<SecretVersion>
     * @example
     * ```typescript
     * import { secrets } from "@nitric/sdk";
     *
     * async function putSecret() {
     *  const secret = secrets().secret('secret');
     *  const version = await secret.put("ssssshhhhh... it's a secret");
     * }
     * ```
     */
    put(secret) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const secretBuff = typeof secret === 'string' ? ENCODER.encode(secret) : secret;
                const request = new secret_pb_1.SecretPutRequest();
                request.setSecret(Secret.toWire(this));
                request.setValue(secretBuff);
                this.secrets.SecretServiceClient.put(request, (error, response) => {
                    if (error) {
                        reject(errors_1.fromGrpcError(error));
                    }
                    else {
                        resolve(new SecretVersion(this.secrets, this, response.getSecretVersion().getVersion()));
                    }
                });
            });
        });
    }
    ;
    /**
     * Retrieves the latest version of a secret
     * @returns Promise<SecretVersion>
     * @example
     * ```typescript
     * import { secrets } from "@nitric/sdk";
     *
     * async function getSecret() {
     *  const secret = secrets().secret('secret');
     *  const latestVersion = secret.latest();
     * }
     * ```
     *
     */
    latest() {
        return this.version('latest');
    }
    ;
    /**
     * Retrieves the latest version of a secret
     * @returns Promise<SecretVersion>
     * @example
     * ```typescript
     * import { secrets } from "@nitric/sdk";
     *
     * const secret = secrets().secret('secret');
     * // NOTE: Version identifiers can difer between providers
     * // In most cases 'latest' should be used
     * const latestVersion = secret.version('1');
     * ```
     *
     */
    version(version) {
        if (!version) {
            throw new errors_1.InvalidArgumentError('A version is required to create a version reference.');
        }
        return new SecretVersion(this.secrets, this, version);
    }
    ;
}
exports.Secret = Secret;
Secret.toWire = (secret) => {
    const wire = new secret_pb_1.Secret();
    wire.setName(secret.name);
    return wire;
};
/**
 * A reference to a secret version.
 */
class SecretVersion {
    constructor(secrets, secret, version) {
        this.secrets = secrets;
        this.secret = secret;
        this.version = version;
    }
    /**
     * Accesses the value stored in a secret version
     *
     * @param secret - The secret value to store
     * @returns Promise<Uint8Array>
     * @example
     * ```typescript
     * import { secrets } from "@nitric/sdk";
     *
     * async function accessSecret() {
     *  const secret = secrets().secret('secret').latest();
     *  const secretValue = await secret.access();
     * }
     * ```
     */
    access() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const request = new secret_pb_1.SecretAccessRequest();
                request.setSecretVersion(SecretVersion.toWire(this));
                this.secrets.SecretServiceClient.access(request, (error, response) => {
                    if (error) {
                        reject(errors_1.fromGrpcError(error));
                    }
                    else {
                        const secretVersion = new SecretVersion(this.secrets, this.secret, response.getSecretVersion().getVersion());
                        const val = new SecretValue(secretVersion, response.getValue_asU8());
                        resolve(val);
                    }
                });
            });
        });
    }
    ;
}
SecretVersion.toWire = (secretVersion) => {
    const wire = new secret_pb_1.SecretVersion();
    wire.setSecret(Secret.toWire(secretVersion.secret));
    wire.setVersion(secretVersion.version);
    return wire;
};
/**
 * Container for a SecretValue
 * Also provides additional metadata about the actual accessed secret version in the case that "latest" is used
 */
class SecretValue {
    constructor(secretVersion, val) {
        /**
         * @returns Uint8Array
         * @example
         * ```typescript
         * import { secrets } from "@nitric/sdk";
         *
         * async function accessSecret() {
         *  const secret = secrets().secret('secret').latest();
         *  const secretValue = await secret.access();
         *
         *  const content = secretValue.asBytes();
         * }
         * ```
         */
        this.asBytes = () => {
            return this.val;
        };
        /**
         * @returns string
         * @example
         * ```typescript
         * import { secrets } from "@nitric/sdk";
         *
         * async function accessSecret() {
         *  const secret = secrets().secret('secret').latest();
         *  const secretValue = await secret.access();
         *
         *  const content = secretValue.asString();
         * }
         * ```
         */
        this.asString = () => {
            return DECODER.decode(this.asBytes());
        };
        this.secretVersion = secretVersion;
        this.val = val;
    }
}
// Secrets client singleton
let SECRETS = undefined;
/**
 * Secrets
 * @returns a Secrets API client.
 * @example
 * ```typescript
 * import { secrets } from "@nitric/sdk";
 *
 * async function getSecret() {
 *  const secret = secrets().secret('secret');
 *  const version = secret.latest();
 *  const content = await version.access();
 * }
 * ```
 */
exports.secrets = () => {
    if (!SECRETS) {
        SECRETS = new Secrets();
    }
    return SECRETS;
};
