"use strict";

const uuid = require('node-uuid'),
  RPC = require('./rpc'),
  _ = require('lodash'),
  DEFAULTS = require('../config/defaults'),
  RPCError = require('./error'),
  protocol = require('./protocol');

function SessionPool(server) {
  if (!(this instanceof SessionPool)) return new SessionPool(server);
  this._pool = {};
  this._server = server;
}

function Session(socket, pool) {
  if (!(this instanceof Session)) return new Session(socket);
  this._pool = pool;
  this._socket = socket;
}

Session.prototype = {
  getSessionPool: function() {
    return this._pool;
  },
  setId: function(id) {
    this._id = id;
  },
  getId: function() {
    return this._id;
  },
  read: function (n) {
    if (this.isWebSocket) return;
    else this._socket.read(n);
  },
  write: function (data) {
    if (this.isWebSocket) this._socket.send(data, { binary: true, mask: true });
    else this._socket.write(data);
  },
  readCommand: function() {
    let self = this;
    if (!self.isWebSocket) {
      this._socket.on('data', receiveHeaders);
    } else {
      this.socket.on('message', receiveHeaders);
    }
    this.read(12);
    function next() {
      return process.nextTick(function() {
        self.readCommand();
      });
    }

    function receiveHeaders(data) {
      if (!self.isWebSocket) {
        self._socket.off('message', receiveHeaders);
      } else self._socket.off('data', receiveHeaders);
      try {
        var header = protocol.Header.decode(data);
      } catch (e) {
        self.write(new protocol.ResponseHeader(0, 0, RPCError.MALFORMED_HEADER).toArrayBuffer());
        return next();
      }
      if (self.isWebSocket) {
        self._socket.on('data', receiveMessage);
      } else self._socket.on('message', receiveMessage);
      if (header.length > DEFAULTS.maxMessageLength) {
        self.write(new protocol.ResponseHeader(header.tx, 0, RPCError.MESSAGE_TOO_LONG).toArrayBuffer());
        return next();
      }
      let rpc = self.rpc[header.fn];
      if (!rpc) {
        self.write(new protocol.ResponseHeader(header.tx, 0, RPCError.METHOD_NOT_IMPLEMENTED).toArrayBuffer());
        return next();
      }
      self.read(header.length);

      function receiveMessage(data) {
        try {
          var payload = rpc.request.decode(data);
        } catch (e) {
          self.write(new protocol.ResponseHeader(header.tx, 0, RPCError.INVALID_PAYLOAD).toArrayBuffer());
          return next();
        }
        rpc.service(payload, function(err, resp) {
          let output;
          if (!resp || !(resp instanceof ArrayBuffer)) output = new ArrayBuffer(0);
          else output = resp.toArrayBuffer();
          self.write(new protocol.ResponseHeader(header.tx, output.byteLength, (err ? err.code : 0)));
          if (output.byteLength) self._socket.write(output);
          return next();
        });
      }
    }
  }
};


SessionPool.prototype = {
  getServer: function getServer() {
    return this._server;
  },
  getSessions: function getSessions() {
    return this._pool;
  },
  forEach: function forEach(cb, thisArg) {
    return _.forOwn(this, cb, thisArg);
  },
  add: function add(socket, opts) {
    let id = uuid.v1();
    let session = this._pool[id] = Session(socket, this);
    session.isWebSocket = opts.isWebSocket;
    session._socket.pause();
    session.id = id;
    session._pool = this;
    session.rpc = RPC(session);
    session._socket.on('readable', function() {
      session.readCommand();
    });
  },
  get: function get(id) {
    return this._pool[id];
  }
};

module.exports = SessionPool;
