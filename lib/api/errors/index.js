"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnauthenticatedError = exports.DataLossError = exports.UnavailableError = exports.InternalError = exports.UnimplementedError = exports.OutOfRangeError = exports.AbortedError = exports.FailedPreconditionError = exports.ResourceExhaustedError = exports.PermissionDeniedError = exports.AlreadyExistsError = exports.NotFoundError = exports.DeadlineExceededError = exports.InvalidArgumentError = exports.UnknownError = exports.CancelledError = exports.fromGrpcError = void 0;
const grpc_js_1 = require("@grpc/grpc-js");
const aborted_1 = require("./aborted");
Object.defineProperty(exports, "AbortedError", { enumerable: true, get: function () { return aborted_1.AbortedError; } });
const already_exists_1 = require("./already-exists");
Object.defineProperty(exports, "AlreadyExistsError", { enumerable: true, get: function () { return already_exists_1.AlreadyExistsError; } });
const cancelled_1 = require("./cancelled");
Object.defineProperty(exports, "CancelledError", { enumerable: true, get: function () { return cancelled_1.CancelledError; } });
const data_loss_1 = require("./data-loss");
Object.defineProperty(exports, "DataLossError", { enumerable: true, get: function () { return data_loss_1.DataLossError; } });
const deadline_exceeded_1 = require("./deadline-exceeded");
Object.defineProperty(exports, "DeadlineExceededError", { enumerable: true, get: function () { return deadline_exceeded_1.DeadlineExceededError; } });
const failed_precondition_1 = require("./failed-precondition");
Object.defineProperty(exports, "FailedPreconditionError", { enumerable: true, get: function () { return failed_precondition_1.FailedPreconditionError; } });
const internal_1 = require("./internal");
Object.defineProperty(exports, "InternalError", { enumerable: true, get: function () { return internal_1.InternalError; } });
const invalid_argument_1 = require("./invalid-argument");
Object.defineProperty(exports, "InvalidArgumentError", { enumerable: true, get: function () { return invalid_argument_1.InvalidArgumentError; } });
const not_found_1 = require("./not-found");
Object.defineProperty(exports, "NotFoundError", { enumerable: true, get: function () { return not_found_1.NotFoundError; } });
const out_of_range_1 = require("./out-of-range");
Object.defineProperty(exports, "OutOfRangeError", { enumerable: true, get: function () { return out_of_range_1.OutOfRangeError; } });
const permission_denied_1 = require("./permission-denied");
Object.defineProperty(exports, "PermissionDeniedError", { enumerable: true, get: function () { return permission_denied_1.PermissionDeniedError; } });
const resource_exhausted_1 = require("./resource-exhausted");
Object.defineProperty(exports, "ResourceExhaustedError", { enumerable: true, get: function () { return resource_exhausted_1.ResourceExhaustedError; } });
const unauthenticated_1 = require("./unauthenticated");
Object.defineProperty(exports, "UnauthenticatedError", { enumerable: true, get: function () { return unauthenticated_1.UnauthenticatedError; } });
const unavailable_1 = require("./unavailable");
Object.defineProperty(exports, "UnavailableError", { enumerable: true, get: function () { return unavailable_1.UnavailableError; } });
const unimplemented_1 = require("./unimplemented");
Object.defineProperty(exports, "UnimplementedError", { enumerable: true, get: function () { return unimplemented_1.UnimplementedError; } });
const unknown_1 = require("./unknown");
Object.defineProperty(exports, "UnknownError", { enumerable: true, get: function () { return unknown_1.UnknownError; } });
const STATUS_CODE_MAP = {
    [grpc_js_1.status.CANCELLED]: cancelled_1.CancelledError,
    [grpc_js_1.status.UNKNOWN]: unknown_1.UnknownError,
    [grpc_js_1.status.INVALID_ARGUMENT]: invalid_argument_1.InvalidArgumentError,
    [grpc_js_1.status.DEADLINE_EXCEEDED]: deadline_exceeded_1.DeadlineExceededError,
    [grpc_js_1.status.NOT_FOUND]: not_found_1.NotFoundError,
    [grpc_js_1.status.ALREADY_EXISTS]: already_exists_1.AlreadyExistsError,
    [grpc_js_1.status.PERMISSION_DENIED]: permission_denied_1.PermissionDeniedError,
    [grpc_js_1.status.RESOURCE_EXHAUSTED]: resource_exhausted_1.ResourceExhaustedError,
    [grpc_js_1.status.FAILED_PRECONDITION]: failed_precondition_1.FailedPreconditionError,
    [grpc_js_1.status.ABORTED]: aborted_1.AbortedError,
    [grpc_js_1.status.OUT_OF_RANGE]: out_of_range_1.OutOfRangeError,
    [grpc_js_1.status.UNIMPLEMENTED]: unimplemented_1.UnimplementedError,
    [grpc_js_1.status.INTERNAL]: internal_1.InternalError,
    [grpc_js_1.status.UNAVAILABLE]: unavailable_1.UnavailableError,
    [grpc_js_1.status.DATA_LOSS]: data_loss_1.DataLossError,
    [grpc_js_1.status.UNAUTHENTICATED]: unauthenticated_1.UnauthenticatedError,
};
/**
 * Translates gRPC service errors to Nitric API errors
 * @param error - Original gRPC service error
 * @returns Nitric API error that maps to the provided service error code
 */
exports.fromGrpcError = (error) => {
    const construct = STATUS_CODE_MAP[error.code];
    if (construct) {
        return new construct(error.message);
    }
    return new unknown_1.UnknownError(error.message);
};
