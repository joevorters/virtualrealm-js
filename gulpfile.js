"use strict";

const gulp = require('gulp'),
  path = require('path'),
  gutil = require('gulp-util'),
  url = require('url'),
  webpack = require('webpack'),
  pathExists = require('path-exists'),
  WebpackDevServer = require('webpack-dev-server'),
  Getopt = require('node-getopt'),
  getopt = new Getopt([
    ['p', 'port=PORT', 'choose port for dev server'],
    ['b', 'bind-addr=BINDADDR', 'choose listen address for dev server']
  ]),
  chalk = require('chalk'),
  os = require('os'),
  sprintf = require('sprintf'),
  config = require(path.join(__dirname, 'webpack.config')),
  devConfPath = path.join(__dirname, 'config', 'dev.json');

let opts = getopt.parseSystem();

const fmt = "%-25s %-20s";

function formatTask(name, desc) {
  return sprintf(fmt, name, desc);
}

getopt.setHelp(`${chalk.yellow(chalk.bold(`Usage: ${process.title} [-p PORT][-b BINDADDR] TASK `))}${os.EOL}${chalk.yellow(chalk.bold((' tasks include:')))}${os.EOL}  ${chalk.gray(chalk.bold(formatTask('doc', 'build documentation')))}${os.EOL}  ${chalk.gray(chalk.bold(formatTask('webpack', 'build client-side assets')))}${os.EOL}  ${chalk.gray(chalk.bold(formatTask('webpack-dev-server', 'run development server')))}${os.EOL}${chalk.yellow(chalk.bold(' options are'))}${os.EOL}${chalk.gray(chalk.bold('[[OPTIONS]]'))}`);

process.argv = [process.argv[0], process.argv[1]].concat(opts.argv);

if (opts.argv[0] === 'help') {
  getopt.showHelp();
  process.exit(0);
}

gulp.task("webpack", function(next) {
  webpack(config, function(err, stats) {
    if (err) throw new gutil.PluginError("webpack", err);
    gutil.log("[webpack]", stats.toString({
      colors: true
    }));
    next();
  });
});

gulp.task("webpack-dev-server", function(next) {
  const compiler = webpack(config);
  let devConf;
  if (pathExists.sync(devConfPath)) {
    devConf = require(devConfPath);
  } else devConf = {};
  if (!devConf.port) devConf.port = 50050;
  if (!devConf.bindAddr) devConf.bindAddr = "localhost";
  if (opts.options.port) devConf.port = +opts.options.port;
  if (opts.options['bind-addr']) devConf.bindAddr = opts.options['bind-addr'];
  new WebpackDevServer(compiler, {
    quiet: false,
    stats: {
      colors: true
    }
  }).listen(devConf.port, devConf.bindAddr, function(err) {
    if (err) throw new gutil.PluginError("webpack-dev-server", err);
    gutil.log("[webpack-dev-server]", url.format({
      protocol: 'http:',
      hostname: devConf.bindAddr,
      port: devConf.port,
      pathname: '/webpack-dev-server/index.html'
    }));
  });
});

gulp.task('default', ['webpack']);

if (opts.argv.length && !gulp.tasks[opts.argv[0]]) {
  require('./lib/log').error(`task ${chalk.magenta(opts.argv[0])} not found`);
  getopt.showHelp();
  process.exit(1);
}
