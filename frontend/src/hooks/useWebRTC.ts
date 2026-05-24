import { useState, useEffect, useRef } from "react";
import type { Socket } from "socket.io-client";

const rtcConfig = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export function useWebRTC(
  socket: Socket | null,
  roomId: string,
  isVideoOff: boolean,
  isMuted: boolean,
  disabled: boolean = false
) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const [peerNames, setPeerNames] = useState<Map<string, string>>(new Map());

  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());

  // 1. Initialize Local Media Stream
  useEffect(() => {
    if (disabled) return;
    let activeStream: MediaStream | null = null;
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setLocalStream(stream);
        activeStream = stream;
      })
      .catch((err) => console.error("Media access denied or not available:", err));

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [disabled]);

  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const screenTrackRef = useRef<MediaStreamTrack | null>(null);

  // 2. Toggle Local Audio/Video Tracks
  useEffect(() => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        // If it's a screen track, we don't disable it with isVideoOff
        if (track.label.includes("screen") || track.label.includes("monitor")) return;
        track.enabled = !isVideoOff;
      });
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !isMuted;
      });
    }
  }, [localStream, isVideoOff, isMuted]);

  const toggleScreenSharing = async () => {
    if (isScreenSharing) {
      // Stop screen sharing
      if (screenTrackRef.current) {
        screenTrackRef.current.stop();
        screenTrackRef.current = null;
      }
      setIsScreenSharing(false);

      // Re-enable camera track
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const camTrack = stream.getVideoTracks()[0];
        if (localStream && camTrack) {
          // Replace track in localStream
          const oldTrack = localStream.getVideoTracks()[0];
          if (oldTrack) localStream.removeTrack(oldTrack);
          localStream.addTrack(camTrack);
          
          // Apply current toggle state
          camTrack.enabled = !isVideoOff;

          // Replace track in all peer connections
          peerConnections.current.forEach((pc) => {
            const sender = pc.getSenders().find((s) => s.track?.kind === "video");
            if (sender) sender.replaceTrack(camTrack);
          });
          
          setLocalStream(new MediaStream(localStream.getTracks()));
        }
      } catch (e) {
        console.error("Failed to restore camera after screen share", e);
      }
    } else {
      // Start screen sharing
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = stream.getVideoTracks()[0];
        screenTrackRef.current = screenTrack;
        setIsScreenSharing(true);

        // Listen for browser-level stop (e.g., clicking "Stop sharing" in Chrome UI)
        screenTrack.onended = () => {
          toggleScreenSharing();
        };

        if (localStream) {
          const oldTrack = localStream.getVideoTracks()[0];
          if (oldTrack) localStream.removeTrack(oldTrack);
          localStream.addTrack(screenTrack);

          // Replace track in all peer connections
          peerConnections.current.forEach((pc) => {
            const sender = pc.getSenders().find((s) => s.track?.kind === "video");
            if (sender) sender.replaceTrack(screenTrack);
          });
          
          setLocalStream(new MediaStream(localStream.getTracks()));
        }
      } catch (err) {
        console.error("Failed to start screen share", err);
      }
    }
  };

  // 3. Handle WebRTC Signaling via Socket
  useEffect(() => {
    if (!socket || !localStream) return;

    const createPeerConnection = (partnerId: string) => {
      const pc = new RTCPeerConnection(rtcConfig);

      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", { candidate: event.candidate, to: partnerId });
        }
      };

      pc.ontrack = (event) => {
        setRemoteStreams((prev) => {
          const newMap = new Map(prev);
          newMap.set(partnerId, event.streams[0]);
          return newMap;
        });
      };

      peerConnections.current.set(partnerId, pc);
      return pc;
    };

    const handleUserJoined = async ({ userName, socketId }: { userName: string; socketId: string }) => {
      if (peerConnections.current.has(socketId)) return;
      
      if (userName) {
        setPeerNames((prev) => {
          const newMap = new Map(prev);
          newMap.set(socketId, userName);
          return newMap;
        });
      }

      const pc = createPeerConnection(socketId);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      socket.emit("webrtc-offer", { offer, to: socketId });
    };

    const handleReceiveOffer = async ({
      offer,
      from,
      userName,
    }: {
      offer: RTCSessionDescriptionInit;
      from: string;
      userName?: string;
    }) => {
      if (userName) {
        setPeerNames((prev) => {
          const newMap = new Map(prev);
          newMap.set(from, userName);
          return newMap;
        });
      }

      const pc = createPeerConnection(from);
      await pc.setRemoteDescription(new RTCSessionDescription(offer));

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit("webrtc-answer", { answer, to: from });
    };

    const handleReceiveAnswer = async ({
      answer,
      from,
      userName,
    }: {
      answer: RTCSessionDescriptionInit;
      from: string;
      userName?: string;
    }) => {
      if (userName) {
        setPeerNames((prev) => {
          const newMap = new Map(prev);
          newMap.set(from, userName);
          return newMap;
        });
      }

      const pc = peerConnections.current.get(from);
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      }
    };

    const handleNewICECandidate = async ({
      candidate,
      from,
    }: {
      candidate: RTCIceCandidateInit;
      from: string;
    }) => {
      const pc = peerConnections.current.get(from);
      if (pc) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.error("Error adding received ice candidate", e);
        }
      }
    };

    const handleUserLeft = ({ socketId }: { socketId: string }) => {
      const pc = peerConnections.current.get(socketId);
      if (pc) {
        pc.close();
        peerConnections.current.delete(socketId);
      }
      setRemoteStreams((prev) => {
        const newMap = new Map(prev);
        newMap.delete(socketId);
        return newMap;
      });
      setPeerNames((prev) => {
        const newMap = new Map(prev);
        newMap.delete(socketId);
        return newMap;
      });
    };

    socket.on("user-joined", handleUserJoined);
    socket.on("webrtc-offer", handleReceiveOffer);
    socket.on("webrtc-answer", handleReceiveAnswer);
    socket.on("ice-candidate", handleNewICECandidate);
    socket.on("user-left", handleUserLeft);

    return () => {
      socket.off("user-joined", handleUserJoined);
      socket.off("webrtc-offer", handleReceiveOffer);
      socket.off("webrtc-answer", handleReceiveAnswer);
      socket.off("ice-candidate", handleNewICECandidate);
      socket.off("user-left", handleUserLeft);
    };
  }, [socket, localStream]);

  // Cleanup peer connections unmount
  useEffect(() => {
    return () => {
      peerConnections.current.forEach((pc) => pc.close());
      peerConnections.current.clear();
    };
  }, []);

  return { localStream, remoteStreams, peerNames, isScreenSharing, toggleScreenSharing };
}
