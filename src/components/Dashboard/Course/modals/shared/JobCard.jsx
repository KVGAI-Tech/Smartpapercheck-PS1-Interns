import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Clock,
  Loader,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  StopCircle,
  PlayCircle,
  Sparkles,
  Users,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { API_BASE_URL } from "../../../../../BaseURL";

const JobCard = ({ job, isActive, onViewDetails, onJobSelect, examId, onRefresh }) => {
  const [actionLoading, setActionLoading] = useState(null);

  const getStatusConfig = (status) => {
    switch (status) {
      case "pending":
        return {
          color: "bg-amber-50 text-amber-700 border-amber-200",
          icon: <Clock className="w-4 h-4" />,
          label: "Pending",
        };
      case "running":
        return {
          color: "bg-indigo-50 text-indigo-700 border-indigo-200",
          icon: <Loader className="w-4 h-4 animate-spin" />,
          label: "Running",
        };
      case "completed":
        return {
          color: "bg-emerald-50 text-emerald-700 border-emerald-200",
          icon: <CheckCircle className="w-4 h-4" />,
          label: "Completed",
        };
      case "completed_with_errors":
        return {
          color: "bg-orange-50 text-orange-700 border-orange-200",
          icon: <AlertTriangle className="w-4 h-4" />,
          label: "Completed with Errors",
        };
      case "failed":
        return {
          color: "bg-rose-50 text-rose-700 border-rose-200",
          icon: <XCircle className="w-4 h-4" />,
          label: "Failed",
        };
      case "canceled":
        return {
          color: "bg-slate-50 text-slate-700 border-slate-200",
          icon: <StopCircle className="w-4 h-4" />,
          label: "Canceled",
        };
      default:
        return {
          color: "bg-slate-50 text-slate-700 border-slate-200",
          icon: <AlertTriangle className="w-4 h-4" />,
          label: status,
        };
    }
  };

  const getModelIcon = (model) => {
    if (model === "gemini") return "✨";
    return "🤖";
  };

  const progress = job.progress || {};
  const statusConfig = getStatusConfig(job.status);
  const isRunning = job.status === "pending" || job.status === "running";
  
  // Backend only allows resuming jobs that are NOT in finished states
  // This seems like a backend bug, but we need to match the backend logic
  // According to backend code, it should NOT be in: completed, completed_with_errors, failed, canceled, cancelled
  // But logically, we WANT to resume failed/canceled jobs
  // The backend validation at line 1367 is preventing this
  const canResume = false; // Disabled until backend is fixed
  
  const progressPercent =
    progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;
  const activeIds = Array.isArray(progress.current_enrollment_ids)
    ? progress.current_enrollment_ids
    : progress.current_enrollment_id
      ? [progress.current_enrollment_id]
      : [];

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    
    try {
      // Backend sends dates without timezone (naive datetime)
      // We need to treat them as UTC by adding 'Z' suffix if missing
      let dateStr = dateString;
      if (!dateStr.endsWith('Z') && !dateStr.includes('+') && !dateStr.includes('T00:00:00')) {
        dateStr = dateStr + 'Z';
      }
      
      const date = new Date(dateStr);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "Invalid date";
      }
      
      const now = new Date();
      const diffMs = now - date;
      
      // If negative (future date), something is wrong
      if (diffMs < 0) {
        return date.toLocaleDateString();
      }
      
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString();
    } catch (e) {
      console.error("Error formatting date:", e, dateString);
      return "Invalid date";
    }
  };

  const getDuration = () => {
    if (!job.started_at) return null;
    
    try {
      // Backend sends dates without timezone (naive datetime)
      // We need to treat them as UTC by adding 'Z' suffix if missing
      let startStr = job.started_at;
      if (!startStr.endsWith('Z') && !startStr.includes('+')) {
        startStr = startStr + 'Z';
      }
      
      let endStr = job.finished_at;
      if (endStr && !endStr.endsWith('Z') && !endStr.includes('+')) {
        endStr = endStr + 'Z';
      }
      
      const start = new Date(startStr);
      const end = endStr ? new Date(endStr) : new Date();
      
      // Check if dates are valid
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return null;
      }
      
      const diffMs = end - start;
      
      // If negative duration, something is wrong
      if (diffMs < 0) return null;
      
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);

      if (diffHours > 0) return `${diffHours}h ${diffMins % 60}m`;
      if (diffMins > 0) return `${diffMins}m ${diffSecs % 60}s`;
      return `${diffSecs}s`;
    } catch (e) {
      console.error("Error calculating duration:", e);
      return null;
    }
  };

  const handleCancel = async (e) => {
    e.stopPropagation();
    setActionLoading("cancel");
    try {
      const token = localStorage.getItem("accessToken");
      const resp = await fetch(
        `${API_BASE_URL}/exams/professor/jobs/evaluations/${job.id}/cancel`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!resp.ok) throw new Error("Failed to cancel job");

      await onRefresh();
    } catch (e) {
      console.error("Cancel job error:", e);
    } finally {
      setActionLoading(null);
    }
  };

  const handleResume = async (e) => {
    e.stopPropagation();
    setActionLoading("resume");
    try {
      const token = localStorage.getItem("accessToken");
      const resp = await fetch(
        `${API_BASE_URL}/exams/professor/jobs/evaluations/${job.id}/resume`,
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

      await onRefresh();
    } catch (e) {
      console.error("Resume job error:", e);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border-2 p-4 transition-all cursor-pointer hover:shadow-md ${
        isActive
          ? "border-indigo-300 bg-gradient-to-br from-indigo-50 to-white shadow-sm"
          : "border-slate-200 bg-white hover:border-slate-300"
      }`}
      onClick={onViewDetails}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="text-sm font-semibold text-slate-900 truncate">
              {job.displayName}
            </div>
            {isActive && (
              <motion.span
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-medium flex items-center gap-1"
              >
                <TrendingUp className="w-3 h-3" />
                Active
              </motion.span>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>{job.createdBy}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(job.created_at)}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <span>{getModelIcon(job.model)}</span>
              <span className="capitalize">{job.model === "gemini" ? "Gemini" : "OpenAI"}</span>
            </div>
            {getDuration() && (
              <>
                <span>•</span>
                <span>Duration: {getDuration()}</span>
              </>
            )}
          </div>
        </div>

        <div
          className={`px-2.5 py-1 rounded-lg border text-xs font-medium flex items-center gap-1.5 whitespace-nowrap ${statusConfig.color}`}
        >
          {statusConfig.icon}
          <span>{statusConfig.label}</span>
        </div>
      </div>

      {/* Progress Section */}
      {progress.total > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <div className="flex items-center gap-2">
              <span className="text-slate-600 font-medium">
                {progress.completed}/{progress.total} students
              </span>
              {progress.failed > 0 && (
                <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 font-medium">
                  {progress.failed} failed
                </span>
              )}
            </div>
            <span className="font-semibold text-slate-900">{progressPercent}%</span>
          </div>

          {/* Progress Bar */}
          <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className={`h-full ${
                job.status === "completed"
                  ? "bg-gradient-to-r from-emerald-500 to-emerald-600"
                  : job.status === "failed"
                  ? "bg-gradient-to-r from-rose-500 to-rose-600"
                  : "bg-gradient-to-r from-indigo-500 to-indigo-600"
              }`}
            />
            {progress.failed > 0 && (
              <div
                className="absolute top-0 right-0 h-full bg-rose-500/30"
                style={{
                  width: `${(progress.failed / progress.total) * 100}%`,
                }}
              />
            )}
          </div>

          {/* Current Student Indicator */}
          {isRunning && activeIds.length > 0 && (
            <div className="mt-1.5 text-xs text-slate-500 flex items-center gap-1">
              <Loader className="w-3 h-3 animate-spin" />
              <span>
                {activeIds.length === 1
                  ? `Processing student #${activeIds[0]}`
                  : `Processing ${activeIds.length} students`}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {job.error && job.status !== "completed" && (
        <div className="mb-3 px-3 py-2 rounded-lg bg-rose-50 border border-rose-200">
          <div className="text-xs font-medium text-rose-700 mb-0.5">Error</div>
          <div className="text-xs text-rose-600">{job.error}</div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails();
          }}
          className="flex-1 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors flex items-center justify-center gap-1.5"
        >
          <Eye className="w-3.5 h-3.5" />
          View Details
        </button>

        {isRunning && (
          <button
            type="button"
            onClick={handleCancel}
            disabled={actionLoading === "cancel"}
            className="px-3 py-2 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-xs font-medium text-rose-700 transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            {actionLoading === "cancel" ? (
              <Loader className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <StopCircle className="w-3.5 h-3.5" />
            )}
            Cancel
          </button>
        )}

        {canResume && (
          <button
            type="button"
            onClick={handleResume}
            disabled={actionLoading === "resume"}
            className="px-3 py-2 rounded-lg border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-xs font-medium text-indigo-700 transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            {actionLoading === "resume" ? (
              <Loader className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <PlayCircle className="w-3.5 h-3.5" />
            )}
            Resume
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default JobCard;
