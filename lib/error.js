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

RPCError.fromCode = function(code) {
    switch (code) {
        case RPCError.NO_ERROR:
            return RPCError('No error', code);
        case RPCError.MALFORMED_HEADER:
            return RPCError('Malformed header', code);
        case RPCError.MESSAGE_TOO_LONG:
            return RPCError('Request message too long', code);
        case RPCError.METHOD_NOT_IMPLEMENTED:
            return RPCError('Remote method not implemented', code);
        case RPCError.INVALID_PAYLOAD:
            return RPCError('Invalid request payload', code);
        case RPCError.INVALID_AUTH:
            return RPCError('Invalid authentication token', code);
        case RPCError.INVALID_LOGIN:
            return RPCError('Invalid login credentials', code);
        case RPCError.JWT_SIGN_ERROR:
            return RPCError('JWT signing error', code);
        case RPCError.JWT_VERIFY_ERROR:
            return RPCError('JWT verify error', code);
        case RPCError.IS_LOGGED_OUT:
            return RPCError('User is logged out', code);
        default:
            return RPCError(`Error code ${code} unknown`, code);
    }
}
module.exports = RPCError;
