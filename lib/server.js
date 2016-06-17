"use strict";

const tls = require('tls'),
  fs = require('fs'),
  path = require('path'),
  chalk = require('chalk'),
  log = require('./log'),
  Auth = require('./auth'),
  SessionPool = require('./pool'),
  certPath = path.join(__dirname, '..', 'certs');

Server.prototype = {
  getSessionPool: function getSessionPool() { return this._pool; },
  getTLSServer: function getTLSServer() { return this._server; },
  getSecureContext: function getSecureContext() { return this._context; },
  getAuth: function getAuth() { return this._auth; }
};

function Server(config) {
  if (!(this instanceof Server)) return new Server(config);
  if (!config) config = {};
  if (!config.context) {
    log.debug(`${chalk.cyan('Loading certificates from')} ${chalk.green('\'' + certPath + '\'')}`);
    config.context = {
      key: fs.readFileSync(path.join(__dirname, '..', 'certs', 'server-key.pem')),
      cert: fs.readFileSync(path.join(__dirname, '..', 'certs', 'server-cert.pem'))
    };
  }
  this._auth = Auth(this);
  this._context = config.context;
  this._pool = SessionPool(this);
  this._server = tls.createServer(config.context, (socket) => {
    log.debug(`${chalk.cyan('Client connected from')} ${chalk.green(socket.remoteAddress)}`);
    return this._pool.add(socket);
  });
  this._server.listen(config.listen, () => {
    log.debug(`${chalk.green('Server')} ${chalk.yellow('bound')}`);
  });
}

module.exports = Server;
