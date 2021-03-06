"use strict";

const tls = require('tls'),
  fs = require('fs'),
  url = require('url'),
  path = require('path'),
  chalk = require('chalk'),
  WebSocketServer = require('ws').Server,
  http = require('http'),
  https = require('https'),
  net = require('net'),
  express = require('express'),
  log = require('./log'),
  bootstrapExpress = require('./bootstrap'),
  Auth = require('./auth'),
  errorSink = require('./sink'),
  SessionPool = require('./pool'),
  certPath = path.join(__dirname, '..', 'certs');

Server.prototype = {
  getSessionPool: function getSessionPool() {
    return this._pool;
  },
  getServer: function getTLSServer() {
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
  getRedirectServer: function getRedirectServer() {
    if (this._redirectServer) return this._redirectServer;
    return null;
  },
  listen: function() {
    this.getHttpServer().listen(this.getConfig().httpPort, () => {
      log.debug(`${chalk.green(`HTTP${this.getSecureContext() && 'S' || ''} Server`)} ${chalk.yellow('bound')} on port ${chalk.red(String(this.getConfig().httpPort))}`);
    });
    let self = this;
    if (this.getSecureContext() && this.getRedirectServer()) {
      this.getRedirectServer().listen(this.getConfig().redirect, function() {
        log.debug(`${chalk.green('HTTP Redirect Server')} ${chalk.yellow('bound')} on port ${chalk.red(String(self.getConfig().redirect))}`);
      });
    }
    this.getServer().listen(this.getConfig().port, () => {
      log.debug(`${chalk.green((this.getSecureContext() ? chalk.red('Secure ') : '') + 'Server')} ${chalk.yellow('bound')} on port ${chalk.red(String(this.getConfig().port))}`);
    });
  }
};

function Server(config) {
  if (!(this instanceof Server)) return new Server(config);
  errorSink(true);
  if (!config) config = {};
  this._config = config;
  this._auth = Auth(this);
  this._context = config.context;
  this._pool = SessionPool(this);
  this._express = express();
  const handleSocketConnect = (socket) => {
    log.debug(`${chalk.cyan('Client connected from')} ${chalk.green(socket.remoteAddress)}`);
    return this._pool.add(socket, {
      isWebSocket: false
    });
  };
  if (this._context) {
    this._httpServer = https.createServer(this._context, this._express);
    this._server = tls.createServer(config.context, handleSocketConnect);
    if (this._config.redirect) {
      this._redirectServer = express();
      this._redirectServer.get('*', function(req, res) {
        return res.redirect(url.format({
          protocol: 'https:',
          pathname: req.url,
          host: req.headers.host || req.headers.Host,
          port: config.httpPort
        }));
      });
    }
  } else {
    this._httpServer = http.createServer(this._express);
    this._server = net.createServer(handleSocketConnect);
  }
  this._wsServer = WebSocketServer({
    server: this._httpServer
  });
  this.getWebSocketServer().on('request', (request) => {
    log.debug(chalk.cyan('WebSocket client connected'));
    this.getSessionPool().add(request.accept('virtualrealm', request.origin), {
      isWebSocket: true
    });
  });
  bootstrapExpress(this.getExpress());
}

module.exports = Server;
