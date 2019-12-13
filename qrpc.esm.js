/*!
 * qrpc.js v0.4.2
 * (c) 2019 innotechx
 * Released under the MIT License.
 */
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

var Frame =
/*#__PURE__*/
function () {
  function Frame(_ref) {
    var _ref$flags = _ref.flags,
        flags = _ref$flags === void 0 ? 0 : _ref$flags,
        cmd = _ref.cmd,
        payload = _ref.payload,
        requestID = _ref.requestID;

    _classCallCheck(this, Frame);

    this.flags = flags;
    this.cmd = cmd;
    this.payload = payload;
    this.requestID = requestID || this.genRequestID();
  }

  _createClass(Frame, [{
    key: "encode",
    value: function encode() {
      var payload = Frame.textEncoder.encode(this.payload);
      var size = 12 + payload.length;
      var bytes = new Uint8Array(size + 4);
      bytes[0] = size >> 24;
      bytes[1] = size >> 16;
      bytes[2] = size >> 8;
      bytes[3] = size;
      bytes.set(this.requestID, 4);
      bytes[12] = this.flags;
      bytes[13] = this.cmd >> 16;
      bytes[14] = this.cmd >> 8;
      bytes[15] = this.cmd;
      bytes.set(payload, 16);
      return bytes;
    }
  }, {
    key: "genRequestID",
    value: function genRequestID() {
      while (true) {
        var bytes = new Uint32Array(2);
        bytes[0] = Math.floor(Math.random() * (Math.pow(2, 32) - 1));
        bytes[1] = Math.floor(Math.random() * (Math.pow(2, 32) - 1));
        var requestID = new Uint8Array(bytes.buffer);

        if (!Frame.requestIDCached[requestID]) {
          Frame.requestIDCached[requestID] = true;
          return requestID;
        }
      }
    }
  }, {
    key: "genHexRequestID",
    value: function genHexRequestID() {
      return Array.from(this.requestID).map(function (n) {
        return n.toString(16);
      }).join('');
    }
  }], [{
    key: "decode",
    value: function decode(buffer) {
      var bytes = new Uint8Array(buffer);
      var size = (bytes[0] << 24) + (bytes[1] << 16) + (bytes[2] << 8) + bytes[3];
      var requestID = bytes.subarray(4, 12);
      var flags = bytes[12];
      var cmd = (bytes[13] << 16) + (bytes[14] << 8) + bytes[15];
      var payload = bytes.subarray(16, size + 4);
      var zipFlagPos = 6; // zip flag

      var bFlags = flags.toString(2);

      if (bFlags.charAt(bFlags.length - zipFlagPos) === '1') {
        payload = Frame.unzipAdapter(payload);
      } else {
        payload = Frame.textDecoder.decode(payload);
      }

      return new Frame({
        flags: flags,
        cmd: cmd,
        payload: payload,
        requestID: requestID
      });
    }
  }, {
    key: "unzipAdapter",
    get: function get() {
      return Frame._unzipAdapter;
    },
    set: function set(unzipAdapter) {
      Frame._unzipAdapter = unzipAdapter;
    }
  }]);

  return Frame;
}();

Frame.textEncoder = new TextEncoder('utf-8');
Frame.textDecoder = new TextDecoder('utf-8');

Frame._unzipAdapter = function (payload) {
  return payload;
};

Frame.requestIDCached = {};

var Config =
/*#__PURE__*/
function () {
  function Config(_ref) {
    var _ref$dialTimeout = _ref.dialTimeout,
        dialTimeout = _ref$dialTimeout === void 0 ? 1000 : _ref$dialTimeout,
        _ref$requestTimeout = _ref.requestTimeout,
        requestTimeout = _ref$requestTimeout === void 0 ? 2000 : _ref$requestTimeout;

    _classCallCheck(this, Config);

    this._dialTimeout = dialTimeout;
    this._requestTimeout = requestTimeout;
  }

  _createClass(Config, [{
    key: "dialTimeout",
    get: function get() {
      return this._dialTimeout;
    }
  }, {
    key: "DialTimeout",
    set: function set(timeout) {
      this._dialTimeout = timeout;
    }
  }, {
    key: "requestTimeout",
    get: function get() {
      return this._requestTimeout;
    },
    set: function set(timeout) {
      this._requestTimeout = timeout;
    }
  }]);

  return Config;
}();

var Completer =
/*#__PURE__*/
function () {
  function Completer(timeout) {
    var _this = this;

    _classCallCheck(this, Completer);

    this._promise = new Promise(function (resolve, reject) {
      _this._resolve = resolve;
      _this._reject = reject;
    });

    if (timeout > 0) {
      this._id = setTimeout(function () {
        _this._reject('timeout');
      }, timeout);
    }
  }

  _createClass(Completer, [{
    key: "getPromise",
    value: function getPromise() {
      return this._promise;
    }
  }, {
    key: "success",
    value: function success(data) {
      this._resolve(data);

      this._complete();
    }
  }, {
    key: "fail",
    value: function fail(reason) {
      this._reject(reason);

      this._complete();
    }
  }, {
    key: "_complete",
    value: function _complete() {
      if (this._id) {
        clearTimeout(this._id);
        this._id = null;
      }
    }
  }]);

  return Completer;
}();

var noop = function noop() {};

var Client =
/*#__PURE__*/
function () {
  function Client(_ref) {
    var conf = _ref.conf,
        addr = _ref.addr,
        _ref$onopen = _ref.onopen,
        onopen = _ref$onopen === void 0 ? noop : _ref$onopen,
        _ref$onclose = _ref.onclose,
        onclose = _ref$onclose === void 0 ? noop : _ref$onclose,
        _ref$onerror = _ref.onerror,
        onerror = _ref$onerror === void 0 ? noop : _ref$onerror,
        _ref$onmessage = _ref.onmessage,
        onmessage = _ref$onmessage === void 0 ? noop : _ref$onmessage,
        _ref$onrequest = _ref.onrequest,
        onrequest = _ref$onrequest === void 0 ? noop : _ref$onrequest;

    _classCallCheck(this, Client);

    this.conf = conf;
    this.respCache = {};
    this.addr = addr;
    this.onopen = onopen;
    this.onclose = onclose;
    this.onerror = onerror;
    this.onmessage = onmessage;
    this.onrequest = onrequest;
  }

  _createClass(Client, [{
    key: "connect",
    value: function connect() {
      var _this = this;

      var connectCompleter = new Completer();
      var ws = new WebSocket(this.addr, null, {
        handshakeTimeout: this.conf.dialTimeout
      });
      this.ws = ws;
      ws.binaryType = 'arraybuffer';

      ws.onclose = function (e) {
        _this.onclose(e);
      };

      ws.onopen = function (e) {
        _this.onopen(e);

        connectCompleter.success(e);
      };

      ws.onerror = function (e) {
        _this.onerror(e);

        connectCompleter.fail(e);
      };

      ws.onmessage = function (e) {
        if (typeof e.data === 'string') {
          return;
        }

        _this.onmessage(e);

        var frame = Frame.decode(e.data);

        if (frame.requestID in _this.respCache) {
          _this.respCache[frame.requestID].success(frame);

          delete _this.respCache[frame.requestID];
        }
      };

      return connectCompleter.getPromise();
    }
  }, {
    key: "request",
    value: function request(_ref2) {
      var cmd = _ref2.cmd,
          payload = _ref2.payload,
          _ref2$flags = _ref2.flags,
          flags = _ref2$flags === void 0 ? 0 : _ref2$flags;
      var frame = new Frame({
        cmd: cmd,
        payload: payload,
        flags: flags
      });
      var bytes = frame.encode();
      this.ws.send(bytes);
      this.onmessage(bytes);
      var requestID = frame.requestID;
      this.respCache[requestID] = new Completer(this.conf.requestTimeout);
      return this.respCache[requestID].getPromise();
    }
  }, {
    key: "close",
    value: function close() {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.close();
        this.ws = null;

        for (var rq in this.respCache) {
          this.respCache[rq].fail('server closed');
        }

        this.respCache = {};
      }
    }
  }]);

  return Client;
}();

var qrpc = {
  Frame: Frame,
  Config: Config,
  Completer: Completer,
  Client: Client
};

export default qrpc;
