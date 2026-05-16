// pages/lecturer/LecturerLiveClasses.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { 
  Video, 
  Calendar, 
  Clock, 
  Users, 
  Play, 
  MoreVertical,
  Copy,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import toast from "react-hot-toast";

const LecturerLiveClasses = () => {
  const navigate = useNavigate();
  const [liveClasses, setLiveClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");

  useEffect(() => {
    fetchLiveClasses();
  }, []);

  const fetchLiveClasses = async () => {
    try {
      const res = await axios.get("/live-class/lecturer/my-classes");
      setLiveClasses(res.data);
    } catch (err) {
      console.error("Error fetching live classes:", err);
      toast.error("Failed to load live classes");
    } finally {
      setLoading(false);
    }
  };

  const startClass = async (classId) => {
    try {
      await axios.post(`/live-class/lecturer/${classId}/start`);
      toast.success("Class started!");
      navigate(`/lecturer/live-class/${classId}`);
    } catch (err) {
      console.error("Error starting class:", err);
      toast.error(err.response?.data?.message || "Failed to start class");
    }
  };

  const endClass = async (classId) => {
    if (!window.confirm("Are you sure you want to end this class?")) return;
    try {
      await axios.post(`/live-class/lecturer/${classId}/end`);
      toast.success("Class ended");
      fetchLiveClasses();
    } catch (err) {
      console.error("Error ending class:", err);
      toast.error("Failed to end class");
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
    const canStart = scheduled - now <= 15 * 60 * 1000 && scheduled - now > 0;
    
    if (status === "ongoing") {
      return { text: "Live Now", color: "bg-green-500", icon: Play };
    }
    if (status === "scheduled" && canStart) {
      return { text: "Start Soon", color: "bg-yellow-500", icon: AlertCircle };
    }
    if (status === "scheduled") {
      return { text: "Scheduled", color: "bg-blue-500", icon: Calendar };
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
        <p className="text-gray-500 dark:text-gray-400 mt-2">Manage and conduct your live virtual classes</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800">
        {[
          { id: "upcoming", label: "Upcoming", icon: Calendar },
          { id: "live", label: "Live Now", icon: Play },
          { id: "past", label: "Past Classes", icon: CheckCircle }
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
            {activeTab === "upcoming" && "No upcoming classes scheduled"}
            {activeTab === "live" && "No live classes at the moment"}
            {activeTab === "past" && "No past classes found"}
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredClasses.map((cls) => {
            const status = getStatusBadge(cls.status, cls.scheduledStartTime);
            const StatusIcon = status.icon;
            
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
                          <Users className="h-4 w-4" />
                          {cls.participants?.length || 0} participants
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      {cls.status === "ongoing" && (
                        <>
                          <button
                            onClick={() => navigate(`/lecturer/live-class/${cls._id}`)}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                          >
                            Join Class
                          </button>
                          <button
                            onClick={() => endClass(cls._id)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            End Class
                          </button>
                        </>
                      )}
                      {cls.status === "scheduled" && (
                        <button
                          onClick={() => startClass(cls._id)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Start Class
                        </button>
                      )}
                      {cls.status === "completed" && cls.recordingAvailable && (
                        <button
                          onClick={() => {/* View recording */}}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          Watch Recording
                        </button>
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

export default LecturerLiveClasses;