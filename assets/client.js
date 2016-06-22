"use strict";

import protobuf from 'protobufjs';
import ChatDefinition from '../proto/chat.proto';
import HeaderDefinition from '../proto/header.proto';
import LoginDefinition from '../proto/login.proto';
import RealmgoerDefinition from '../proto/realmgoer.proto';
import ResponseDefinition from '../proto/response.proto';
import ServicesDefinition from '../proto/services.proto';
import SpaceDefinition from '../proto/space.proto';
import SubrealmDefinition from '../proto/subrealm.proto';
import TransactionDefinition from '../proto/transaction.proto';
import RPCIndexProto from '../lib/index';
import { dispatch } from './store';
import RPCError from '../lib/error';
import url from 'url';

let builder = protobuf.newBuilder({
    convertFieldsToCamelCase: true
});

function loadDefinitions() {
    [].slice.call(arguments).forEach(function(v) {
        protobuf.loadJson(v, builder);
    });
}

loadDefinitions(
    ChatDefinition,
    HeaderDefinition,
    LoginDefinition,
    RealmgoerDefinition,
    ResponseDefinition,
    ServicesDefinition,
    SpaceDefinition,
    SubrealmDefinition,
    TransactionDefinition);

let protocol = builder.build().virtualproto;
protocol._builder = builder;

let lastTx = 0;

let index = [

    function ServerBroadcast(query) {
        let self = this;
        let buffer = query.toArrayBuffer();
        const thisTx = ++lastTx;
        return new Promise(function(resolve, reject) {
            function handleHeader(msg) {
                let header = protocol.ResponseHeader.decode(msg);
                if (header.tx === thisTx) {
                    self.removeEventListener('message', handleHeader);
                    if (header.error) return reject(RPCError.fromCode(header.error));
                    self.addEventListener('message', handleResponse);
                }

                function handleResponse(msg) {
                    self.removeEventListener('message', handleResponse);
                    resolve(msg);
                }
            }
            self.addEventListener('message', handleHeader);
            self.send(buffer);
        });
    },
    function ServerWhisper(query) {
        let self = this;
        let buffer = query.toArrayBuffer();
        const thisTx = ++lastTx;
        return new Promise(function(resolve, reject) {
            function handleHeader(msg) {
                let header = protocol.ResponseHeader.decode(msg);
                if (header.tx === thisTx) {
                    self.removeEventListener('message', handleHeader);
                    if (header.error) return reject(RPCError.fromCode(header.error));
                    self.addEventListener('message', handleResponse);
                }

                function handleResponse(msg) {
                    self.removeEventListener('message', handleResponse);
                    resolve(msg);
                }
            }
            self.addEventListener('message', handleHeader);
            self.send(buffer);
        });
    },
    function ServerLogin(query) {
        let self = this;
        let buffer = query.toArrayBuffer();
        const thisTx = ++lastTx;
        return new Promise(function(resolve, reject) {
            function handleHeader(msg) {
                let header = protocol.ResponseHeader.decode(msg);
                if (header.tx === thisTx) {
                    self.removeEventListener('message', handleHeader);
                    if (header.error) return reject(RPCError.fromCode(header.error));
                    self.addEventListener('message', handleResponse);
                }

                function handleResponse(msg) {
                    self.removeEventListener('message', handleResponse);
                    resolve(msg);
                }
            }
            self.addEventListener('message', handleHeader);
            self.send(buffer);
        });
    },
    function ServerRequestZone(query) {
        return new Promise(function() {})
    },
    function ServerMove(query) {
        return new Promise(function() {});
    },
    function ServerRotate(query) {
        return new Promise(function() {})
    },
    function ClientSend(query) {
        let self = this;
        dispatch({
            type: 'RECEIVED_MESSAGE',
            isWhisper,
            from,
            msg
        });
        self.send(new protocol.Header(0, 0, 0));
        return Promise.resolve(new ArrayBuffer(0));
    }
];

function implBind(socket) {
  return function impl(method, req, cb) {
    let methodCall = protocol._builder.lookup(method);
    index.getFnByName(methodCall.name).call(socket, req).then(function(result) {
        cb(null, result);
    }, function(err) {
        cb(err);
    });
  };
}

function RPCClient(socket) {
    socket.addEventListener('message', function handleHeader (msg) {
      try {
        let header = protocol.Header.decode(msg);
        if (!header.tx) {
          socket.removeEventListener('message', handleHeader);
          socket.addEventListener('message', function handleCall (msg) {
            client[index[header.fn].name].call(socket, msg, function (err, resp) {
              socket.removeEventListener('message', handleCall);
              socket.addEventListener('message', handleHeader);
              socket.send(resp);
            });
          });
        }
      } catch (e) {}
    });
    let client = {};
    let bound = implBind(socket);
    Object.assign(client, new protocol.Server(bound));
    Object.assign(client, new protocol.Client(bound));
    return client;
}

RPCClient.protocol = protocol;

export default RPCClient(new WebSocket(url.format({
  protocol: 'wss:',
  hostname: window.location.hostname
})));
