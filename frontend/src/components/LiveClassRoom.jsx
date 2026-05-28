import { useState, useEffect, useRef, useCallback, memo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "../api/axios";
import { io } from "socket.io-client";
import Peer from "simple-peer";
import { 
  Video, Mic, MicOff, VideoOff, PhoneOff, MessageSquare, Users, Send,
  Clock, Calendar, Grid, List, Maximize2, Minimize2, Pin, Settings,
  Copy, Check, LogOut, WifiOff, Loader2, Menu, X, Sun, Moon, Volume2, VolumeX
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
  const [socketConnected, setSocketConnected] = useState(false);
  const [localStreamReady, setLocalStreamReady] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileControls, setShowMobileControls] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [classEnded, setClassEnded] = useState(false);
  const [remoteVideoStreams, setRemoteVideoStreams] = useState({});
  const [remoteAudioEnabled, setRemoteAudioEnabled] = useState({});
  const [remoteVideoEnabled, setRemoteVideoEnabled] = useState({});
  
  // WebRTC Refs
  const socketRef = useRef(null);
  const peersRef = useRef({});
  const userMediaStreamRef = useRef(null);
  const localVideoRef = useRef(null);
  const durationIntervalRef = useRef(null);
  const videoRefs = useRef({});
  const isLeavingRef = useRef(false);
  const isInitializedRef = useRef(false);
  const pendingParticipantsRef = useRef([]);
  const retryTimeoutsRef = useRef({});
  const remoteVideoElementsRef = useRef({});
  
  // Helper function to safely get user ID
  const getUserId = useCallback((participant) => {
    if (!participant) return null;
    if (participant.userId?._id) return participant.userId._id;
    if (participant.userId?.toString) return participant.userId.toString();
    if (participant._id) return participant._id;
    if (participant.id) return participant.id;
    return null;
  }, []);

  // Helper function to safely get user name
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
      Object.values(retryTimeoutsRef.current).forEach(timeout => clearTimeout(timeout));
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
    socketRef.current.on("participant-updated", handleParticipantUpdated);
    socketRef.current.on("class-ended", handleClassEnded);
    socketRef.current.on("new-chat-message", handleNewChatMessage);
  };

  const handleExistingParticipants = useCallback(async (participantsList) => {
    console.log("📋 Received existing participants:", participantsList);
    
    if (!participantsList || !Array.isArray(participantsList)) {
      console.log("No existing participants or invalid format");
      return;
    }
    
    if (participantsList.length === 0) {
      console.log("No existing participants in room");
      return;
    }
    
    if (!userMediaStreamRef.current || !localStreamReady) {
      console.log("Waiting for local stream before creating peers for existing participants");
      pendingParticipantsRef.current = participantsList;
      return;
    }
    
    for (const participant of participantsList) {
      const participantId = participant.userId;
      if (participantId && participantId !== currentUser?._id && !peersRef.current[participantId]) {
        console.log(`🔗 Creating peer for existing participant: ${participant.userName} (${participantId})`);
        await createPeer(participantId, userMediaStreamRef.current, true);
        
        setParticipants(prev => {
          const exists = prev.some(p => getUserId(p) === participantId);
          if (exists) return prev;
          return [...prev, {
            userId: { _id: participantId, name: participant.userName },
            role: participant.role || "student",
            joinedAt: new Date(),
            active: true,
            audioEnabled: participant.audioEnabled !== false,
            videoEnabled: participant.videoEnabled !== false
          }];
        });
      }
    }
  }, [currentUser, localStreamReady, getUserId]);

  const handleJoinConfirmed = useCallback(() => {
    console.log("✅ Join confirmed by server");
    setIsConnecting(false);
    setIsJoined(true);
    startDurationTimer();
    toast.success("Successfully joined the class!");
    
    if (pendingParticipantsRef.current.length > 0 && userMediaStreamRef.current && localStreamReady) {
      console.log("Processing pending participants after join confirmed");
      const participantsToProcess = [...pendingParticipantsRef.current];
      pendingParticipantsRef.current = [];
      
      setTimeout(() => {
        participantsToProcess.forEach(participant => {
          const participantId = participant.userId;
          if (participantId && participantId !== currentUser?._id && !peersRef.current[participantId]) {
            console.log(`Creating peer for pending participant: ${participant.userName}`);
            createPeer(participantId, userMediaStreamRef.current, true);
          }
        });
      }, 500);
    }
  }, [currentUser, localStreamReady]);

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
      
      const allParticipants = (res.data.participants || [])
        .filter(p => p && p.userId)
        .map(p => ({
          userId: p.userId,
          role: p.role || "student",
          joinedAt: p.joinedAt,
          leftAt: p.leftAt,
          active: !p.leftAt,
          audioEnabled: p.audioEnabled !== false,
          videoEnabled: p.videoEnabled !== false
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

  // CRITICAL FIX: Initialize local media stream with proper constraints
  const initializeLocalStream = useCallback(async () => {
    if (userMediaStreamRef.current && localStreamReady) {
      return userMediaStreamRef.current;
    }
    
    try {
      // First, stop any existing tracks
      if (userMediaStreamRef.current) {
        userMediaStreamRef.current.getTracks().forEach(track => track.stop());
        userMediaStreamRef.current = null;
      }
      
      // CRITICAL: Request high-quality audio and video
      const constraints = {
        video: isVideoOff ? false : {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
          sampleSize: 16,
          channelCount: 1
        }
      };
      
      if (selectedCamera && !isVideoOff) {
        constraints.video = {
          ...constraints.video,
          deviceId: { exact: selectedCamera }
        };
      }
      
      if (selectedMicrophone) {
        constraints.audio = {
          ...constraints.audio,
          deviceId: { exact: selectedMicrophone }
        };
      }
      
      console.log("🎥 Requesting media with constraints:", constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      userMediaStreamRef.current = stream;
      
      // CRITICAL: Ensure all audio tracks are enabled and at proper volume
      stream.getAudioTracks().forEach(track => {
        track.enabled = true;
        console.log(`🎤 Audio track: ${track.label}, enabled: ${track.enabled}, readyState: ${track.readyState}`);
      });
      
      stream.getVideoTracks().forEach(track => {
        track.enabled = !isVideoOff;
        console.log(`📷 Video track: ${track.label}, enabled: ${track.enabled}`);
      });
      
      setLocalStreamReady(true);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.volume = 0;
        localVideoRef.current.muted = true;
        await localVideoRef.current.play().catch(e => console.log("Local video play error:", e));
      }
      
      console.log("✅ Local stream ready");
      console.log(`   Audio tracks: ${stream.getAudioTracks().length}`);
      console.log(`   Video tracks: ${stream.getVideoTracks().length}`);
      
      return stream;
    } catch (err) {
      console.error("Error accessing media devices:", err);
      toast.error("Unable to access camera or microphone. Please check permissions.");
      return null;
    }
  }, [isVideoOff, selectedCamera, selectedMicrophone, localStreamReady]);

  // CRITICAL FIX: Create peer with proper audio and video handling
  const createPeer = useCallback((userId, stream, isInitiator = true, retryCount = 0) => {
    if (!userId) return null;
    
    if (peersRef.current[userId]) {
      console.log(`⚠️ Peer for ${userId} already exists`);
      return peersRef.current[userId];
    }
    
    if (retryTimeoutsRef.current[userId]) {
      clearTimeout(retryTimeoutsRef.current[userId]);
      delete retryTimeoutsRef.current[userId];
    }
    
    console.log(`🔗 Creating ${isInitiator ? 'initiator' : 'receiver'} peer for ${userId}`);
    
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
        iceCandidatePoolSize: 10
      }
    });
    
    peer.on("signal", signal => {
      if (socketRef.current && socketConnected) {
        console.log(`📡 Sending signal to ${userId}`);
        socketRef.current.emit("signal", { 
          to: userId, 
          signal, 
          classId,
          from: currentUser?._id
        });
      } else {
        console.log(`⚠️ Cannot send signal to ${userId}: socket not connected`);
      }
    });
    
    peer.on("stream", remoteStream => {
      console.log(`📺 Received remote stream from ${userId}`);
      console.log(`   Audio tracks: ${remoteStream.getAudioTracks().length}`);
      console.log(`   Video tracks: ${remoteStream.getVideoTracks().length}`);
      
      // CRITICAL: Force enable all remote audio and video tracks
      remoteStream.getAudioTracks().forEach(track => {
        track.enabled = true;
        console.log(`🎤 Remote audio track for ${userId}: enabled`);
      });
      
      remoteStream.getVideoTracks().forEach(track => {
        track.enabled = true;
        console.log(`📷 Remote video track for ${userId}: enabled`);
      });
      
      // Store remote stream
      setRemoteVideoStreams(prev => ({
        ...prev,
        [userId]: remoteStream
      }));
      
      // Update participant with remote stream info
      setParticipants(prev => {
        const updated = prev.map(p => {
          const pid = getUserId(p);
          if (pid === userId) {
            return { ...p, remoteStreamAvailable: true };
          }
          return p;
        });
        
        const exists = updated.some(p => getUserId(p) === userId);
        if (!exists) {
          updated.push({
            userId: { _id: userId, name: `User ${userId.slice(-4)}` },
            role: "student",
            joinedAt: new Date(),
            active: true,
            audioEnabled: true,
            videoEnabled: true,
            remoteStreamAvailable: true
          });
        }
        
        return [...updated];
      });
      
      // Force re-render to show video
      setTimeout(() => {
        setParticipants(prev => [...prev]);
      }, 100);
    });
    
    peer.on("connect", () => {
      console.log(`✅ Peer connected to ${userId}`);
    });
    
    peer.on("close", () => {
      console.log(`❌ Peer closed for ${userId}`);
      delete peersRef.current[userId];
      setRemoteVideoStreams(prev => {
        const newStreams = { ...prev };
        delete newStreams[userId];
        return newStreams;
      });
    });
    
    peer.on("error", (err) => {
      console.error(`Peer error for ${userId}:`, err.message);
      
      if (retryCount < 3 && (err.message.includes('ICE') || err.message.includes('connect'))) {
        console.log(`🔄 Retrying peer creation for ${userId}, attempt ${retryCount + 1}`);
        delete peersRef.current[userId];
        retryTimeoutsRef.current[userId] = setTimeout(() => {
          createPeer(userId, stream, isInitiator, retryCount + 1);
        }, 1000 * (retryCount + 1));
      }
    });
    
    peer.on("iceConnectionStateChange", () => {
      console.log(`ICE connection state for ${userId}: ${peer.iceConnectionState}`);
      if (peer.iceConnectionState === 'connected') {
        console.log(`✅ ICE connected for ${userId}`);
      }
    });
    
    peersRef.current[userId] = peer;
    return peer;
  }, [classId, socketConnected, currentUser, getUserId]);

  const handleUserJoined = useCallback((data) => {
    const { userId, userName, role, audioEnabled, videoEnabled } = data;
    
    console.log(`👤 User joined: ${userName} (${userId})`);
    
    setParticipants(prev => {
      const exists = prev.some(p => getUserId(p) === userId);
      if (exists) return prev;
      console.log(`   Adding ${userName} to participants list`);
      return [...prev, {
        userId: { _id: userId, name: userName },
        role: role || "student",
        joinedAt: new Date(),
        active: true,
        audioEnabled: audioEnabled !== false,
        videoEnabled: videoEnabled !== false
      }];
    });
    
    const createPeerWithRetry = (retryCount = 0) => {
      if (userMediaStreamRef.current && localStreamReady && !peersRef.current[userId]) {
        console.log(`🔗 Creating peer for new user ${userName} (${userId})`);
        createPeer(userId, userMediaStreamRef.current, true);
      } else if (retryCount < 10) {
        console.log(`⏳ Waiting for local stream, retry ${retryCount + 1} for ${userName}`);
        setTimeout(() => createPeerWithRetry(retryCount + 1), 500);
      } else {
        console.log(`❌ Failed to create peer for ${userName} after 10 retries`);
      }
    };
    
    createPeerWithRetry();
    
    toast.success(`${userName} joined the class`);
  }, [localStreamReady, createPeer, getUserId]);

  const handleUserLeft = useCallback((data) => {
    const { userId, userName } = data;
    
    console.log(`👋 User left: ${userName} (${userId})`);
    
    if (peersRef.current[userId]) {
      peersRef.current[userId].destroy();
      delete peersRef.current[userId];
    }
    
    setParticipants(prev => prev.filter(p => getUserId(p) !== userId));
    setRemoteVideoStreams(prev => {
      const newStreams = { ...prev };
      delete newStreams[userId];
      return newStreams;
    });
    
    toast.info(`${userName} left the class`);
  }, [getUserId]);

  const handleSignal = useCallback((data) => {
    const { from, signal } = data;
    
    console.log(`📡 Received signal from ${from}`);
    
    if (peersRef.current[from]) {
      console.log(`   Forwarding signal to existing peer ${from}`);
      peersRef.current[from].signal(signal);
    } else if (userMediaStreamRef.current && from !== currentUser?._id) {
      console.log(`   Creating new peer for signal from ${from}`);
      const peer = createPeer(from, userMediaStreamRef.current, false);
      if (peer) {
        try {
          peer.signal(signal);
        } catch (err) {
          console.error(`Error signaling peer ${from}:`, err);
        }
      }
    } else {
      console.log(`   Cannot handle signal from ${from}`);
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

  const handleParticipantUpdated = useCallback((data) => {
    setParticipants(prev => prev.map(p => {
      const pid = getUserId(p);
      if (pid === data.userId) {
        if (data.updates.audioEnabled !== undefined) {
          setRemoteAudioEnabled(prevAudio => ({ ...prevAudio, [pid]: data.updates.audioEnabled }));
        }
        if (data.updates.videoEnabled !== undefined) {
          setRemoteVideoEnabled(prevVideo => ({ ...prevVideo, [pid]: data.updates.videoEnabled }));
        }
        return { ...p, ...data.updates };
      }
      return p;
    }));
  }, [getUserId]);

  // Toggle mute with proper audio handling
  const toggleMute = useCallback(async () => {
    if (userMediaStreamRef.current) {
      const audioTracks = userMediaStreamRef.current.getAudioTracks();
      if (audioTracks.length > 0) {
        const newMuteState = !isMuted;
        audioTracks.forEach(track => {
          track.enabled = !newMuteState;
        });
        setIsMuted(newMuteState);
        
        socketRef.current?.emit("participant-updated", {
          classId, userId: currentUser._id, updates: { audioEnabled: !newMuteState }
        });
        
        toast.success(newMuteState ? "Microphone muted" : "Microphone unmuted");
        console.log(`Microphone ${newMuteState ? 'muted' : 'unmuted'}`);
      } else {
        console.log("No audio track found");
        toast.error("No microphone detected");
      }
    }
  }, [isMuted, classId, currentUser]);

  const toggleVideo = useCallback(async () => {
    const newVideoState = !isVideoOff;
    
    if (userMediaStreamRef.current) {
      const videoTracks = userMediaStreamRef.current.getVideoTracks();
      if (videoTracks.length > 0) {
        videoTracks.forEach(track => {
          track.enabled = !newVideoState;
        });
        setIsVideoOff(newVideoState);
        
        socketRef.current?.emit("participant-updated", {
          classId, userId: currentUser._id, updates: { videoEnabled: !newVideoState }
        });
        
        toast.success(newVideoState ? "Camera off" : "Camera on");
        console.log(`Camera ${newVideoState ? 'off' : 'on'}`);
      }
    } else if (!newVideoState) {
      await initializeLocalStream();
      setIsVideoOff(false);
    }
  }, [isVideoOff, classId, currentUser, initializeLocalStream]);

  const joinClass = async () => {
    try {
      await axios.post(`/live-class/${classId}/join`);
      
      const stream = await initializeLocalStream();
      if (!stream) {
        toast.error("Could not access camera/microphone");
        setIsConnecting(false);
        return;
      }
      
      await joinCall();
    } catch (err) {
      console.error("Join error:", err);
      toast.error(err.response?.data?.message || "Failed to join class");
      setIsConnecting(false);
    }
  };

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
    Object.values(retryTimeoutsRef.current).forEach(timeout => clearTimeout(timeout));
    retryTimeoutsRef.current = {};
    
    Object.values(peersRef.current).forEach(peer => {
      if (peer) peer.destroy();
    });
    peersRef.current = {};
    
    if (userMediaStreamRef.current) {
      userMediaStreamRef.current.getTracks().forEach(track => track.stop());
      userMediaStreamRef.current = null;
    }
    
    if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
    
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    
    setLocalStreamReady(false);
    setSocketConnected(false);
    setIsJoined(false);
    setParticipants([]);
    setRemoteVideoStreams({});
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

  const activeParticipantsCount = participants.filter(p => p && p.active && !p.leftAt).length;

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

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      {!socketConnected && (
        <div className="fixed top-16 md:top-20 right-2 md:right-4 z-50 bg-red-500/90 backdrop-blur-sm rounded-lg px-2 md:px-3 py-1 md:py-1.5 flex items-center gap-1 md:gap-2">
          <WifiOff className="h-2 w-2 md:h-3 md:w-3 text-white" />
          <span className="text-white text-[10px] md:text-xs">Reconnecting...</span>
        </div>
      )}
      
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
            <button onClick={toggleDarkMode} className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
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
        <div className="flex-1 p-2 md:p-4 min-h-0">
          <div className="bg-gray-900 rounded-xl overflow-hidden h-full relative">
            {isJoined && isClassActive && socketConnected ? (
              <>
                <VideoGridComponent 
                  layout={layout}
                  pinnedVideo={pinnedVideo}
                  setPinnedVideo={setPinnedVideo}
                  currentUser={currentUser}
                  participants={participants}
                  isMuted={isMuted}
                  isVideoOff={isVideoOff}
                  userMediaStreamRef={userMediaStreamRef}
                  localStreamReady={localStreamReady}
                  remoteVideoStreams={remoteVideoStreams}
                  remoteVideoEnabled={remoteVideoEnabled}
                  remoteAudioEnabled={remoteAudioEnabled}
                  videoRefs={videoRefs}
                  speakingUsers={speakingUsers}
                />
                
                <video ref={localVideoRef} autoPlay playsInline muted className="hidden" />
                
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
              {participants
                .filter(p => p && p.active && !p.leftAt)
                .map((p, idx) => {
                  const pid = getUserId(p);
                  const pName = getUserName(p);
                  return (
                    <div key={pid || idx} className="flex items-center gap-2 p-1.5 md:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                      <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white font-semibold text-xs md:text-sm">{pName?.charAt(0) || "U"}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs md:text-sm font-medium text-gray-900 dark:text-white truncate">{pName}</p>
                        <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400">{p.role === "lecturer" ? "Host" : p.role === "admin" ? "Admin" : "Student"}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {p.audioEnabled === false && <MicOff className="h-2.5 w-2.5 md:h-3 md:w-3 text-red-400" />}
                        {p.videoEnabled === false && <VideoOff className="h-2.5 w-2.5 md:h-3 md:w-3 text-red-400" />}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
        
        {showSidebar && (
          <div className="fixed inset-0 bg-black/50 z-40 sm:hidden" onClick={() => setShowSidebar(false)} />
        )}
      </div>

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

// ================= VIDEO TILE COMPONENT =================
const VideoTile = memo(({ video, isPinned = false, isSidebar = false, 
  userMediaStreamRef, localStreamReady, videoRefs, pinnedVideo, setPinnedVideo, speakingUsers }) => {
  const videoElementRef = useRef(null);
  
  useEffect(() => {
    if (video?.id && videoElementRef.current) {
      videoRefs.current[video.id] = videoElementRef.current;
    }
    
    return () => {
      if (video?.id) {
        delete videoRefs.current[video.id];
      }
    };
  }, [video?.id, videoRefs]);
  
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
      console.log(`🎥 Attaching stream for ${video.name}`);
      
      // Force enable all tracks
      streamToUse.getTracks().forEach(track => {
        track.enabled = true;
        console.log(`   Track enabled for ${video.name}: ${track.kind}`);
      });
      
      videoElement.srcObject = streamToUse;
      videoElement.volume = video.isLocal ? 0 : 1;
      videoElement.muted = video.isLocal;
      
      const playPromise = videoElement.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => {
          console.log(`Play error for ${video.name}:`, e);
          setTimeout(() => {
            if (videoElement.srcObject === streamToUse) {
              videoElement.play().catch(e2 => console.log("Retry error:", e2));
            }
          }, 500);
        });
      }
    }
  }, [video?.id, video?.isLocal, video?.remoteStream, userMediaStreamRef]);
  
  if (!video) return null;
  
  const hasValidStream = video.isLocal ? localStreamReady && userMediaStreamRef.current : !!video.remoteStream;
  const shouldShowVideo = hasValidStream && !video.isVideoOff;
  const isSpeaking = speakingUsers?.[video.id] || false;
  
  return (
    <div 
      className={`relative bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden group ${
        isPinned ? "h-full" : isSidebar ? "h-24 md:h-32" : "aspect-video"
      } ${isSpeaking ? "ring-2 ring-green-500" : ""}`}
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
              {video.name}
            </p>
            {video.isVideoOff && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Camera off</p>}
            {!hasValidStream && !video.isLocal && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Waiting for video...</p>}
          </div>
        </div>
      )}
      
      {/* Speaking indicator */}
      {isSpeaking && (
        <div className="absolute top-2 left-2 bg-green-500/80 backdrop-blur-sm rounded-full px-2 py-0.5 text-white text-[10px] font-medium flex items-center gap-1">
          <Volume2 className="h-2 w-2" />
          Speaking
        </div>
      )}
      
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 md:p-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 md:gap-2">
            <span className="text-white text-xs md:text-sm font-medium truncate max-w-[80px] md:max-w-[150px]">
              {video.name}
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
      
      {!video.isLocal && !isSidebar && setPinnedVideo && (
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

// ================= VIDEO GRID COMPONENT =================
const VideoGridComponent = memo(({ layout, pinnedVideo, setPinnedVideo, currentUser, participants, 
  isMuted, isVideoOff, userMediaStreamRef, localStreamReady, remoteVideoStreams, videoRefs, speakingUsers }) => {
  
  const getVideoParticipants = useCallback(() => {
    const allVideos = [];
    
    // Add local user (YOU)
    if (currentUser?._id && userMediaStreamRef.current) {
      allVideos.push({
        id: `local_${currentUser._id}`,
        userId: currentUser._id,
        name: `${currentUser.name} (You)`,
        remoteStream: userMediaStreamRef.current,
        isLocal: true,
        role: currentUser.role,
        isMuted: isMuted,
        isVideoOff: isVideoOff,
        isSpeaking: false
      });
    }
    
    // Add remote participants (OTHER USERS)
    if (Array.isArray(participants)) {
      participants
        .filter(p => p && p.userId && p.userId._id !== currentUser?._id && p.active && !p.leftAt)
        .forEach(p => {
          if (p.userId?._id) {
            const remoteStream = remoteVideoStreams[p.userId._id];
            allVideos.push({
              id: p.userId._id,
              userId: p.userId._id,
              name: p.userId.name || "Participant",
              remoteStream: remoteStream,
              isLocal: false,
              role: p.role || "student",
              isMuted: !p.audioEnabled,
              isVideoOff: !p.videoEnabled,
              isSpeaking: speakingUsers?.[p.userId._id] || false
            });
          }
        });
    }
    
    if (pinnedVideo) {
      const pinned = allVideos.find(v => v.id === pinnedVideo);
      const others = allVideos.filter(v => v.id !== pinnedVideo);
      return { pinned, others };
    }
    return { pinned: null, others: allVideos };
  }, [currentUser, participants, isMuted, isVideoOff, pinnedVideo, userMediaStreamRef, remoteVideoStreams, speakingUsers]);
  
  const { pinned, others } = getVideoParticipants();
  
  if (others.length === 0 && !pinned) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-500">
          <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>Waiting for participants to join...</p>
        </div>
      </div>
    );
  }
  
  if (layout === "speaker" && others.length > 0) {
    const mainSpeaker = pinned || others.find(v => v.role === "lecturer") || others[0];
    const sidebarVideos = others.filter(v => v.id !== mainSpeaker?.id);
    
    return (
      <div className="flex flex-col md:flex-row h-full gap-2 md:gap-4">
        <div className="flex-1 min-h-0">
          {mainSpeaker && (
            <VideoTile 
              video={mainSpeaker} 
              isPinned 
              userMediaStreamRef={userMediaStreamRef}
              localStreamReady={localStreamReady}
              videoRefs={videoRefs}
              pinnedVideo={pinnedVideo}
              setPinnedVideo={setPinnedVideo}
              speakingUsers={speakingUsers}
            />
          )}
        </div>
        {sidebarVideos.length > 0 && (
          <div className="flex md:flex-col gap-2 md:gap-3 overflow-x-auto md:overflow-y-auto md:w-32 lg:w-48 p-2">
            {sidebarVideos.map(video => (
              <VideoTile 
                key={video.id} 
                video={video} 
                isSidebar 
                userMediaStreamRef={userMediaStreamRef}
                localStreamReady={localStreamReady}
                videoRefs={videoRefs}
                pinnedVideo={pinnedVideo}
                setPinnedVideo={setPinnedVideo}
                speakingUsers={speakingUsers}
              />
            ))}
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
      {others.map(video => (
        <VideoTile 
          key={video.id} 
          video={video} 
          userMediaStreamRef={userMediaStreamRef}
          localStreamReady={localStreamReady}
          videoRefs={videoRefs}
          pinnedVideo={pinnedVideo}
          setPinnedVideo={setPinnedVideo}
          speakingUsers={speakingUsers}
        />
      ))}
    </div>
  );
});

export default LiveClassRoom;