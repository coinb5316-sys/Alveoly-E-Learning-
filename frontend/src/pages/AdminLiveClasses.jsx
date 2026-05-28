// pages/admin/AdminLiveClasses.jsx - FULLY FIXED WITH PROPER DELETE
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { 
  Video, 
  Calendar, 
  Clock, 
  Users, 
  Plus,
  Edit,
  Trash2,
  Play,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import toast from "react-hot-toast";

const AdminLiveClasses = () => {
  const navigate = useNavigate();
  const [liveClasses, setLiveClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("");
  const [programs, setPrograms] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);

  useEffect(() => {
    fetchLiveClasses();
    fetchPrograms();
  }, []);

  const fetchLiveClasses = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/live-class/admin/all");
      console.log("Fetched live classes:", res.data);
      setLiveClasses(res.data || []);
    } catch (err) {
      console.error("Error fetching live classes:", err);
      toast.error("Failed to load live classes");
    } finally {
      setLoading(false);
    }
  };

  const fetchPrograms = async () => {
    try {
      const res = await axios.get("/admin/programs");
      setPrograms(res.data || []);
    } catch (err) {
      console.error("Error fetching programs:", err);
      setPrograms([]);
    }
  };

  const handleDelete = async () => {
    if (!selectedClass || !selectedClass._id) {
      toast.error("No class selected for deletion");
      return;
    }
    
    setDeleting(true);
    try {
      console.log(`Deleting class with ID: ${selectedClass._id}`);
      const response = await axios.delete(`/live-class/admin/${selectedClass._id}`);
      console.log("Delete response:", response.data);
      
      toast.success(`"${selectedClass.title}" deleted successfully`);
      
      // Refresh the list
      await fetchLiveClasses();
      
      // Close modal
      setShowDeleteModal(false);
      setSelectedClass(null);
    } catch (err) {
      console.error("Error deleting live class:", err);
      console.error("Error response:", err.response?.data);
      
      if (err.response?.status === 400) {
        toast.error(err.response?.data?.message || "Cannot delete this class. It may be ongoing or completed.");
      } else if (err.response?.status === 404) {
        toast.error("Class not found. It may have been already deleted.");
      } else {
        toast.error("Failed to delete live class. Please try again.");
      }
    } finally {
      setDeleting(false);
    }
  };

  // Filter classes based on tab, search, and program
  const filteredClasses = liveClasses.filter(cls => {
    if (!cls) return false;
    if (activeTab !== "all" && cls.status !== activeTab) return false;
    if (searchTerm && !cls.title?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (selectedProgram && cls.programId?._id !== selectedProgram && cls.programId !== selectedProgram) return false;
    return true;
  });

  const getStatusBadge = (status) => {
    switch(status) {
      case "ongoing":
        return { text: "Live Now", color: "bg-green-500", icon: Play };
      case "scheduled":
        return { text: "Scheduled", color: "bg-blue-500", icon: Calendar };
      case "completed":
        return { text: "Completed", color: "bg-gray-500", icon: CheckCircle };
      case "cancelled":
        return { text: "Cancelled", color: "bg-red-500", icon: XCircle };
      default:
        return { text: status || "Unknown", color: "bg-gray-500", icon: AlertCircle };
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-12 w-12 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Live Classes</h1>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1 sm:mt-2">
            Manage all live classes across the platform
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/live-classes/create")}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 text-sm sm:text-base"
        >
          <Plus className="h-4 w-4" />
          Schedule Class
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value)}
            className="px-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Programs</option>
            {programs.map(program => (
              <option key={program._id} value={program._id}>{program.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 sm:gap-2 border-b border-gray-200 dark:border-gray-800">
        {[
          { id: "all", label: "All Classes", icon: Video },
          { id: "scheduled", label: "Scheduled", icon: Calendar },
          { id: "ongoing", label: "Live Now", icon: Play },
          { id: "completed", label: "Completed", icon: CheckCircle }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
            }`}
          >
            <tab.icon className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
          </button>
        ))}
      </div>

      {/* Classes Table */}
      {filteredClasses.length === 0 ? (
        <div className="text-center py-12 sm:py-20 bg-white dark:bg-gray-900 rounded-2xl">
          <Video className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">No classes found</h3>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
            Try adjusting your filters or create a new class
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Class</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Program/Course</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Lecturer</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Schedule</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {filteredClasses.map((cls) => {
                  const status = getStatusBadge(cls.status);
                  const StatusIcon = status.icon;
                  const canDelete = cls.status !== "ongoing";
                  
                  return (
                    <tr key={cls._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 sm:px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">{cls.title}</p>
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{cls.description || "No description"}</p>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <div className="space-y-1">
                          <p className="text-sm text-gray-900 dark:text-white">{cls.programId?.name || "N/A"}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{cls.courseId?.name} • {cls.subjectId?.name}</p>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-[10px] sm:text-xs font-bold">
                              {cls.lecturerId?.name?.charAt(0) || "L"}
                            </span>
                          </div>
                          <span className="text-xs sm:text-sm text-gray-900 dark:text-white truncate max-w-[100px] sm:max-w-none">
                            {cls.lecturerId?.name || "Unknown"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                            <Calendar className="h-3 w-3 flex-shrink-0" />
                            <span>{new Date(cls.scheduledStartTime).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <Clock className="h-3 w-3 flex-shrink-0" />
                            <span>{new Date(cls.scheduledStartTime).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white ${status.color}`}>
                          <StatusIcon className="h-3 w-3" />
                          {status.text}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {cls.status === "ongoing" && (
                            <button
                              onClick={() => navigate(`/admin/live-class/${cls._id}`)}
                              className="p-1.5 rounded-lg bg-green-500 hover:bg-green-600 transition-colors"
                              title="Join Class"
                            >
                              <Play className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                            </button>
                          )}
                          <button
                            onClick={() => navigate(`/admin/live-classes/${cls._id}/edit`)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            title="Edit Class"
                          >
                            <Edit className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                          </button>
                          <button
                            onClick={() => {
                              if (!canDelete) {
                                toast.error("Cannot delete an ongoing class. Please end it first.");
                                return;
                              }
                              setSelectedClass(cls);
                              setShowDeleteModal(true);
                            }}
                            className={`p-1.5 rounded-lg transition-colors ${
                              canDelete 
                                ? "hover:bg-red-100 dark:hover:bg-red-950/30 text-red-500" 
                                : "opacity-50 cursor-not-allowed"
                            }`}
                            title={canDelete ? "Delete Class" : "Cannot delete ongoing class"}
                            disabled={!canDelete}
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedClass && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">Delete Live Class</h3>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-6">
              Are you sure you want to delete <span className="font-medium text-gray-900 dark:text-white">"{selectedClass.title}"</span>? 
              This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedClass(null);
                }}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLiveClasses;