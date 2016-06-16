#!/usr/bin/env node

"use strict";

const spawnSync = require('child_process').spawnSync,
  spawn = require('child_process').spawn,
  os = require('os'),
  which = require('which'),
  log = require('../lib/log'),
  chalk = require('chalk'),
  path = require('path'),
  pathExists = require('path-exists'),
  mkdirp = require('mkdirp'),
  Getopt = require('node-getopt'),
  getopt = new Getopt([
    ['n', 'no-color', 'disable colored output'],
    ['h', 'help', 'display this help'],
    ['v', 'version', 'display version number'],
    ['d', 'debug', 'enable debugging output']
  ]),
  util = require('../lib/util'),
  hasOpenssl = (function() {
    try {
      which.sync('openssl');
      return true;
    } catch (e) {
      return false;
    }
  })(),
  DEFAULTS = require('../config/ssl');

process.title = path.basename(process.argv[1]);

let opts = getopt.parseSystem();

if (opts.options["no-color"]) util.neutralizeColor();

getopt.setHelp(`${chalk.yellow(chalk.bold('Usage:'))} ${chalk.yellow(chalk.bold(process.title))} ${chalk.yellow(chalk.bold('[-dnvh]'))}${os.EOL}${chalk.gray(chalk.bold('[[OPTIONS]]'))}`);

if (opts.options["help"]) {
  getopt.showHelp();
  process.exit(0);
}

log.setDebugging(opts.options.debug);

if (opts.options.version) {
  log(require('../package').version);
  process.exit(0);
}

if (!hasOpenssl) {
  log.error(`${chalk.bold(chalk.gray(process.title)) + ':'} ${chalk.bold(chalk.gray('openssl not found in PATH'))}`);
  process.exit(1);
}

process.chdir(path.join(__dirname, ".."));

try {
  var certsPathExists = pathExists.sync('certs');
} catch (e) {
  if (opts.options.debug) log.error(e.stack);
  else log.error(`${chalk.bold(chalk.gray(process.title)) + ':'} ${chalk.bold(chalk.gray(e.message))}`);
  process.exit(1);
}

if (!certsPathExists) {
  try {
    mkdirp.sync('certs');
  } catch (e) {
    if (opts.options.debug) log.error(e.stack);
    else log.error(`${chalk.bold(chalk.gray(process.title)) + ':'} ${chalk.bold(chalk.gray(e.message))}`);
    process.exit(1);
  }
}

process.chdir('certs');

let args = ['genrsa', '-out', 'server-key.pem', DEFAULTS.size];

let keyGenProc = spawnSync('openssl', args);
if (opts.options.debug) log(chalk.gray(chalk.bold('$ openssl ' + args.join(' '))));

keyGenProc.stderr.toString('utf8').split('\n').filter(Boolean).forEach(function(v, i, lines) {
  if (opts.options.debug) {
    if (i === 0 || i === lines.length - 1) log(chalk.bold(chalk.cyan(v)));
    else log(chalk.magenta(v));
  }
});

log.debug(chalk.bold(chalk.yellow('Key generated!')));

setTimeout(function() {
  args = ['req', '-new', '-key', 'server-key.pem', '-out', 'server-csr.pem'];
  if (opts.options.debug) log(chalk.gray(chalk.bold('$ openssl ' + args.join(' '))));
  let csrGenProc = spawn('openssl', args);

  csrGenProc.stderr.on('data', handleCountry);

  function handleCountry(data) {
    util.spliceHandler(csrGenProc.stderr, 'data', handleCountry);
    if (opts.options.debug) {
      log.write(chalk.bold(chalk.green(data.toString('utf8'))));
      log.write(' ');
      log(chalk.bold(chalk.magenta(DEFAULTS.country)));
    }
    csrGenProc.stderr.on('data', handleState);
    csrGenProc.stdin.write(DEFAULTS.country + os.EOL);
  }

  function handleState(data) {
    util.spliceHandler(csrGenProc.stderr, 'data', handleState);
    if (opts.options.debug) {
      log.write(chalk.bold(chalk.green(data.toString('utf8'))));
      log.write(' ');
      log(chalk.bold(chalk.magenta(DEFAULTS.state)));
    }
    csrGenProc.stderr.on('data', handleLocality);
    csrGenProc.stdin.write(DEFAULTS.state + os.EOL);
  }

  function handleLocality(data) {
    util.spliceHandler(csrGenProc.stderr, 'data', handleLocality);
    if (opts.options.debug) {
      log.write(chalk.bold(chalk.green(data.toString('utf8'))));
      log.write(' ');
      log(chalk.bold(chalk.magenta(DEFAULTS.locality)));
    }
    csrGenProc.stderr.on('data', handleOrganization);
    csrGenProc.stdin.write(DEFAULTS.locality + os.EOL);
  }

  function handleOrganization(data) {
    util.spliceHandler(csrGenProc.stderr, 'data', handleOrganization);
    if (opts.options.debug) {
      log.write(chalk.bold(chalk.green(data.toString('utf8'))));
      log.write(' ');
      log(chalk.bold(chalk.magenta(DEFAULTS.organization)));
    }
    csrGenProc.stderr.on('data', handleUnit);
    csrGenProc.stdin.write(DEFAULTS.organization + os.EOL);
  }

  function handleUnit(data) {
    util.spliceHandler(csrGenProc.stderr, 'data', handleUnit);
    if (opts.options.debug) {
      log.write(chalk.bold(chalk.green(data.toString('utf8'))));
      log.write(' ');
      log(chalk.bold(chalk.magenta(DEFAULTS.unit)));
    }
    csrGenProc.stderr.on('data', handleCommon);
    csrGenProc.stdin.write(DEFAULTS.unit + os.EOL);
  }

  function handleCommon(data) {
    util.spliceHandler(csrGenProc.stderr, 'data', handleCommon);
    if (opts.options.debug) {
      log.write(chalk.bold(chalk.green(data.toString('utf8'))));
      log.write(' ');
      log(chalk.bold(chalk.magenta(DEFAULTS.common)));
    }
    csrGenProc.stderr.on('data', handleEmail);
    csrGenProc.stdin.write(DEFAULTS.common + os.EOL);
  }

  function handleEmail(data) {
    util.spliceHandler(csrGenProc.stderr, 'data', handleEmail);
    if (opts.options.debug) {
      log.write(chalk.bold(chalk.green(data.toString('utf8'))));
      log.write(' ');
      log(chalk.bold(chalk.magenta(DEFAULTS.email)));
    }
    csrGenProc.stderr.on('data', handlePassword);
    csrGenProc.stdin.write(DEFAULTS.email + os.EOL);
  }

  function handlePassword(data) {
    if (opts.options.debug) {
      log(chalk.bold(chalk.green(data.toString('utf8'))));
    }
    if (/password/.test(data.toString('utf8'))) {
      util.spliceHandler(csrGenProc.stderr, 'data', handlePassword);
      csrGenProc.stderr.on('data', handleOptional);
      csrGenProc.stdin.write(os.EOL);
    }
  }

  function handleOptional(data) {
    util.spliceHandler(csrGenProc.stderr, 'data', handleOptional);
    if (opts.options.debug) {
      log(chalk.bold(chalk.green(data.toString('utf8'))));
    }
    csrGenProc.stdin.write(os.EOL);
  }

  csrGenProc.on('close', (code) => {
    log.debug(chalk.bold(chalk.yellow('CSR generated!')));
    args = ['x509', '-req', '-in', 'server-csr.pem', '-signkey', 'server-key.pem', '-out', 'server-cert.pem'];
    setTimeout(function() {
      if (opts.options.debug) log(chalk.bold(chalk.gray('$ openssl ' + args.join(' '))));
      let crtProc = spawnSync('openssl', args);
      if (opts.options.debug) {
        log(chalk.cyan(crtProc.stderr.toString('utf8').split(os.EOL).filter(Boolean).join(os.EOL)));
        log.debug(chalk.yellow(chalk.bold('CSR signed!')));
      }
    }, 500);
  });
}, 500);
