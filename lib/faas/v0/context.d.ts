import { TriggerRequest, TriggerResponse } from '@nitric/api/proto/faas/v1/faas_pb';
export declare abstract class TriggerContext<Req extends AbstractRequest = AbstractRequest, Resp extends Record<string, any> = any> {
    protected request: Req;
    protected response: Resp;
    /**
     *
     */
    get http(): HttpContext | undefined;
    /**
     *
     */
    get event(): EventContext | undefined;
    /**
     *
     */
    get req(): Req;
    /**
     *
     */
    get res(): Resp;
    static fromGrpcTriggerRequest(trigger: TriggerRequest): TriggerContext<any, any>;
    static toGrpcTriggerResponse(ctx: TriggerContext): TriggerResponse;
}
export declare abstract class AbstractRequest {
    readonly data: string | Uint8Array;
    protected constructor(data: string | Uint8Array);
    text(): string;
    json(): Record<string, any>;
}
interface EventResponse {
    success: boolean;
}
declare type Method = 'GET' | 'POST' | 'DELETE' | 'PATCH' | 'PUT' | 'HEAD';
interface HttpRequestArgs {
    data: string | Uint8Array;
    method: Method | string;
    path: string;
    params: Record<string, string>;
    query: Record<string, string[]>;
    headers: Record<string, string[]>;
}
export declare class HttpRequest extends AbstractRequest {
    readonly method: Method | string;
    readonly path: string;
    readonly params: Record<string, string>;
    readonly query: Record<string, string[]>;
    readonly headers: Record<string, string[] | string>;
    constructor({ data, method, path, params, query, headers }: HttpRequestArgs);
}
interface HttpResponseArgs {
    body: string | Uint8Array;
    status: number;
    headers: Record<string, string[]>;
    ctx: HttpContext;
}
export declare class HttpResponse {
    status: number;
    body: string | Uint8Array | Record<string, any>;
    headers: Record<string, string[]>;
    private ctx;
    constructor({ status, headers, body, ctx }: HttpResponseArgs);
    /**
     * Helper method to encode to JSON string for JSON http responses
     * @returns HttpContext with body property set with an encoded JSON string and json headers set.
     */
    get json(): (data: string | number | boolean | Record<string, any>) => HttpContext;
}
export declare class EventRequest extends AbstractRequest {
    readonly topic: string;
    constructor(data: string | Uint8Array, topic: string);
}
export declare class HttpContext extends TriggerContext<HttpRequest, HttpResponse> {
    get http(): HttpContext;
    static fromGrpcTriggerRequest(trigger: TriggerRequest): HttpContext;
    static toGrpcTriggerResponse(ctx: TriggerContext): TriggerResponse;
}
export declare class EventContext extends TriggerContext<EventRequest, EventResponse> {
    get event(): EventContext;
    static fromGrpcTriggerRequest(trigger: TriggerRequest): EventContext;
    static toGrpcTriggerResponse(ctx: TriggerContext): TriggerResponse;
}
export {};
