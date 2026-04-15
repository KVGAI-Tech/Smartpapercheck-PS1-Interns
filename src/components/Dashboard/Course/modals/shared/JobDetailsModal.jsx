import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Clock,
  Loader,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  Users,
  Zap,
  TrendingUp,
  Activity,
  StopCircle,
  PlayCircle,
  Download,
  RefreshCw,
} from "lucide-react";
import { API_BASE_URL } from "../../../../../BaseURL";

const JobDetailsModal = ({ open, onClose, job, examId, onJobSelect, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [detailedJob, setDetailedJob] = useState(job);

  useEffect(() => {
    if (open && job) {
      fetchJobDetails();
    }
  }, [open, job]);

  const fetchJobDetails = async () => {
    if (!job?.id) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const resp = await fetch(
        `${API_BASE_URL}/exams/professor/jobs/evaluations/${job.id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!resp.ok) throw new Error("Failed to fetch job details");

      const data = await resp.json();
      setDetailedJob(data?.data || job);
    } catch (e) {
      console.error("Failed to fetch job details:", e);
      setDetailedJob(job);
    } finally {
      setLoading(false);
    }
  };

  if (!open || !job) return null;

  const currentJob = detailedJob || job;
  const progress = currentJob.progress || {};
  const results = currentJob.results || [];
  const isRunning = currentJob.status === "pending" || currentJob.status === "running";
  
  // Backend only allows resuming jobs that are NOT in finished states
  // This seems like a backend bug - the validation at line 1367 prevents resuming finished jobs
  // But logically, we WANT to resume failed/canceled jobs
  const canResume = false; // Disabled until backend is fixed

  const getStatusConfig = (status) => {
    switch (status) {
      case "pending":
        return { color: "bg-amber-100 text-amber-700", icon: <Clock className="w-5 h-5" /> };
      case "running":
        return { color: "bg-indigo-100 text-indigo-700", icon: <Loader className="w-5 h-5 animate-spin" /> };
      case "completed":
        return { color: "bg-emerald-100 text-emerald-700", icon: <CheckCircle className="w-5 h-5" /> };
      case "completed_with_errors":
        return { color: "bg-orange-100 text-orange-700", icon: <AlertTriangle className="w-5 h-5" /> };
      case "failed":
        return { color: "bg-rose-100 text-rose-700", icon: <XCircle className="w-5 h-5" /> };
      case "canceled":
        return { color: "bg-slate-100 text-slate-700", icon: <StopCircle className="w-5 h-5" /> };
      default:
        return { color: "bg-slate-100 text-slate-700", icon: <AlertTriangle className="w-5 h-5" /> };
    }
  };

  const statusConfig = getStatusConfig(currentJob.status);
  const progressPercent = progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;
  const activeIds = Array.isArray(progress.current_enrollment_ids)
    ? progress.current_enrollment_ids
    : progress.current_enrollment_id
      ? [progress.current_enrollment_id]
      : [];

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    
    try {
      // Backend sends dates without timezone (naive datetime)
      // We need to treat them as UTC by adding 'Z' suffix if missing
      let dateStr = dateString;
      if (!dateStr.endsWith('Z') && !dateStr.includes('+')) {
        dateStr = dateStr + 'Z';
      }
      
      const date = new Date(dateStr);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "Invalid date";
      }
      
      return date.toLocaleString();
    } catch (e) {
      console.error("Error formatting date:", e, dateString);
      return "Invalid date";
    }
  };

  const getDuration = () => {
    if (!currentJob.started_at) return "Not started";
    
    try {
      // Backend sends dates without timezone (naive datetime)
      // We need to treat them as UTC by adding 'Z' suffix if missing
      let startStr = currentJob.started_at;
      if (!startStr.endsWith('Z') && !startStr.includes('+')) {
        startStr = startStr + 'Z';
      }
      
      let endStr = currentJob.finished_at;
      if (endStr && !endStr.endsWith('Z') && !endStr.includes('+')) {
        endStr = endStr + 'Z';
      }
      
      const start = new Date(startStr);
      const end = endStr ? new Date(endStr) : new Date();
      
      // Check if dates are valid
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return "Invalid date";
      }
      
      const diffMs = end - start;
      
      // If negative duration, something is wrong
      if (diffMs < 0) return "Invalid duration";
      
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);

      if (diffHours > 0) return `${diffHours}h ${diffMins % 60}m ${diffSecs % 60}s`;
      if (diffMins > 0) return `${diffMins}m ${diffSecs % 60}s`;
      return `${diffSecs}s`;
    } catch (e) {
      console.error("Error calculating duration:", e);
      return "Error";
    }
  };

  const handleCancel = async () => {
    setActionLoading("cancel");
    try {
      const token = localStorage.getItem("accessToken");
      const resp = await fetch(
        `${API_BASE_URL}/exams/professor/jobs/evaluations/${currentJob.id}/cancel`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!resp.ok) throw new Error("Failed to cancel job");

      await fetchJobDetails();
      if (onRefresh) await onRefresh();
    } catch (e) {
      console.error("Cancel job error:", e);
    } finally {
      setActionLoading(null);
    }
  };

  const handleResume = async () => {
    setActionLoading("resume");
    try {
      const token = localStorage.getItem("accessToken");
      const resp = await fetch(
        `${API_BASE_URL}/exams/professor/jobs/evaluations/${currentJob.id}/resume`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!resp.ok) throw new Error("Failed to resume job");

      const data = await resp.json();
      const newJobId = data?.data?.job_id;

      if (newJobId && onJobSelect) {
        onJobSelect(newJobId);
      }

      if (onRefresh) await onRefresh();
      onClose();
    } catch (e) {
      console.error("Resume job error:", e);
    } finally {
      setActionLoading(null);
    }
  };

  const exportResults = () => {
    const csvContent = [
      ["Enrollment ID", "Status", "Total Marks", "Error"],
      ...results.map((r) => [
        r.enrollment_id || "",
        r.status || "",
        r.total_marks || "",
        r.error || "",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `job-${currentJob.id}-results.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center px-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.99 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-4xl max-h-[85vh] rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-xl ${statusConfig.color}`}>
                    {statusConfig.icon}
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-slate-900">
                      {currentJob.displayName || "Evaluation Job"}
                    </div>
                    <div className="text-xs text-slate-500">Job ID: {currentJob.id}</div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={fetchJobDetails}
                  disabled={loading}
                  className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors disabled:opacity-50"
                  title="Refresh"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5">
            {/* Overview Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
              <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200">
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="w-4 h-4 text-indigo-600" />
                  <div className="text-xs text-indigo-600 font-medium">Status</div>
                </div>
                <div className="text-sm font-semibold text-indigo-900 capitalize">
                  {currentJob.status?.replace("_", " ")}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <div className="text-xs text-emerald-600 font-medium">Completed</div>
                </div>
                <div className="text-sm font-semibold text-emerald-900">
                  {progress.completed || 0}/{progress.total || 0}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
                <div className="flex items-center gap-2 mb-1">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <div className="text-xs text-rose-600 font-medium">Failed</div>
                </div>
                <div className="text-sm font-semibold text-rose-900">{progress.failed || 0}</div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <div className="text-xs text-amber-600 font-medium">Duration</div>
                </div>
                <div className="text-sm font-semibold text-amber-900">{getDuration()}</div>
              </div>
            </div>

            {/* Progress Bar */}
            {progress.total > 0 && (
              <div className="mb-5 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-slate-900">Progress</div>
                  <div className="text-sm font-semibold text-slate-900">{progressPercent}%</div>
                </div>
                <div className="relative h-3 bg-white rounded-full overflow-hidden border border-slate-200">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600"
                  />
                </div>
                {isRunning && activeIds.length > 0 && (
                  <div className="mt-2 text-xs text-slate-600 flex items-center gap-1">
                    <Loader className="w-3 h-3 animate-spin" />
                    <span>
                      {activeIds.length === 1
                        ? `Currently processing student #${activeIds[0]}`
                        : `Currently processing ${activeIds.length} students`}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Job Details */}
            <div className="mb-5 p-4 rounded-xl bg-white border border-slate-200">
              <div className="text-sm font-semibold text-slate-900 mb-3">Job Details</div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="text-slate-500 mb-1">Created By</div>
                  <div className="text-slate-900 font-medium">{currentJob.createdBy || "Unknown"}</div>
                </div>
                <div>
                  <div className="text-slate-500 mb-1">Model</div>
                  <div className="text-slate-900 font-medium capitalize">
                    {currentJob.model === "gemini" ? "✨ Gemini" : "🤖 OpenAI"}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500 mb-1">Created At</div>
                  <div className="text-slate-900 font-medium">{formatDateTime(currentJob.created_at)}</div>
                </div>
                <div>
                  <div className="text-slate-500 mb-1">Started At</div>
                  <div className="text-slate-900 font-medium">{formatDateTime(currentJob.started_at)}</div>
                </div>
                <div>
                  <div className="text-slate-500 mb-1">Finished At</div>
                  <div className="text-slate-900 font-medium">{formatDateTime(currentJob.finished_at)}</div>
                </div>
                <div>
                  <div className="text-slate-500 mb-1">Force Re-evaluate</div>
                  <div className="text-slate-900 font-medium">
                    {currentJob.force_reevaluate ? "Yes" : "No"}
                  </div>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {currentJob.error && job.status !== "completed" && (
              <div className="mb-5 p-4 rounded-xl bg-rose-50 border border-rose-200">
                <div className="text-sm font-semibold text-rose-900 mb-2">Error</div>
                <div className="text-xs text-rose-700">{currentJob.error}</div>
              </div>
            )}

            {/* Results Table */}
            {results.length > 0 && (
              <div className="rounded-xl bg-white border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                  <div className="text-sm font-semibold text-slate-900">
                    Results ({results.length})
                  </div>
                  <button
                    type="button"
                    onClick={exportResults}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-medium text-slate-700 transition-colors flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export CSV
                  </button>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium text-slate-700">
                          Enrollment ID
                        </th>
                        <th className="px-4 py-2 text-left font-medium text-slate-700">Status</th>
                        <th className="px-4 py-2 text-left font-medium text-slate-700">
                          Total Marks
                        </th>
                        <th className="px-4 py-2 text-left font-medium text-slate-700">Error</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {results.map((result, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="px-4 py-2 text-slate-900 font-medium">
                            {result.enrollment_id}
                          </td>
                          <td className="px-4 py-2">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                result.status === "completed"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-rose-100 text-rose-700"
                              }`}
                            >
                              {result.status}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-slate-900">
                            {result.total_marks !== null && result.total_marks !== undefined
                              ? result.total_marks
                              : "—"}
                          </td>
                          <td className="px-4 py-2 text-rose-600 text-xs">
                            {result.error || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-sm font-medium text-slate-700 transition-colors"
            >
              Close
            </button>

            <div className="flex items-center gap-2">
              {isRunning && (
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={actionLoading === "cancel"}
                  className="px-4 py-2 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-sm font-medium text-rose-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {actionLoading === "cancel" ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <StopCircle className="w-4 h-4" />
                  )}
                  Cancel Job
                </button>
              )}

              {canResume && (
                <button
                  type="button"
                  onClick={handleResume}
                  disabled={actionLoading === "resume"}
                  className="px-4 py-2 rounded-lg border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-sm font-medium text-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {actionLoading === "resume" ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <PlayCircle className="w-4 h-4" />
                  )}
                  Resume Job
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default JobDetailsModal;
