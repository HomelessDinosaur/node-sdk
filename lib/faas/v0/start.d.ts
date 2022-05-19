import { EventMiddleware, HttpMiddleware, TriggerMiddleware } from '.';
import { ApiWorkerOptions, RateWorkerOptions } from "../../resources";
declare class FaasWorkerOptions {
}
declare type FaasClientOptions = ApiWorkerOptions | RateWorkerOptions | FaasWorkerOptions;
/**
 *
 */
export declare class Faas {
    private httpHandler?;
    private eventHandler?;
    private anyHandler?;
    private readonly options;
    constructor(opts: FaasClientOptions);
    /**
     * Add an event handler to this Faas server
     */
    event(...handlers: EventMiddleware[]): Faas;
    /**
     * Add a http handler to this Faas server
     */
    http(...handlers: HttpMiddleware[]): Faas;
    /**
     * Get http handler for this server
     */
    private getHttpHandler;
    /**
     * Get event handler for this server
     */
    private getEventHandler;
    /**
     * Start the Faas server
     */
    start(...handlers: TriggerMiddleware[]): Promise<void>;
}
/**
 * Register a HTTP handler
 */
export declare const http: (...handlers: HttpMiddleware[]) => Faas;
/**
 * Register an event handler
 */
export declare const event: (...handlers: EventMiddleware[]) => Faas;
/**
 * Start the FaaS server with a universal handler
 */
export declare const start: (...handlers: TriggerMiddleware[]) => Promise<void>;
export {};
