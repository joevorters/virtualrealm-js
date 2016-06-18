"use strict";

const chalk = require('chalk'),
  moment = require('moment');

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

log.error = function (data) {
  console.error(`${chalk.red(chalk.bold('[error]'))} ${data}`);
  return data;
};

log.fatal = function (err) {
  console.error(`${chalk.red(chalk.bold('[fatal]'))} ${err.message}`);
  if (log._debugging) console.error(err.stack);
  return err;
};

log.event = function (event, data) {
  console.log(`${chalk.magenta(chalk.bold('[event:' + String(event) + ']'))} ${data}`);
};

log.shutdown = function (code) {
  if (typeof code === 'undefined') code = 0;
  log.event('shutdown', moment().format('MM-DD-YYYY hh:mm:ss'));
  process.exit(code);
};

log.write = function (data) {
  process.stdout.write(data);
  return data;
}

module.exports = log;
