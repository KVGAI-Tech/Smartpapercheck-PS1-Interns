import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Loader,
  Briefcase,
  RefreshCw,
  Filter,
  Search,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Play,
  Pause,
  Eye,
} from "lucide-react";
import { API_BASE_URL } from "../../../../../BaseURL";
import JobCard from "./JobCard";
import JobDetailsModal from "./JobDetailsModal";

const JobsListModal = ({
  open,
  onClose,
  examId,
  activeJobId,
  onJobSelect,
  currentUser,
}) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedJob, setSelectedJob] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchJobs = useCallback(async () => {
    if (!examId) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Authentication required");

      const resp = await fetch(
        `${API_BASE_URL}/exams/professor/jobs/evaluations?exam_id=${examId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!resp.ok) throw new Error("Failed to fetch jobs");

      const data = await resp.json();
      const fetchedJobs = data?.data?.jobs || [];

      // Enrich with job names from localStorage
      const storageKey = `job_names:${examId}`;
      const jobNames = JSON.parse(localStorage.getItem(storageKey) || "{}");

      const enrichedJobs = fetchedJobs.map((job) => ({
        ...job,
        displayName: jobNames[job.id]?.name || `Evaluation Job`,
        createdBy:
          jobNames[job.id]?.createdBy ||
          (job.professor_id === currentUser?.id
            ? currentUser?.name || currentUser?.email || "You"
            : `Professor #${job.professor_id}`),
        metadata: jobNames[job.id] || {},
      }));

      setJobs(enrichedJobs);
    } catch (e) {
      console.error("Failed to fetch jobs:", e);
    } finally {
      setLoading(false);
    }
  }, [examId, currentUser]);

  useEffect(() => {
    if (open) {
      fetchJobs();
    }
  }, [open, fetchJobs]);

  // Auto-refresh every 5 seconds when modal is open and autoRefresh is enabled
  useEffect(() => {
    if (!open || !autoRefresh) return;

    const interval = setInterval(() => {
      fetchJobs();
    }, 5000);

    return () => clearInterval(interval);
  }, [open, autoRefresh, fetchJobs]);

  const filteredJobs = jobs.filter((job) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = job.displayName.toLowerCase().includes(query);
      const matchesCreator = job.createdBy.toLowerCase().includes(query);
      const matchesModel = job.model?.toLowerCase().includes(query);
      if (!matchesName && !matchesCreator && !matchesModel) return false;
    }

    // Status filter
    if (statusFilter !== "all") {
      if (statusFilter === "active") {
        return job.status === "pending" || job.status === "running";
      }
      if (statusFilter === "completed") {
        return job.status === "completed" || job.status === "completed_with_errors";
      }
      if (statusFilter === "failed") {
        return job.status === "failed" || job.status === "canceled";
      }
    }

    return true;
  });

  const stats = {
    total: jobs.length,
    active: jobs.filter((j) => j.status === "pending" || j.status === "running").length,
    completed: jobs.filter((j) => j.status === "completed").length,
    failed: jobs.filter((j) => j.status === "failed" || j.status === "canceled").length,
  };

  const handleViewDetails = (job) => {
    setSelectedJob(job);
    setShowDetailsModal(true);
  };

  if (!open) return null;

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.99 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-5xl max-h-[85vh] rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-indigo-100">
                    <Briefcase className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-slate-900">
                      Evaluation Jobs
                    </div>
                    <div className="text-xs text-slate-500">
                      Track and manage all evaluation jobs for this exam
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAutoRefresh(!autoRefresh)}
                    className={`p-2 rounded-lg transition-colors ${
                      autoRefresh
                        ? "bg-indigo-100 text-indigo-600"
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    }`}
                    title={autoRefresh ? "Auto-refresh enabled" : "Auto-refresh disabled"}
                  >
                    <RefreshCw className={`w-4 h-4 ${autoRefresh ? "animate-spin" : ""}`} />
                  </button>
                  <button
                    type="button"
                    onClick={fetchJobs}
                    disabled={loading}
                    className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors disabled:opacity-50"
                    title="Refresh now"
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

              {/* Stats */}
              <div className="grid grid-cols-4 gap-3">
                <div className="px-3 py-2 rounded-lg bg-white border border-slate-200">
                  <div className="text-xs text-slate-500">Total Jobs</div>
                  <div className="text-lg font-semibold text-slate-900">{stats.total}</div>
                </div>
                <div className="px-3 py-2 rounded-lg bg-indigo-50 border border-indigo-200">
                  <div className="text-xs text-indigo-600">Active</div>
                  <div className="text-lg font-semibold text-indigo-700">{stats.active}</div>
                </div>
                <div className="px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200">
                  <div className="text-xs text-emerald-600">Completed</div>
                  <div className="text-lg font-semibold text-emerald-700">{stats.completed}</div>
                </div>
                <div className="px-3 py-2 rounded-lg bg-rose-50 border border-rose-200">
                  <div className="text-xs text-rose-600">Failed</div>
                  <div className="text-lg font-semibold text-rose-700">{stats.failed}</div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="px-5 py-3 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, creator, or model..."
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed/Canceled</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5">
              {loading && jobs.length === 0 ? (
                <div className="flex items-center justify-center py-16">
                  <Loader className="w-6 h-6 animate-spin text-slate-400" />
                  <span className="ml-2 text-sm text-slate-600">Loading jobs...</span>
                </div>
              ) : filteredJobs.length === 0 ? (
                <div className="text-center py-16">
                  {jobs.length === 0 ? (
                    <>
                      <Briefcase className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                      <div className="text-sm font-medium text-slate-900 mb-1">
                        No evaluation jobs yet
                      </div>
                      <div className="text-xs text-slate-500">
                        Create a job by selecting students and clicking "Evaluate"
                      </div>
                    </>
                  ) : (
                    <>
                      <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                      <div className="text-sm font-medium text-slate-900 mb-1">
                        No jobs match your filters
                      </div>
                      <div className="text-xs text-slate-500">
                        Try adjusting your search or filter criteria
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredJobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      isActive={job.id === activeJobId}
                      onViewDetails={() => handleViewDetails(job)}
                      onJobSelect={onJobSelect}
                      examId={examId}
                      onRefresh={fetchJobs}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Job Details Modal */}
      <JobDetailsModal
        open={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedJob(null);
        }}
        job={selectedJob}
        examId={examId}
        onJobSelect={onJobSelect}
        onRefresh={fetchJobs}
      />
    </>
  );
};

export default JobsListModal;
