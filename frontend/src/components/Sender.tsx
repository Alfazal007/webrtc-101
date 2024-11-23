import { useEffect, useState } from "react"

export const Sender = () => {
    const [socket, setSocket] = useState<WebSocket | null>(null)
    const [pc, setPc] = useState<RTCPeerConnection | null>(null)

    useEffect(() => {
        const ws = new WebSocket("ws://localhost:8080")
        const pcConn = new RTCPeerConnection()

        pcConn.onicecandidate = ((event) => {
            ws.send(JSON.stringify({
                type: "iceCandidate",
                candidate: event.candidate
            }))
        })

        ws.onopen = () => {
            ws.send(JSON.stringify({ type: "sender" }))
        }

        ws.onmessage = async (event) => {
            const message = JSON.parse(event.data)
            if (message.type == "createAnswer") {
                await pcConn.setRemoteDescription(message.sdp)
            }
            else if (message.type == "iceCandidate") {
                await pcConn.addIceCandidate(message.candidate)
            }
        }

        pcConn.onnegotiationneeded = async () => {
            const offer = await pcConn.createOffer()
            await pcConn.setLocalDescription(offer)
            ws.send(JSON.stringify({
                type: "createOffer",
                sdp: offer
            }))
        }

        ws.onclose = () => {
            setSocket(null)
        }

        setSocket(ws)
        setPc(pcConn)
    }, [])

    const handleSendData = () => {
        getCameraStreamAndSend()
    }
    const getCameraStreamAndSend = () => {
        navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
            const video = document.createElement('video');
            video.srcObject = stream;
            video.play();
            // this is wrong, should propogate via a component
            document.body.appendChild(video);
            stream.getTracks().forEach((track) => {
                pc?.addTrack(track);
            });
        });
        navigator.mediaDevices.getDisplayMedia({ video: true }).then((stream) => {
            const video = document.createElement('video');
            video.srcObject = stream;
            video.play();
            // this is wrong, should propogate via a component
            document.body.appendChild(video);
            stream.getTracks().forEach((track) => {
                pc?.addTrack(track);
            });
        });
    }

    return (
        <>
            <div>Sender</div>
            <button onClick={handleSendData}>Send data</button>
        </>
    )
}
