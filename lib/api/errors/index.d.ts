import { ServiceError } from "@grpc/grpc-js";
import { AbortedError } from "./aborted";
import { AlreadyExistsError } from "./already-exists";
import { CancelledError } from "./cancelled";
import { DataLossError } from "./data-loss";
import { DeadlineExceededError } from "./deadline-exceeded";
import { FailedPreconditionError } from "./failed-precondition";
import { InternalError } from "./internal";
import { InvalidArgumentError } from "./invalid-argument";
import { NotFoundError } from "./not-found";
import { OutOfRangeError } from "./out-of-range";
import { PermissionDeniedError } from "./permission-denied";
import { ResourceExhaustedError } from "./resource-exhausted";
import { UnauthenticatedError } from "./unauthenticated";
import { UnavailableError } from "./unavailable";
import { UnimplementedError } from "./unimplemented";
import { UnknownError } from "./unknown";
/**
 * Translates gRPC service errors to Nitric API errors
 * @param error - Original gRPC service error
 * @returns Nitric API error that maps to the provided service error code
 */
export declare const fromGrpcError: (error: ServiceError) => Error;
export { CancelledError, UnknownError, InvalidArgumentError, DeadlineExceededError, NotFoundError, AlreadyExistsError, PermissionDeniedError, ResourceExhaustedError, FailedPreconditionError, AbortedError, OutOfRangeError, UnimplementedError, InternalError, UnavailableError, DataLossError, UnauthenticatedError, };
