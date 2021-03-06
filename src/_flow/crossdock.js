// @flow
// Copyright (c) 2016 Uber Technologies, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
// in compliance with the License. You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software distributed under the License
// is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
// or implied. See the License for the specific language governing permissions and limitations under
// the License.

declare type Downstream = {
  serviceName: string,
  serverRole: string,
  host: string,
  port: string,
  transport: string,
  downstream?: Downstream,
};

declare type StartTraceRequest = {
  serverRole: string,
  sampled: boolean,
  baggage: string,
  downstream: Downstream,
};

declare type JoinTraceRequest = {
  serverRole: string,
  downstream?: Downstream,
};

declare type ObservedSpan = {
  traceId: string,
  sampled: boolean,
  baggage: string,
};

declare type TraceResponse = {
  span?: ObservedSpan,
  downstream?: TraceResponse,
  notImplementedError?: string,
};
