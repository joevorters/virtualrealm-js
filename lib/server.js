"use strict";

const tls = require('tls'),
  fs = require('fs'),
  path = require('path'),
  chalk = require('chalk'),
  WebSocketServer = require('ws').Server,
  https = require('https'),
  express = require('express'),
  log = require('./log'),
  bootstrapExpress = require('./bootstrap'),
  Auth = require('./auth'),
  SessionPool = require('./pool'),
  certPath = path.join(__dirname, '..', 'certs');

Server.prototype = {
  getSessionPool: function getSessionPool() {
    return this._pool;
  },
  getTLSServer: function getTLSServer() {
    return this._server;
  },
  getSecureContext: function getSecureContext() {
    return this._context;
  },
  getAuth: function getAuth() {
    return this._auth;
  },
  getExpress: function getExpress() {
    return this._express;
  },
  getHttpServer: function getHttpServer() {
    return this._httpServer;
  },
  getWebSocketServer: function getWebSocketServer() {
    return this._wsServer;
  },
  getConfig: function getConfig() {
    return this._config;
  },
  listen: function() {
    this.getHttpServer().listen(this.getConfig().httpPort, () => {
      log.debug(`${chalk.green('HTTP Server')} ${chalk.yellow('bound')} on port ${chalk.red(String(this.getConfig().httpPort))}`);
    });
    this.getTLSServer().listen(this.getConfig().port, () => {
      log.debug(`${chalk.green('TLS Server')} ${chalk.yellow('bound')} on port ${chalk.red(String(this.getConfig().port))}`);
    });
  }
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
  this._config = config;
  this._auth = Auth(this);
  this._context = config.context;
  this._pool = SessionPool(this);
  this._server = tls.createServer(config.context, (socket) => {
    log.debug(`${chalk.cyan('Client connected from')} ${chalk.green(socket.remoteAddress)}`);
    return this._pool.add(socket, { isWebSocket: false });
  });
  this._express = express();
  this._httpServer = https.createServer(this._context, this._express);
  this._wsServer = WebSocketServer({
    server: this._httpServer
  });
  this.getWebSocketServer().on('request', (request) => {
    log.debug(chalk.cyan('WebSocket client connected'));
    this.getSessionPool().add(request.accept('virtualrealm', request.origin), { isWebSocket: true });
  });
  bootstrapExpress(this.getExpress());
}

module.exports = Server;
