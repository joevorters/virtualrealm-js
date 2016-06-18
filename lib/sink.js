"use strict";

const log = require('./log'),
  shutdown = require('./shutdown'),
  chalk = require('chalk');

let active;

function errorSink (onOrOff) {
  if (active != onOrOff) {
    active = onOrOff;
    if (onOrOff) process.on('uncaughtException', handler);
    else process.off('uncaughtException', handler);
    return true;
  }
  return false;
}

function handler(data) {
  data.message = chalk.bold(data.message);
  log.fatal(data);;
  shutdown();
}

module.exports = errorSink;
