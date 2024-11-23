"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const wss = new ws_1.WebSocketServer({ port: 8080 });
let sender = null;
let receiver = null;
// there will be only one connection so dont override these global variables
wss.on('connection', function connection(ws) {
    if (sender == null) {
        sender = ws;
    }
    else if (receiver == null) {
        receiver = ws;
    }
    ws.on('error', console.error);
    ws.on('message', function message(data) {
        try {
            const stringData = data.toString();
            const jsonData = JSON.parse(stringData);
            console.log({ jsonData });
        }
        catch (err) {
            console.log(err);
        }
    });
});
