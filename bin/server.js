"use strict";

const os = require('os'),
  Getopt = require('node-getopt'),
  getopt = new Getopt([
    ['p', 'port=PORT', 'server bind port'],
    ['d', 'debug', 'enable debugging output'],
    ['h', 'help', 'display help'],
    ['v', 'version', 'display version number']
  ]),
  chalk = require('chalk'),
  log = require('../lib/log'),
  path = require('path'),
  DEFAULTS = require('../config/defaults'),
  Server = require('..');

process.title = path.basename(process.argv[1]);

getopt.setHelp(`${chalk.yellow(chalk.bold('Usage:'))} ${chalk.yellow(chalk.bold(process.title))} ${chalk.yellow(chalk.bold('[-dvh] [-p PORT]'))}${os.EOL}${chalk.gray(chalk.bold('[[OPTIONS]]'))}`);

let opts = getopt.parseSystem();

log.setDebugging(typeof opts.options.debug !== 'undefined');

if (!opts.options.port) opts.options.port = DEFAULTS.port;
if (opts.options.help) {
  getopt.showHelp();
  process.exit(0);
}
if (opts.options.version) {
  log(require('../package').version);
  process.exit(0);
}

Server({
  listen: opts.options.port
});
