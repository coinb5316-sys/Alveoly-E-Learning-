// components/LiveClassRoom.jsx - COMPLETELY FIXED WebRTC with working audio/video
import { useState, useEffect, useRef, useCallback, memo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "../api/axios";
import { io } from "socket.io-client";
import Peer from "simple-peer";
import { 
  Video, Mic, MicOff, VideoOff, PhoneOff, MessageSquare, Users, Send,
  Clock, Calendar, Grid, List, Maximize2, Minimize2, Pin, Settings,
  Copy, Check, LogOut, WifiOff, Loader2, Menu, X, Sun, Moon
} from "lucide-react";
import toast from "react-hot-toast";

const LiveClassRoom = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, loading: authLoading } = useAuth();
  
  // State Management
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
  const [fullscreenVideo, setFullscreenVideo] = useState(null);
  const [pinnedVideo, setPinnedVideo] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState("");
  const [selectedMicrophone, setSelectedMicrophone] = useState("");
  const [availableCameras, setAvailableCameras] = useState([]);
  const [availableMicrophones, setAvailableMicrophones] = useState([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [speakingUsers, setSpeakingUsers] = useState({});
  const [inviteLink, setInviteLink] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showLeftNotification, setShowLeftNotification] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [localStreamReady, setLocalStreamReady] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileControls, setShowMobileControls] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [classEnded, setClassEnded] = useState(false);
  const [remoteStreamsReady, setRemoteStreamsReady] = useState({});
  
  // WebRTC Refs
  const socketRef = useRef(null);
  const peersRef = useRef({});
  const userMediaStreamRef = useRef(null);
  const localVideoRef = useRef(null);
  const durationIntervalRef = useRef(null);
  const videoRefs = useRef({});
  const isLeavingRef = useRef(false);
  const pendingCandidatesRef = useRef({});
  
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
  
  // Dark mode handling
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = savedTheme === "dark" || (!savedTheme && systemPrefersDark);
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
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  useEffect(() => {
    if (!authLoading && !currentUser) {
      toast.error("Please login to access this page");
      navigate("/login");
    }
  }, [currentUser, authLoading, navigate]);

  useEffect(() => {
    if (!currentUser || authLoading) return;
    
    initializeSocket();
    fetchLiveClassDetails();
    getMediaDevices();
    
    return () => {
      if (!isLeavingRef.current) {
        cleanup();
      }
    };
  }, [classId, currentUser, authLoading]);

  const getMediaDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(device => device.kind === 'videoinput');
      const microphones = devices.filter(device => device.kind === 'audioinput');
      setAvailableCameras(cameras);
      setAvailableMicrophones(microphones);
      if (cameras.length > 0) setSelectedCamera(cameras[0].deviceId);
      if (microphones.length > 0) setSelectedMicrophone(microphones[0].deviceId);
    } catch (err) {
      console.error("Error getting media devices:", err);
    }
  };

  const initializeSocket = () => {
    const API_URL = import.meta.env.VITE_APP_API_BASE_URL || "https://alveoly-e-learning-755w.onrender.com";
    
    socketRef.current = io(API_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      forceNew: true
    });

    socketRef.current.on("connect", () => {
      console.log("✅ Socket connected:", socketRef.current.id);
      setSocketConnected(true);
    });

    socketRef.current.on("disconnect", () => {
      console.log("❌ Socket disconnected");
      setSocketConnected(false);
    });

    socketRef.current.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
      setSocketConnected(false);
    });

    socketRef.current.on("existing-participants", handleExistingParticipants);
    socketRef.current.on("join-confirmed", handleJoinConfirmed);
    socketRef.current.on("user-joined", handleUserJoined);
    socketRef.current.on("user-left", handleUserLeft);
    socketRef.current.on("signal", handleSignal);
    socketRef.current.on("user-speaking", handleUserSpeaking);
    socketRef.current.on("participant-updated", handleParticipantUpdated);
    socketRef.current.on("class-ended", handleClassEnded);
    socketRef.current.on("new-chat-message", handleNewChatMessage);
  };

  const handleExistingParticipants = useCallback((participantsList) => {
    console.log("📋 Existing participants:", participantsList);
    
    if (!participantsList || participantsList.length === 0) return;
    
    // Update participants list
    const newParticipants = participantsList
      .filter(participant => participant.userId !== currentUser?._id)
      .map(participant => ({
        userId: { _id: participant.userId, name: participant.userName },
        role: participant.role,
        joinedAt: new Date(),
        active: true,
        audioEnabled: participant.audioEnabled !== false,
        videoEnabled: participant.videoEnabled !== false,
        remoteStream: null
      }));
    
    setParticipants(prev => {
      const existingIds = new Set(prev.map(p => p.userId?._id));
      const uniqueNew = newParticipants.filter(p => !existingIds.has(p.userId._id));
      return [...prev, ...uniqueNew];
    });
    
    // Create peers for existing participants after a short delay to ensure stream is ready
    const createPeersWithRetry = (retryCount = 0) => {
      if (userMediaStreamRef.current && localStreamReady) {
        participantsList.forEach(participant => {
          if (participant.userId !== currentUser?._id && !peersRef.current[participant.userId]) {
            console.log(`🔄 Creating peer for existing participant: ${participant.userName}`);
            createPeer(participant.userId, userMediaStreamRef.current, true);
          }
        });
      } else if (retryCount < 10) {
        console.log(`⏳ Waiting for local stream, retry ${retryCount + 1}/10`);
        setTimeout(() => createPeersWithRetry(retryCount + 1), 500);
      }
    };
    
    createPeersWithRetry();
  }, [currentUser, localStreamReady, createPeer]);

  const handleJoinConfirmed = useCallback(() => {
    console.log("✅ Join confirmed");
    setIsConnecting(false);
    setIsJoined(true);
    startDurationTimer();
    toast.success("Successfully joined the class!");
  }, []);

  const handleNewChatMessage = useCallback((data) => {
    setChatMessages(prev => [...prev, {
      userId: data.userId,
      userName: data.userName,
      message: data.message,
      timestamp: data.timestamp
    }]);
  }, []);

  const fetchLiveClassDetails = async () => {
    try {
      const res = await axios.get(`/live-class/${classId}`);
      
      if (res.data.status === "completed") {
        toast.error("This class has already ended");
        navigate(getDashboardPath());
        return;
      }
      
      setLiveClass(res.data);
      
      const allParticipants = (res.data.participants || []).map(p => ({
        ...p,
        active: !p.leftAt,
        remoteStream: null
      }));
      setParticipants(allParticipants);
      setChatMessages(res.data.chatMessages || []);
      
      const isUserLecturer = currentUser?.role === "lecturer" || res.data.lecturerId?._id === currentUser?._id;
      setIsLecturer(isUserLecturer);
      
      const inviteUrl = `${window.location.origin}/join/${classId}`;
      setInviteLink(inviteUrl);
      
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

  // Initialize local media stream
  const initializeLocalStream = useCallback(async () => {
    if (userMediaStreamRef.current && localStreamReady) {
      return userMediaStreamRef.current;
    }
    
    try {
      const constraints = {
        video: !isVideoOff,
        audio: !isMuted
      };
      
      if (selectedCamera && !isVideoOff) {
        constraints.video = { deviceId: { exact: selectedCamera } };
      }
      
      if (selectedMicrophone && !isMuted) {
        constraints.audio = { deviceId: { exact: selectedMicrophone } };
      }
      
      console.log("🎥 Requesting media with constraints:", constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (userMediaStreamRef.current !== stream) {
        if (userMediaStreamRef.current) {
          userMediaStreamRef.current.getTracks().forEach(track => track.stop());
        }
        userMediaStreamRef.current = stream;
      }
      
      // Ensure audio tracks are enabled
      stream.getAudioTracks().forEach(track => {
        track.enabled = !isMuted;
        console.log(`Audio track enabled: ${track.enabled}`);
      });
      
      // Ensure video tracks are enabled
      stream.getVideoTracks().forEach(track => {
        track.enabled = !isVideoOff;
        console.log(`Video track enabled: ${track.enabled}`);
      });
      
      setLocalStreamReady(true);
      
      // Display local video
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.play().catch(e => console.log("Play error:", e));
      }
      
      console.log("✅ Local stream ready, audio tracks:", stream.getAudioTracks().length, "video tracks:", stream.getVideoTracks().length);
      return stream;
    } catch (err) {
      console.error("Error accessing media devices:", err);
      toast.error("Unable to access camera or microphone. Please check permissions.");
      return null;
    }
  }, [isVideoOff, isMuted, selectedCamera, selectedMicrophone, localStreamReady]);

  const joinCall = async () => {
    if (!socketRef.current || !socketConnected) {
      toast.error("Not connected to server");
      return;
    }
    
    if (!userMediaStreamRef.current || !localStreamReady) {
      const stream = await initializeLocalStream();
      if (!stream) {
        toast.error("Cannot join without camera/microphone");
        setIsConnecting(false);
        return;
      }
    }
    
    setIsConnecting(true);
    console.log("🎥 Joining call with stream ready");
    
    socketRef.current.emit("join-call", {
      classId,
      userId: currentUser._id,
      userName: currentUser.name,
      role: currentUser.role,
      audioEnabled: !isMuted,
      videoEnabled: !isVideoOff
    });
  };

  // FIXED: Proper peer creation with valid ICE servers and audio handling
  const createPeer = useCallback((userId, stream, isInitiator = true) => {
    if (!userId) return null;
    
    // Don't create duplicate peers
    if (peersRef.current[userId]) {
      console.log(`⚠️ Peer for ${userId} already exists`);
      return peersRef.current[userId];
    }
    
    console.log(`🔗 Creating ${isInitiator ? 'initiator' : 'receiver'} peer for ${userId}`);
    
    // Use only reliable STUN servers, remove invalid TURN
    const peer = new Peer({
      initiator: isInitiator,
      trickle: true,
      stream: stream,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
          { urls: 'stun:stun3.l.google.com:19302' },
          { urls: 'stun:stun4.l.google.com:19302' },
          { urls: 'stun:stun.stunprotocol.org:3478' }
        ],
        iceCandidatePoolSize: 5
      }
    });
    
    peer.on("signal", signal => {
      if (socketRef.current && socketConnected) {
        console.log(`📡 Sending signal to ${userId}`);
        socketRef.current.emit("signal", { to: userId, signal, classId });
      }
    });
    
    peer.on("stream", remoteStream => {
      console.log(`📺 Received remote stream from ${userId}, tracks: audio=${remoteStream.getAudioTracks().length}, video=${remoteStream.getVideoTracks().length}`);
      
      // Ensure audio plays
      remoteStream.getAudioTracks().forEach(track => {
        track.enabled = true;
        console.log(`Remote audio track enabled for ${userId}`);
      });
      
      // Update participants with remote stream
      setParticipants(prev => prev.map(p => 
        p.userId?._id === userId ? { ...p, remoteStream } : p
      ));
      
      // Update video element if it exists
      const videoElement = videoRefs.current[userId];
      if (videoElement && remoteStream) {
        videoElement.srcObject = remoteStream;
        videoElement.play().catch(e => console.log("Play error:", e));
      }
      
      // Force re-render to show video
      setRemoteStreamsReady(prev => ({ ...prev, [userId]: true }));
    });
    
    peer.on("connect", () => {
      console.log(`✅ Peer connected to ${userId}`);
    });
    
    peer.on("close", () => {
      console.log(`❌ Peer closed for ${userId}`);
      delete peersRef.current[userId];
      delete videoRefs.current[userId];
    });
    
    peer.on("error", (err) => {
      console.error(`Peer error for ${userId}:`, err);
    });
    
    // Monitor ICE connection state
    peer.on("iceConnectionStateChange", () => {
      console.log(`ICE connection state for ${userId}: ${peer.iceConnectionState}`);
      if (peer.iceConnectionState === 'failed') {
        console.error(`ICE connection failed for ${userId}, attempting restart`);
        peer.restartIce();
      }
    });
    
    peersRef.current[userId] = peer;
    return peer;
  }, [classId, socketConnected]);

  const handleUserJoined = useCallback((data) => {
    const { userId, userName, role, audioEnabled, videoEnabled } = data;
    
    console.log(`👤 User joined: ${userName} (${userId})`);
    
    // Add to participants list
    setParticipants(prev => {
      const exists = prev.find(p => p.userId?._id === userId);
      if (exists) return prev;
      return [...prev, {
        userId: { _id: userId, name: userName },
        role: role,
        joinedAt: new Date(),
        active: true,
        audioEnabled: audioEnabled !== false,
        videoEnabled: videoEnabled !== false,
        remoteStream: null
      }];
    });
    
    // Create peer connection with retry
    const createPeerWithRetry = (retryCount = 0) => {
      if (userMediaStreamRef.current && localStreamReady && !peersRef.current[userId]) {
        createPeer(userId, userMediaStreamRef.current, true);
      } else if (retryCount < 10) {
        setTimeout(() => createPeerWithRetry(retryCount + 1), 500);
      }
    };
    
    createPeerWithRetry();
    
    toast.success(`${userName} joined the class`);
  }, [createPeer, localStreamReady]);

  const handleUserLeft = useCallback((data) => {
    const { userId, userName } = data;
    
    console.log(`👋 User left: ${userName} (${userId})`);
    
    if (peersRef.current[userId]) {
      peersRef.current[userId].destroy();
      delete peersRef.current[userId];
    }
    
    setParticipants(prev => prev.filter(p => p.userId?._id !== userId));
    setRemoteStreamsReady(prev => {
      const newState = { ...prev };
      delete newState[userId];
      return newState;
    });
    
    setShowLeftNotification({ userId, userName });
    setTimeout(() => setShowLeftNotification(null), 3000);
    
    toast.info(`${userName} left the class`);
  }, []);

  const handleSignal = useCallback((data) => {
    const { from, signal } = data;
    
    if (peersRef.current[from]) {
      console.log(`📡 Received signal from ${from}`);
      peersRef.current[from].signal(signal);
    } else if (userMediaStreamRef.current && from !== currentUser?._id) {
      console.log(`🔄 Creating peer for signal from ${from}`);
      const peer = createPeer(from, userMediaStreamRef.current, false);
      if (peer) peer.signal(signal);
    }
  }, [currentUser, createPeer]);

  const handleClassEnded = useCallback(() => {
    if (classEnded) return;
    setClassEnded(true);
    
    toast.error("Class has been ended by the lecturer", { duration: 5000, icon: "🔴" });
    
    setTimeout(() => {
      if (!isLeavingRef.current) {
        isLeavingRef.current = true;
        cleanup();
        navigate(getDashboardPath());
      }
    }, 2000);
  }, [navigate, classEnded, getDashboardPath]);

  const handleUserSpeaking = useCallback((data) => {
    setSpeakingUsers(prev => ({ ...prev, [data.userId]: data.isSpeaking }));
  }, []);

  const handleParticipantUpdated = useCallback((data) => {
    setParticipants(prev => prev.map(p => 
      p.userId?._id === data.userId ? { ...p, ...data.updates } : p
    ));
  }, []);

  const toggleMute = useCallback(() => {
    if (userMediaStreamRef.current) {
      const audioTrack = userMediaStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        const newMuteState = !isMuted;
        audioTrack.enabled = !newMuteState;
        setIsMuted(newMuteState);
        
        // Notify others about mute state
        socketRef.current?.emit("participant-updated", {
          classId, userId: currentUser._id, updates: { audioEnabled: !newMuteState }
        });
        
        toast.success(newMuteState ? "Microphone muted" : "Microphone unmuted");
      }
    }
  }, [isMuted, classId, currentUser]);

  const toggleVideo = useCallback(async () => {
    const newVideoState = !isVideoOff;
    
    if (userMediaStreamRef.current) {
      const videoTrack = userMediaStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !newVideoState;
        setIsVideoOff(newVideoState);
        
        socketRef.current?.emit("participant-updated", {
          classId, userId: currentUser._id, updates: { videoEnabled: !newVideoState }
        });
        
        toast.success(newVideoState ? "Camera off" : "Camera on");
      }
    } else if (!newVideoState) {
      await initializeLocalStream();
      setIsVideoOff(false);
    }
  }, [isVideoOff, classId, currentUser, initializeLocalStream]);

  const joinClass = async () => {
    try {
      // First join the database
      await axios.post(`/live-class/${classId}/join`);
      
      // Initialize stream first
      const stream = await initializeLocalStream();
      if (!stream) {
        toast.error("Could not access camera/microphone");
        setIsConnecting(false);
        return;
      }
      
      // Then join the call
      await joinCall();
    } catch (err) {
      console.error("Join error:", err);
      toast.error(err.response?.data?.message || "Failed to join class");
      setIsConnecting(false);
    }
  };

  const leaveClass = async () => {
    if (isLeavingRef.current) return;
    isLeavingRef.current = true;
    
    try {
      socketRef.current?.emit("user-leaving", { 
        classId, userId: currentUser._id, userName: currentUser.name, isLecturer
      });
      
      await axios.post(`/live-class/${classId}/leave`);
      
      if (isLecturer) {
        await axios.post(`/live-class/lecturer/${classId}/end`);
        socketRef.current?.emit("end-class", { classId });
        toast.success("Class ended successfully");
        navigate(getLiveClassesPath());
      } else {
        toast.success("Left the class");
        navigate(getDashboardPath());
      }
      
      cleanup();
    } catch (err) {
      console.error("Leave error:", err);
      toast.error("Failed to leave class");
      isLeavingRef.current = false;
    }
  };

  const cleanup = useCallback(() => {
    // Destroy all peer connections
    Object.values(peersRef.current).forEach(peer => {
      if (peer) peer.destroy();
    });
    peersRef.current = {};
    
    // Stop all media tracks
    if (userMediaStreamRef.current) {
      userMediaStreamRef.current.getTracks().forEach(track => track.stop());
      userMediaStreamRef.current = null;
    }
    
    // Clear intervals
    if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
    
    // Disconnect socket
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    
    // Reset state
    setLocalStreamReady(false);
    setSocketConnected(false);
    setIsJoined(false);
    setRemoteStreamsReady({});
  }, []);

  const startDurationTimer = () => {
    if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
    
    const startTime = liveClass?.actualStartTime ? new Date(liveClass.actualStartTime) : new Date();
    setDuration(Math.floor((new Date() - startTime) / 1000));
    
    durationIntervalRef.current = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);
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
      console.error("Send message error:", err);
      toast.error("Failed to send message");
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
    toast.success("Invite link copied!");
  };

  // VideoTile Component
  const VideoTile = memo(({ video, isPinned = false, isSidebar = false }) => {
    const videoElementRef = useRef(null);
    
    // Store video element reference
    useEffect(() => {
      if (video.id && videoElementRef.current) {
        videoRefs.current[video.id] = videoElementRef.current;
      }
      
      return () => {
        if (video.id) {
          delete videoRefs.current[video.id];
        }
      };
    }, [video.id]);
    
    // Handle stream attachment
    useEffect(() => {
      const videoElement = videoElementRef.current;
      if (!videoElement) return;
      
      let streamToUse = null;
      if (video.isLocal) {
        streamToUse = userMediaStreamRef.current;
      } else {
        streamToUse = video.remoteStream;
      }
      
      if (streamToUse && videoElement.srcObject !== streamToUse) {
        console.log(`🎥 Attaching stream for ${video.name}, local: ${video.isLocal}`);
        videoElement.srcObject = streamToUse;
        videoElement.play().catch(e => console.log("Play error:", e));
        
        // Force re-render when metadata loads
        videoElement.onloadedmetadata = () => {
          console.log(`Video metadata loaded for ${video.name}`);
          videoElement.play().catch(e => console.log("Play after metadata error:", e));
        };
      }
    }, [video.id, video.isLocal, video.remoteStream, userMediaStreamRef.current, remoteStreamsReady[video.id]]);
    
    const hasValidStream = video.isLocal ? localStreamReady : !!video.remoteStream;
    const shouldShowVideo = hasValidStream && !video.isVideoOff;
    
    return (
      <div 
        className={`relative bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden group ${
          isPinned ? "h-full" : isSidebar ? "h-24 md:h-32" : "aspect-video"
        } ${video.isSpeaking ? "ring-2 ring-green-500" : ""}`}
      >
        <video
          ref={videoElementRef}
          autoPlay
          playsInline
          muted={video.isLocal}
          className="w-full h-full object-cover"
        />
        
        {!shouldShowVideo && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-100 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
            <div className="text-center px-2">
              <div className="w-12 h-12 md:w-16 md:h-16 mx-auto rounded-full bg-indigo-500/20 dark:bg-indigo-500/30 flex items-center justify-center mb-1 md:mb-2">
                <span className="text-xl md:text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {video.name?.charAt(0) || "U"}
                </span>
              </div>
              <p className="text-gray-800 dark:text-white text-xs md:text-sm font-medium truncate max-w-[100px] md:max-w-[150px]">
                {video.name}{video.isLocal && " (You)"}
              </p>
              {video.isVideoOff && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Camera off</p>}
              {!hasValidStream && !video.isLocal && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Waiting for video...</p>}
            </div>
          </div>
        )}
        
        {/* Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 md:p-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 md:gap-2">
              <span className="text-white text-xs md:text-sm font-medium truncate max-w-[80px] md:max-w-[150px]">
                {video.name}{video.isLocal && " (You)"}
              </span>
              {video.role === "lecturer" && (
                <span className="px-1 md:px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] md:text-xs">Host</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {video.isMuted && <MicOff className="h-3 w-3 md:h-4 md:w-4 text-red-400" />}
              {video.isVideoOff && <VideoOff className="h-3 w-3 md:h-4 md:w-4 text-red-400" />}
            </div>
          </div>
        </div>
        
        {!video.isLocal && !isSidebar && (
          <button 
            onClick={() => setPinnedVideo(pinnedVideo === video.id ? null : video.id)} 
            className="absolute top-2 right-2 p-1 md:p-1.5 rounded-lg bg-black/50 hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Pin className={`h-2 w-2 md:h-3 md:w-3 ${pinnedVideo === video.id ? "text-indigo-400 fill-indigo-400" : "text-white"}`} />
          </button>
        )}
      </div>
    );
  });

  // Video Grid Component
  const VideoGrid = memo(() => {
    const getVideoParticipants = useCallback(() => {
      const allVideos = [];
      
      // Add local user
      allVideos.push({
        id: currentUser?._id,
        name: currentUser?.name,
        remoteStream: userMediaStreamRef.current,
        isLocal: true,
        role: currentUser?.role,
        isMuted: isMuted,
        isVideoOff: isVideoOff,
        isSpeaking: speakingUsers[currentUser?._id]
      });
      
      // Add remote participants
      participants
        .filter(p => p.userId?._id !== currentUser?._id && p.active && !p.leftAt)
        .forEach(p => {
          allVideos.push({
            id: p.userId._id,
            name: p.userId.name,
            remoteStream: p.remoteStream,
            isLocal: false,
            role: p.role,
            isMuted: !p.audioEnabled,
            isVideoOff: !p.videoEnabled,
            isSpeaking: speakingUsers[p.userId._id]
          });
        });
      
      if (pinnedVideo) {
        const pinned = allVideos.find(v => v.id === pinnedVideo);
        const others = allVideos.filter(v => v.id !== pinnedVideo);
        return { pinned, others };
      }
      return { pinned: null, others: allVideos };
    }, [currentUser, participants, isMuted, isVideoOff, speakingUsers, pinnedVideo]);
    
    const { pinned, others } = getVideoParticipants();
    
    if (layout === "speaker" && others.length > 0) {
      const mainSpeaker = pinned || others.find(v => v.role === "lecturer") || others[0];
      const sidebarVideos = others.filter(v => v.id !== mainSpeaker?.id);
      
      return (
        <div className="flex flex-col md:flex-row h-full gap-2 md:gap-4">
          <div className="flex-1 min-h-0">{mainSpeaker && <VideoTile video={mainSpeaker} isPinned />}</div>
          {sidebarVideos.length > 0 && (
            <div className="flex md:flex-col gap-2 md:gap-3 overflow-x-auto md:overflow-y-auto md:w-32 lg:w-48 p-2">
              {sidebarVideos.map(video => <VideoTile key={video.id} video={video} isSidebar />)}
            </div>
          )}
        </div>
      );
    }
    
    const count = others.length;
    const getGridCols = () => {
      if (count <= 1) return "grid-cols-1";
      if (count === 2) return "grid-cols-2";
      if (count <= 4) return "grid-cols-2";
      if (count <= 6) return "grid-cols-2 md:grid-cols-3";
      return "grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
    };
    
    return (
      <div className={`grid ${getGridCols()} gap-2 md:gap-4 h-full auto-rows-fr overflow-y-auto p-1 md:p-2`}>
        {others.map(video => <VideoTile key={video.id} video={video} />)}
      </div>
    );
  });

  // Loading states
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <Loader2 className="animate-spin h-12 w-12 md:h-16 md:w-16 text-indigo-500" />
      </div>
    );
  }

  if (!liveClass) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 px-4">
        <div className="text-center">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">Class Not Found</h2>
          <button onClick={() => navigate(getDashboardPath())} className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm md:text-base">
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isClassActive = liveClass.status === "ongoing" && !classEnded;
  const activeParticipantsCount = participants.filter(p => p.active && !p.leftAt).length;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      {/* Connection status */}
      {!socketConnected && (
        <div className="fixed top-16 md:top-20 right-2 md:right-4 z-50 bg-red-500/90 backdrop-blur-sm rounded-lg px-2 md:px-3 py-1 md:py-1.5 flex items-center gap-1 md:gap-2">
          <WifiOff className="h-2 w-2 md:h-3 md:w-3 text-white" />
          <span className="text-white text-[10px] md:text-xs">Reconnecting...</span>
        </div>
      )}
      
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 px-3 md:px-6 py-2 md:py-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex-1 min-w-0">
            <h1 className="text-sm md:text-lg font-semibold text-gray-900 dark:text-white truncate">{liveClass.title}</h1>
            <div className="flex items-center gap-2 md:gap-3 text-[10px] md:text-sm text-gray-500 dark:text-gray-400 mt-0.5 md:mt-1">
              <span className="hidden sm:inline">{new Date(liveClass.scheduledStartTime).toLocaleDateString()}</span>
              <span className="truncate">{liveClass.lecturerId?.name || "Lecturer"}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={toggleDarkMode}
              className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {darkMode ? <Sun className="h-3 w-3 md:h-4 md:w-4 text-yellow-500" /> : <Moon className="h-3 w-3 md:h-4 md:w-4 text-gray-600" />}
            </button>
            
            <div className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-0.5 md:py-1 rounded-full bg-gray-100 dark:bg-gray-800">
              <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${isClassActive && isJoined ? "bg-green-500 animate-pulse" : isClassActive ? "bg-yellow-500" : "bg-gray-500"}`} />
              <span className="text-[10px] md:text-sm text-gray-600 dark:text-gray-300 hidden sm:inline">
                {isClassActive && isJoined ? "Connected" : isClassActive ? "Live" : "Scheduled"}
              </span>
            </div>
            
            {isJoined && (
              <div className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-0.5 md:py-1 rounded-full bg-indigo-100 dark:bg-indigo-500/20">
                <Clock className="h-2 w-2 md:h-3 md:w-3 text-indigo-600 dark:text-indigo-400" />
                <span className="text-[10px] md:text-sm text-indigo-600 dark:text-indigo-400 font-mono">{formatDuration(duration)}</span>
              </div>
            )}
            
            <button onClick={() => setShowInviteModal(true)} className="hidden sm:flex items-center gap-1 md:gap-2 px-2 md:px-3 py-0.5 md:py-1 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-[10px] md:text-sm">
              <Users className="h-3 w-3 md:h-4 md:w-4" /> Invite
            </button>
            <button onClick={() => setShowSidebar(!showSidebar)} className="sm:hidden p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800">
              <Menu className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row h-[calc(100vh-52px)] md:h-[calc(100vh-60px)]">
        {/* Video Area */}
        <div className="flex-1 p-2 md:p-4 min-h-0">
          <div className="bg-gray-900 rounded-xl overflow-hidden h-full relative">
            {isJoined && isClassActive && socketConnected ? (
              <>
                <VideoGrid />
                <video ref={localVideoRef} autoPlay playsInline muted className="hidden" />
                
                {/* Controls */}
                <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex items-center gap-2 md:gap-3 bg-black/80 backdrop-blur-sm rounded-full px-3 md:px-5 py-1.5 md:py-2 z-10">
                  <button onClick={toggleMute} className={`p-1.5 md:p-2.5 rounded-full transition-colors ${isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'}`}>
                    {isMuted ? <MicOff className="h-3 w-3 md:h-4 md:w-4 text-white" /> : <Mic className="h-3 w-3 md:h-4 md:w-4 text-white" />}
                  </button>
                  <button onClick={toggleVideo} className={`p-1.5 md:p-2.5 rounded-full transition-colors ${isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'}`}>
                    {isVideoOff ? <VideoOff className="h-3 w-3 md:h-4 md:w-4 text-white" /> : <Video className="h-3 w-3 md:h-4 md:w-4 text-white" />}
                  </button>
                  <button onClick={() => setLayout(layout === "grid" ? "speaker" : "grid")} className="p-1.5 md:p-2.5 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors">
                    {layout === "grid" ? <List className="h-3 w-3 md:h-4 md:w-4 text-white" /> : <Grid className="h-3 w-3 md:h-4 md:w-4 text-white" />}
                  </button>
                  <button onClick={leaveClass} className="p-1.5 md:p-2.5 rounded-full bg-red-500 hover:bg-red-600 transition-colors">
                    <PhoneOff className="h-3 w-3 md:h-4 md:w-4 text-white" />
                  </button>
                </div>
              </>
            ) : isClassActive ? (
              <div className="flex flex-col items-center justify-center h-full px-4">
                <div className="text-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-3 md:mb-4 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <Video className="h-8 w-8 md:h-10 md:w-10 text-white" />
                  </div>
                  <h2 className="text-lg md:text-xl font-bold text-white mb-2">Ready to join?</h2>
                  <button onClick={joinClass} disabled={isConnecting || !socketConnected} className="px-4 md:px-6 py-1.5 md:py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-semibold flex items-center gap-2 text-sm md:text-base">
                    {isConnecting ? <Loader2 className="h-3 w-3 md:h-4 md:w-4 animate-spin" /> : !socketConnected ? <WifiOff className="h-3 w-3 md:h-4 md:w-4" /> : null}
                    {isConnecting ? "Connecting..." : !socketConnected ? "Connecting..." : "Join Class"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full px-4">
                <div className="text-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-3 md:mb-4 rounded-full bg-gray-800 flex items-center justify-center">
                    <Calendar className="h-8 w-8 md:h-10 md:w-10 text-gray-500" />
                  </div>
                  <h2 className="text-lg md:text-xl font-bold text-white mb-2">Class Not Started</h2>
                  <p className="text-gray-400 text-xs md:text-sm">Starts on {new Date(liveClass.scheduledStartTime).toLocaleString()}</p>
                  <button onClick={() => navigate(getLiveClassesPath())} className="mt-4 px-4 py-1.5 md:py-2 bg-gray-700 rounded-lg text-white text-xs md:text-sm">
                    Back to Live Classes
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className={`fixed inset-y-0 right-0 w-80 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 flex flex-col z-50 transform transition-transform duration-300 sm:relative sm:transform-none sm:w-80 ${
          showSidebar ? 'translate-x-0' : 'translate-x-full sm:translate-x-0'
        }`}>
          <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-800 sm:hidden">
            <h3 className="text-gray-900 dark:text-white font-semibold">Chat & Participants</h3>
            <button onClick={() => setShowSidebar(false)} className="p-1 rounded-lg bg-gray-100 dark:bg-gray-800">
              <X className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
          
          <div className="flex border-b border-gray-200 dark:border-gray-800">
            <button onClick={() => { setShowChat(true); setShowParticipants(false); }} className={`flex-1 py-2.5 text-xs md:text-sm transition-colors ${showChat ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400" : "text-gray-500 dark:text-gray-400"}`}>
              <MessageSquare className="h-3 w-3 md:h-3.5 md:w-3.5 inline mr-1" /> Chat
            </button>
            <button onClick={() => { setShowChat(false); setShowParticipants(true); }} className={`flex-1 py-2.5 text-xs md:text-sm transition-colors ${showParticipants ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400" : "text-gray-500 dark:text-gray-400"}`}>
              <Users className="h-3 w-3 md:h-3.5 md:w-3.5 inline mr-1" /> Participants ({activeParticipantsCount})
            </button>
          </div>

          {showChat && (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto p-2 md:p-3 space-y-2">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-[10px] md:text-xs font-bold">{msg.userName?.charAt(0) || "U"}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 md:gap-2 flex-wrap">
                        <span className="text-[10px] md:text-xs font-semibold text-gray-900 dark:text-white">{msg.userName}</span>
                        <span className="text-[8px] md:text-[10px] text-gray-500 dark:text-gray-400">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-[10px] md:text-xs text-gray-600 dark:text-gray-300 mt-0.5 break-words">{msg.message}</p>
                    </div>
                  </div>
                ))}
                {chatMessages.length === 0 && <div className="text-center text-gray-500 dark:text-gray-400 text-xs md:text-sm py-8">No messages yet</div>}
              </div>
              {isJoined && isClassActive && (
                <form onSubmit={sendMessage} className="p-2 md:p-3 border-t border-gray-200 dark:border-gray-800">
                  <div className="flex gap-2">
                    <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." className="flex-1 px-2 md:px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white text-xs md:text-sm rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:border-indigo-500" />
                    <button type="submit" className="p-1.5 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"><Send className="h-3 w-3 md:h-4 md:w-4" /></button>
                  </div>
                </form>
              )}
            </div>
          )}

          {showParticipants && (
            <div className="flex-1 overflow-y-auto p-2 md:p-3 space-y-2">
              {participants.filter(p => p.active && !p.leftAt).map((p, idx) => (
                <div key={idx} className="flex items-center gap-2 p-1.5 md:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white font-semibold text-xs md:text-sm">{p.userId?.name?.charAt(0) || "U"}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs md:text-sm font-medium text-gray-900 dark:text-white truncate">{p.userId?.name}</p>
                    <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400">{p.role === "lecturer" ? "Host" : p.role === "admin" ? "Admin" : "Student"}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {p.audioEnabled === false && <MicOff className="h-2.5 w-2.5 md:h-3 md:w-3 text-red-400" />}
                    {p.videoEnabled === false && <VideoOff className="h-2.5 w-2.5 md:h-3 md:w-3 text-red-400" />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {showSidebar && (
          <div className="fixed inset-0 bg-black/50 z-40 sm:hidden" onClick={() => setShowSidebar(false)} />
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-5 max-w-md w-full">
            <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-white mb-2 md:mb-3">Invite Participants</h3>
            <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm mb-2 md:mb-3">Share this link:</p>
            <div className="flex gap-2 mb-3 md:mb-4">
              <input type="text" value={inviteLink} readOnly className="flex-1 px-2 md:px-3 py-1.5 md:py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white text-xs md:text-sm rounded-lg border border-gray-300 dark:border-gray-600 truncate" />
              <button onClick={copyInviteLink} className="px-2 md:px-3 py-1.5 md:py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 flex items-center gap-1 text-xs md:text-sm transition-colors">
                {copied ? <Check className="h-3 w-3 md:h-4 md:w-4" /> : <Copy className="h-3 w-3 md:h-4 md:w-4" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <button onClick={() => setShowInviteModal(false)} className="w-full py-1.5 md:py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-sm transition-colors">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveClassRoom;