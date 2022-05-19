"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
const resource_grpc_pb_1 = require("@nitric/api/proto/resource/v1/resource_grpc_pb");
const constants_1 = require("../constants");
const grpc = tslib_1.__importStar(require("@grpc/grpc-js"));
const resourceClient = new resource_grpc_pb_1.ResourceServiceClient(constants_1.SERVICE_BIND, grpc.ChannelCredentials.createInsecure());
exports.default = resourceClient;
