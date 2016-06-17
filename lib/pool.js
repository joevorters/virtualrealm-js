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
  getSessionPool: function () {
    return this._pool;
  },
  setId: function(id) {
    this._id = id;
  },
  getId: function() {
    return this._id;
  },
  readCommand: function() {
    let self = this;
    this._socket.read(12);
    this._socket.on('data', receiveHeaders);

    function next () {
      return process.nextTick(function () {
        self.readCommand();
      });
    }

    function receiveHeaders(data) {
      self._socket.off('data', receiveHeaders);
      try {
        var header = protocol.Header.decode(data);
      } catch (e) {
        self._socket.write(new protocol.ResponseHeader(0, 0, RPCError.MALFORMED_HEADER).toArrayBuffer());
        return next();
      }
      self._socket.on('data', receiveMessage);
      if (header.length > DEFAULTS.maxMessageLength) {
        self._socket.write(new protocol.ResponseHeader(header.tx, 0, RPCError.MESSAGE_TOO_LONG).toArrayBuffer());
        return next();
      }
      let rpc = self.rpc[header.fn];
      if (!rpc) {
        self._socket.write(new protocol.ResponseHeader(header.tx, 0, RPCError.METHOD_NOT_IMPLEMENTED).toArrayBuffer());
        return next();
      }
      self._socket.read(header.length);
      function receiveMessage(data) {
        try {
          var payload = rpc.request.decode(data);
        } catch (e) {
          self._socket.write(new protocol.ResponseHeader(header.tx, 0, RPCError.INVALID_PAYLOAD).toArrayBuffer());
          return next();
        }
        rpc.service(payload, function (err, resp) {
          let output;
          if (!resp || !(resp instanceof ArrayBuffer)) output = new ArrayBuffer(0);
          else output = resp.toArrayBuffer();
          self._socket.write(new protocol.ResponseHeader(header.tx, output.byteLength, (err ? err.code : 0)));
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
  add: function add(socket) {
    let id = uuid.v1();
    let session = this._pool[id] = Session(socket, this);
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
