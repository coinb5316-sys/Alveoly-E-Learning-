import { useState, useEffect, useRef, useCallback, memo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "../api/axios";
import { io } from "socket.io-client";
import Peer from "simple-peer";
import { 
  Video, Mic, MicOff, VideoOff, PhoneOff, MessageSquare, Users, Send,
  Clock, Calendar, Grid, List, Pin, Copy, Check, WifiOff, Loader2, 
  Menu, X, Sun, Moon, Volume2, ScreenShare, StopCircle
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
  const [isScreenSharing, setIsScreenSharing] = useState(false);
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
  const [darkMode, setDarkMode] = useState(false);
  const [classEnded, setClassEnded] = useState(false);
  const [remoteStreams, setRemoteStreams] = useState({});
  
  // WebRTC Refs
  const socketRef = useRef(null);
  const peersRef = useRef({});
  const userMediaStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const localVideoRef = useRef(null);
  const durationIntervalRef = useRef(null);
  const isLeavingRef = useRef(false);
  const pendingParticipantsRef = useRef([]);
  const retryTimeoutsRef = useRef({});
  
  // Video element refs for remote streams
  const remoteVideoRefs = useRef({});
  
  const getUserId = useCallback((participant) => {
    if (!participant) return null;
    if (participant.userId?._id) return participant.userId._id;
    if (participant.userId?.toString) return participant.userId.toString();
    if (participant._id) return participant._id;
    if (participant.id) return participant.id;
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
    socketRef.current.on("user-speaking", handleUserSpeaking);
    socketRef.current.on("participant-updated", handleParticipantUpdated);
    socketRef.current.on("class-ended", handleClassEnded);
    socketRef.current.on("new-chat-message", handleNewChatMessage);
  };

  const handleExistingParticipants = useCallback((participantsList) => {
    console.log("📋 Received existing participants:", participantsList);
    
    if (!participantsList || !Array.isArray(participantsList)) {
      return;
    }
    
    if (!userMediaStreamRef.current || !localStreamReady) {
      pendingParticipantsRef.current = participantsList;
      return;
    }
    
    for (const participant of participantsList) {
      const participantId = participant.userId;
      if (participantId && participantId !== currentUser?._id && !peersRef.current[participantId]) {
        console.log(`🔗 Creating peer for existing participant: ${participant.userName}`);
        createPeer(participantId, userMediaStreamRef.current, true);
      }
    }
  }, [currentUser, localStreamReady]);

  const handleJoinConfirmed = useCallback(() => {
    console.log("✅ Join confirmed by server");
    setIsConnecting(false);
    setIsJoined(true);
    startDurationTimer();
    toast.success("Successfully joined the class!");
    
    if (pendingParticipantsRef.current.length > 0 && userMediaStreamRef.current && localStreamReady) {
      const participantsToProcess = [...pendingParticipantsRef.current];
      pendingParticipantsRef.current = [];
      
      setTimeout(() => {
        participantsToProcess.forEach(participant => {
          const participantId = participant.userId;
          if (participantId && participantId !== currentUser?._id && !peersRef.current[participantId]) {
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
          videoEnabled: p.videoEnabled !== false,
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
      if (userMediaStreamRef.current) {
        userMediaStreamRef.current.getTracks().forEach(track => track.stop());
        userMediaStreamRef.current = null;
      }
      
      const constraints = {
        video: isVideoOff ? false : {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      };
      
      if (selectedCamera && !isVideoOff) {
        constraints.video = { deviceId: { exact: selectedCamera } };
      }
      
      if (selectedMicrophone) {
        constraints.audio = { deviceId: { exact: selectedMicrophone } };
      }
      
      console.log("🎥 Requesting media:", constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      userMediaStreamRef.current = stream;
      
      stream.getAudioTracks().forEach(track => {
        track.enabled = true;
      });
      
      stream.getVideoTracks().forEach(track => {
        track.enabled = !isVideoOff;
      });
      
      setLocalStreamReady(true);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.muted = true;
        localVideoRef.current.play().catch(e => console.log("Local video play error:", e));
      }
      
      console.log("✅ Local stream ready");
      return stream;
    } catch (err) {
      console.error("Error accessing media devices:", err);
      toast.error("Unable to access camera or microphone. Please check permissions.");
      return null;
    }
  }, [isVideoOff, selectedCamera, selectedMicrophone, localStreamReady]);

  // Screen sharing
  const toggleScreenShare = useCallback(async () => {
    if (isScreenSharing) {
      // Stop screen sharing and revert to camera
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => track.stop());
        screenStreamRef.current = null;
      }
      
      // Update all peers to use camera stream
      Object.values(peersRef.current).forEach(peer => {
        if (peer && peer._pc) {
          const senders = peer._pc.getSenders();
          const videoSender = senders.find(s => s.track && s.track.kind === 'video');
          if (videoSender && userMediaStreamRef.current) {
            const videoTrack = userMediaStreamRef.current.getVideoTracks()[0];
            if (videoTrack) {
              videoSender.replaceTrack(videoTrack);
            }
          }
        }
      });
      
      setIsScreenSharing(false);
      toast.success("Stopped screen sharing");
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenStreamRef.current = screenStream;
        
        // Update all peers to use screen share stream
        Object.values(peersRef.current).forEach(peer => {
          if (peer && peer._pc) {
            const senders = peer._pc.getSenders();
            const videoSender = senders.find(s => s.track && s.track.kind === 'video');
            if (videoSender) {
              const videoTrack = screenStream.getVideoTracks()[0];
              if (videoTrack) {
                videoSender.replaceTrack(videoTrack);
              }
            }
          }
        });
        
        screenStream.getVideoTracks()[0].onended = () => {
          toggleScreenShare();
        };
        
        setIsScreenSharing(true);
        toast.success("Sharing screen");
      } catch (err) {
        console.error("Screen share error:", err);
        toast.error("Failed to share screen");
      }
    }
  }, [isScreenSharing]);

  // Create peer connection
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
    
    console.log(`🔗 Creating peer for ${userId}, initiator: ${isInitiator}`);
    
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
      }
    });
    
    peer.on("stream", remoteStream => {
      console.log(`📺 Received remote stream from ${userId}`);
      
      // Store remote stream
      setRemoteStreams(prev => ({ ...prev, [userId]: remoteStream }));
      
      // Attach to video element if it exists
      if (remoteVideoRefs.current[userId]) {
        const videoElement = remoteVideoRefs.current[userId];
        videoElement.srcObject = remoteStream;
        videoElement.play().catch(e => console.log("Video play error:", e));
      }
      
      // Update participant list
      setParticipants(prev => {
        const exists = prev.some(p => getUserId(p) === userId);
        if (!exists) {
          return [...prev, {
            userId: { _id: userId, name: `User ${userId.slice(-4)}` },
            role: "student",
            joinedAt: new Date(),
            active: true,
            audioEnabled: true,
            videoEnabled: true,
          }];
        }
        return prev;
      });
    });
    
    peer.on("connect", () => {
      console.log(`✅ Peer connected to ${userId}`);
    });
    
    peer.on("close", () => {
      console.log(`❌ Peer closed for ${userId}`);
      delete peersRef.current[userId];
      setRemoteStreams(prev => {
        const newStreams = { ...prev };
        delete newStreams[userId];
        return newStreams;
      });
    });
    
    peer.on("error", (err) => {
      console.error(`Peer error for ${userId}:`, err.message);
      
      if (retryCount < 3) {
        console.log(`🔄 Retrying peer creation for ${userId}, attempt ${retryCount + 1}`);
        delete peersRef.current[userId];
        retryTimeoutsRef.current[userId] = setTimeout(() => {
          createPeer(userId, stream, isInitiator, retryCount + 1);
        }, 1000 * (retryCount + 1));
      }
    });
    
    peersRef.current[userId] = peer;
    return peer;
  }, [classId, socketConnected, currentUser]);

  const handleUserJoined = useCallback((data) => {
    const { userId, userName, role, audioEnabled, videoEnabled } = data;
    
    console.log(`👤 User joined: ${userName} (${userId})`);
    
    setParticipants(prev => {
      const exists = prev.some(p => getUserId(p) === userId);
      if (exists) return prev;
      return [...prev, {
        userId: { _id: userId, name: userName },
        role: role || "student",
        joinedAt: new Date(),
        active: true,
        audioEnabled: audioEnabled !== false,
        videoEnabled: videoEnabled !== false,
      }];
    });
    
    const createPeerWithRetry = (retryCount = 0) => {
      if (userMediaStreamRef.current && localStreamReady && !peersRef.current[userId]) {
        console.log(`🔗 Creating peer for new user ${userName}`);
        createPeer(userId, userMediaStreamRef.current, true);
      } else if (retryCount < 10) {
        setTimeout(() => createPeerWithRetry(retryCount + 1), 500);
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
    setRemoteStreams(prev => {
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
      peersRef.current[from].signal(signal);
    } else if (userMediaStreamRef.current && from !== currentUser?._id) {
      console.log(`   Creating peer for signal from ${from}`);
      const peer = createPeer(from, userMediaStreamRef.current, false);
      if (peer) {
        try {
          peer.signal(signal);
        } catch (err) {
          console.error(`Error signaling peer ${from}:`, err);
        }
      }
    }
  }, [currentUser, createPeer]);

  const handleClassEnded = useCallback(() => {
    if (classEnded) return;
    setClassEnded(true);
    
    toast.error("Class has been ended by the lecturer", { duration: 5000 });
    
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
    setParticipants(prev => prev.map(p => {
      const pid = getUserId(p);
      return pid === data.userId ? { ...p, ...data.updates } : p;
    }));
  }, [getUserId]);

  const toggleMute = useCallback(() => {
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
    
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
    }
    
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
    setRemoteStreams({});
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

  // Get all video streams for display
  const getAllVideoStreams = () => {
    const videos = [];
    
    // Add local video
    if (userMediaStreamRef.current && localStreamReady) {
      videos.push({
        id: `local_${currentUser?._id}`,
        userId: currentUser?._id,
        name: `${currentUser?.name || "You"} (You)`,
        stream: userMediaStreamRef.current,
        isLocal: true,
        isVideoOff: isVideoOff,
        isMuted: isMuted,
        role: currentUser?.role,
        isSpeaking: speakingUsers[currentUser?._id]
      });
    }
    
    // Add remote videos
    Object.entries(remoteStreams).forEach(([userId, stream]) => {
      const participant = participants.find(p => getUserId(p) === userId);
      videos.push({
        id: userId,
        userId: userId,
        name: participant?.userId?.name || `User ${userId.slice(-4)}`,
        stream: stream,
        isLocal: false,
        isVideoOff: participant?.videoEnabled === false,
        isMuted: participant?.audioEnabled === false,
        role: participant?.role || "student",
        isSpeaking: speakingUsers[userId]
      });
    });
    
    return videos;
  };

  const videos = getAllVideoStreams();
  const pinnedVideoStream = pinnedVideo ? videos.find(v => v.id === pinnedVideo) : null;
  const otherVideos = pinnedVideo ? videos.filter(v => v.id !== pinnedVideo) : videos;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <Loader2 className="animate-spin h-12 w-12 text-indigo-500" />
      </div>
    );
  }

  if (!liveClass) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 px-4">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Class Not Found</h2>
          <button onClick={() => navigate(getDashboardPath())} className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded-lg">
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
        <div className="fixed top-16 right-4 z-50 bg-red-500/90 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center gap-2">
          <WifiOff className="h-3 w-3 text-white" />
          <span className="text-white text-xs">Reconnecting...</span>
        </div>
      )}
      
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 px-4 md:px-6 py-2 md:py-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex-1 min-w-0">
            <h1 className="text-sm md:text-lg font-semibold text-gray-900 dark:text-white truncate">{liveClass.title}</h1>
            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              <span className="hidden sm:inline">{new Date(liveClass.scheduledStartTime).toLocaleDateString()}</span>
              <span className="truncate">{liveClass.lecturerId?.name || "Lecturer"}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleDarkMode} className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800">
              {darkMode ? <Sun className="h-4 w-4 text-yellow-500" /> : <Moon className="h-4 w-4 text-gray-600" />}
            </button>
            
            <div className="flex items-center gap-2 px-3 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800">
              <div className={`w-1.5 h-1.5 rounded-full ${isClassActive && isJoined ? "bg-green-500 animate-pulse" : isClassActive ? "bg-yellow-500" : "bg-gray-500"}`} />
              <span className="text-xs text-gray-600 dark:text-gray-300 hidden sm:inline">
                {isClassActive && isJoined ? "Connected" : isClassActive ? "Live" : "Scheduled"}
              </span>
            </div>
            
            {isJoined && (
              <div className="flex items-center gap-2 px-3 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-500/20">
                <Clock className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs text-indigo-600 dark:text-indigo-400 font-mono">{formatDuration(duration)}</span>
              </div>
            )}
            
            <button onClick={() => setShowInviteModal(true)} className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm">
              <Users className="h-4 w-4" /> Invite
            </button>
            <button onClick={() => setShowSidebar(!showSidebar)} className="sm:hidden p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800">
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col sm:flex-row h-[calc(100vh-52px)]">
        <div className="flex-1 p-4 min-h-0">
          <div className="bg-gray-900 rounded-xl overflow-hidden h-full relative">
            {isJoined && isClassActive && socketConnected ? (
              <>
                {videos.length === 0 && !pinnedVideoStream ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-gray-500">
                      <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Waiting for participants to join...</p>
                    </div>
                  </div>
                ) : (
                  <div className={`grid ${pinnedVideoStream ? 'grid-cols-1 lg:grid-cols-4' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'} gap-4 h-full overflow-y-auto p-4`}>
                    {/* Pinned video (if any) */}
                    {pinnedVideoStream && (
                      <div className="lg:col-span-3 relative bg-gray-800 rounded-xl overflow-hidden">
                        <VideoTile 
                          video={pinnedVideoStream}
                          isPinned={true}
                        />
                        <button 
                          onClick={() => setPinnedVideo(null)} 
                          className="absolute top-4 right-4 p-2 rounded-lg bg-black/50 hover:bg-black/70 z-10"
                        >
                          <X className="h-4 w-4 text-white" />
                        </button>
                      </div>
                    )}
                    
                    {/* All videos */}
                    {(pinnedVideoStream ? otherVideos : videos).map(video => (
                      <VideoTile 
                        key={video.id} 
                        video={video}
                        isPinned={false}
                        onPin={() => setPinnedVideo(pinnedVideo === video.id ? null : video.id)}
                        isPinnedActive={pinnedVideo === video.id}
                      />
                    ))}
                  </div>
                )}
                
                {/* Controls */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-3 bg-black/80 backdrop-blur-sm rounded-full px-5 py-2 z-10">
                  <button onClick={toggleMute} className={`p-2.5 rounded-full transition-colors ${isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'}`}>
                    {isMuted ? <MicOff className="h-4 w-4 text-white" /> : <Mic className="h-4 w-4 text-white" />}
                  </button>
                  <button onClick={toggleVideo} className={`p-2.5 rounded-full transition-colors ${isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'}`}>
                    {isVideoOff ? <VideoOff className="h-4 w-4 text-white" /> : <Video className="h-4 w-4 text-white" />}
                  </button>
                  {currentUser?.role === "lecturer" && (
                    <button onClick={toggleScreenShare} className={`p-2.5 rounded-full transition-colors ${isScreenSharing ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-700 hover:bg-gray-600'}`}>
                      {isScreenSharing ? <StopCircle className="h-4 w-4 text-white" /> : <ScreenShare className="h-4 w-4 text-white" />}
                    </button>
                  )}
                  <button onClick={() => setLayout(layout === "grid" ? "speaker" : "grid")} className="p-2.5 rounded-full bg-gray-700 hover:bg-gray-600">
                    {layout === "grid" ? <List className="h-4 w-4 text-white" /> : <Grid className="h-4 w-4 text-white" />}
                  </button>
                  <button onClick={leaveClass} className="p-2.5 rounded-full bg-red-500 hover:bg-red-600">
                    <PhoneOff className="h-4 w-4 text-white" />
                  </button>
                </div>
              </>
            ) : isClassActive ? (
              <div className="flex flex-col items-center justify-center h-full px-4">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <Video className="h-10 w-10 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-white mb-2">Ready to join?</h2>
                  <button onClick={joinClass} disabled={isConnecting || !socketConnected} className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-semibold flex items-center gap-2">
                    {isConnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : !socketConnected ? <WifiOff className="h-4 w-4" /> : null}
                    {isConnecting ? "Connecting..." : !socketConnected ? "Connecting..." : "Join Class"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full px-4">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
                    <Calendar className="h-10 w-10 text-gray-500" />
                  </div>
                  <h2 className="text-xl font-bold text-white mb-2">Class Not Started</h2>
                  <p className="text-gray-400 text-sm">Starts on {new Date(liveClass.scheduledStartTime).toLocaleString()}</p>
                  <button onClick={() => navigate(getLiveClassesPath())} className="mt-4 px-4 py-2 bg-gray-700 rounded-lg text-white text-sm">
                    Back to Live Classes
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
          <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-800 sm:hidden">
            <h3 className="text-gray-900 dark:text-white font-semibold">Chat & Participants</h3>
            <button onClick={() => setShowSidebar(false)} className="p-1 rounded-lg bg-gray-100 dark:bg-gray-800">
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>
          
          <div className="flex border-b border-gray-200 dark:border-gray-800">
            <button onClick={() => { setShowChat(true); setShowParticipants(false); }} className={`flex-1 py-2.5 text-sm transition-colors ${showChat ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600" : "text-gray-500"}`}>
              <MessageSquare className="h-3.5 w-3.5 inline mr-1" /> Chat
            </button>
            <button onClick={() => { setShowChat(false); setShowParticipants(true); }} className={`flex-1 py-2.5 text-sm transition-colors ${showParticipants ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600" : "text-gray-500"}`}>
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
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-gray-900 dark:text-white">{msg.userName}</span>
                        <span className="text-[10px] text-gray-500">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5 break-words">{msg.message}</p>
                    </div>
                  </div>
                ))}
                {chatMessages.length === 0 && <div className="text-center text-gray-500 text-sm py-8">No messages yet</div>}
              </div>
              {isJoined && isClassActive && (
                <form onSubmit={sendMessage} className="p-3 border-t border-gray-200 dark:border-gray-800">
                  <div className="flex gap-2">
                    <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." className="flex-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white text-sm rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:border-indigo-500" />
                    <button type="submit" className="p-1.5 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"><Send className="h-4 w-4" /></button>
                  </div>
                </form>
              )}
            </div>
          )}

          {showParticipants && (
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {participants
                .filter(p => p && p.active && !p.leftAt)
                .map((p, idx) => {
                  const pid = getUserId(p);
                  const pName = getUserName(p);
                  return (
                    <div key={pid || idx} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">{pName?.charAt(0) || "U"}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{pName}</p>
                        <p className="text-xs text-gray-500">{p.role === "lecturer" ? "Host" : p.role === "admin" ? "Admin" : "Student"}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {p.audioEnabled === false && <MicOff className="h-3 w-3 text-red-400" />}
                        {p.videoEnabled === false && <VideoOff className="h-3 w-3 text-red-400" />}
                        {speakingUsers[pid] && <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />}
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

      {/* Hidden local video element */}
      <video ref={localVideoRef} autoPlay playsInline muted className="hidden" />

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Invite Participants</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Share this link:</p>
            <div className="flex gap-2 mb-4">
              <input type="text" value={inviteLink} readOnly className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white text-sm rounded-lg border border-gray-300 truncate" />
              <button onClick={copyInviteLink} className="px-3 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 flex items-center gap-1 text-sm">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <button onClick={() => setShowInviteModal(false)} className="w-full py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 text-sm">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

// Video Tile Component
const VideoTile = ({ video, isPinned = false, onPin, isPinnedActive = false }) => {
  const videoRef = useRef(null);
  
  useEffect(() => {
    if (videoRef.current && video.stream) {
      if (videoRef.current.srcObject !== video.stream) {
        videoRef.current.srcObject = video.stream;
        videoRef.current.play().catch(e => console.log("Video play error:", e));
      }
    }
  }, [video.stream]);
  
  const shouldShowVideo = !video.isVideoOff && video.stream;
  
  return (
    <div className={`relative bg-gray-800 rounded-xl overflow-hidden group ${isPinned ? 'h-full' : 'aspect-video'} ${video.isSpeaking ? 'ring-2 ring-green-500' : ''}`}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={video.isLocal}
        className="w-full h-full object-cover"
      />
      
      {!shouldShowVideo && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-indigo-500/30 flex items-center justify-center mb-2">
              <span className="text-2xl font-bold text-indigo-400">{video.name?.charAt(0) || "U"}</span>
            </div>
            <p className="text-white text-sm font-medium">{video.name}</p>
            {video.isVideoOff && <p className="text-xs text-gray-400 mt-1">Camera off</p>}
          </div>
        </div>
      )}
      
      {/* Speaking indicator */}
      {!video.isLocal && video.isSpeaking && (
        <div className="absolute top-3 left-3 bg-green-500/80 backdrop-blur-sm rounded-full px-2 py-0.5 text-white text-xs flex items-center gap-1">
          <Volume2 className="h-3 w-3" />
          Speaking
        </div>
      )}
      
      {/* Video info overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-white text-sm font-medium truncate max-w-[150px]">{video.name}</span>
            {video.role === "lecturer" && (
              <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-xs">Host</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {video.isMuted && <MicOff className="h-4 w-4 text-red-400" />}
            {video.isVideoOff && <VideoOff className="h-4 w-4 text-red-400" />}
          </div>
        </div>
      </div>
      
      {/* Pin button */}
      {!video.isLocal && onPin && (
        <button 
          onClick={() => onPin()} 
          className={`absolute top-3 right-3 p-1.5 rounded-lg bg-black/50 hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity ${isPinnedActive ? 'text-indigo-400' : 'text-white'}`}
        >
          <Pin className={`h-3.5 w-3.5 ${isPinnedActive ? 'fill-indigo-400' : ''}`} />
        </button>
      )}
    </div>
  );
};

export default LiveClassRoom;