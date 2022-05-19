import { Resource as ProtoResource, ActionMap } from '@nitric/api/proto/resource/v1/resource_pb';
export declare type ActionsList = ActionMap[keyof ActionMap][];
export declare abstract class Resource {
    /**
     * Unique name for the resource by type within the stack.
     *
     * This name can be used in all future references, it will be resolved automatically at runtime.
     */
    readonly name: string;
    /**
     * Used to resolve the given resource for policy creation
     */
    private _registerPromise;
    constructor(name: string);
    protected get registerPromise(): Promise<ProtoResource>;
    protected set registerPromise(promise: Promise<ProtoResource>);
    protected abstract register(): Promise<ProtoResource>;
}
export declare abstract class SecureResource<P> extends Resource {
    protected abstract permsToActions(...perms: P[]): ActionsList;
    protected registerPolicy(...perms: P[]): void;
}
export declare type newer<T> = (name: string, ...args: any[]) => T;
/**
 * Provides a new resource instance.
 *
 * @param name the _unique_ name of the resource within the stack
 * @returns the resource
 */
export declare const make: <T extends Resource>(T: new (name: string, ...args: any[]) => T) => newer<T>;
