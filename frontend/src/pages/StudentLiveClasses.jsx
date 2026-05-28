// pages/student/StudentLiveClasses.jsx - FIXED to use correct API endpoint
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { 
  Video, 
  Calendar, 
  Clock, 
  Users, 
  Play, 
  User,
  CheckCircle,
  AlertCircle,
  GraduationCap,
  MonitorPlay
} from "lucide-react";
import toast from "react-hot-toast";

const StudentLiveClasses = () => {
  const navigate = useNavigate();
  const [liveClasses, setLiveClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [userProgram, setUserProgram] = useState(null);
  const [userProgramId, setUserProgramId] = useState(null);

  useEffect(() => {
    fetchUserProgram();
  }, []);

  const fetchUserProgram = async () => {
    try {
      // ✅ FIXED: Use /auth/me instead of /users/profile
      const res = await axios.get("/auth/me");
      const userData = res.data;
      
      console.log("User data:", userData);
      
      // Get the program ID from user's program field
      const programId = userData.programId?._id || userData.programId;
      setUserProgramId(programId);
      
      if (programId) {
        // Get program name from user data or fetch separately
        if (userData.programId?.name) {
          setUserProgram(userData.programId);
        } else {
          // Fetch program details if not populated
          try {
            const programRes = await axios.get(`/admin/programs/${programId}`);
            setUserProgram(programRes.data);
          } catch (err) {
            console.error("Error fetching program details:", err);
          }
        }
        // Then fetch live classes for this program
        fetchLiveClasses(programId);
      } else {
        // If no program assigned, show all classes or show message
        console.log("No program assigned to this student");
        setUserProgram({ name: "All Classes" });
        fetchLiveClasses(null);
      }
    } catch (err) {
      console.error("Error fetching user program:", err);
      toast.error("Failed to load your information");
      // Try to fetch all classes as fallback
      fetchLiveClasses(null);
    }
  };

  const fetchLiveClasses = async (programId) => {
    try {
      setLoading(true);
      
      let url = "/live-class/student/my-classes";
      if (programId) {
        url += `?programId=${programId}`;
      }
      
      const res = await axios.get(url);
      setLiveClasses(res.data);
      console.log(`Found ${res.data.length} live classes`);
    } catch (err) {
      console.error("Error fetching live classes:", err);
      toast.error("Failed to load live classes");
      setLiveClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const joinClass = async (classId) => {
    try {
      await axios.post(`/live-class/${classId}/join`);
      toast.success("Joined class!");
      navigate(`/student/live-class/${classId}`);
    } catch (err) {
      console.error("Error joining class:", err);
      toast.error(err.response?.data?.message || "Failed to join class");
    }
  };

  const filteredClasses = liveClasses.filter(cls => {
    if (activeTab === "upcoming") return cls.status === "scheduled";
    if (activeTab === "live") return cls.status === "ongoing";
    if (activeTab === "past") return cls.status === "completed";
    return true;
  });

  const getStatusBadge = (status, scheduledTime) => {
    const now = new Date();
    const scheduled = new Date(scheduledTime);
    const canJoin = scheduled - now <= 15 * 60 * 1000 && scheduled - now > 0;
    
    if (status === "ongoing") {
      return { text: "Live Now", color: "bg-green-500", icon: Play };
    }
    if (status === "scheduled" && canJoin) {
      return { text: "Join Now", color: "bg-yellow-500", icon: AlertCircle };
    }
    if (status === "scheduled") {
      return { text: "Upcoming", color: "bg-blue-500", icon: Calendar };
    }
    return { text: "Completed", color: "bg-gray-500", icon: CheckCircle };
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Live Classes</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          {userProgram ? `Classes for ${userProgram.name}` : "Your live virtual classes"}
        </p>
      </div>

      {/* Program Info Card */}
      {userProgram && userProgram.name !== "All Classes" && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-xl p-4 border border-indigo-100 dark:border-indigo-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Your Program</p>
              <p className="font-semibold text-gray-900 dark:text-white">{userProgram.name}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800">
        {[
          { id: "upcoming", label: "Upcoming", icon: Calendar },
          { id: "live", label: "Live Now", icon: Play },
          { id: "past", label: "Recordings", icon: MonitorPlay }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Classes Grid */}
      {filteredClasses.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl">
          <Video className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No classes found</h3>
          <p className="text-gray-500 dark:text-gray-400">
            {activeTab === "upcoming" && "No upcoming classes scheduled for your program"}
            {activeTab === "live" && "No live classes at the moment"}
            {activeTab === "past" && "No recordings available yet"}
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredClasses.map((cls) => {
            const status = getStatusBadge(cls.status, cls.scheduledStartTime);
            const StatusIcon = status.icon;
            const canJoin = cls.status === "ongoing" || 
              (cls.status === "scheduled" && new Date(cls.scheduledStartTime) - new Date() <= 15 * 60 * 1000);
            
            return (
              <div
                key={cls._id}
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-md transition-all"
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`px-2 py-1 rounded-full text-xs font-medium text-white ${status.color} flex items-center gap-1`}>
                          <StatusIcon className="h-3 w-3" />
                          {status.text}
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {cls.subjectId?.name} • {cls.courseId?.name}
                        </span>
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {cls.title}
                      </h2>
                      <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                        {cls.description || "No description provided"}
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(cls.scheduledStartTime).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {new Date(cls.scheduledStartTime).toLocaleTimeString()} - {new Date(cls.scheduledEndTime).toLocaleTimeString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {cls.lecturerId?.name || "Lecturer"}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {cls.participants?.length || 0} participants
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      {canJoin && cls.status !== "completed" && (
                        <button
                          onClick={() => joinClass(cls._id)}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                        >
                          <Video className="h-4 w-4" />
                          Join Class
                        </button>
                      )}
                      {cls.status === "completed" && cls.recordingAvailable && (
                        <button
                          onClick={() => window.open(cls.recordingUrl, '_blank')}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                        >
                          <MonitorPlay className="h-4 w-4" />
                          Watch Recording
                        </button>
                      )}
                      {cls.status === "completed" && !cls.recordingAvailable && (
                        <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-lg flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          Recording Pending
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentLiveClasses;