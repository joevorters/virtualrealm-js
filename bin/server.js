#!/usr/bin/env node

"use strict";

const os = require('os'),
  fs = require('fs'),
  Getopt = require('node-getopt'),
  getopt = new Getopt([
    ['p', 'port=PORT', 'server bind port'],
    ['d', 'debug', 'enable debugging output'],
    ['h', 'help', 'display help'],
    ['v', 'version', 'display version number'],
    ['n', 'no-color', 'disable color in output']
  ]),
  chalk = require('chalk'),
  log = require('../lib/log'),
  util = require('../lib/util'),
  path = require('path'),
  spawnSync = require('child_process').spawnSync,
  pathExists = require('path-exists'),
  DEFAULTS = require('../config/defaults'),
  Server = require('..');

process.title = path.basename(process.argv[1]);


let opts = getopt.parseSystem();

log.setDebugging(typeof opts.options.debug !== 'undefined');

if (!opts.options.port) opts.options.port = DEFAULTS.port;

if (opts.options['no-color']) util.neutralizeColor();

getopt.setHelp(`${chalk.yellow(chalk.bold('Usage:'))} ${chalk.yellow(chalk.bold(process.title))} ${chalk.yellow(chalk.bold('[-dvh] [-p PORT]'))}${os.EOL}${chalk.gray(chalk.bold('[[OPTIONS]]'))}`);

if (opts.options.help) {
  getopt.showHelp();
  process.exit(0);
}
if (opts.options.version) {
  log(require('../package').version);
  process.exit(0);
}

let lastDir = process.cwd();

Server({
  listen: opts.options.port,
  context: (function getContextSync() {
    let certPath = path.join(__dirname, '..', 'certs');
    let hadToRegenerateCerts;
    if ((hadToRegenerateCerts = (!pathExists.sync(certPath) || !pathExists.sync(path.join(certPath, 'server-key.pem')) || !pathExists.sync(path.join(certPath, 'server-cert.pem'))))) {
      log.debug('Missing certificates for SSL, regenerating ...');
      process.chdir(__dirname);
      let args = ['generate'];
      if (opts.options.debug) args.push('-d');
      spawnSync('node', args, { stdio: 'inherit' });
      process.chdir(lastDir);
    } else log.debug(`${chalk.cyan('Loading certificates from')} ${chalk.green('\'' + certPath + '\'')}`);
    return {
      key: fs.readFileSync(path.join(__dirname, '..', 'certs', 'server-key.pem')),
      cert: fs.readFileSync(path.join(__dirname, '..', 'certs', 'server-cert.pem'))
    }
  })()
});
