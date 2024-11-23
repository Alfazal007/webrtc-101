import { WebSocket, WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

let sender: WebSocket | null = null;
let receiver: WebSocket | null = null;


// there will be only one connection so dont override these global variables
wss.on('connection', function connection(ws) {
    ws.on('error', console.error);

    ws.on('message', function message(data) {
        try {
            const stringData = data.toString()
            const jsonData = JSON.parse(stringData)
            if (jsonData.type == "sender") {
                sender = ws
            } else if (jsonData.type == "receiver") {
                receiver = ws
            } else if (jsonData.type == "createOffer") {
                receiver?.send(JSON.stringify({ type: "createOffer", sdp: jsonData.sdp }))
            } else if (jsonData.type == "createAnswer") {
                sender?.send(JSON.stringify({ type: "createAnswer", sdp: jsonData.sdp }))
            } else if (jsonData.type == "iceCandidate") {
                if (ws == sender) {
                    receiver?.send(JSON.stringify({ type: "iceCandidate", candidate: jsonData.candidate }))
                } else if (ws == receiver) {
                    sender?.send(JSON.stringify({ type: "iceCandidate", candidate: jsonData.candidate }))
                }
            }
        } catch (err) {
            console.log(err)
        }
    });
});

