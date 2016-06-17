"use strict";

RPCError.prototype = Object.create(Error.prototype, {
  name: {
    value: RPCError.name
  }
});

function RPCError(msg, code) {
  if (this instanceof RPCError) return RPCError(msg, code);
  let retval = Error(msg);
  retval.code = code;
  retval.name = RPCError.name;
  return retval;
}

Object.assign(RPCError, {
  NO_ERROR: 0x0,
  MALFORMED_HEADER: 0x1,
  MESSAGE_TOO_LONG: 0x2,
  METHOD_NOT_IMPLEMENTED: 0x3,
  INVALID_PAYLOAD: 0x4,
  INVALID_AUTH: 0x5,
  INVALID_LOGIN: 0x6,
  JWT_SIGN_ERROR: 0x7,
  JWT_VERIFY_ERROR: 0x8,
  IS_LOGGED_OUT: 0x9
});

module.exports = RPCError;
