'use strict';

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _chai = require('chai');

var _constants = require('../../src/constants');

var constants = _interopRequireWildcard(_constants);

var _constants2 = require('../src/constants');

var crossdock_constants = _interopRequireWildcard(_constants2);

var _const_sampler = require('../../src/samplers/const_sampler.js');

var _const_sampler2 = _interopRequireDefault(_const_sampler);

var _default_context = require('../../src/default_context');

var _default_context2 = _interopRequireDefault(_default_context);

var _opentracing = require('opentracing');

var _opentracing2 = _interopRequireDefault(_opentracing);

var _in_memory_reporter = require('../../src/reporters/in_memory_reporter.js');

var _in_memory_reporter2 = _interopRequireDefault(_in_memory_reporter);

var _tchannel_bridge = require('../../src/tchannel_bridge');

var _tchannel_bridge2 = _interopRequireDefault(_tchannel_bridge);

var _tchannel_server = require('../src/tchannel_server.js');

var _tchannel_server2 = _interopRequireDefault(_tchannel_server);

var _thrift = require('tchannel/as/thrift');

var _thrift2 = _interopRequireDefault(_thrift);

var _tchannel = require('tchannel');

var _tchannel2 = _interopRequireDefault(_tchannel);

var _tracer = require('../../src/tracer.js');

var _tracer2 = _interopRequireDefault(_tracer);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _util = require('../../src/util.js');

var _util2 = _interopRequireDefault(_util);

function _interopRequireWildcard(obj) {
    if (obj && obj.__esModule) {
        return obj;
    } else {
        var newObj = {};if (obj != null) {
            for (var key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
            }
        }newObj.default = obj;return newObj;
    }
}

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

// Copyright (c) 2016 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

process.env.NODE_ENV = 'test';

// WARNING THESE TESTS DO NOT WORK WHEN THE VPN IS RUNNING.

describe('crossdock tchannel server should', function () {
    var ip = void 0;
    var server = void 0;
    var tracer = void 0;
    var bridge = void 0;
    var crossdockSpecPath = _path2.default.join(__dirname, '..', '..', 'src', 'jaeger-idl', 'thrift', 'crossdock', 'tracetest.thrift');

    before(function () {
        tracer = new _tracer2.default('node', new _in_memory_reporter2.default(), new _const_sampler2.default(false));
        bridge = new _tchannel_bridge2.default(tracer);
        server = new _tchannel_server2.default(crossdockSpecPath);
        ip = _util2.default.myIp();
    });

    describe('joinTrace with different options', function () {

        it('propagate span state on tchannel joinTrace', function (done) {
            var span = tracer.startSpan('test-span');
            span.setBaggageItem(crossdock_constants.BAGGAGE_KEY, 'fry');

            var clientChannel = new _tchannel2.default();

            var requestChannel = clientChannel.makeSubChannel({
                serviceName: 'node',
                peers: [_util2.default.myIp() + ':8082']
            });
            var thriftChannel = (0, _thrift2.default)({
                channel: requestChannel,
                entryPoint: crossdockSpecPath
            });
            var tracedChannel = bridge.tracedChannel(thriftChannel);

            var joinRequest = {
                'serverRole': 'S1',
                'downstream': {
                    'serviceName': 'node',
                    'serverRole': 'S2',
                    'host': _util2.default.myIp(),
                    'port': '8082',
                    'transport': 'TCHANNEL'
                }
            };

            var context = new _default_context2.default();
            context.setSpan(span);
            tracedChannel.request({
                timeout: 100000,
                context: context,
                serviceName: 'node',
                headers: {
                    cn: 'node-tchannel'
                }
            }).send('TracedService::joinTrace', null, { 'request': joinRequest }, function (err, res) {
                if (err) {
                    _chai.assert.isNotOk(err);
                } else {
                    var traceResponse = res.body;
                    _chai.assert.equal(traceResponse.span.traceId, span.context().traceIdStr);
                    _chai.assert.equal(traceResponse.span.traceId, traceResponse.downstream.span.traceId);
                    _chai.assert.equal(traceResponse.span.sampled, false);
                    _chai.assert.equal(traceResponse.span.baggage, span.getBaggageItem(crossdock_constants.BAGGAGE_KEY));
                }
                done();
            });
        }).timeout(100000);
    });
});
//# sourceMappingURL=tchannel_server.js.map
//# sourceMappingURL=tchannel_server.js.map