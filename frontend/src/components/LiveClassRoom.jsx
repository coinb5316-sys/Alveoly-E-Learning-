// components/LiveClassRoom.jsx - COMPLETE WORKING VERSION

import { useState, useEffect, useRef, useCallback, memo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "../api/axios";
import { io } from "socket.io-client";
import Peer from "simple-peer";
import { getIceServers } from "../utils/webrtc";
import { 
  Video, Mic, MicOff, VideoOff, PhoneOff, MessageSquare, Users, Send,
  Clock, Calendar, Grid, List, Pin, Copy, Check, WifiOff, Loader2, 
  Menu, X, Sun, Moon
} from "lucide-react";
import toast from "react-hot-toast";

const LiveClassRoom = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, loading: authLoading } = useAuth();
  
  // State
  const [liveClass, setLiveClass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isJoined, setIsJoined] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [showSidebar, setShowSidebar] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [participants, setParticipants] = useState([]);
  const [duration, setDuration] = useState(0);
  const [isLecturer, setIsLecturer] = useState(false);
  const [layout, setLayout] = useState("grid");
  const [pinnedVideo, setPinnedVideo] = useState(null);
  const [inviteLink, setInviteLink] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [localStreamReady, setLocalStreamReady] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [classEnded, setClassEnded] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [remoteStreams, setRemoteStreams] = useState({});
  
  // Refs
  const socketRef = useRef(null);
  const peersRef = useRef({});
  const userStreamRef = useRef(null);
  const localVideoRef = useRef(null);
  const durationIntervalRef = useRef(null);
  const videoRefs = useRef({});
  const isLeavingRef = useRef(false);
  const initPeersRef = useRef(false);
  
  // Helper functions
  const getUserId = useCallback((participant) => {
    if (!participant) return null;
    if (participant.userId?._id) return participant.userId._id;
    if (participant.userId?.toString) return participant.userId.toString();
    if (participant._id) return participant._id;
    return null;
  }, []);

  const getUserName = useCallback((participant) => {
    if (!participant) return "Unknown";
    if (participant.userId?.name) return participant.userId.name;
    if (participant.userName) return participant.userName;
    if (participant.name) return participant.name;
    return "Unknown User";
  }, []);

  const getDashboardPath = useCallback(() => {
    if (!currentUser) return "/";
    switch (currentUser.role) {
      case "admin": return "/admin";
      case "lecturer": return "/lecturer";
      case "student": return "/student/dashboard";
      default: return "/";
    }
  }, [currentUser]);

  const getLiveClassesPath = useCallback(() => {
    if (!currentUser) return "/";
    switch (currentUser.role) {
      case "admin": return "/admin/live-classes";
      case "lecturer": return "/lecturer/live-classes";
      case "student": return "/student/live-classes";
      default: return "/";
    }
  }, [currentUser]);
  
  // Dark mode
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const isDark = savedTheme === "dark";
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("theme", newDarkMode ? "dark" : "light");
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };
  
  useEffect(() => {
    if (!authLoading && !currentUser) {
      toast.error("Please login to access this page");
      navigate("/login");
    }
  }, [currentUser, authLoading, navigate]);

  useEffect(() => {
    if (!currentUser || authLoading) return;
    
    init();
    
    return () => {
      cleanup();
    };
  }, [classId, currentUser, authLoading]);

  const init = async () => {
    initializeSocket();
    await fetchLiveClassDetails();
  };

  const initializeSocket = () => {
    const API_URL = import.meta.env.VITE_APP_API_BASE_URL || "https://alveoly-e-learning-755w.onrender.com";
    
    socketRef.current = io(API_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current.on("connect", () => {
      console.log("✅ Socket connected");
      setSocketConnected(true);
    });

    socketRef.current.on("disconnect", () => {
      console.log("❌ Socket disconnected");
      setSocketConnected(false);
    });

    socketRef.current.on("existing-participants", handleExistingParticipants);
    socketRef.current.on("user-joined", handleUserJoined);
    socketRef.current.on("user-left", handleUserLeft);
    socketRef.current.on("signal", handleSignal);
    socketRef.current.on("class-ended", handleClassEnded);
    socketRef.current.on("new-chat-message", handleNewChatMessage);
  };

  const fetchLiveClassDetails = async () => {
    try {
      const res = await axios.get(`/live-class/${classId}`);
      
      if (res.data.status === "completed") {
        toast.error("This class has already ended");
        navigate(getDashboardPath());
        return;
      }
      
      setLiveClass(res.data);
      setChatMessages(res.data.chatMessages || []);
      
      const isUserLecturer = currentUser?.role === "lecturer" || res.data.lecturerId?._id === currentUser?._id;
      setIsLecturer(isUserLecturer);
      
      setInviteLink(`${window.location.origin}/join/${classId}`);
      
      if (res.data.status === "ongoing") {
        await joinClass();
      }
    } catch (err) {
      console.error("Error fetching live class:", err);
      toast.error(err.response?.data?.message || "Failed to load live class");
      navigate(getDashboardPath());
    } finally {
      setLoading(false);
    }
  };

  const getLocalStream = async () => {
    if (userStreamRef.current) return userStreamRef.current;
    
    try {
      const constraints = {
        video: !isVideoOff,
        audio: !isMuted
      };
      
      console.log("🎥 Getting user media with constraints:", constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      userStreamRef.current = stream;
      
      // Enable/disable tracks based on state
      stream.getAudioTracks().forEach(track => track.enabled = !isMuted);
      stream.getVideoTracks().forEach(track => track.enabled = !isVideoOff);
      
      setLocalStreamReady(true);
      
      // Show local video
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      console.log("✅ Local stream ready - Audio:", stream.getAudioTracks().length, "Video:", stream.getVideoTracks().length);
      return stream;
    } catch (err) {
      console.error("Error getting media:", err);
      toast.error("Cannot access camera/microphone. Please check permissions.");
      return null;
    }
  };

  const createPeer = useCallback((targetUserId, stream, isInitiator = true) => {
    if (!targetUserId || peersRef.current[targetUserId]) return;
    
    console.log(`🔗 Creating peer for ${targetUserId}, initiator: ${isInitiator}`);
    
    const peer = new Peer({
      initiator: isInitiator,
      trickle: true,
      stream: stream,
      config: getIceServers(),
      sdpTransform: (sdp) => {
        // Ensure we're sending and receiving audio
        if (stream.getAudioTracks().length > 0) {
          sdp = sdp.replace(/a=recvonly/g, 'a=sendrecv');
        }
        return sdp;
      }
    });
    
    peer.on("signal", (signal) => {
      console.log(`📡 Sending signal to ${targetUserId}`);
      socketRef.current?.emit("signal", {
        to: targetUserId,
        signal,
        classId
      });
    });
    
    peer.on("stream", (remoteStream) => {
      console.log(`📺 Received stream from ${targetUserId}`);
      console.log(`   Audio tracks: ${remoteStream.getAudioTracks().length}`);
      console.log(`   Video tracks: ${remoteStream.getVideoTracks().length}`);
      
      // Enable all tracks
      remoteStream.getAudioTracks().forEach(t => t.enabled = true);
      remoteStream.getVideoTracks().forEach(t => t.enabled = true);
      
      setRemoteStreams(prev => ({ ...prev, [targetUserId]: remoteStream }));
      
      // Update participants with stream
      setParticipants(prev => prev.map(p => {
        if (getUserId(p) === targetUserId) {
          return { ...p, remoteStream };
        }
        return p;
      }));
      
      // Attach to video element if exists
      const videoEl = videoRefs.current[targetUserId];
      if (videoEl) {
        videoEl.srcObject = remoteStream;
        videoEl.play().catch(console.log);
      }
    });
    
    peer.on("connect", () => {
      console.log(`✅ Peer connected to ${targetUserId}`);
    });
    
    peer.on("close", () => {
      console.log(`❌ Peer closed for ${targetUserId}`);
      delete peersRef.current[targetUserId];
      setRemoteStreams(prev => {
        const newState = { ...prev };
        delete newState[targetUserId];
        return newState;
      });
    });
    
    peer.on("error", (err) => {
      console.error(`Peer error for ${targetUserId}:`, err.message);
    });
    
    peersRef.current[targetUserId] = peer;
    return peer;
  }, [classId]);

  const handleExistingParticipants = useCallback(async (participantsList) => {
    console.log("📋 Existing participants:", participantsList);
    
    if (!participantsList || !Array.isArray(participantsList)) return;
    
    // Wait for local stream
    if (!userStreamRef.current || !localStreamReady) {
      console.log("Waiting for local stream...");
      setTimeout(() => handleExistingParticipants(participantsList), 1000);
      return;
    }
    
    for (const p of participantsList) {
      const pid = p.userId;
      if (pid !== currentUser?._id && !peersRef.current[pid]) {
        console.log(`Creating peer for existing participant: ${p.userName}`);
        
        // Add to UI
        setParticipants(prev => {
          if (prev.some(ex => getUserId(ex) === pid)) return prev;
          return [...prev, {
            userId: { _id: pid, name: p.userName },
            role: p.role || "student",
            active: true,
            remoteStream: null
          }];
        });
        
        // Create peer
        createPeer(pid, userStreamRef.current, true);
      }
    }
  }, [currentUser, localStreamReady, createPeer, getUserId]);

  const handleUserJoined = useCallback((data) => {
    const { userId, userName, role } = data;
    
    if (userId === currentUser?._id) return;
    
    console.log(`👤 User joined: ${userName}`);
    
    setParticipants(prev => {
      if (prev.some(p => getUserId(p) === userId)) return prev;
      return [...prev, {
        userId: { _id: userId, name: userName },
        role: role || "student",
        active: true,
        remoteStream: null
      }];
    });
    
    // Create peer if stream ready
    if (userStreamRef.current && localStreamReady && !peersRef.current[userId]) {
      createPeer(userId, userStreamRef.current, true);
    }
    
    toast.success(`${userName} joined`);
  }, [currentUser, localStreamReady, createPeer, getUserId]);

  const handleUserLeft = useCallback((data) => {
    const { userId, userName } = data;
    
    console.log(`👋 User left: ${userName}`);
    
    if (peersRef.current[userId]) {
      peersRef.current[userId].destroy();
      delete peersRef.current[userId];
    }
    
    setParticipants(prev => prev.filter(p => getUserId(p) !== userId));
    setRemoteStreams(prev => {
      const newState = { ...prev };
      delete newState[userId];
      return newState;
    });
    
    toast.info(`${userName} left`);
  }, [getUserId]);

  const handleSignal = useCallback((data) => {
    const { from, signal } = data;
    
    if (from === currentUser?._id) return;
    
    console.log(`📡 Signal from ${from}`);
    
    if (peersRef.current[from]) {
      peersRef.current[from].signal(signal);
    } else if (userStreamRef.current && localStreamReady) {
      console.log(`Creating receiver peer for signal from ${from}`);
      const peer = createPeer(from, userStreamRef.current, false);
      if (peer) peer.signal(signal);
    }
  }, [currentUser, localStreamReady, createPeer]);

  const handleClassEnded = useCallback(() => {
    setClassEnded(true);
    toast.error("Class has been ended");
    setTimeout(() => {
      cleanup();
      navigate(getDashboardPath());
    }, 2000);
  }, [navigate, getDashboardPath]);

  const handleNewChatMessage = useCallback((data) => {
    setChatMessages(prev => [...prev, {
      userId: data.userId,
      userName: data.userName,
      message: data.message,
      timestamp: data.timestamp
    }]);
  }, []);

  const joinClass = async () => {
    try {
      // First join via API
      await axios.post(`/live-class/${classId}/join`);
      
      // Get local stream
      const stream = await getLocalStream();
      if (!stream) {
        toast.error("Cannot join without camera/microphone");
        return;
      }
      
      // Join via socket
      setIsConnecting(true);
      socketRef.current?.emit("join-call", {
        classId,
        userId: currentUser._id,
        userName: currentUser.name,
        role: currentUser.role,
        audioEnabled: !isMuted,
        videoEnabled: !isVideoOff
      });
      
      // Set joined after a moment
      setTimeout(() => {
        setIsJoined(true);
        setIsConnecting(false);
        startDurationTimer();
        toast.success("Joined class!");
      }, 1000);
      
    } catch (err) {
      console.error("Join error:", err);
      toast.error(err.response?.data?.message || "Failed to join");
      setIsConnecting(false);
    }
  };

  const leaveClass = async () => {
    if (isLeavingRef.current) return;
    isLeavingRef.current = true;
    
    try {
      socketRef.current?.emit("user-leaving", { classId, userId: currentUser._id, userName: currentUser.name });
      
      await axios.post(`/live-class/${classId}/leave`);
      
      if (isLecturer) {
        await axios.post(`/live-class/lecturer/${classId}/end`);
        socketRef.current?.emit("end-class", { classId });
        toast.success("Class ended");
        navigate(getLiveClassesPath());
      } else {
        toast.success("Left class");
        navigate(getDashboardPath());
      }
      
      cleanup();
    } catch (err) {
      console.error("Leave error:", err);
      toast.error("Failed to leave");
      isLeavingRef.current = false;
    }
  };

  const cleanup = () => {
    // Destroy all peers
    Object.values(peersRef.current).forEach(peer => peer.destroy());
    peersRef.current = {};
    
    // Stop local stream
    if (userStreamRef.current) {
      userStreamRef.current.getTracks().forEach(track => track.stop());
      userStreamRef.current = null;
    }
    
    // Clear interval
    if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
    
    // Disconnect socket
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    
    setLocalStreamReady(false);
    setSocketConnected(false);
    setIsJoined(false);
    setRemoteStreams({});
  };

  const startDurationTimer = () => {
    if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
    const startTime = liveClass?.actualStartTime ? new Date(liveClass.actualStartTime) : new Date();
    setDuration(Math.floor((new Date() - startTime) / 1000));
    durationIntervalRef.current = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);
  };

  const toggleMute = () => {
    if (userStreamRef.current) {
      const audioTrack = userStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        const newState = !isMuted;
        audioTrack.enabled = !newState;
        setIsMuted(newState);
        toast.success(newState ? "Muted" : "Unmuted");
        
        socketRef.current?.emit("participant-updated", {
          classId, userId: currentUser._id, updates: { audioEnabled: !newState }
        });
      }
    }
  };

  const toggleVideo = () => {
    if (userStreamRef.current) {
      const videoTrack = userStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        const newState = !isVideoOff;
        videoTrack.enabled = !newState;
        setIsVideoOff(newState);
        toast.success(newState ? "Camera off" : "Camera on");
        
        socketRef.current?.emit("participant-updated", {
          classId, userId: currentUser._id, updates: { videoEnabled: !newState }
        });
      }
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    try {
      await axios.post(`/live-class/${classId}/chat`, { message: newMessage });
      socketRef.current?.emit("chat-message", {
        classId, message: newMessage, userId: currentUser._id, userName: currentUser.name
      });
      setNewMessage("");
    } catch (err) {
      console.error("Send error:", err);
    }
  };

  const formatDuration = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Link copied!");
  };

  const activeParticipantsCount = participants.filter(p => p && p.active).length;
  const isClassActive = liveClass?.status === "ongoing" && !classEnded;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <Loader2 className="animate-spin h-12 w-12 text-indigo-500" />
      </div>
    );
  }

  if (!liveClass) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Class Not Found</h2>
          <button onClick={() => navigate(getDashboardPath())} className="px-4 py-2 bg-indigo-500 text-white rounded-lg">
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 px-4 md:px-6 py-2 md:py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">{liveClass.title}</h1>
            <p className="text-xs md:text-sm text-gray-500">{liveClass.lecturerId?.name || "Lecturer"}</p>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <button onClick={toggleDarkMode} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800">
              <div className={`w-2 h-2 rounded-full ${isClassActive && isJoined ? "bg-green-500 animate-pulse" : "bg-gray-500"}`} />
              <span className="text-xs md:text-sm">{isJoined ? "Connected" : "Live"}</span>
            </div>
            
            {isJoined && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-500/20">
                <Clock className="h-3 w-3 text-indigo-600" />
                <span className="text-xs md:text-sm text-indigo-600 font-mono">{formatDuration(duration)}</span>
              </div>
            )}
            
            <button onClick={() => setShowInviteModal(true)} className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm">
              <Users className="h-4 w-4" /> Invite
            </button>
            <button onClick={() => setShowSidebar(!showSidebar)} className="sm:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row h-[calc(100vh-57px)] md:h-[calc(100vh-65px)]">
        {/* Video Area */}
        <div className="flex-1 p-2 md:p-4">
          <div className="bg-gray-900 rounded-xl overflow-hidden h-full relative">
            {isJoined && isClassActive && socketConnected ? (
              <>
                <VideoGrid
                  currentUser={currentUser}
                  participants={participants}
                  remoteStreams={remoteStreams}
                  localStream={userStreamRef.current}
                  localStreamReady={localStreamReady}
                  videoRefs={videoRefs}
                  isVideoOff={isVideoOff}
                  layout={layout}
                  pinnedVideo={pinnedVideo}
                  setPinnedVideo={setPinnedVideo}
                />
                <video ref={localVideoRef} autoPlay playsInline muted className="hidden" />
                
                {/* Controls */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 md:gap-3 bg-black/80 backdrop-blur-sm rounded-full px-3 md:px-5 py-1.5 md:py-2 z-10">
                  <button onClick={toggleMute} className={`p-2 md:p-2.5 rounded-full transition-colors ${isMuted ? 'bg-red-500' : 'bg-gray-700'}`}>
                    {isMuted ? <MicOff className="h-3 w-3 md:h-4 md:w-4 text-white" /> : <Mic className="h-3 w-3 md:h-4 md:w-4 text-white" />}
                  </button>
                  <button onClick={toggleVideo} className={`p-2 md:p-2.5 rounded-full transition-colors ${isVideoOff ? 'bg-red-500' : 'bg-gray-700'}`}>
                    {isVideoOff ? <VideoOff className="h-3 w-3 md:h-4 md:w-4 text-white" /> : <Video className="h-3 w-3 md:h-4 md:w-4 text-white" />}
                  </button>
                  <button onClick={() => setLayout(layout === "grid" ? "speaker" : "grid")} className="p-2 md:p-2.5 rounded-full bg-gray-700">
                    {layout === "grid" ? <List className="h-3 w-3 md:h-4 md:w-4 text-white" /> : <Grid className="h-3 w-3 md:h-4 md:w-4 text-white" />}
                  </button>
                  <button onClick={leaveClass} className="p-2 md:p-2.5 rounded-full bg-red-500">
                    <PhoneOff className="h-3 w-3 md:h-4 md:w-4 text-white" />
                  </button>
                </div>
              </>
            ) : isClassActive ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <Video className="h-8 w-8 md:h-10 md:w-10 text-white" />
                  </div>
                  <h2 className="text-lg md:text-xl font-bold text-white mb-2">Ready to join?</h2>
                  <button 
                    onClick={joinClass} 
                    disabled={isConnecting || !socketConnected}
                    className="px-4 md:px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-semibold"
                  >
                    {isConnecting ? <Loader2 className="h-4 w-4 animate-spin inline mr-2" /> : null}
                    {isConnecting ? "Connecting..." : "Join Class"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
                    <Calendar className="h-8 w-8 md:h-10 md:w-10 text-gray-500" />
                  </div>
                  <h2 className="text-lg md:text-xl font-bold text-white mb-2">Class Not Started</h2>
                  <p className="text-gray-400 text-sm">Starts at {new Date(liveClass.scheduledStartTime).toLocaleTimeString()}</p>
                  <button onClick={() => navigate(getLiveClassesPath())} className="mt-4 px-4 py-2 bg-gray-700 rounded-lg text-white">
                    Back
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className={`fixed inset-y-0 right-0 w-80 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 flex flex-col z-50 transform transition-transform duration-300 sm:relative sm:transform-none ${
          showSidebar ? 'translate-x-0' : 'translate-x-full sm:translate-x-0'
        }`}>
          <div className="flex items-center justify-between p-3 border-b sm:hidden">
            <h3 className="font-semibold">Chat</h3>
            <button onClick={() => setShowSidebar(false)} className="p-1 rounded-lg bg-gray-100">
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="flex border-b">
            <button onClick={() => { setShowChat(true); setShowParticipants(false); }} className={`flex-1 py-2 text-sm ${showChat ? "text-indigo-600 border-b-2 border-indigo-600" : "text-gray-500"}`}>
              <MessageSquare className="h-3.5 w-3.5 inline mr-1" /> Chat
            </button>
            <button onClick={() => { setShowChat(false); setShowParticipants(true); }} className={`flex-1 py-2 text-sm ${showParticipants ? "text-indigo-600 border-b-2 border-indigo-600" : "text-gray-500"}`}>
              <Users className="h-3.5 w-3.5 inline mr-1" /> Participants ({activeParticipantsCount})
            </button>
          </div>

          {showChat && (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">{msg.userName?.charAt(0) || "U"}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold">{msg.userName}</span>
                        <span className="text-[10px] text-gray-500">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">{msg.message}</p>
                    </div>
                  </div>
                ))}
              </div>
              {isJoined && (
                <form onSubmit={sendMessage} className="p-3 border-t">
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={newMessage} 
                      onChange={(e) => setNewMessage(e.target.value)} 
                      placeholder="Type a message..." 
                      className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-800 text-sm rounded-lg border focus:outline-none focus:border-indigo-500"
                    />
                    <button type="submit" className="p-2 bg-indigo-500 text-white rounded-lg">
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {showParticipants && (
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {participants.filter(p => p.active).map((p, idx) => {
                const pid = getUserId(p);
                const pName = getUserName(p);
                const hasVideo = remoteStreams[pid] && remoteStreams[pid].getVideoTracks().length > 0;
                
                return (
                  <div key={pid || idx} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">{pName?.charAt(0) || "U"}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium truncate">{pName}</p>
                      <p className="text-xs text-gray-500">{p.role === "lecturer" ? "Host" : p.role === "admin" ? "Admin" : "Student"}</p>
                    </div>
                    {hasVideo && <div className="w-2 h-2 rounded-full bg-green-500" title="Video on" />}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {showSidebar && <div className="fixed inset-0 bg-black/50 z-40 sm:hidden" onClick={() => setShowSidebar(false)} />}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 max-w-md w-full">
            <h3 className="text-lg font-bold mb-3">Invite Participants</h3>
            <p className="text-sm text-gray-600 mb-2">Share this link:</p>
            <div className="flex gap-2 mb-4">
              <input type="text" value={inviteLink} readOnly className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-sm rounded-lg truncate" />
              <button onClick={copyInviteLink} className="px-3 py-2 bg-indigo-500 text-white rounded-lg flex items-center gap-1 text-sm">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <button onClick={() => setShowInviteModal(false)} className="w-full py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Video Grid Component
const VideoGrid = memo(({ 
  currentUser, participants, remoteStreams, localStream, localStreamReady,
  videoRefs, isVideoOff, layout, pinnedVideo, setPinnedVideo 
}) => {
  
  const videos = [];
  
  // Local video
  videos.push({
    id: currentUser?._id,
    name: `${currentUser?.name} (You)`,
    stream: localStream,
    isLocal: true,
    isVideoOff: isVideoOff,
    role: currentUser?.role
  });
  
  // Remote videos
  participants.forEach(p => {
    const pid = p.userId?._id || p.userId;
    if (pid !== currentUser?._id && p.active) {
      const stream = remoteStreams[pid];
      videos.push({
        id: pid,
        name: p.userId?.name || "Participant",
        stream: stream,
        isLocal: false,
        isVideoOff: !stream || stream.getVideoTracks().length === 0,
        role: p.role
      });
    }
  });
  
  if (layout === "speaker" && videos.length > 1) {
    const mainVideo = pinnedVideo ? videos.find(v => v.id === pinnedVideo) : videos.find(v => v.role === "lecturer") || videos[0];
    const sidebarVideos = videos.filter(v => v.id !== mainVideo?.id);
    
    return (
      <div className="flex flex-col md:flex-row h-full gap-4">
        <div className="flex-1">
          {mainVideo && <VideoTile video={mainVideo} videoRefs={videoRefs} isMain />}
        </div>
        <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto md:w-48 p-2">
          {sidebarVideos.map(v => <VideoTile key={v.id} video={v} videoRefs={videoRefs} isSidebar />)}
        </div>
      </div>
    );
  }
  
  const count = videos.length;
  const getGridCols = () => {
    if (count === 1) return "grid-cols-1";
    if (count === 2) return "grid-cols-2";
    if (count <= 4) return "grid-cols-2";
    return "grid-cols-2 md:grid-cols-3";
  };
  
  return (
    <div className={`grid ${getGridCols()} gap-4 h-full auto-rows-fr overflow-y-auto p-2`}>
      {videos.map(v => (
        <VideoTile 
          key={v.id} 
          video={v} 
          videoRefs={videoRefs} 
          isPinned={pinnedVideo === v.id}
          onPin={() => setPinnedVideo?.(pinnedVideo === v.id ? null : v.id)}
        />
      ))}
    </div>
  );
});

// Video Tile Component
const VideoTile = memo(({ video, videoRefs, isMain, isSidebar, isPinned, onPin }) => {
  const videoRef = useRef(null);
  
  useEffect(() => {
    if (video?.id && videoRef.current) {
      videoRefs.current[video.id] = videoRef.current;
    }
    return () => {
      if (video?.id) delete videoRefs.current[video.id];
    };
  }, [video?.id, videoRefs]);
  
  useEffect(() => {
    const el = videoRef.current;
    if (!el || !video?.stream) return;
    
    if (el.srcObject !== video.stream) {
      el.srcObject = video.stream;
      el.play().catch(console.log);
    }
  }, [video?.stream, video?.id]);
  
  const showVideo = video?.stream && !video?.isVideoOff;
  
  return (
    <div className={`relative bg-gray-800 rounded-xl overflow-hidden group ${isMain ? "h-full" : isSidebar ? "h-32" : "aspect-video"}`}>
      <video ref={videoRef} autoPlay playsInline muted={video?.isLocal} className="w-full h-full object-cover" />
      
      {!showVideo && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-indigo-500/30 flex items-center justify-center">
              <span className="text-2xl font-bold text-indigo-400">{video?.name?.charAt(0) || "U"}</span>
            </div>
            <p className="text-white text-sm mt-2">{video?.name}</p>
          </div>
        </div>
      )}
      
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center justify-between">
          <span className="text-white text-sm truncate">{video?.name}</span>
        </div>
      </div>
      
      {!video?.isLocal && onPin && (
        <button onClick={onPin} className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
          <Pin className={`h-3 w-3 ${isPinned ? "text-indigo-400 fill-indigo-400" : "text-white"}`} />
        </button>
      )}
    </div>
  );
});

export default LiveClassRoom;