import { Resource } from '@nitric/api/proto/resource/v1/resource_pb';
import { Secret } from '../api/secrets';
import { ActionsList, SecureResource } from './common';
declare type SecretPermission = 'put' | 'access';
/**
 * Cloud secret resource for secret storage
 */
export declare class SecretResource extends SecureResource<SecretPermission> {
    protected register(): Promise<Resource>;
    protected permsToActions(...perms: SecretPermission[]): ActionsList;
    for(...perms: SecretPermission[]): Secret;
}
export declare const secret: import("./common").newer<SecretResource>;
export {};
