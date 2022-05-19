import { SecretServiceClient } from '@nitric/api/proto/secret/v1/secret_grpc_pb';
import { SecretVersion as GrpcSecretVersion, Secret as GrpcSecret } from '@nitric/api/proto/secret/v1/secret_pb';
/**
 * Nitric secret client, facilitates writing and and accessing secrets.cd ../
 */
export declare class Secrets {
    SecretServiceClient: SecretServiceClient;
    constructor();
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
    secret: (name: string) => Secret;
}
/**
 * A reference to a secret.
 */
export declare class Secret {
    readonly secrets: Secrets;
    readonly name: string;
    constructor(secrets: Secrets, name: string);
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
    put(secret: string | Uint8Array): Promise<SecretVersion>;
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
    latest(): SecretVersion;
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
    version(version: string): SecretVersion;
    static toWire: (secret: Secret) => GrpcSecret;
}
/**
 * A reference to a secret version.
 */
declare class SecretVersion {
    readonly secrets: Secrets;
    readonly secret: Secret;
    readonly version: string;
    constructor(secrets: Secrets, secret: Secret, version: string);
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
    access(): Promise<SecretValue>;
    static toWire: (secretVersion: SecretVersion) => GrpcSecretVersion;
}
/**
 * Container for a SecretValue
 * Also provides additional metadata about the actual accessed secret version in the case that "latest" is used
 */
declare class SecretValue {
    readonly secretVersion: SecretVersion;
    private readonly val;
    constructor(secretVersion: SecretVersion, val: Uint8Array);
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
    asBytes: () => Uint8Array;
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
    asString: () => string;
}
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
export declare const secrets: () => Secrets;
export {};
