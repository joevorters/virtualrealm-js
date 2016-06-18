/**
 * @module virtualrealm/lib/util
 * @description Contains all helper functions used by the application
 */

"use strict";

const clone = require('clone'),
  chalk = require('chalk'),
  pathExists = require('path-exists'),
  path = require('path');

const nullifier = {
  open: '',
  close: ''
}

/**
 * @description
 * Explicitly disables the action of chalk, preventing color from being added
 * @returns {boolean} Returns false if chalk was already disabled
 */

module.exports.neutralizeColor = function neutralizeColor() {
  if (!neutralizeColor.cache) {
    neutralizeColor.cache = clone(chalk.styles);
    Object.keys(chalk.styles).forEach(function(v) {
      Object.assign(chalk.styles[v], nullifier);
    });
    return true;
  }
  return false;
}

/**
 * @description
 * Re-enable chalk if it was previously disabled
 * @returns {boolean} Returns false if chalk was already enabled
 */

module.exports.reenableColor = function reenableColor() {
  if (!neutralizeColor.cache) return false;
  chalk.styles = neutralizeColor.cache;
  delete neutralizeColor.cache;
  return true;
}

/**
 * @description
 * Splices out an event handler from an EventEmitter instance that does not implement EventEmitter#off
 * @returns {void}
 */

module.exports.spliceHandler = function(sock, evt, fn) {
  if (Array.isArray(sock._events[evt])) {
    let idx = sock._events[evt].indexOf(fn);
    if (!~idx) return;
    sock._events[evt].splice(idx, 1);
    return;
  }
  if (typeof sock._events[evt] === 'function') delete sock._events[evt];
};

/**
 * @description
 * Joins the arguments into a path using require('path').join and feeds it to require('path-exists').sync
 * @returns {boolean} Whether or not the path exists on the file system
 */

module.exports.pathJoinExistsSync = function () {
  return pathExists.sync(path.join.apply(null, arguments));
};
