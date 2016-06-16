"use strict";

const chalk = require('chalk');

function log (data) {
  console.log(data);
  return data;
}

log.setDebugging = function (bool) {
  log._debugging = bool;
}

log.debug = function (data) {
  if (log._debugging) console.log(`${chalk.bold(chalk.yellow('[debug]'))} ${data}`);
  return data;
}

module.exports = log;
