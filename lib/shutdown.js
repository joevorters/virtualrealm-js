const log = require('./log');

module.exports = function shutdown(code) {
  log.shutdown();
  process.exit(code);
}
