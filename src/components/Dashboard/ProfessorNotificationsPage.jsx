import React, { useEffect, useState } from "react";
import { AlertCircle, CheckCircle, Clock, RefreshCw, XCircle } from "lucide-react";
import { API_BASE_URL } from "../../BaseURL";

const StatusBadge = ({ status }) => {
  const map = {
    pending: { label: "Pending", className: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock },
    running: { label: "Running", className: "bg-blue-50 text-blue-700 border-blue-200", icon: RefreshCw },
    completed: { label: "Completed", className: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle },
    failed: { label: "Failed", className: "bg-red-50 text-red-700 border-red-200", icon: XCircle },
  };
  const conf = map[status] || map.pending;
  const Icon = conf.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${conf.className}`}>
      <Icon className="w-3 h-3" />
      {conf.label}
    </span>
  );
};

const ProfessorNotificationsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState(null);
  const [progress, setProgress] = useState(null);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Not authenticated");

      const resp = await fetch(`${API_BASE_URL}/exams/professor/jobs/answers-processing`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!resp.ok) {
        throw new Error(`Failed to load notifications (${resp.status})`);
      }

      const json = await resp.json();
      setJobs(json?.data?.jobs || []);
    } catch (e) {
      console.error("Error fetching jobs", e);
      setError(e.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Live professor notifications WebSocket: keep jobs list/status in sync
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    let wsUrl;
    try {
      const base = new URL(API_BASE_URL);
      base.protocol = base.protocol === "https:" ? "wss:" : "ws:";
      base.pathname = `${base.pathname.replace(/\/+$/, "")}/exams/ws/professor/notifications`;
      base.search = `?token=${encodeURIComponent(token)}`;
      wsUrl = base.toString();
    } catch {
      const wsBase = API_BASE_URL.replace(/^https?/, "ws");
      wsUrl = `${wsBase}/exams/ws/professor/notifications?token=${encodeURIComponent(token)}`;
    }

    let ws;
    try {
      ws = new WebSocket(wsUrl);
    } catch (e) {
      console.error("Failed to open professor notifications WebSocket", e);
      return undefined;
    }

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload?.event !== "job_update" || !payload.job) return;

        const job = payload.job;

        // Merge or prepend job into jobs list
        setJobs((prev) => {
          if (!Array.isArray(prev) || prev.length === 0) {
            return [job];
          }

          const idx = prev.findIndex((j) => j.id === job.id);
          if (idx === -1) {
            return [job, ...prev];
          }

          const next = [...prev];
          next[idx] = { ...next[idx], ...job };
          return next;
        });

        // Keep selected job in sync so status/progress react immediately
        setSelectedJob((prev) => {
          if (!prev || prev.id !== job.id) return prev;
          return { ...prev, ...job };
        });
      } catch (e) {
        console.error("Failed to parse professor notifications WS message", e);
      }
    };

    ws.onerror = (e) => {
      console.error("Professor notifications WebSocket error", e);
    };

    return () => {
      try {
        ws && ws.close();
      } catch {
        // ignore
      }
    };
  }, []);

  // Open exam progress WebSocket when viewing a job that is still running/pending
  useEffect(() => {
    if (!selectedJob) {
      setProgress(null);
      return;
    }

    const status = (selectedJob.status || "").toLowerCase();
    if (status === "completed" || status === "failed") {
      // No need for live progress for finished jobs
      setProgress(null);
      return;
    }

    try {
      const wsBase = API_BASE_URL.replace(/^http/, "ws");
      const ws = new WebSocket(`${wsBase}/exams/ws/exams/${selectedJob.exam_id}/progress`);

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.event === "upload_progress") {
            setProgress({
              students_total: data.students_total ?? 0,
              students_processed: data.students_processed ?? 0,
              total_processed: data.total_processed ?? 0,
              total_failed: data.total_failed ?? 0,
            });
          }
        } catch (e) {
          console.error("Failed to parse exam progress WS message", e);
        }
      };

      ws.onerror = (e) => {
        console.error("Exam progress WebSocket error", e);
      };

      return () => {
        ws.close();
      };
    } catch (e) {
      console.error("Failed to open exam progress WebSocket", e);
    }
  }, [selectedJob]);

  const openJob = async (job) => {
    setSelectedJob(job);
    setStudents([]);
    setStudentsError(null);
    try {
      setStudentsLoading(true);
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Not authenticated");

      // Reuse existing API that lists students with uploaded answers
      const resp = await fetch(`${API_BASE_URL}/exams/${job.exam_id}/students-with-answers`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!resp.ok) {
        throw new Error(`Failed to load students (${resp.status})`);
      }

      const json = await resp.json();
      setStudents(json?.data?.students || json?.data || []);
    } catch (e) {
      console.error("Error fetching students for job", e);
      setStudentsError(e.message || "Failed to load students");
    } finally {
      setStudentsLoading(false);
    }
  };

  const formatDateTime = (iso) => {
    if (!iso) return "-";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Processing Notifications</h1>
          <p className="text-sm text-gray-500 mt-1">
            Background jobs for exam answers processing. Click a job to view processed students.
          </p>
        </div>
        <button
          onClick={fetchJobs}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 p-4 rounded-lg bg-red-50 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      ) : jobs.length === 0 ? (
        <div className="p-6 rounded-lg border border-dashed border-gray-200 text-center text-gray-500 text-sm">
          No processing jobs found yet. Upload answer ZIPs to see notifications here.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-3">
            {jobs.map((job) => (
              <button
                key={job.id}
                onClick={() => openJob(job)}
                className={`w-full text-left p-4 rounded-xl border transition-all text-sm shadow-sm hover:shadow-md hover:border-accent/50 ${
                  selectedJob?.id === job.id ? "border-accent bg-accent/5" : "border-gray-200 bg-white"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-medium text-gray-900">Exam #{job.exam_id}</span>
                  <StatusBadge status={job.status} />
                </div>
                <p className="text-xs text-gray-500 mb-1">Course ID: {job.course_id}</p>
                {job.summary && (
                  <p className="text-xs text-gray-600">
                    Processed {job.summary.total_processed ?? 0}
                    {" · "}
                    Failed {job.summary.total_failed ?? 0}
                    {typeof job.summary.total_attempted_questions === "number" &&
                      typeof job.summary.total_unattempted_questions === "number" && (
                        <>
                          {" · "}
                          Attempted {job.summary.total_attempted_questions}
                          {" · "}
                          Unattempted {job.summary.total_unattempted_questions}
                        </>
                      )}
                  </p>
                )}
                <p className="text-[11px] text-gray-400 mt-1">
                  Created: {formatDateTime(job.created_at)}
                </p>
              </button>
            ))}
          </div>

          <div className="lg:col-span-2">
            {!selectedJob ? (
              <div className="p-6 rounded-lg border border-dashed border-gray-200 text-center text-gray-500 text-sm">
                Select a job to view processed students and answer statuses.
              </div>
            ) : studentsLoading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
              </div>
            ) : studentsError ? (
              <div className="flex items-center gap-2 p-4 rounded-lg bg-red-50 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{studentsError}</span>
              </div>
            ) : students.length === 0 ? (
              <div className="p-6 rounded-lg border border-dashed border-gray-200 text-center text-gray-500 text-sm">
                No students found for this exam yet.
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-sm font-semibold text-gray-900">
                    Students for exam #{selectedJob.exam_id}
                  </h2>
                  {progress && (
                    <div className="flex flex-col items-end gap-1 text-xs text-gray-600">
                      <span>
                        {progress.students_processed} / {progress.students_total} students processed
                      </span>
                      <div className="w-40 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full bg-accent transition-all"
                          style={{
                            width:
                              progress.students_total > 0
                                ? `${Math.min(
                                    100,
                                    (progress.students_processed / progress.students_total) * 100
                                  )}%`
                                : "0%",
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-4 py-2 text-left font-medium text-xs text-gray-500 uppercase tracking-wider">
                            Student
                          </th>
                          <th className="px-4 py-2 text-left font-medium text-xs text-gray-500 uppercase tracking-wider">
                            Roll Number
                          </th>
                          <th className="px-4 py-2 text-center font-medium text-xs text-gray-500 uppercase tracking-wider">
                            Attempted
                          </th>
                          <th className="px-4 py-2 text-center font-medium text-xs text-gray-500 uppercase tracking-wider">
                            Unattempted
                          </th>
                          <th className="px-4 py-2 text-center font-medium text-xs text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {students.map((s, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-4 py-2 whitespace-nowrap">
                              <div className="text-gray-900 font-medium">{s.student_name || s.name}</div>
                              <div className="text-xs text-gray-500">ID: {s.student_id || s.id}</div>
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-gray-700">
                              {s.roll_number || "-"}
                            </td>
                            <td className="px-4 py-2 text-center">
                              <span className="inline-flex px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
                                {s.attempted_questions ?? s.attempted ?? 0}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-center">
                              <span
                                className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  (s.unattempted_questions ?? s.unattempted ?? 0) > 0
                                    ? "bg-red-50 text-red-700"
                                    : "bg-gray-50 text-gray-600"
                                }`}
                              >
                                {s.unattempted_questions ?? s.unattempted ?? 0}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-center">
                              <span
                                className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                                  (s.status || "uploaded") === "success" || s.status === "uploaded"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-red-50 text-red-700"
                                }`}
                              >
                                {s.status || "uploaded"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfessorNotificationsPage;
