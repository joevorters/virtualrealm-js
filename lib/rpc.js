"use strict";

const protocol = require('./protocol'),
  auth = require('./auth'),
  RPCError = require('./error');

const RPCIndexProto = Object.create(Array.prototype, {
  getFnByName: {
    value: function getFnByName(name) {
      for (let i = 0; i < this.length; ++i)
        if (name === this[i].name) return this[i];
      return null;
    }
  }
});

let index = [

  function ServerBroadcast(query) {
    let self = this;
    return new Promise(function(resolve, reject) {
      self.getSessionPool().getServer().getAuth().verify(query.auth).then(function(token) {
        self.getSessionPool().broadcast(query.msg);
        resolve(new protocol.ServerBroadcastResult(token));
      }, function(err) {
        reject(err);
      });
    });
  },
  function ServerWhisper(query) {
    let self = this;
    return new Promise(function(resolve, reject) {
      self.getSessionPool().getServer().getAuth().verify(query.auth).then(function(token) {
        if (self.getSessionPool().getServer().getAuth().isLoggedIn(query.target)) {
          self.getSessionPool().getSessions()[query.target].whisper(query.msg);
          return resolve(new protocol.ServerWhisperResult(token));
        } else reject(RPCError('Player is not logged in', RPCError.IS_LOGGED_OUT));
      }, function(err) {
        reject(err);
      });
    });
  },
  function ServerLogin(query) {
    let self = this;
    return new Promise(function(resolve, reject) {
      self.getSessionPool().getServer().getAuth().login(query.username, query.password).then(function(token) {
        let sessions = self.getSessionPool().getSessions();
        delete sessions[self.id];
        sessions[query.username] = self;
        self.id = query.username;
        resolve(new protocol.ServerLoginResult(token));
      }, function(err) {
        reject(err);
      });
    });
  },
  function ServerRequestZone(query) {
    return new Promise(function() {})
  },
  function ServerMove(query) {
    return new Promise(function() {});
  },
  function ServerRotate(query) {
    return new Promise(function() {})
  }
];

Object.setPrototypeOf(index, RPCIndexProto);

module.exports = function bindRPC(client) {
  return new protocol.Server(function(method, req, cb) {
    let methodCall = protocol._builder.lookup(method);
    index.getFnByName(methodCall.name).call(client, req).then(function(result) {
      cb(null, result);
    }, function(err) {
      cb(err);
    });
  });
};
