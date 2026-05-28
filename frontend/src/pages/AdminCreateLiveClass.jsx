// pages/admin/AdminCreateLiveClass.jsx - WITH PROGRAM SUPPORT
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../../api/axios";
import { 
  Calendar, 
  Clock, 
  Users, 
  BookOpen, 
  GraduationCap,
  Video,
  Save,
  ArrowLeft,
  Loader2
} from "lucide-react";
import toast from "react-hot-toast";

const AdminCreateLiveClass = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  const [programs, setPrograms] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    programId: "",
    courseId: "",
    subjectId: "",
    lecturerId: "",
    scheduledStartTime: "",
    scheduledEndTime: "",
    maxParticipants: 100
  });

  useEffect(() => {
    fetchFormData();
    if (isEditing) {
      fetchLiveClass();
    }
  }, []);

  useEffect(() => {
    if (formData.programId) {
      fetchCoursesByProgram(formData.programId);
    } else {
      setCourses([]);
      setSubjects([]);
    }
  }, [formData.programId]);

  useEffect(() => {
    if (formData.courseId && formData.programId) {
      fetchSubjectsByCourse(formData.courseId, formData.programId);
    } else {
      setSubjects([]);
    }
  }, [formData.courseId]);

  const fetchFormData = async () => {
    try {
      // Fetch programs
      const programsRes = await axios.get("/live-class/admin/programs");
      setPrograms(programsRes.data || []);
      
      // Fetch lecturers
      const usersRes = await axios.get("/admin/users");
      const lecturersList = usersRes.data.filter(user => user.role === "lecturer");
      setLecturers(lecturersList);
    } catch (err) {
      console.error("Error fetching form data:", err);
      toast.error("Failed to load form data");
    }
  };

  const fetchCoursesByProgram = async (programId) => {
    try {
      const res = await axios.get(`/live-class/admin/courses/${programId}`);
      setCourses(res.data || []);
    } catch (err) {
      console.error("Error fetching courses:", err);
      setCourses([]);
    }
  };

  const fetchSubjectsByCourse = async (courseId, programId) => {
    try {
      const res = await axios.get(`/admin/subjects?course=${courseId}&program=${programId}`);
      setSubjects(res.data || []);
    } catch (err) {
      console.error("Error fetching subjects:", err);
      setSubjects([]);
    }
  };

  const fetchLiveClass = async () => {
    try {
      const res = await axios.get(`/live-class/${id}`);
      const cls = res.data;
      setFormData({
        title: cls.title || "",
        description: cls.description || "",
        programId: cls.programId?._id || cls.programId || "",
        courseId: cls.courseId?._id || cls.courseId || "",
        subjectId: cls.subjectId?._id || cls.subjectId || "",
        lecturerId: cls.lecturerId?._id || cls.lecturerId || "",
        scheduledStartTime: cls.scheduledStartTime ? new Date(cls.scheduledStartTime).toISOString().slice(0, 16) : "",
        scheduledEndTime: cls.scheduledEndTime ? new Date(cls.scheduledEndTime).toISOString().slice(0, 16) : "",
        maxParticipants: cls.maxParticipants || 100
      });
      
      if (cls.programId?._id) {
        await fetchCoursesByProgram(cls.programId._id);
        if (cls.courseId?._id) {
          await fetchSubjectsByCourse(cls.courseId._id, cls.programId._id);
        }
      }
    } catch (err) {
      console.error("Error fetching live class:", err);
      toast.error("Failed to load live class data");
      navigate("/admin/live-classes");
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.programId || !formData.courseId || !formData.subjectId || !formData.lecturerId || !formData.scheduledStartTime || !formData.scheduledEndTime) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    const startTime = new Date(formData.scheduledStartTime);
    const endTime = new Date(formData.scheduledEndTime);
    
    if (startTime >= endTime) {
      toast.error("End time must be after start time");
      return;
    }
    
    if (startTime < new Date()) {
      toast.error("Start time cannot be in the past");
      return;
    }
    
    setLoading(true);
    
    try {
      if (isEditing) {
        await axios.put(`/live-class/admin/${id}`, formData);
        toast.success("Live class updated successfully");
      } else {
        await axios.post("/live-class/admin/create", formData);
        toast.success("Live class created successfully");
      }
      navigate("/admin/live-classes");
    } catch (err) {
      console.error("Error saving live class:", err);
      toast.error(err.response?.data?.message || "Failed to save live class");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Reset dependent fields
    if (name === "programId") {
      setFormData(prev => ({ ...prev, courseId: "", subjectId: "" }));
    }
    if (name === "courseId") {
      setFormData(prev => ({ ...prev, subjectId: "" }));
    }
  };

  if (fetching) {
    return (
      <div className="flex justify-center items-center min-h-[50vh] py-20 px-4">
        <Loader2 className="h-8 w-8 sm:h-10 sm:w-12 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 max-w-full lg:max-w-5xl xl:max-w-6xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <button
          onClick={() => navigate("/admin/live-classes")}
          className="group inline-flex items-center gap-2 text-sm sm:text-base text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors mb-3 sm:mb-4"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Live Classes
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white break-words">
          {isEditing ? "Edit Live Class" : "Schedule New Live Class"}
        </h1>
        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1 sm:mt-2">
          {isEditing ? "Update the class details" : "Create a new live class and assign a lecturer"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5 md:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
            <Video className="h-5 w-5 text-indigo-500 flex-shrink-0" />
            <span>Basic Information</span>
          </h2>
          
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Class Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="e.g., Introduction to Web Development"
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="Provide details about the class..."
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5 md:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-indigo-500 flex-shrink-0" />
            <span>Program & Course Assignment</span>
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Program *
              </label>
              <select
                name="programId"
                value={formData.programId}
                onChange={handleChange}
                required
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              >
                <option value="">Select a program</option>
                {programs.map(program => (
                  <option key={program._id} value={program._id}>{program.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Course *
              </label>
              <select
                name="courseId"
                value={formData.courseId}
                onChange={handleChange}
                required
                disabled={!formData.programId}
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <option value="">Select a course</option>
                {courses.map(course => (
                  <option key={course._id} value={course._id}>{course.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Subject *
              </label>
              <select
                name="subjectId"
                value={formData.subjectId}
                onChange={handleChange}
                required
                disabled={!formData.courseId}
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <option value="">Select a subject</option>
                {subjects.map(subject => (
                  <option key={subject._id} value={subject._id}>{subject.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Lecturer *
              </label>
              <select
                name="lecturerId"
                value={formData.lecturerId}
                onChange={handleChange}
                required
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              >
                <option value="">Select a lecturer</option>
                {lecturers.map(lecturer => (
                  <option key={lecturer._id} value={lecturer._id}>{lecturer.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Max Participants
              </label>
              <input
                type="number"
                name="maxParticipants"
                value={formData.maxParticipants}
                onChange={handleChange}
                min={1}
                max={500}
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5 md:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-indigo-500 flex-shrink-0" />
            <span>Schedule</span>
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Start Time *
              </label>
              <input
                type="datetime-local"
                name="scheduledStartTime"
                value={formData.scheduledStartTime}
                onChange={handleChange}
                required
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                End Time *
              </label>
              <input
                type="datetime-local"
                name="scheduledEndTime"
                value={formData.scheduledEndTime}
                onChange={handleChange}
                required
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-2 sm:pt-0">
          <button
            type="button"
            onClick={() => navigate("/admin/live-classes")}
            className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {loading ? "Saving..." : isEditing ? "Update Class" : "Schedule Class"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminCreateLiveClass;