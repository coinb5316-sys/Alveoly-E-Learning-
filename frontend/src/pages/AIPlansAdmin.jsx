import { useState, useEffect } from "react";
import axios from "../api/axios";
import { 
  FaEdit, 
  FaTrash, 
  FaTag, 
  FaPlus, 
  FaSave, 
  FaTimes,
  FaCrown,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaGem,
  FaRocket,
  FaStar,
  FaCheckCircle
} from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";

const AIPlansAdmin = () => {
  const [plans, setPlans] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [durationValue, setDurationValue] = useState("");
  const [durationUnit, setDurationUnit] = useState("days");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // ================= DARK MODE =================
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

  const fetchPlans = async () => {
    try {
      const res = await axios.get("/ai-plans");
      setPlans(res.data);
    } catch (err) {
      console.error("Failed to fetch AI plans:", err);
      toast.error("Failed to load plans");
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleSave = async () => {
    if (!name || !price || !durationValue) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      const data = {
        name,
        description,
        price: parseFloat(price),
        durationValue: parseInt(durationValue),
        durationUnit,
      };

      if (editingId) {
        await axios.put(`/ai-plans/${editingId}`, data);
        toast.success("Plan updated successfully!");
        setEditingId(null);
      } else {
        await axios.post("/ai-plans", data);
        toast.success("Plan created successfully!");
      }

      // Reset form
      setName("");
      setDescription("");
      setPrice("");
      setDurationValue("");
      setDurationUnit("days");

      fetchPlans();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save plan");
    }
    setLoading(false);
  };

  const handleEdit = (plan) => {
    setName(plan.name);
    setDescription(plan.description || "");
    setPrice(plan.price);
    setDurationValue(plan.durationValue);
    setDurationUnit(plan.durationUnit);
    setEditingId(plan._id);
    toast.success("Editing mode activated");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this plan?")) return;
    try {
      await axios.delete(`/ai-plans/${id}`);
      fetchPlans();
      toast.success("Plan deleted successfully");
    } catch (err) {
      toast.error("Failed to delete plan");
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName("");
    setDescription("");
    setPrice("");
    setDurationValue("");
    setDurationUnit("days");
  };

  const getDurationLabel = (value, unit) => {
    if (value === 1) {
      switch(unit) {
        case "minutes": return "Minute";
        case "hours": return "Hour";
        case "days": return "Day";
        case "weeks": return "Week";
        case "months": return "Month";
        case "years": return "Year";
        default: return unit;
      }
    }
    switch(unit) {
      case "minutes": return "Minutes";
      case "hours": return "Hours";
      case "days": return "Days";
      case "weeks": return "Weeks";
      case "months": return "Months";
      case "years": return "Years";
      default: return unit;
    }
  };

  const getPlanIcon = (index) => {
    const icons = [FaCrown, FaGem, FaRocket, FaStar];
    const Icon = icons[index % icons.length];
    return <Icon className="w-8 h-8" />;
  };

  const getPlanGradient = (index) => {
    const gradients = [
      "from-amber-500 to-orange-500",
      "from-blue-500 to-cyan-500",
      "from-purple-500 to-pink-500",
      "from-emerald-500 to-teal-500",
    ];
    return gradients[index % gradients.length];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "#fff",
            borderRadius: "16px",
          },
        }}
      />

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-full mb-4 backdrop-blur-sm">
            <FaCrown className="text-indigo-600 dark:text-indigo-400 text-sm" />
            <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Admin Dashboard</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            AI Subscription Plans
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-3 max-w-2xl mx-auto">
            Create and manage subscription plans for AI features
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* LEFT: FORM - Premium Card */}
          <div className="lg:sticky lg:top-6 h-fit">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    {editingId ? <FaEdit className="text-white text-lg" /> : <FaPlus className="text-white text-lg" />}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {editingId ? "Edit Plan" : "Create New Plan"}
                    </h2>
                    <p className="text-white/70 text-sm">
                      {editingId ? "Modify existing subscription plan" : "Add a new subscription plan"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-5">
                {/* Plan Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Plan Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Basic, Pro, Enterprise"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Price (GH₵) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FaMoneyBillWave className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Duration <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <FaCalendarAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                      <input
                        type="number"
                        placeholder="Value"
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                        value={durationValue}
                        onChange={(e) => setDurationValue(e.target.value)}
                      />
                    </div>
                    <select
                      className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all cursor-pointer"
                      value={durationUnit}
                      onChange={(e) => setDurationUnit(e.target.value)}
                    >
                      <option value="minutes">Minutes</option>
                      <option value="hours">Hours</option>
                      <option value="days">Days</option>
                      <option value="weeks">Weeks</option>
                      <option value="months">Months</option>
                      <option value="years">Years</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Description
                  </label>
                  <textarea
                    placeholder="Describe what this plan includes..."
                    rows="4"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <FaSave className="w-4 h-4" />
                        {editingId ? "Update Plan" : "Create Plan"}
                      </>
                    )}
                  </button>
                  
                  {editingId && (
                    <button
                      onClick={handleCancelEdit}
                      className="px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                    >
                      <FaTimes className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: PLANS LIST - Premium Cards */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">All Plans</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {plans.length} active subscription{plans.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800">
                <FaTag className="text-indigo-500 text-xs" />
                <span className="text-xs text-slate-600 dark:text-slate-400">Total Plans</span>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{plans.length}</span>
              </div>
            </div>

            {plans.length === 0 && (
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-12 text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-950/50 dark:to-purple-950/50 flex items-center justify-center mx-auto mb-4">
                  <FaCrown className="w-10 h-10 text-indigo-500" />
                </div>
                <p className="text-slate-500 dark:text-slate-400">No plans created yet</p>
                <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Create your first subscription plan</p>
              </div>
            )}

            <div className="space-y-4">
              {plans.map((plan, index) => {
                const PlanIcon = getPlanIcon(index);
                const gradient = getPlanGradient(index);
                
                return (
                  <div
                    key={plan._id}
                    className="group bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="p-5">
                      <div className="flex items-start justify-between">
                        {/* Left - Plan Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
                              <PlanIcon className="text-white text-xl" />
                            </div>
                            <div>
                              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                                {plan.name}
                              </h3>
                              <div className="flex items-center gap-2 mt-1">
                                <FaMoneyBillWave className="text-emerald-500 text-xs" />
                                <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                  GH₵{plan.price}
                                </span>
                                <span className="text-sm text-slate-500 dark:text-slate-400">
                                  / {getDurationLabel(plan.durationValue, plan.durationUnit)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {plan.description && (
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                              {plan.description}
                            </p>
                          )}

                          <div className="flex items-center gap-4 mt-3">
                            <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                              <FaCalendarAlt className="w-3 h-3" />
                              <span>{plan.durationValue} {getDurationLabel(plan.durationValue, plan.durationUnit)}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                              <FaTag className="w-3 h-3" />
                              <span>Active</span>
                            </div>
                          </div>
                        </div>

                        {/* Right - Actions */}
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => handleEdit(plan)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-950/50 transition-all"
                          >
                            <FaEdit className="w-3.5 h-3.5" />
                            <span className="text-sm font-medium">Edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(plan._id)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/50 transition-all"
                          >
                            <FaTrash className="w-3.5 h-3.5" />
                            <span className="text-sm font-medium">Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIPlansAdmin;