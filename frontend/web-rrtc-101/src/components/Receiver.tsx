import { useEffect, useRef } from "react";

export const Receiver = () => {
  //   const videoRef = useRef<any>(null);
  useEffect(() => {
    const socket = new WebSocket("ws://localhost:3000");
    socket.onopen = () => {
      console.log("connected from sender.tsx");
      socket.send(
        JSON.stringify({
          type: "receiver",
        })
      );
    };

    socket.onmessage = async (event) => {
      const message = JSON.parse(event.data);
      let pc: RTCPeerConnection | null = null;
      if (message.type === "createOffer") {
        //Create an answer
        pc = new RTCPeerConnection();
        pc.setRemoteDescription(message.sdp);
        pc.onicecandidate = (event) => {
          console.log("Event Ice Candidate Receiver ", event);
          if (event.candidate) {
            socket.send(
              JSON.stringify({
                type: "iceCandidate",
                candidate: event.candidate,
              })
            );
          }
        };

        pc.ontrack = (track) => {
          console.log("Track ", track);
          const video = document.createElement("video");
          document.body.appendChild(video);
          video.srcObject = new MediaStream([track.track]);
          video.play();
        };
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.send(
          JSON.stringify({
            type: "createAnswer",
            sdp: pc.localDescription,
          })
        );
      } else if (message.type === "iceCandidate") {
        if (!pc) {
          return;
        }
        //@ts-ignore
        pc.addIceCandidate(message.candidate);
      }
    };
  });
  return (
    <>
      <h1>Receiver</h1>
    </>
  );
};
