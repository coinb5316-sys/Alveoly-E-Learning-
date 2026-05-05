// AdminPlans.jsx - Professional styling with dark mode
import { useEffect, useState } from "react";
import axios from "../api/axios";
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  DollarSign,
  Clock,
  BookOpen,
  CheckCircle,
  AlertCircle,
  Loader2,
  Zap,
  Crown,
  Star,
  ChevronRight,
  Filter,
  Search,
  Calendar,
  Tag,
  Users
} from "lucide-react";

const AdminPlans = () => {
  const [plans, setPlans] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [form, setForm] = useState({
    title: "",
    price: "",
    subjects: [],
    duration: "",
    durationUnit: "days",
  });

  const [editingId, setEditingId] = useState(null);

  // ================= FETCH =================
  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/plans");
      setPlans(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await axios.get("/subjects");
      setSubjects(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPlans();
    fetchSubjects();
  }, []);

  // ================= HANDLE =================
  const handleSubmit = async () => {
    if (!form.title || !form.price || !form.duration) {
      alert("Please fill all required fields");
      return;
    }

    try {
      setSaving(true);

      if (editingId) {
        await axios.put(`/plans/${editingId}`, form);
      } else {
        await axios.post("/plans", form);
      }

      resetForm();
      fetchPlans();
    } catch (err) {
      console.error(err);
      alert("Failed to save plan");
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setForm({
      title: "",
      price: "",
      subjects: [],
      duration: "",
      durationUnit: "days",
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (plan) => {
    setForm({
      title: plan.title,
      price: plan.price,
      subjects: plan.subjects.map((s) => s._id),
      duration: plan.duration || "",
      durationUnit: plan.durationUnit || "days",
    });
    setEditingId(plan._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this plan? This action cannot be undone.")) return;

    try {
      await axios.delete(`/plans/${id}`);
      fetchPlans();
    } catch (err) {
      console.error(err);
      alert("Failed to delete plan");
    }
  };

  const toggleSubject = (id) => {
    setForm((prev) => ({
      ...prev,
      subjects: prev.subjects.includes(id)
        ? prev.subjects.filter((s) => s !== id)
        : [...prev.subjects, id],
    }));
  };

  const filteredPlans = plans.filter(plan =>
    plan.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const durationUnits = [
    { value: "minutes", label: "Minutes", icon: Clock },
    { value: "hours", label: "Hours", icon: Clock },
    { value: "days", label: "Days", icon: Calendar },
    { value: "weeks", label: "Weeks", icon: Calendar },
    { value: "months", label: "Months", icon: Calendar },
  ];

  const getDurationUnitIcon = (unit) => {
    const found = durationUnits.find(u => u.value === unit);
    return found?.icon || Clock;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
            Subscription Plans
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Create and manage subscription plans for students
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <Package className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {plans.length} Plans
            </span>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all shadow-lg shadow-blue-500/25"
          >
            <Plus className="h-4 w-4" />
            New Plan
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Plans</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
                {plans.length}
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
              <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active Subscriptions</p>
              <p className="text-2xl font-semibold text-green-600 dark:text-green-400 mt-1">
                N/A
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-green-50 dark:bg-green-950/30 flex items-center justify-center">
              <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Monthly Revenue</p>
              <p className="text-2xl font-semibold text-yellow-600 dark:text-yellow-400 mt-1">
                ₵0
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-yellow-50 dark:bg-yellow-950/30 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Subjects Covered</p>
              <p className="text-2xl font-semibold text-purple-600 dark:text-purple-400 mt-1">
                {subjects.length}
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Create/Edit Plan Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl relative shadow-2xl animate-scaleIn my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  {editingId ? (
                    <Edit className="h-4 w-4 text-white" />
                  ) : (
                    <Plus className="h-4 w-4 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {editingId ? "Edit Plan" : "Create New Plan"}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    {editingId ? "Update plan details" : "Add a new subscription plan"}
                  </p>
                </div>
              </div>
              <button
                onClick={resetForm}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Plan Title
                  </label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="e.g., Basic Plan, Premium Plan"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Price (GHS)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      placeholder="e.g., 99"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Duration
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      placeholder="e.g., 30"
                      value={form.duration}
                      onChange={(e) => setForm({ ...form, duration: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Duration Unit
                  </label>
                  <select
                    value={form.durationUnit}
                    onChange={(e) => setForm({ ...form, durationUnit: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  >
                    {durationUnits.map((unit) => (
                      <option key={unit.value} value={unit.value}>
                        {unit.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Included Subjects
                </label>
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <div className="max-h-64 overflow-y-auto p-3 space-y-1 bg-gray-50 dark:bg-gray-800/30">
                    {subjects.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                        No subjects available. Create subjects first.
                      </p>
                    ) : (
                      subjects.map((s) => (
                        <label
                          key={s._id}
                          className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                            form.subjects.includes(s._id)
                              ? "bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800"
                              : "hover:bg-gray-100 dark:hover:bg-gray-800"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={form.subjects.includes(s._id)}
                            onChange={() => toggleSubject(s._id)}
                            className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                          />
                          <div className="flex-1">
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {s.name}
                            </span>
                            {s.isPaid && (
                              <span className="ml-2 text-xs text-yellow-600 dark:text-yellow-400">
                                (Premium)
                              </span>
                            )}
                          </div>
                          {form.subjects.includes(s._id) && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                        </label>
                      ))
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Selected: {form.subjects.length} subjects
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-6 pt-0 border-t border-gray-200 dark:border-gray-800">
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {editingId ? "Update Plan" : "Create Plan"}
                  </>
                )}
              </button>
              <button
                onClick={resetForm}
                className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Plans List */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search plans..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            <p className="text-gray-500 dark:text-gray-400 mt-3">Loading plans...</p>
          </div>
        ) : filteredPlans.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-gray-300 dark:text-gray-700 mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm ? "No plans match your search" : "No plans created yet"}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="mt-4 text-blue-600 dark:text-blue-400 text-sm hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr className="text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800">
                    <th className="px-6 py-4 text-left font-medium">Plan</th>
                    <th className="px-6 py-4 text-left font-medium">Price</th>
                    <th className="px-6 py-4 text-left font-medium">Duration</th>
                    <th className="px-6 py-4 text-left font-medium">Subjects</th>
                    <th className="px-6 py-4 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredPlans.map((plan) => {
                    const DurationIcon = getDurationUnitIcon(plan.durationUnit);
                    return (
                      <tr key={plan._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                              <Crown className="h-4 w-4 text-white" />
                            </div>
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {plan.title}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400 text-xs font-semibold">
                            <DollarSign className="h-3 w-3" />
                            ₵{plan.price}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 text-gray-600 dark:text-gray-400">
                            <DurationIcon className="h-3.5 w-3.5" />
                            {plan.duration} {plan.durationUnit}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1 max-w-md">
                            {plan.subjects.slice(0, 3).map((subject) => (
                              <span key={subject._id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs">
                                <BookOpen className="h-2.5 w-2.5" />
                                {subject.name}
                              </span>
                            ))}
                            {plan.subjects.length > 3 && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                +{plan.subjects.length - 3} more
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(plan)}
                              className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
                              title="Edit Plan"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(plan._id)}
                              className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                              title="Delete Plan"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-800">
              {filteredPlans.map((plan) => {
                const DurationIcon = getDurationUnitIcon(plan.durationUnit);
                return (
                  <div key={plan._id} className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <Crown className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                            {plan.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400 text-xs font-semibold">
                              <DollarSign className="h-3 w-3" />
                              ₵{plan.price}
                            </span>
                            <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                              <DurationIcon className="h-3 w-3" />
                              {plan.duration} {plan.durationUnit}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEdit(plan)}
                          className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(plan._id)}
                          className="p-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {plan.subjects.slice(0, 4).map((subject) => (
                        <span key={subject._id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs">
                          <BookOpen className="h-2.5 w-2.5" />
                          {subject.name}
                        </span>
                      ))}
                      {plan.subjects.length > 4 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          +{plan.subjects.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPlans;