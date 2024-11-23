import { useEffect, useRef } from "react"

export const Receiver = () => {
    const ws = new WebSocket("ws://localhost:8080")
    const pcConn = new RTCPeerConnection()
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        ws.onopen = () => {
            ws.send(JSON.stringify({ type: "receiver" }))
        }
        ws.onmessage = async (event) => {
            const message = JSON.parse(event.data)
            if (message.type == "createOffer") {
                await pcConn.setRemoteDescription(message.sdp)
                const answer = await pcConn.createAnswer()
                await pcConn.setLocalDescription(answer)
                ws.send(JSON.stringify({
                    type: "createAnswer",
                    sdp: answer
                }))
            } else if (message.type == "iceCandidate") {
                await pcConn.addIceCandidate(message.candidate)
            }
        }
        startReceiving()
    }, [])


    /*    function startReceiving1() {
            pcConn.ontrack = async (event) => {
                if (videoRef.current) {
                    videoRef.current.srcObject = new MediaStream([event.track]);
                    await videoRef.current.play();
                }
            }
        }
    */
    function startReceiving() {
        // Create two video elements
        const video1 = document.createElement('video');
        const video2 = document.createElement('video');

        // Set autoplay
        video1.autoplay = true;
        video2.autoplay = true;

        // Add to document
        document.body.appendChild(video1);
        document.body.appendChild(video2);

        let firstVideo = true;

        pcConn.ontrack = async (event) => {
            if (firstVideo) {
                video1.srcObject = new MediaStream([event.track]);
                await video1.play();
                firstVideo = false;
            } else {
                video2.srcObject = new MediaStream([event.track]);
                await video2.play();
            }
        };
    }
    return (
        <div>
            <video ref={videoRef} />
        </div>
    )
}
