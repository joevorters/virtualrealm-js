"use strict";

const protocol = require('./protocol');

let exports = [{
  service: protocol.Server.ServerBroadcast
  request: protocol.ServerBroadcastQuery,
  response: protocol.ServerBroadcastResponse
}, {
  service: protocol.Server.ServerWhisper,
  request: protocol.Server.ServerWhisperQuery,
  response: protocol.Server.ServerWhisperResponse,
}, {
  service: protocol.Server.ServerLogin,
  request: protocol.Server.ServerLoginQuery,
  response: protocol.Server.ServerLoginResponse
}, {
  service: protocol.Server.ServerRequestZone,
  request: protocol.Server.ServerRequestZoneQuery,
  response: protocol.Server.ServerRequestZoneResponse
}, {
  service: protocol.Server.ServerMove,
  request: protocol.Server.ServerMoveQuery,
  response: protocol.Server.ServerMoveResponse
}, {
  service: protocol.Server.ServerRotate,
  request: protocol.Server.ServerRotateQuery,
  response: protocol.Server.ServerRotateResponse
}];

module.exports = exports;
