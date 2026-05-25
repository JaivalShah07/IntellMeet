import { useState, useEffect, useRef } from "react";
import type { Socket } from "socket.io-client";

const rtcConfig = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

function createMockStream(label: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 480;
  const ctx = canvas.getContext("2d");
  
  let angle = 0;
  const draw = () => {
    if (!ctx) return;
    
    // Create animated gradient background (dark futuristic blue/indigo theme)
    const gradient = ctx.createRadialGradient(
      320, 240, 50,
      320, 240, 320
    );
    
    const pulse = Math.sin(angle);
    const r1 = Math.floor(15 + 10 * pulse);
    const g1 = Math.floor(23 + 12 * Math.cos(angle));
    const b1 = Math.floor(42 + 15 * pulse);
    
    gradient.addColorStop(0, `rgb(${r1 + 25}, ${g1 + 35}, ${b1 + 65})`);
    gradient.addColorStop(1, `rgb(${r1}, ${g1}, ${b1})`);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 640, 480);
    
    // Draw revolving rings (glowing orbits)
    ctx.strokeStyle = "rgba(14, 165, 233, 0.15)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(320, 240, 120, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.strokeStyle = "rgba(99, 102, 241, 0.1)";
    ctx.beginPath();
    ctx.arc(320, 240, 160, 0, 2 * Math.PI);
    ctx.stroke();
    
    // Draw revolving orbital nodes
    const orbitX1 = 320 + 120 * Math.cos(angle * 0.7);
    const orbitY1 = 240 + 120 * Math.sin(angle * 0.7);
    ctx.fillStyle = "#38bdf8";
    ctx.shadowColor = "#38bdf8";
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(orbitX1, orbitY1, 6, 0, 2 * Math.PI);
    ctx.fill();
    ctx.shadowBlur = 0; // reset

    const orbitX2 = 320 + 160 * Math.cos(-angle * 0.5 + Math.PI);
    const orbitY2 = 240 + 160 * Math.sin(-angle * 0.5 + Math.PI);
    ctx.fillStyle = "#818cf8";
    ctx.shadowColor = "#818cf8";
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(orbitX2, orbitY2, 5, 0, 2 * Math.PI);
    ctx.fill();
    ctx.shadowBlur = 0; // reset

    // Blinking red recording indicator
    ctx.fillStyle = Math.floor(angle * 2.5) % 2 === 0 ? "#ef4444" : "rgba(239, 68, 68, 0.3)";
    ctx.beginPath();
    ctx.arc(45, 45, 8, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 11px monospace";
    ctx.textAlign = "left";
    ctx.fillText("LIVE SIMULATOR", 62, 48);

    // Audio level meter visualization
    ctx.fillStyle = "rgba(14, 165, 233, 0.2)";
    ctx.fillRect(520, 420, 80, 20);
    const barCount = 8;
    ctx.fillStyle = "#10b981";
    for (let i = 0; i < barCount; i++) {
      const h = Math.abs(Math.sin(angle * 3 + i)) * 14 + 2;
      ctx.fillRect(525 + i * 8, 435 - h, 5, h);
    }

    // Avatar card background
    ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(170, 160, 300, 160, 16);
    ctx.fill();
    ctx.stroke();

    // User initials badge in camera center
    const initials = label
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
      
    const avatarGrad = ctx.createLinearGradient(170, 160, 470, 320);
    avatarGrad.addColorStop(0, "#0ea5e9");
    avatarGrad.addColorStop(1, "#6366f1");
    ctx.fillStyle = avatarGrad;
    ctx.beginPath();
    ctx.arc(320, 215, 40, 0, 2 * Math.PI);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 28px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(initials, 320, 217);

    // Camera label text
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.font = "bold 16px system-ui, sans-serif";
    ctx.fillText(label, 320, 280);

    ctx.fillStyle = "rgba(56, 189, 248, 0.8)";
    ctx.font = "10px monospace";
    ctx.fillText("VIDEO FEED SUCCESSFUL", 320, 302);
    
    angle += 0.03;
    requestAnimationFrame(draw);
  };
  
  draw();
  
  // Capture track at 30 fps
  const captureStream = canvas.captureStream || (canvas as any).webkitCaptureStream;
  const videoTrack = captureStream.call(canvas, 30).getVideoTracks()[0];
  
  // Create mock silent audio track via Web Audio API
  let audioTrack: MediaStreamTrack;
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    const dst = audioContext.createMediaStreamDestination();
    oscillator.connect(dst);
    audioTrack = dst.stream.getAudioTracks()[0];
  } catch (err) {
    const audioCanvas = document.createElement("canvas");
    audioTrack = (audioCanvas as any).captureStream(1).getVideoTracks()[0];
  }
  
  return new MediaStream([videoTrack, audioTrack]);
}

export function useWebRTC(
  socket: Socket | null,
  roomId: string,
  isVideoOff: boolean,
  isMuted: boolean,
  disabled: boolean = false,
  userName: string = "Guest"
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
      .catch((err) => {
        console.warn("Hardware camera unavailable. Starting virtual camera simulator:", err);
        const mockStream = createMockStream(userName);
        setLocalStream(mockStream);
        activeStream = mockStream;
      });

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [disabled, userName]);

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
