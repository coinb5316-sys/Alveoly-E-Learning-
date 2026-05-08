// pages/lecturer/LecturerStudentProgress.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import {
  ArrowLeft, User, Mail, Calendar, Award, TrendingUp,
  BookOpen, CheckCircle, XCircle, Clock, Loader2,
  BarChart3, FileText, Star, Activity
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const LecturerStudentProgress = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentReport();
  }, [studentId]);

  const fetchStudentReport = async () => {
    try {
      const res = await axios.get(`/api/lecturer/reports/student/${studentId}`);
      if (res.data.success) {
        setReport(res.data.report);
      }
    } catch (err) {
      console.error("Fetch report error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Student not found</p>
        <button onClick={() => navigate("/lecturer/students")} className="text-blue-600 mt-4">
          Back to Students
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/lecturer/students")}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Student Progress Report
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Detailed performance analytics and learning insights
          </p>
        </div>
      </div>

      {/* Student Info */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-xl">
                {report.studentInfo?.name?.charAt(0) || "S"}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {report.studentInfo?.name}
              </h2>
              <div className="flex flex-wrap items-center gap-3 mt-1">
                <span className="inline-flex items-center gap-1 text-sm text-gray-500">
                  <Mail className="h-4 w-4" />
                  {report.studentInfo?.email}
                </span>
                <span className="inline-flex items-center gap-1 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  Student ID: {report.studentInfo?._id?.slice(-6)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">{report.summary?.averageScore}%</p>
              <p className="text-xs text-gray-500">Overall Average</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl bg-blue-50 dark:bg-blue-950/20 p-4">
          <p className="text-2xl font-bold text-blue-600">{report.summary?.totalAttempts || 0}</p>
          <p className="text-xs text-gray-600">Total Attempts</p>
        </div>
        <div className="rounded-xl bg-green-50 dark:bg-green-950/20 p-4">
          <p className="text-2xl font-bold text-green-600">{report.summary?.completedAttempts || 0}</p>
          <p className="text-xs text-gray-600">Completed</p>
        </div>
        <div className="rounded-xl bg-purple-50 dark:bg-purple-950/20 p-4">
          <p className="text-2xl font-bold text-purple-600">{report.summary?.passedCount || 0}</p>
          <p className="text-xs text-gray-600">Passed</p>
        </div>
        <div className="rounded-xl bg-orange-50 dark:bg-orange-950/20 p-4">
          <p className="text-2xl font-bold text-orange-600">{Math.floor(report.summary?.totalTimeSpent / 60) || 0}m</p>
          <p className="text-xs text-gray-600">Total Time</p>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Performance Trend
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={report.contentBreakdown || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="title" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="percentage" stroke="#3b82f6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Content Breakdown */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Content Performance Breakdown
        </h3>
        <div className="space-y-4">
          {report.contentBreakdown?.map((item, idx) => (
            <div key={idx} className="border-b border-gray-100 dark:border-gray-800 pb-4 last:border-0">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{item.title}</p>
                  <p className="text-sm text-gray-500 capitalize">{item.type}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{item.percentage}%</p>
                    <p className="text-xs text-gray-500">{item.score}/{item.totalPoints} pts</p>
                  </div>
                  {item.isPassed ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
              </div>
              <div className="mt-2">
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${item.isPassed ? 'bg-green-500' : 'bg-red-500'}`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weak & Strong Areas */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <h3 className="text-sm font-semibold text-red-600 mb-4 flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            Areas for Improvement
          </h3>
          {report.weakAreas?.length > 0 ? (
            <ul className="space-y-2">
              {report.weakAreas.map((area, idx) => (
                <li key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  {area}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No weak areas identified</p>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <h3 className="text-sm font-semibold text-green-600 mb-4 flex items-center gap-2">
            <Star className="h-4 w-4" />
            Strengths
          </h3>
          {report.strongAreas?.length > 0 ? (
            <ul className="space-y-2">
              {report.strongAreas.map((area, idx) => (
                <li key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  {area}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">Continue building strengths</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LecturerStudentProgress;