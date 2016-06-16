"use strict";

const protocol = require('./protocol');

let exports = [{
  service: 'ServerBroadcast',
  request: protocol.ServerBroadcastQuery,
  response: protocol.ServerBroadcastResponse
}, {
  service: 'ServerWhisper',
  request: protocol.Server.ServerWhisperQuery,
  response: protocol.Server.ServerWhisperResponse,
}, {
  service: 'ServerLogin',
  request: protocol.Server.ServerLoginQuery,
  response: protocol.Server.ServerLoginResponse
}, {
  service: 'ServerRequestZone',
  request: protocol.Server.ServerRequestZoneQuery,
  response: protocol.Server.ServerRequestZoneResponse
}, {
  service: 'ServerMove',
  request: protocol.Server.ServerMoveQuery,
  response: protocol.Server.ServerMoveResponse
}];

module.exports = exports;
