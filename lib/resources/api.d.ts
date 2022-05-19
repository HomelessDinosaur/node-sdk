import { HttpMiddleware } from '../faas';
import { Resource } from '@nitric/api/proto/resource/v1/resource_pb';
import { HttpMethod } from '../types';
import { Resource as Base } from './common';
export declare class ApiWorkerOptions {
    readonly api: string;
    readonly route: string;
    readonly methods: HttpMethod[];
    readonly opts: MethodOptions<string>;
    constructor(api: string, route: string, methods: HttpMethod[], opts?: MethodOptions<string>);
}
interface MethodOptions<SecurityDefs extends string> {
    /**
     * Optional security definitions for this method
     */
    security?: Partial<Record<SecurityDefs, string[]>>;
}
interface RouteOpts {
    /**
     * Optional middleware to apply to all methods for the route. Useful for universal middleware such as CORS or Auth.
     */
    middleware?: HttpMiddleware[] | HttpMiddleware;
}
declare class Route<SecurityDefs extends string> {
    readonly api: Api<SecurityDefs>;
    readonly path: string;
    readonly middleware: HttpMiddleware[];
    constructor(api: Api<SecurityDefs>, path: string, opts?: RouteOpts);
    method(methods: HttpMethod[], opts: MethodOptions<SecurityDefs>, ...middleware: HttpMiddleware[]): Promise<void>;
    /**
     * Register a handler function for GET requests to this route
     */
    get(opts: MethodOptions<SecurityDefs>, ...middleware: HttpMiddleware[]): Promise<void>;
    /**
     * Register a handler function for POST requests to this route
     */
    post(opts: MethodOptions<SecurityDefs>, ...middleware: HttpMiddleware[]): Promise<void>;
    /**
     * Register a handler function for PUT requests to this route
     */
    put(opts: MethodOptions<SecurityDefs>, ...middleware: HttpMiddleware[]): Promise<void>;
    /**
     * Register a handler function for PATCH requests to this route
     */
    patch(opts: MethodOptions<SecurityDefs>, ...middleware: HttpMiddleware[]): Promise<void>;
    /**
     * Register a handler function for DELETE requests to this route
     */
    delete(opts: MethodOptions<SecurityDefs>, ...middleware: HttpMiddleware[]): Promise<void>;
    /**
     * Register a handler function for OPTIONS requests to this route
     */
    options(opts: MethodOptions<SecurityDefs>, ...middleware: HttpMiddleware[]): Promise<void>;
    /**
     * Register a handler function for GET, POST, PATCH, PUT and DELETE requests to this route.
     *
     * Most useful when routing isn't important or you're doing you own internal routing.
     */
    all(opts: MethodOptions<SecurityDefs>, ...middleware: HttpMiddleware[]): Promise<void>;
}
declare class JwtSecurityDefinition {
    readonly issuer: string;
    readonly audiences: string[];
    constructor(issuer: string, audiences: string[]);
}
declare type SecurityDefinition = JwtSecurityDefinition;
interface ApiOpts<Defs extends string> {
    /**
     * The base path for all routes in the API.
     *
     * Acts as a prefix, e.g. path '/api/v1/', with route '/customers' would result in the full path '/api/v1/customers'.
     */
    path?: string;
    /**
     * Optional middleware to apply to all routes/methods in the API. Useful for universal middleware such as CORS or Auth.
     */
    middleware?: HttpMiddleware[] | HttpMiddleware;
    /**
     * Optional security definitions for the API
     */
    securityDefinitions?: Record<Defs, SecurityDefinition>;
    /**
     * Optional root level secruity for the API
     */
    security?: Record<Defs, string[]>;
}
/**
 * API Resource
 *
 * Represents an HTTP API, capable of routing and securing incoming HTTP requests to handlers.
 */
declare class Api<SecurityDefs extends string> extends Base {
    readonly path: string;
    readonly middleware?: HttpMiddleware[];
    private readonly routes;
    private readonly securityDefinitions?;
    private readonly security?;
    constructor(name: string, options?: ApiOpts<SecurityDefs>);
    /**
     * Register a new route in this API.
     *
     * Used to define Method handlers. e.g.
     *
     * ```
     * // Create a route
     * const home = api.route('/home')
     *
     * // Register a handler for Http GET request to this route
     * home.get(homeHandler)
     * ```
     *
     * @param match the route path matcher e.g. '/home'. Supports path params via colon prefix e.g. '/customers/:customerId'
     * @param options route options such as setting middleware which applies to all methods in the route
     * @returns the route object, which can be used to register method handlers
     */
    route(match: string, options?: RouteOpts): Route<SecurityDefs>;
    /**
     * Registers a new route with a GET handler in a single method.
     * @param match the route path matcher e.g. '/home'. Supports path params via colon prefix e.g. '/customers/:customerId'
     * @param middleware the middleware/handler to register for calls to GET
     * @returns {Promise} that resolves when the handler terminates.
     */
    get(match: string, middleware: HttpMiddleware, opts?: MethodOptions<SecurityDefs>): Promise<void>;
    /**
     * Registers a new route with a POST handler in a single method.
     * @param match the route path matcher e.g. '/home'. Supports path params via colon prefix e.g. '/customers/:customerId'
     * @param middleware the middleware/handler to register for calls to POST
     * @returns {Promise} that resolves when the handler terminates.
     */
    post(match: string, middleware: HttpMiddleware, opts?: MethodOptions<SecurityDefs>): Promise<void>;
    /**
     * Registers a new route with a PUT handler in a single method.
     * @param match the route path matcher e.g. '/home'. Supports path params via colon prefix e.g. '/customers/:customerId'
     * @param middleware the middleware/handler to register for calls to PUT
     * @returns {Promise} that resolves when the handler terminates.
     */
    put(match: string, middleware: HttpMiddleware, opts?: MethodOptions<SecurityDefs>): Promise<void>;
    /**
     * Registers a new route with a PATCH handler in a single method.
     * @param match the route path matcher e.g. '/home'. Supports path params via colon prefix e.g. '/customers/:customerId'
     * @param middleware the middleware/handler to register for calls to PATCH
     * @returns {Promise} that resolves when the handler terminates.
     */
    patch(match: string, middleware: HttpMiddleware, opts?: MethodOptions<SecurityDefs>): Promise<void>;
    /**
     * Registers a new route with a DELETE handler in a single method.
     * @param match the route path matcher e.g. '/home'. Supports path params via colon prefix e.g. '/customers/:customerId'
     * @param middleware the middleware/handler to register for calls to DELETE
     * @returns {Promise} that resolves when the handler terminates.
     */
    delete(match: string, middleware: HttpMiddleware, opts?: MethodOptions<SecurityDefs>): Promise<void>;
    /**
     * Registers a new route with a OPTIONS handler in a single method.
     * @param match the route path matcher e.g. '/home'. Supports path params via colon prefix e.g. '/customers/:customerId'
     * @param middleware the middleware/handler to register for calls to DELETE
     * @returns {Promise} that resolves when the handler terminates.
     */
    options(match: string, middleware: HttpMiddleware, opts?: MethodOptions<SecurityDefs>): Promise<void>;
    /**
     * Register this bucket as a required resource for the calling function/container
     * @returns a promise that resolves when the registration is complete
     */
    protected register(): Promise<Resource>;
}
/**
 * Register a new API Resource.
 *
 * The returned API object can be used to register Routes and Methods, with Handlers.
 * e.g. api.route('/customers').get(getCustomerHandler)
 *
 * @param name
 * @param options
 * @returns
 */
export declare const api: <Defs extends string>(name: string, options?: ApiOpts<Defs>) => Api<Defs>;
/**
 * Create a jwt security definition
 * @returns
 */
export declare const jwt: (opts: {
    issuer: string;
    audiences: string[];
}) => JwtSecurityDefinition;
export {};
