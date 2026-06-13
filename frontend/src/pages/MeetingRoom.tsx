import React, { useState, useEffect, useRef } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  MonitorUp,
  PhoneOff,
  MessageSquare,
  Users,
  Wifi,
  Circle,
  FileText,
  ListChecks,
  Plus,
  Loader2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../hooks/useSocket";
import { useWebRTC } from "../hooks/useWebRTC";
import { useMeetingRecorder } from "../hooks/useMeetingRecorder";
import api from "../lib/api";

const VideoPlayer = ({ stream, isLocal, name }: { stream: MediaStream | null; isLocal?: boolean; name?: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  if (!stream) {
    return (
      <div className="w-full h-full bg-slate-800/50 flex flex-col items-center justify-center rounded-2xl border border-white/5">
        <Video className="w-8 h-8 text-slate-600 mb-2" />
        <span className="text-slate-500 text-sm">{name || "Loading..."}</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black rounded-2xl overflow-hidden border border-white/10 shadow-lg">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal}
        className="w-full h-full object-cover"
      />
      <div className="absolute bottom-3 left-3 bg-slate-900/80 px-3 py-1.5 rounded-lg text-sm font-medium border border-white/10 backdrop-blur-md">
        {name || (isLocal ? "You" : "Participant")}
      </div>
    </div>
  );
};

export default function MeetingRoom() {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [showPanel, setShowPanel] = useState(true);
  const [activeTab, setActiveTab] = useState("chat");
  const [chatInput, setChatInput] = useState("");

  // Shared Notes & Tasks States
  const [notesText, setNotesText] = useState("");
  const [tasks, setTasks] = useState<any[]>([]);
  const [taskInput, setTaskInput] = useState("");
  const [taskCreating, setTaskCreating] = useState(false);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const roomId = searchParams.get("room");
  const userName = user?.name || "Guest";

  const [meetingLoading, setMeetingLoading] = useState(true);
  const [meetingError, setMeetingError] = useState<string | null>(null);
  const [meetingInfo, setMeetingInfo] = useState<any>(null);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    if (!roomId) {
      navigate("/meetings", { replace: true });
    }
  }, [roomId, navigate]);

  useEffect(() => {
    if (!roomId) return;
    api.get(`/meetings/room/${roomId}`)
      .then((res) => {
        const meeting = res.data.meeting;
        if (meeting.status === "completed") {
          setMeetingError("This meeting has already ended and cannot be joined.");
        } else {
          setMeetingInfo(meeting);
          if (meeting.status === "scheduled") {
            api.patch(`/meetings/${meeting._id}/status`, { status: "live" })
              .then((statusRes) => {
                if (statusRes.data?.meeting) {
                  setMeetingInfo(statusRes.data.meeting);
                }
              })
              .catch((err) => {
                console.error("Failed to update status to live:", err);
              });
          }
        }
      })
      .catch((err) => {
        setMeetingError(err.response?.data?.message || "Failed to load meeting details.");
      })
      .finally(() => {
        setMeetingLoading(false);
      });
  }, [roomId]);

  // Only initialize hooks if roomId exists and meeting is verified as active
  const safeRoomId = roomId || "";
  const isHookDisabled = meetingLoading || !!meetingError || !roomId;

  const [readyToJoin, setReadyToJoin] = useState(false);

  const { socket, messages, connected, sendMessage } = useSocket(
    safeRoomId,
    userName,
    isHookDisabled,
    readyToJoin
  );
  const { localStream, remoteStreams, peerNames, isScreenSharing, toggleScreenSharing } = useWebRTC(
    socket,
    safeRoomId,
    isVideoOff,
    isMuted,
    isHookDisabled,
    userName
  );

  const { isRecording, recordingDuration, startRecording, stopRecording, isUploading } = useMeetingRecorder(
    localStream,
    safeRoomId,
    meetingInfo?._id
  );

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  useEffect(() => {
    if (localStream) {
      setReadyToJoin(true);
    }
  }, [localStream]);

  useEffect(() => {
    if (!socket) return;
    socket.on("meeting-ended", (data: any) => {
      setMeetingError(data.message || "This meeting has already ended.");
    });
    return () => {
      socket.off("meeting-ended");
    };
  }, [socket]);

  // Load tasks created during this meeting
  useEffect(() => {
    if (!meetingInfo?._id) return;
    api.get(`/tasks?meetingId=${meetingInfo._id}`)
      .then((res) => {
        setTasks(res.data.tasks || []);
      })
      .catch(console.error);
  }, [meetingInfo]);

  // Sync notes and task creations real-time via Socket.io
  useEffect(() => {
    if (!socket) return;

    const handleNotesUpdate = ({ notes }: any) => {
      setNotesText(notes);
    };

    const handleTaskCreated = ({ task }: any) => {
      setTasks((prev) => [task, ...prev]);
    };

    socket.on("notes-update", handleNotesUpdate);
    socket.on("task-created", handleTaskCreated);

    return () => {
      socket.off("notes-update", handleNotesUpdate);
      socket.off("task-created", handleTaskCreated);
    };
  }, [socket]);

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setNotesText(text);
    if (socket) {
      socket.emit("notes-edit", { roomId: safeRoomId, notes: text });
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskInput.trim() || !meetingInfo?._id) return;

    const title = taskInput.trim();
    setTaskInput("");

    const tempId = `temp-${Date.now()}`;
    const newTask = {
      _id: tempId,
      title,
      status: "todo",
      meetingId: meetingInfo._id
    };
    setTasks((prev) => [newTask, ...prev]);

    setTaskCreating(true);
    try {
      const { data } = await api.post("/tasks", {
        title,
        meetingId: meetingInfo._id,
      });

      const actualTask = data.task || { ...newTask, _id: data._id || tempId };
      setTasks((prev) => prev.map(t => t._id === tempId ? actualTask : t));

      if (socket) {
        socket.emit("task-created", { roomId: safeRoomId, task: actualTask });
      }
    } catch (err) {
      setTasks((prev) => prev.filter(t => t._id !== tempId));
      console.error("Failed to create task in meeting:", err);
      alert("Failed to create task");
    } finally {
      setTaskCreating(false);
    }
  };

  const [fullTranscript, setFullTranscript] = useState("");
  const [currentSubtitle, setCurrentSubtitle] = useState<{ text: string; userName: string } | null>(
    null
  );
  const [analyzing, setAnalyzing] = useState(false);

  // Speech Recognition (Live Transcription)
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition || !socket) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      let finalStr = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalStr += event.results[i][0].transcript;
        }
      }
      if (finalStr.trim()) {
        setFullTranscript((prev) => prev + " " + finalStr.trim());
        socket.emit("transcript", { roomId: safeRoomId, text: finalStr.trim(), userName });
      }
    };

    recognition.onend = () => {
      if (!isMuted) {
        try {
          recognition.start();
        } catch {}
      }
    };

    if (!isMuted) {
      try {
        recognition.start();
      } catch {}
    }

    return () => {
      recognition.onend = null;
      recognition.stop();
    };
  }, [socket, safeRoomId, userName, isMuted]);

  // Receive Subtitles
  useEffect(() => {
    if (!socket) return;
    const handleTranscript = ({ text, userName: speakerName }: any) => {
      setCurrentSubtitle({ text, userName: speakerName });
      setTimeout(() => {
        setCurrentSubtitle((prev) => {
          if (prev?.text === text) return null;
          return prev;
        });
      }, 4000); // clear after 4s
    };
    socket.on("transcript", handleTranscript);
    return () => {
      socket.off("transcript", handleTranscript);
    };
  }, [socket]);

  const [wasRecorded, setWasRecorded] = useState(false);

  const handleToggleRecording = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      try {
        await startRecording();
        setWasRecorded(true);
      } catch (err) {
        console.error("Failed to start recording:", err);
      }
    }
  };

  const performFinalLeave = async () => {
    localStream?.getTracks().forEach((track) => track.stop());

    if (meetingInfo?._id) {
      try {
        await api.patch(`/meetings/${meetingInfo._id}/status`, {
          status: "completed",
          ...(wasRecorded || isRecording ? { hasRecording: true } : {})
        });
      } catch (err) {
        console.error("Failed to update meeting status to completed in database:", err);
      }
    }

    if (fullTranscript.trim().length > 20) {
      const wantAnalyze = window.confirm(
        "Do you want to run AI Analysis on this meeting's transcript?"
      );
      if (wantAnalyze) {
        setAnalyzing(true);
        try {
          await api.post("/ai/analyze", {
            transcript: fullTranscript,
            roomId: safeRoomId,
            meetingTitle: `Room ${safeRoomId} Meeting`,
          });
          alert("Analysis complete! Check the AI Insights page.");
        } catch (err) {
          console.error(err);
          alert("AI Analysis failed.");
        } finally {
          setAnalyzing(false);
        }
      }
    }
    navigate("/dashboard");
  };

  const handleLeave = async () => {
    if (isRecording) {
      stopRecording();
      setIsLeaving(true);
    } else if (isUploading) {
      setIsLeaving(true);
    } else {
      await performFinalLeave();
    }
  };

  useEffect(() => {
    if (isLeaving && !isRecording && !isUploading) {
      performFinalLeave();
    }
  }, [isLeaving, isRecording, isUploading]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(chatInput);
    setChatInput("");
  };

  const remoteStreamsArray = Array.from(remoteStreams.entries());
  const totalParticipants = 1 + remoteStreamsArray.length;

  if (meetingLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0f172a] text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-slate-900 to-emerald-500/10" />
        <div className="relative flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-300 font-medium">Verifying meeting room...</p>
        </div>
      </div>
    );
  }

  if (meetingError) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0f172a] text-white px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-slate-900 to-indigo-500/5" />
        <div className="relative max-w-md w-full text-center space-y-6 bg-slate-900/60 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-2xl animate-fade-in">
          <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
            <VideoOff className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold tracking-tight">Meeting Unavailable</h2>
            <p className="text-slate-400 text-sm leading-relaxed">{meetingError}</p>
          </div>
          <button
            onClick={() => navigate("/meetings")}
            className="w-full px-6 py-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg hover:brightness-110"
          >
            Back to Meetings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex bg-[#0f172a] text-white relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-[40rem] h-[40rem] bg-indigo-600 rounded-full mix-blend-screen filter blur-[120px] opacity-20 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-sky-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20 pointer-events-none" />

      <div
        className={`flex-1 flex flex-col transition-all duration-300 relative ${
          showPanel ? "mr-[320px] md:mr-[380px]" : "mr-0"
        }`}
      >
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10">
          <div className="bg-slate-900/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 flex items-center gap-3 shadow-xl">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold">Room {safeRoomId}</span>
            <span className="text-gray-400 text-sm flex items-center gap-1">
              <Wifi className={`w-3 h-3 ${connected ? "text-emerald-400" : "text-red-400"}`} />
              {connected ? "Live" : "Connecting..."}
            </span>
            {isRecording && (
              <span className="text-red-500 text-xs flex items-center gap-1.5 font-bold border-l border-white/10 pl-3">
                <Circle className="w-2.5 h-2.5 fill-red-500 animate-pulse" />
                REC {formatDuration(recordingDuration)}
              </span>
            )}
          </div>
          <span className="text-xs text-slate-400 bg-slate-800/80 px-3 py-1 rounded-lg border border-slate-700">
            Encrypted Connection
          </span>
          <div className="text-xs text-slate-300 bg-slate-800/80 px-3 py-1 rounded-lg border border-slate-700">
  Participants: {totalParticipants}
</div>
        </div>

        <div className="flex-1 p-6 pt-24 pb-32 flex items-center justify-center">
          <div
            className={`w-full max-w-7xl h-full grid gap-4 p-4 ${
              totalParticipants === 1
                ? "grid-cols-1"
                : totalParticipants === 2
                ? "grid-cols-2"
                : "grid-cols-2 md:grid-cols-3"
            }`}
          >
            {/* Local Video */}
            <div className={totalParticipants === 1 ? "max-w-4xl mx-auto w-full aspect-video" : "w-full aspect-video"}>
              <VideoPlayer stream={localStream} isLocal={true} name={`${userName} (You)`} />
            </div>

            {/* Remote Videos */}
            {remoteStreamsArray.map(([id, stream]) => (
              <div key={id} className="w-full aspect-video">
                <VideoPlayer stream={stream} name={peerNames.get(id) || `Participant (${id.slice(0, 4)})`} />
              </div>
            ))}
          </div>
          
          {currentSubtitle && (
            <div className="absolute bottom-28 left-1/2 -translate-x-1/2 max-w-2xl w-full px-6 text-center z-20 pointer-events-none">
              <div className="inline-block bg-black/70 backdrop-blur-md px-4 py-2 rounded-lg text-white font-medium border border-white/10 shadow-lg shadow-black/50">
                <span className="text-sky-400 text-xs uppercase font-bold mr-2">{currentSubtitle.userName}:</span>
                <span className="text-sm sm:text-base leading-relaxed">{currentSubtitle.text}</span>
              </div>
            </div>
          )}
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-slate-900/70 backdrop-blur-xl px-6 py-4 rounded-2xl border border-white/10 shadow-2xl z-20">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-4 rounded-xl ${isMuted ? "bg-red-500" : "bg-white/10 hover:bg-white/20"}`}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setIsVideoOff(!isVideoOff)}
            className={`p-4 rounded-xl ${isVideoOff ? "bg-red-500" : "bg-white/10 hover:bg-white/20"}`}
          >
            {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </button>
          <button
            onClick={toggleScreenSharing}
            className={`p-4 rounded-xl hidden sm:block ${
              isScreenSharing ? "bg-sky-600" : "bg-white/10 hover:bg-white/20"
            }`}
          >
            <MonitorUp className="w-5 h-5" />
          </button>
          <button
            onClick={handleToggleRecording}
            className={`p-4 rounded-xl hidden sm:block ${
              isRecording ? "bg-red-500 text-white" : "bg-white/10 hover:bg-white/20 text-white/80 hover:text-white"
            }`}
            title={isRecording ? "Stop Recording" : "Record Meeting"}
          >
            <Circle className={`w-5 h-5 ${isRecording ? "fill-white" : ""}`} />
          </button>
          <button
            onClick={() => setShowPanel(!showPanel)}
            className="p-4 rounded-xl bg-white/10 hover:bg-white/20 hidden sm:block"
          >
            <MessageSquare className="w-5 h-5" />
          </button>
          <button
            onClick={handleLeave}
            disabled={analyzing}
            className="px-6 py-4 rounded-xl bg-red-600 hover:bg-red-700 font-semibold flex items-center gap-2 disabled:opacity-50"
          >
            {analyzing ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <PhoneOff className="w-5 h-5" />
            )}
            {analyzing ? "Analyzing..." : "Leave"}
          </button>
        </div>
      </div>

      <div
        className={`absolute right-0 top-0 bottom-0 w-[320px] md:w-[380px] bg-slate-900/60 backdrop-blur-2xl border-l border-white/10 flex flex-col z-30 transition-transform ${
          showPanel ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-4 border-b border-white/10 grid grid-cols-4 gap-1">
          <button
            onClick={() => setActiveTab("chat")}
            className={`py-2 rounded-lg text-xs font-semibold flex flex-col items-center justify-center gap-1 ${
              activeTab === "chat" ? "bg-white/10 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <MessageSquare className="w-4 h-4" /> Chat
          </button>
          <button
            onClick={() => setActiveTab("notes")}
            className={`py-2 rounded-lg text-xs font-semibold flex flex-col items-center justify-center gap-1 ${
              activeTab === "notes" ? "bg-white/10 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileText className="w-4 h-4" /> Notes
          </button>
          <button
            onClick={() => setActiveTab("tasks")}
            className={`py-2 rounded-lg text-xs font-semibold flex flex-col items-center justify-center gap-1 ${
              activeTab === "tasks" ? "bg-white/10 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <ListChecks className="w-4 h-4" /> Tasks
          </button>
          <button
            onClick={() => setActiveTab("participants")}
            className={`py-2 rounded-lg text-xs font-semibold flex flex-col items-center justify-center gap-1 ${
              activeTab === "participants" ? "bg-white/10 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Users className="w-4 h-4" /> People
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col min-h-0">
          {activeTab === "chat" && (
            <div className="flex-1 overflow-y-auto space-y-3">
              {messages.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-8">
                  Start the conversation
                </p>
              ) : (
                messages.map((msg, i) => (
                  <div
                    key={i}
                    className="bg-slate-800/50 rounded-xl p-3 border border-white/5 max-w-[90%]"
                  >
                    <p className="text-xs text-slate-400 mb-1">
                      {msg.userName} · {new Date(msg.at).toLocaleTimeString()}
                    </p>
                    <p className="text-sm">{msg.message}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "notes" && (
            <div className="flex flex-col h-full space-y-2 min-h-0">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Collaborative Notes</span>
              <textarea
                value={notesText}
                onChange={handleNotesChange}
                placeholder="Start typing notes..."
                className="flex-1 w-full bg-slate-800/50 border border-white/10 rounded-xl p-3 text-sm focus:ring-2 focus:ring-sky-500 outline-none resize-none font-sans leading-relaxed text-white"
              />
            </div>
          )}

          {activeTab === "tasks" && (
            <div className="flex flex-col h-full space-y-3 min-h-0">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Tasks Created</span>
              <form onSubmit={handleCreateTask} className="flex gap-2">
                <input
                  value={taskInput}
                  onChange={(e) => setTaskInput(e.target.value)}
                  placeholder="Create task..."
                  className="flex-1 bg-slate-800/50 border border-white/10 rounded-xl py-2 px-3 text-xs focus:ring-2 focus:ring-sky-500 outline-none text-white"
                />
                <button
                  type="submit"
                  disabled={taskCreating}
                  className="px-3 py-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 rounded-xl text-white font-semibold text-xs flex items-center justify-center shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </form>
              <div className="flex-1 overflow-y-auto space-y-2">
                {tasks.length === 0 ? (
                  <p className="text-slate-500 text-xs text-center py-6">
                    No tasks created yet during this meeting.
                  </p>
                ) : (
                  tasks.map((task) => (
                    <div key={task._id} className="p-3 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-1">
                      <p className="font-semibold text-xs text-white">{task.title}</p>
                      <span className="text-[10px] text-emerald-400 capitalize bg-emerald-500/10 px-2 py-0.5 rounded-full w-fit">
                        {task.status || "todo"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === "participants" && (
            <div className="space-y-2 overflow-y-auto">
              <div className="p-3 rounded-xl bg-white/5">
                <p className="font-semibold text-sm">{userName} (You)</p>
                <p className="text-xs text-emerald-400">Connected</p>
              </div>
              {remoteStreamsArray.map(([id]) => (
                <div key={id} className="p-3 rounded-xl bg-white/5">
                  <p className="font-semibold text-sm">
                    {peerNames.get(id) || `Participant (${id.slice(0, 4)})`}
                  </p>
                  <p className="text-xs text-sky-400">Connected</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {activeTab === "chat" && (
          <form onSubmit={handleSend} className="p-4 border-t border-white/10">
            <div className="flex gap-2">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Message everyone..."
                className="flex-1 bg-slate-800/50 border border-white/10 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 rounded-xl font-semibold text-sm"
              >
                Send
              </button>
            </div>
          </form>
        )}
      </div>

      <button
        onClick={handleLeave}
        className="absolute top-6 left-6 z-20 text-sm text-slate-400 hover:text-white flex items-center gap-1 font-semibold"
      >
        ← Leave Meeting
      </button>

      {isLeaving && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-50 flex flex-col items-center justify-center text-white animate-fade-in">
          <Loader2 className="w-12 h-12 animate-spin text-sky-500 mb-4" />
          <h3 className="text-xl font-bold">Uploading Recording</h3>
          <p className="text-slate-400 mt-2 text-sm max-w-xs text-center">
            Saving your meeting recording to Cloudinary. Please don't close this window.
          </p>
        </div>
      )}
    </div>
  );
}
