// pages/lecturer/LecturerProfile.jsx
import { useEffect, useState } from "react";
import axios from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import {
  User, Mail, Phone, Building, BookOpen, Award,
  Calendar, Edit2, Save, X, Loader2, Camera,
  Briefcase, GraduationCap, MapPin, Globe
} from "lucide-react";

const LecturerProfile = () => {
  const { user, setUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    lecturerInfo: {
      department: "",
      title: "",
      specialization: "",
      bio: "",
      phoneNumber: ""
    }
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        lecturerInfo: {
          department: user.lecturerInfo?.department || "",
          title: user.lecturerInfo?.title || "",
          specialization: user.lecturerInfo?.specialization || "",
          bio: user.lecturerInfo?.bio || "",
          phoneNumber: user.lecturerInfo?.phoneNumber || ""
        }
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("lecturerInfo.")) {
      const field = name.split(".")[1];
      setFormData(prev => ({
        ...prev,
        lecturerInfo: { ...prev.lecturerInfo, [field]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.put("/api/lecturer/profile", formData);
      if (res.data.success) {
        setUser({ ...user, ...formData });
        setEditing(false);
        alert("Profile updated successfully!");
      }
    } catch (err) {
      console.error("Update profile error:", err);
      alert(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            My Profile
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your personal and professional information
          </p>
        </div>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit2 className="h-4 w-4" />
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => setEditing(false)}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Profile Card */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
        {/* Cover Photo */}
        <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 relative">
          <div className="absolute -bottom-12 left-6">
            <div className="relative">
              <div className="h-24 w-24 rounded-full bg-white dark:bg-gray-900 p-1">
                <div className="h-full w-full rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">
                    {formData.name?.charAt(0) || "L"}
                  </span>
                </div>
              </div>
              <button className="absolute bottom-0 right-0 p-1.5 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition-colors">
                <Camera className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="pt-16 p-6">
          {!editing ? (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {formData.name}
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                  {formData.lecturerInfo.title} {formData.lecturerInfo.specialization && `- ${formData.lecturerInfo.specialization}`}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                  <Mail className="h-4 w-4" />
                  <span>{formData.email}</span>
                </div>
                {formData.lecturerInfo.phoneNumber && (
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                    <Phone className="h-4 w-4" />
                    <span>{formData.lecturerInfo.phoneNumber}</span>
                  </div>
                )}
                {formData.lecturerInfo.department && (
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                    <Building className="h-4 w-4" />
                    <span>{formData.lecturerInfo.department}</span>
                  </div>
                )}
                {formData.lecturerInfo.specialization && (
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                    <Award className="h-4 w-4" />
                    <span>{formData.lecturerInfo.specialization}</span>
                  </div>
                )}
              </div>

              {formData.lecturerInfo.bio && (
                <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">About</h3>
                  <p className="text-gray-600 dark:text-gray-400">{formData.lecturerInfo.bio}</p>
                </div>
              )}
            </div>
          ) : (
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50 text-gray-500"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title
                  </label>
                  <select
                    name="lecturerInfo.title"
                    value={formData.lecturerInfo.title}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                  >
                    <option value="">Select Title</option>
                    <option value="Dr.">Dr.</option>
                    <option value="Prof.">Prof.</option>
                    <option value="Mr.">Mr.</option>
                    <option value="Mrs.">Mrs.</option>
                    <option value="Ms.">Ms.</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Department
                  </label>
                  <input
                    type="text"
                    name="lecturerInfo.department"
                    value={formData.lecturerInfo.department}
                    onChange={handleChange}
                    placeholder="e.g., Computer Science"
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Specialization
                </label>
                <input
                  type="text"
                  name="lecturerInfo.specialization"
                  value={formData.lecturerInfo.specialization}
                  onChange={handleChange}
                  placeholder="e.g., Web Development, AI, Database"
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="lecturerInfo.phoneNumber"
                  value={formData.lecturerInfo.phoneNumber}
                  onChange={handleChange}
                  placeholder="+1234567890"
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bio / About
                </label>
                <textarea
                  name="lecturerInfo.bio"
                  value={formData.lecturerInfo.bio}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Tell your students about yourself, your experience, and teaching philosophy..."
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 resize-none"
                />
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LecturerProfile;