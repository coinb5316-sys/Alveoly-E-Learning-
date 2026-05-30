// src/pages/AdminSubscribers.jsx
import React, { useState, useEffect } from "react";
import { FaSpinner, FaEnvelope, FaUsers, FaTrash, FaDownload } from "react-icons/fa";
import API from "../api/axios";
import toast from "react-hot-toast";

const AdminSubscribers = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const res = await API.get("/blogs/subscribers");
      setSubscribers(res.data.subscribers || []);
    } catch (err) {
      console.error("Error fetching subscribers:", err);
      toast.error("Failed to load subscribers");
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async (email) => {
    if (!window.confirm(`Unsubscribe ${email}?`)) return;
    
    try {
      await API.post(`/blogs/unsubscribe/${encodeURIComponent(email)}`);
      setSubscribers(prev => prev.filter(s => s.email !== email));
      toast.success("Subscriber removed successfully!");
    } catch (err) {
      console.error("Error unsubscribing:", err);
      toast.error("Failed to remove subscriber");
    }
  };

  const exportToCSV = () => {
    const headers = ["Email", "Subscribed Date", "Status"];
    const csvData = subscribers.map(s => [
      s.email,
      new Date(s.subscribedAt).toLocaleDateString(),
      s.isActive ? "Active" : "Inactive"
    ]);
    
    const csvContent = [headers, ...csvData].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subscribers_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exporting subscribers...");
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Newsletter Subscribers</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage your email newsletter subscribers
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportToCSV}
            disabled={subscribers.length === 0}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <FaDownload /> Export CSV
          </button>
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <FaUsers className="text-blue-600" />
            <span className="font-semibold text-blue-700 dark:text-blue-400">
              {subscribers.length} Subscribers
            </span>
          </div>
        </div>
      </div>

      {/* Subscribers List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <FaSpinner className="text-4xl text-blue-600 animate-spin" />
        </div>
      ) : subscribers.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center shadow-sm border border-gray-100 dark:border-gray-700">
          <FaEnvelope className="text-5xl text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Subscribers Yet</h3>
          <p className="text-gray-500 dark:text-gray-400">
            When users subscribe to your newsletter, they will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                <tr>
                  <th className="text-left p-4 font-semibold text-gray-600 dark:text-gray-400">Email</th>
                  <th className="text-left p-4 font-semibold text-gray-600 dark:text-gray-400">Subscribed Date</th>
                  <th className="text-left p-4 font-semibold text-gray-600 dark:text-gray-400">Status</th>
                  <th className="text-left p-4 font-semibold text-gray-600 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((subscriber, idx) => (
                  <tr key={idx} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <FaEnvelope className="text-gray-400" />
                        <span className="text-gray-900 dark:text-white">{subscriber.email}</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-500 dark:text-gray-400">
                      {formatDate(subscriber.subscribedAt)}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs">
                        Active
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleUnsubscribe(subscriber.email)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSubscribers;