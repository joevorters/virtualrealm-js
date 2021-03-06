/**
 * @module virtualrealm/lib/protocol
 * @description Defines the protocol used by virtualrealm
 */

"use strict";

const protobuf = require('protobufjs'),
  path = require('path'),
  fs = require('fs'),
  builder = protobuf.newBuilder({ convertFieldsToCamelCase: true });

let protoPath = path.join(__dirname, '..', 'proto');

fs.readdirSync(protoPath).filter(function (v) {
  return /.proto$/.test(v);
}).forEach(function (v) {
  protobuf.loadProtoFile(path.join(protoPath, v), builder);
});

module.exports = builder.build().virtualproto;
module.exports._builder = builder;
