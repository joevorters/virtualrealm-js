"use strict";
const jwt = require('jsonwebtoken'),
  chalk = require('chalk'),
  log = require('./log');

function databaseCheck(user, pass) {
  return new Promise(function(resolve, reject) {
    if (user === 'sal' && pass === 'dmx2bnra')
      return resolve();
    reject(RPCError('Login not found', RPCError.INVALID_LOGIN));
  });
}

module.exports = function(server) {
  let sessions = {};
  return {
    login(user, pass) {
        return new Promise(function(resolve, reject) {
          databaseCheck(user, pass).then(function() {
            jwt.sign({
              username: user,
              count: 0
            }, server.getSecureContext().key, {
              algorithm: 'HS256'
            }, function(err, resp) {
              if (err) return reject(RPCError('JWT sign error', RPCError.JWT_SIGN_ERROR));
              sessions[user] = 0;
              log.debug(`login from ${chalk.bold(chalk.cyan(user))}`);
              resolve(resp);
            });
          }, function(err) {
            reject(err);
          });
        });
      },
      logout(token) {
        return new Promise(function (resolve, reject) {
          jwt.verify(token, server.getSecureContext().key, { algorithm: 'HS256' }, function (err, resp) {
            if (err) return reject(RPCError('JWT verify error', RPCError.JWT_VERIFY_ERROR));
            if (!sessions[resp.username]) return reject(RPCError('User already logged out', RPCError.IS_LOGGED_OUT));
            delete sessions[resp.username];
            resolve();
          });
        });
      },
      verify(token) {
        return new Promise(function (resolve, reject) {
          jwt.verify(token, server.getSecureContext().key, { algorithm: 'HS256' }, function (err, resp) {
            if (err || resp.count !== sessions[resp.username]) return reject(RPCError('JWT verify error', RPCError.JWT_VERIFY_ERROR));
            if (!sessions[resp.username]) return reject(RPCError('User is not logged in', RPCError.IS_LOGGED_OUT));
            sessions[resp.username]++;
            resp.count++;
            jwt.sign(resp, server.getSecureContext().key, { algorithm: 'HS256' }, function (err, resp) {
              if (err) return reject(RPCError('JWT sign error', RPCError.JWT_SIGN_ERROR));
              resolve(resp);
            });
          });
        });
      },
      resetCount(user) {
        if (sessions[user]) sessions[user].count = 0;
      },
      isLoggedIn(user) {
        return typeof sessions[user] !== 'undefined';
      }
  };
};
