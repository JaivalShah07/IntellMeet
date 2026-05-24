import { useState, useRef, useEffect } from "react";

export function useMeetingRecorder(localStream: MediaStream | null, roomId: string) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const durationIntervalRef = useRef<any>(null);
  const displayStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mixedAudioDestRef = useRef<MediaStreamAudioDestinationNode | null>(null);

  const startRecording = async () => {
    try {
      // 1. Request Screen/Tab Capture stream (prompt the user)
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true, // Captures tab audio (remote participants' voices)
      });
      displayStreamRef.current = displayStream;

      // 2. Mix Audios (Local microphone + Tab audio)
      const audioTracks: MediaStreamTrack[] = [];
      const hasDisplayAudio = displayStream.getAudioTracks().length > 0;
      const hasLocalAudio = localStream && localStream.getAudioTracks().length > 0;

      if (hasDisplayAudio || hasLocalAudio) {
        // Initialize AudioContext
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const audioContext = new AudioCtx();
        audioContextRef.current = audioContext;
        
        const mixedDest = audioContext.createMediaStreamDestination();
        mixedAudioDestRef.current = mixedDest;

        if (hasDisplayAudio) {
          const displayAudioSource = audioContext.createMediaStreamSource(
            new MediaStream([displayStream.getAudioTracks()[0]])
          );
          displayAudioSource.connect(mixedDest);
        }

        if (hasLocalAudio) {
          const localAudioSource = audioContext.createMediaStreamSource(
            new MediaStream([localStream!.getAudioTracks()[0]])
          );
          localAudioSource.connect(mixedDest);
        }

        if (mixedDest.stream.getAudioTracks().length > 0) {
          audioTracks.push(mixedDest.stream.getAudioTracks()[0]);
        }
      }

      // 3. Construct the combined recording stream
      const videoTrack = displayStream.getVideoTracks()[0];
      const combinedTracks = [videoTrack, ...audioTracks];
      const recordingStream = new MediaStream(combinedTracks);

      // 4. Initialize MediaRecorder
      let options = { mimeType: "video/webm;codecs=vp9" };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = { mimeType: "video/webm;codecs=vp8" };
      }
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = { mimeType: "video/webm" };
      }

      const mediaRecorder = new MediaRecorder(recordingStream, options);
      mediaRecorderRef.current = mediaRecorder;
      recordedChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        saveRecording();
        cleanupStreams();
      };

      // Handle track endings (e.g. if the user clicks browser's native "Stop sharing" button)
      videoTrack.onended = () => {
        stopRecording();
      };

      // 5. Start MediaRecorder and start duration timer
      mediaRecorder.start(1000); // chunk every 1 sec
      setIsRecording(true);
      setRecordingDuration(0);
      durationIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Failed to start recording:", err);
      cleanupStreams();
      throw err;
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    setIsRecording(false);
  };

  const cleanupStreams = () => {
    if (displayStreamRef.current) {
      displayStreamRef.current.getTracks().forEach((track) => track.stop());
      displayStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(console.error);
      audioContextRef.current = null;
    }
    mixedAudioDestRef.current = null;
  };

  const saveRecording = () => {
    if (recordedChunksRef.current.length === 0) return;
    const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = `Meeting_Room_${roomId}_${new Date().toISOString().slice(0, 10)}.webm`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 100);
  };

  useEffect(() => {
    return () => {
      if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
      cleanupStreams();
    };
  }, []);

  return {
    isRecording,
    recordingDuration,
    startRecording,
    stopRecording,
  };
}
