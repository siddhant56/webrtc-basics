import { useEffect, useState } from "react";

export const Sender = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  useEffect(() => {
    const socket = new WebSocket("ws://localhost:3000");
    // setSocket(socket);
    socket.onopen = () => {
      console.log("connected from sender.tsx");
      socket.send(
        JSON.stringify({
          type: "sender",
        })
      );
    };
    setSocket(socket);
  }, []);

  async function startSendingVideo() {
    //Create An Offer

    if (!socket) {
      return;
    }

    const pc = new RTCPeerConnection();
    pc.onnegotiationneeded = async () => {
      console.log("On Negotiation Needed");

      const offer = await pc.createOffer(); //SDP
      await pc.setLocalDescription(offer);
      socket?.send(
        JSON.stringify({
          type: "createOffer",
          sdp: pc.localDescription,
        })
      );
    };

    pc.onicecandidate = (event) => {
      console.log("Event Ice Candidate ", event);
      if (event.candidate) {
        socket.send(
          JSON.stringify({
            type: "iceCandidate",
            candidate: event.candidate,
          })
        );
      }
    };

    socket.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "createAnswer") {
        pc.setRemoteDescription(data.sdp);
      } else if (data.type === "iceCandidate") {
        pc.addIceCandidate(data.candidate);
      }
    };

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    });

    pc.addTrack(stream.getVideoTracks()[0]);

    // const video = document.createElement("video");
    // document.body.appendChild(video);
    // video.srcObject = stream;
    // video.play();
  }
  return (
    <>
      <h1>Sender</h1>
      <button onClick={startSendingVideo}>Create Offer</button>
    </>
  );
};
