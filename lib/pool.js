"use strict";

const uuid = require('node-uuid'),
  _ = require('lodash'),
  protocol = require('./protocol');

function SessionPool() {
  if (!(this instanceof SessionPool)) return new SessionPool;
  this._pool = {};
}

function Session(socket) {
  if (!(this instanceof Session)) return new Session(socket);
  this._socket = socket;
}

Session.prototype = {
  setId: function(id) {
    this._id = id;
  },
  getId: function() {
    return this._id;
  },
  readCommand: function() {
    let self = this;
    this._socket.read(8);
    this._socket.on('data', receiveHeaders);

    function receiveHeaders(data) {
      self._socket.off('data', receiveHeaders);
      let header = protocol.Header.decode(data);
      self._socket.read(header.length);
      self._socket.on('data', function(data) {});
    }
  }
};


SessionPool.prototype = {
  forEach: function forEach(cb, thisArg) {
    return _.forOwn(this, cb, thisArg);
  },
  add: function add(socket) {
    let id = uuid.v1();
    let session = this._pool[id] = Session(socket);
    session._socket.pause();
    session.id = id;
    session._pool = this;
    session._socket.on('readable', function() {
      session.readHeaders();
    });
  },
  get: function get(id) {
    return this._pool[id];
  }
};

module.exports = SessionPool;
