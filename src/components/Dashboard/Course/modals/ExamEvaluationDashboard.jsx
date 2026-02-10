import React, { useCallback, useEffect, useMemo, useRef, useState, Suspense } from "react";
import {
  BarChart3,
  Filter,
  Search,
  Settings,
  Tag,
  X,
  Loader,
  CheckCircle,
  AlertTriangle,
  Eye,
  Play,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { API_BASE_URL } from "../../../../BaseURL";

const StudentEvaluationLoader = React.lazy(() => import("./StudentEvaluationLoader"));

const fadeInUp = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: "easeOut" },
  },
};

const computeStats = (values) => {
  const nums = (values || []).filter((v) => Number.isFinite(v));
  if (nums.length === 0) {
    return {
      count: 0,
      avg: 0,
      max: 0,
      min: 0,
      stdDev: 0,
    };
  }

  const count = nums.length;
  const sum = nums.reduce((a, b) => a + b, 0);
  const avg = sum / count;
  const max = Math.max(...nums);
  const min = Math.min(...nums);
  const variance = nums.reduce((acc, v) => acc + (v - avg) ** 2, 0) / count;
  const stdDev = Math.sqrt(variance);

  return { count, avg, max, min, stdDev };
};

const buildHistogram = ({ values, maxValue, binSize }) => {
  const nums = (values || []).filter((v) => Number.isFinite(v));
  const safeMax = Number.isFinite(maxValue) && maxValue > 0 ? maxValue : 100;
  const safeBin = Number.isFinite(binSize) && binSize > 0 ? binSize : 10;
  const binsCount = Math.max(1, Math.ceil(safeMax / safeBin));
  const bins = Array.from({ length: binsCount }, (_, i) => ({
    from: i * safeBin,
    to: Math.min(safeMax, (i + 1) * safeBin),
    count: 0,
  }));

  nums.forEach((v) => {
    const clamped = Math.max(0, Math.min(safeMax, v));
    const idx = Math.min(binsCount - 1, Math.floor(clamped / safeBin));
    bins[idx].count += 1;
  });

  const maxCount = Math.max(...bins.map((b) => b.count), 0);
  return { bins, maxCount };
};

const clampText = (txt, maxLen = 140) => {
  const s = String(txt || "").replace(/\s+/g, " ").trim();
  if (!s) return "";
  if (s.length <= maxLen) return s;
  return `${s.slice(0, maxLen).trim()}…`;
};

const getTagStyle = (tag) => {
  const t = String(tag || "").toLowerCase();
  if (t.includes("top performer") || t.includes("perfect")) {
    return {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
      icon: "text-emerald-600",
    };
  }
  if (t.includes("needs attention") || t.includes("failed")) {
    return {
      bg: "bg-rose-50",
      text: "text-rose-700",
      border: "border-rose-200",
      icon: "text-rose-600",
    };
  }
  if (t.includes("pending") || t.includes("running")) {
    return {
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
      icon: "text-amber-600",
    };
  }
  if (t.startsWith("model:")) {
    return {
      bg: "bg-indigo-50",
      text: "text-indigo-700",
      border: "border-indigo-200",
      icon: "text-indigo-600",
    };
  }
  return {
    bg: "bg-slate-50",
    text: "text-slate-700",
    border: "border-slate-200",
    icon: "text-slate-500",
  };
};

const ConfirmModal = ({ open, title, message, confirmText, confirmTone = "primary", loading, onCancel, onConfirm }) => {
  if (!open) return null;
  const confirmBtn =
    confirmTone === "danger"
      ? "bg-rose-600 hover:bg-rose-700"
      : confirmTone === "warning"
      ? "bg-amber-600 hover:bg-amber-700"
      : "bg-slate-900 hover:bg-slate-800";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4"
        onClick={onCancel}
      >
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.99 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-2xl"
        >
          <div className="p-5">
            <div className="text-sm font-semibold text-slate-900">{title}</div>
            <div className="mt-2 text-sm text-slate-600 leading-relaxed">{message}</div>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={loading}
                className={`px-4 py-2 rounded-xl text-sm font-medium text-white ${confirmBtn} disabled:opacity-60 inline-flex items-center gap-2`}
              >
                {loading ? <Loader className="w-4 h-4 animate-spin" /> : null}
                <span>{confirmText}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const CompareModelsModal = ({ open, student, maxMarks, compareData, loading, error, onClose }) => {
  if (!open) return null;

  const byModel = (model) => {
    const m = compareData?.model_evaluations?.[model] || null;
    const evals = m?.evaluations || {};
    const questions = Object.entries(evals)
      .map(([k, v]) => {
        const qn = String(k).startsWith("question_") ? Number(String(k).split("_")[1]) : Number(String(k).replace(/\D/g, ""));
        const total = v?.total_marks ?? null;
        const feedback = v?.overall_feedback ?? "";
        const item_grades = Array.isArray(v?.item_grades) ? v.item_grades : [];
        return {
          key: k,
          questionNumber: Number.isFinite(qn) ? qn : k,
          totalMarks: total,
          overallFeedback: feedback,
          itemGrades: item_grades,
        };
      })
      .sort((a, b) => Number(a.questionNumber) - Number(b.questionNumber));

    const chart = questions.map((q) => ({
      name: `Q${q.questionNumber}`,
      marks: Number.isFinite(Number(q.totalMarks)) ? Number(q.totalMarks) : 0,
    }));

    return {
      total: m?.total_marks,
      updatedAt: m?.updated_at,
      questions,
      chart,
    };
  };

  const openAi = byModel("current");
  const gemini = byModel("gemini");

  const combinedChart = (() => {
    const keys = new Set();
    openAi.questions.forEach((q) => keys.add(String(q.questionNumber)));
    gemini.questions.forEach((q) => keys.add(String(q.questionNumber)));

    const sorted = Array.from(keys)
      .map((k) => (Number.isFinite(Number(k)) ? Number(k) : k))
      .sort((a, b) => {
        const an = Number(a);
        const bn = Number(b);
        if (Number.isFinite(an) && Number.isFinite(bn)) return an - bn;
        return String(a).localeCompare(String(b));
      });

    const byQ = (arr) => {
      const m = new Map();
      arr.forEach((q) => m.set(String(q.questionNumber), q));
      return m;
    };

    const oMap = byQ(openAi.questions);
    const gMap = byQ(gemini.questions);

    return sorted.map((q) => {
      const k = String(q);
      const o = oMap.get(k);
      const g = gMap.get(k);
      return {
        name: `Q${k}`,
        openai: Number.isFinite(Number(o?.totalMarks)) ? Number(o.totalMarks) : 0,
        gemini: Number.isFinite(Number(g?.totalMarks)) ? Number(g.totalMarks) : 0,
      };
    });
  })();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 14, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 14, scale: 0.99 }}
          onClick={(e) => e.stopPropagation()}
          className="fixed inset-4 md:inset-8 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        >
          <div className="p-5 border-b border-slate-200 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-sm text-slate-500">Student comparison</div>
              <div className="mt-0.5 text-lg font-semibold text-slate-900 truncate">
                {student?.student_name || "Student"} <span className="text-slate-400 font-normal">({student?.roll_number || ""})</span>
              </div>
              <div className="text-xs text-slate-500">Two models side-by-side (per-question marks + feedback)</div>
            </div>
            <button type="button" onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 h-[calc(100%-72px)] overflow-auto">
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Loader className="w-4 h-4 animate-spin" />
                <span>Loading comparison…</span>
              </div>
            ) : error ? (
              <div className="text-sm text-rose-600">{error}</div>
            ) : !compareData ? (
              <div className="text-sm text-slate-600">No data.</div>
            ) : (
              <div className="space-y-5">
                <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                  <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-700">OpenAI</div>
                      <div className="text-xs text-slate-500">Total: {Number.isFinite(Number(openAi.total)) ? `${openAi.total}/${maxMarks}` : "—"}</div>
                      <div className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700">Gemini</div>
                      <div className="text-xs text-slate-500">Total: {Number.isFinite(Number(gemini.total)) ? `${gemini.total}/${maxMarks}` : "—"}</div>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="h-36 w-full rounded-xl border border-slate-200">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={combinedChart} margin={{ top: 12, right: 12, left: 0, bottom: 8 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                          <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748B" }} axisLine={{ stroke: "#E2E8F0" }} tickLine={{ stroke: "#E2E8F0" }} />
                          <YAxis tick={{ fontSize: 10, fill: "#64748B" }} axisLine={{ stroke: "#E2E8F0" }} tickLine={{ stroke: "#E2E8F0" }} allowDecimals={false} />
                          <Tooltip />
                          <Bar dataKey="openai" fill="#6366F1" radius={[6, 6, 0, 0]} />
                          <Bar dataKey="gemini" fill="#10B981" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {[{ id: "current", title: "OpenAI", data: openAi }, { id: "gemini", title: "Gemini", data: gemini }].map((col) => (
                    <div key={col.id} className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                        <div className="text-sm font-semibold text-slate-900">{col.title}</div>
                        <div className="text-xs text-slate-500">
                          Total: {Number.isFinite(Number(col.data.total)) ? `${col.data.total}/${maxMarks}` : "—"}
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="space-y-3">
                          {col.data.questions.map((q) => (
                            <div key={q.key} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                              <div className="flex items-center justify-between gap-2">
                                <div className="text-xs font-semibold text-slate-900">Q{q.questionNumber}</div>
                                <div className="text-xs text-slate-600">
                                  {Number.isFinite(Number(q.totalMarks)) ? q.totalMarks : "—"}
                                </div>
                              </div>
                              <div className="mt-1 text-xs text-slate-700 whitespace-pre-wrap">{q.overallFeedback || "—"}</div>
                              {q.itemGrades.length > 0 && (
                                <div className="mt-2 grid grid-cols-1 gap-2">
                                  {q.itemGrades.map((ig) => (
                                    <div key={ig.item_number} className="text-xs text-slate-600">
                                      <span className="font-medium text-slate-800">Item {ig.item_number}:</span> {ig.marks_awarded}
                                      {ig.feedback ? <span className="text-slate-500"> — {ig.feedback}</span> : null}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                          {col.data.questions.length === 0 && (
                            <div className="text-xs text-slate-500">No evaluations stored for this model yet.</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const normalizeModel = (model) => {
  const m = String(model || "").trim().toLowerCase();
  if (m === "gemini" || m === "google" || m === "google_gemini") return "gemini";
  return "current";
};

const displayModelName = (model) => {
  const m = normalizeModel(model);
  if (m === "gemini") return "Gemini";
  return "OpenAI";
};

const Toast = ({ show, message, type = "success", onClose }) => {
  useEffect(() => {
    if (!show) return;
    const t = setTimeout(() => onClose(), 3500);
    return () => clearTimeout(t);
  }, [show, onClose]);

  if (!show) return null;

  const styles =
    type === "error"
      ? { bg: "bg-red-600", icon: <AlertTriangle className="w-5 h-5" /> }
      : type === "warning"
      ? { bg: "bg-amber-500", icon: <AlertTriangle className="w-5 h-5" /> }
      : type === "info"
      ? { bg: "bg-accent", icon: <Loader className="w-5 h-5 animate-spin" /> }
      : { bg: "bg-accent", icon: <CheckCircle className="w-5 h-5" /> };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className={`fixed bottom-6 right-6 px-5 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-3 ${styles.bg} text-white border border-white/10`}
    >
      <div className="bg-white/20 p-2 rounded-full">{styles.icon}</div>
      <div className="text-sm font-medium">{message}</div>
    </motion.div>
  );
};

const StudentCard = ({
  student,
  maxMarks,
  tags,
  reasoning,
  reasoningLoading,
  onOpen,
  onRerun,
  rerunDisabled,
}) => {
  const score = Number.isFinite(student?.marks_obtained) ? student.marks_obtained : null;
  const pct = maxMarks > 0 && score != null ? Math.round((score / maxMarks) * 100) : null;

  const previewLines = useMemo(() => {
    if (reasoningLoading) return [];
    const arr = Array.isArray(reasoning) ? reasoning : [];
    return arr.slice(0, 2).map((r) => {
      const q = r?.questionNumber;
      const txt = clampText(r?.reasoning, 90) || "—";
      return { key: String(q), label: `Q${q}:`, text: txt };
    });
  }, [reasoning, reasoningLoading]);

  const hasReasoning = Array.isArray(reasoning) ? reasoning.length > 0 : false;

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="bg-white border border-slate-200 rounded-2xl p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-slate-900 truncate">
            {student.student_name}
          </div>
          <div className="mt-0.5 text-xs text-slate-500 truncate">{student.roll_number}</div>
        </div>
        <div className="flex items-center gap-2">
          {score != null ? (
            <div className="px-2.5 py-1 rounded-lg bg-slate-900/5 text-slate-800 text-xs font-medium">
              {score}/{maxMarks} {pct != null ? `(${pct}%)` : ""}
            </div>
          ) : (
            <div className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-500 text-xs font-medium">
              Not evaluated
            </div>
          )}

          <button
            type="button"
            onClick={onRerun}
            disabled={rerunDisabled}
            className={`p-2 rounded-lg transition-colors ${
              rerunDisabled
                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                : "hover:bg-indigo-50 text-indigo-600"
            }`}
            title="Run evaluation again"
          >
            <Play className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onOpen}
            className="p-2 rounded-lg hover:bg-emerald-50 text-emerald-700"
            title="Compare models"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {tags.map((t) => {
            const st = getTagStyle(t);
            return (
              <span
                key={t}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border ${st.border} ${st.bg} text-xs ${st.text}`}
                title={t}
              >
                <Tag className={`w-3.5 h-3.5 ${st.icon}`} />
                <span className="max-w-[160px] truncate">{t}</span>
              </span>
            );
          })}
        </div>
      )}

      <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
        {reasoningLoading ? (
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Loader className="w-4 h-4 animate-spin" />
            <span>Loading reasoning…</span>
          </div>
        ) : hasReasoning ? (
          <div className="space-y-2">
            {previewLines.map((p) => (
              <div key={p.key} className="text-xs text-slate-700">
                <span className="font-semibold text-slate-900">{p.label}</span> <span className="text-slate-600">{p.text}</span>
              </div>
            ))}
            <button
              type="button"
              onClick={onOpen}
              className="mt-1 inline-flex items-center gap-2 text-xs font-medium text-emerald-700 hover:text-emerald-800"
            >
              <span>Open full analysis</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="text-xs text-slate-600">
            No reasoning available yet.
            <button
              type="button"
              onClick={onRerun}
              disabled={rerunDisabled}
              className="ml-2 text-indigo-700 hover:text-indigo-800 font-medium disabled:text-slate-400"
            >
              Run evaluation
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const ExamEvaluationDashboard = ({ examId, courseId, onClose }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("");

  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState(null);
  const [showStudentDetail, setShowStudentDetail] = useState(false);

  const [marksMode, setMarksMode] = useState("marks"); // marks | percent
  const [binSize, setBinSize] = useState(10);
  const [hoverBin, setHoverBin] = useState(null);

  const [showSettings, setShowSettings] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const [selectedModel, setSelectedModel] = useState("current");
  const [pendingModelSelection, setPendingModelSelection] = useState("current");

  const [activeEvaluationJobId, setActiveEvaluationJobId] = useState(null);
  const evaluationJobPollRef = useRef(null);
  const evaluationJobPollDelayRef = useRef(4000);

  const [evaluationProgress, setEvaluationProgress] = useState({
    completed: 0,
    total: 0,
    failed: 0,
    status: null,
  });

  const localTagsKey = useMemo(
    () => `eval_dashboard_tags:${examId}`,
    [examId]
  );
  const [tagsByEnrollment, setTagsByEnrollment] = useState({});

  const [reasoningByEnrollment, setReasoningByEnrollment] = useState({});
  const [reasoningLoadingByEnrollment, setReasoningLoadingByEnrollment] = useState({});

  const [previewByEnrollment, setPreviewByEnrollment] = useState({});
  const [previewLoading, setPreviewLoading] = useState(false);

  const [confirmState, setConfirmState] = useState({ open: false });
  const [confirmLoading, setConfirmLoading] = useState(false);

  const [compareOpen, setCompareOpen] = useState(false);
  const [compareStudent, setCompareStudent] = useState(null);
  const [compareLoading, setCompareLoading] = useState(false);
  const [compareError, setCompareError] = useState(null);
  const [compareData, setCompareData] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(localTagsKey);
      if (raw) setTagsByEnrollment(JSON.parse(raw));
    } catch {
      setTagsByEnrollment({});
    }
  }, [localTagsKey]);

  useEffect(() => {
    try {
      localStorage.setItem(localTagsKey, JSON.stringify(tagsByEnrollment));
    } catch {
      // ignore
    }
  }, [localTagsKey, tagsByEnrollment]);

  const showToast = useCallback((message, type = "success") => {
    setToast({ show: true, message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast({ show: false, message: "", type: "success" });
  }, []);

  const fetchEnrollments = useCallback(async () => {
    try {
      if (!examId) throw new Error("Exam ID is missing");

      if (students.length === 0) setLoading(true);
      else setRefreshing(true);

      setError(null);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 600000);

      const resp = await fetch(
        `${API_BASE_URL}/exams/${examId}/enrollments/list?page=${encodeURIComponent(
          page
        )}&page_size=${encodeURIComponent(pageSize)}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            "Content-Type": "application/json",
          },
          mode: "cors",
          signal: controller.signal,
        }
      ).finally(() => clearTimeout(timeoutId));

      if (!resp.ok) {
        const t = await resp.text().catch(() => "Unknown error");
        throw new Error(`API error (${resp.status}): ${t}`);
      }

      const data = await resp.json();
      const enrollments = data?.data?.enrollments;
      if (!Array.isArray(enrollments)) {
        throw new Error("Invalid response format from API");
      }

      const examFullMarks = data?.data?.exam?.full_marks || 0;
      const pag = data?.data?.pagination || null;
      if (pag) {
        setTotalPages(Number(pag.total_pages || 1) || 1);
        setTotalStudents(Number(pag.total || 0) || 0);
      } else {
        setTotalPages(1);
        setTotalStudents(enrollments.length);
      }

      const formatted = enrollments.map((student) => {
        const hasMarks =
          student.marks_obtained !== null && student.marks_obtained !== undefined;
        return {
          enrollment_id: student.id,
          student_id: student.student_id,
          exam_id: student.exam_id,
          student_name: student.student_name,
          roll_number: student.roll_number,
          marks_obtained: hasMarks ? student.marks_obtained : null,
          max_marks: student.max_marks || examFullMarks || 0,
          status: student.status || "not_uploaded",
        };
      });

      setStudents(formatted);
    } catch (e) {
      console.error("Dashboard fetch enrollments error:", e);
      setError(e.message || "Failed to load enrollments");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [examId, page, pageSize, students.length]);

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  const stopEvaluationJobPolling = useCallback(() => {
    if (evaluationJobPollRef.current) {
      clearInterval(evaluationJobPollRef.current);
      evaluationJobPollRef.current = null;
    }
    evaluationJobPollDelayRef.current = 4000;
  }, []);

  useEffect(() => {
    return () => stopEvaluationJobPolling();
  }, [stopEvaluationJobPolling]);

  const fetchEvaluationJob = useCallback(async (jobId) => {
    const token = localStorage.getItem("accessToken");
    if (!token) throw new Error("Authentication required");

    const resp = await fetch(
      `${API_BASE_URL}/exams/professor/jobs/evaluations/${jobId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        mode: "cors",
      }
    );

    if (!resp.ok) {
      const t = await resp.text().catch(() => "Unknown error");
      throw new Error(`API error (${resp.status}): ${t}`);
    }

    const data = await resp.json();
    if (!data || data.code !== 200 || !data.data) {
      throw new Error(data?.message || "Failed to fetch evaluation job");
    }

    return data.data;
  }, []);

  const pollEvaluationJob = useCallback(
    async (jobId) => {
      try {
        const job = await fetchEvaluationJob(jobId);
        const status = job?.status;
        const progress = job?.progress || {};

        setEvaluationProgress({
          completed: Number(progress.completed || 0),
          total: Number(progress.total || 0),
          failed: Number(progress.failed || 0),
          status: status || null,
        });

        const running = status === "pending" || status === "running";
        if (!running) {
          stopEvaluationJobPolling();
          setActiveEvaluationJobId(null);

          const failed = Number(progress.failed || 0);
          const completed = Number(progress.completed || 0);
          const total = Number(progress.total || 0);

          if (failed > 0) showToast(`Evaluation finished: ${completed}/${total}. Failed: ${failed}.`, "warning");
          else showToast(`Evaluation finished: ${completed}/${total}.`, "success");

          await fetchEnrollments();
        }
      } catch (e) {
        console.error("Dashboard poll job error:", e);
        evaluationJobPollDelayRef.current = Math.min(
          30000,
          (evaluationJobPollDelayRef.current || 4000) * 2
        );
        stopEvaluationJobPolling();
        if (jobId) {
          evaluationJobPollRef.current = setInterval(() => {
            pollEvaluationJob(jobId);
          }, evaluationJobPollDelayRef.current);
        }
      }
    },
    [fetchEvaluationJob, stopEvaluationJobPolling, showToast, fetchEnrollments]
  );

  const startEvaluationJob = useCallback(
    async ({ enrollmentIds, forceReevaluate, model }) => {
      if (!examId) throw new Error("Exam ID is missing");
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Authentication required");

      const ids = Array.isArray(enrollmentIds) ? enrollmentIds : [];
      if (ids.length === 0) throw new Error("No students selected");

      const resp = await fetch(`${API_BASE_URL}/exams/${examId}/evaluations/jobs`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          enrollment_ids: ids,
          force_reevaluate: Boolean(forceReevaluate),
          model: model || "current",
        }),
        mode: "cors",
      });

      if (!resp.ok) {
        const t = await resp.text().catch(() => "Unknown error");
        throw new Error(`API error (${resp.status}): ${t}`);
      }

      const data = await resp.json();
      const jobId = data?.data?.job_id;
      if (!jobId) throw new Error(data?.message || "Failed to start evaluation");

      setActiveEvaluationJobId(jobId);
      setEvaluationProgress({ completed: 0, total: ids.length, failed: 0, status: "running" });

      stopEvaluationJobPolling();
      evaluationJobPollRef.current = setInterval(() => {
        pollEvaluationJob(jobId);
      }, 4000);

      await pollEvaluationJob(jobId);
    },
    [examId, pollEvaluationJob, stopEvaluationJobPolling]
  );

  const fetchStudentReasoning = useCallback(async () => {}, []);

  const fetchFeedbackPreviews = useCallback(
    async ({ enrollmentIds, model }) => {
      if (!examId) return;
      const ids = Array.isArray(enrollmentIds) ? enrollmentIds.filter(Boolean) : [];
      if (ids.length === 0) return;

      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Authentication required");

      setPreviewLoading(true);
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000);
        const resp = await fetch(`${API_BASE_URL}/exams/${examId}/feedback/previews`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            enrollment_ids: ids,
            model: model || "current",
          }),
          mode: "cors",
          signal: controller.signal,
        }).finally(() => clearTimeout(timeoutId));

        if (!resp.ok) {
          const t = await resp.text().catch(() => "Unknown error");
          throw new Error(`API error (${resp.status}): ${t}`);
        }

        const data = await resp.json();
        if (!data || data.code !== 200 || !data.data) {
          throw new Error(data?.message || "Failed to load previews");
        }

        const previews = data.data.previews || {};
        setPreviewByEnrollment((prev) => ({ ...prev, ...previews }));
      } finally {
        setPreviewLoading(false);
      }
    },
    [examId]
  );

  useEffect(() => {
    const resume = async () => {
      try {
        if (!examId) return;
        const token = localStorage.getItem("accessToken");
        if (!token) return;

        const resp = await fetch(
          `${API_BASE_URL}/exams/professor/jobs/evaluations?exam_id=${examId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            mode: "cors",
          }
        );
        if (!resp.ok) return;

        const data = await resp.json();
        const jobs = Array.isArray(data?.data?.jobs) ? data.data.jobs : [];
        const active = jobs.find(
          (j) => j && (j.status === "pending" || j.status === "running")
        );
        if (active?.id) {
          setActiveEvaluationJobId(active.id);
          stopEvaluationJobPolling();
          evaluationJobPollRef.current = setInterval(() => {
            pollEvaluationJob(active.id);
          }, 4000);
          await pollEvaluationJob(active.id);
        }
      } catch (e) {
        console.error("Dashboard resume job error:", e);
      }
    };

    resume();
  }, [examId, pollEvaluationJob, stopEvaluationJobPolling]);

  const maxMarks = useMemo(() => {
    const any = students.find((s) => Number.isFinite(s?.max_marks) && s.max_marks > 0);
    return any?.max_marks || 100;
  }, [students]);

  const computeAutoTags = useCallback(
    (student) => {
      const tags = [];
      if (student?.status === "not_uploaded") tags.push("Not uploaded");
      const score = Number.isFinite(student?.marks_obtained) ? Number(student.marks_obtained) : null;
      const uploaded = student?.status && student.status !== "not_uploaded";
      if (!uploaded) tags.push("Not uploaded");
      if (uploaded && score == null) tags.push("Pending evaluation");
      if (score != null && maxMarks > 0) {
        const pct = (score / maxMarks) * 100;
        if (pct >= 90) tags.push("Top performer");
        if (pct === 100) tags.push("Perfect");
        if (pct < 40) tags.push("Needs attention");
      }
      const model = normalizeModel(student?.evaluation_model);
      if (model) tags.push(`Model: ${displayModelName(model)}`);
      return tags;
    },
    [maxMarks]
  );

  const filteredStudents = useMemo(() => {
    const query = String(searchQuery || "").trim().toLowerCase();
    const tagQ = String(tagFilter || "").trim().toLowerCase();

    return (students || []).filter((s) => {
      if (query) {
        const ok =
          s.student_name?.toLowerCase().includes(query) ||
          s.roll_number?.toLowerCase().includes(query);
        if (!ok) return false;
      }

      if (statusFilter !== "all") {
        const evaluated = s.marks_obtained !== null && s.marks_obtained !== undefined;
        if (statusFilter === "evaluated" && !evaluated) return false;
        if (statusFilter === "not_evaluated" && evaluated) return false;
      }

      if (tagQ) {
        const tags = tagsByEnrollment[String(s.enrollment_id)] || [];
        const ok = tags.some((t) => String(t).toLowerCase().includes(tagQ));
        if (!ok) return false;
      }

      return true;
    });
  }, [students, searchQuery, statusFilter, tagFilter, tagsByEnrollment]);

  const valuesForHistogram = useMemo(() => {
    const arr = filteredStudents
      .map((s) => {
        if (s.marks_obtained === null || s.marks_obtained === undefined) return null;
        if (marksMode === "percent") {
          if (!maxMarks) return null;
          return (Number(s.marks_obtained) / maxMarks) * 100;
        }
        return Number(s.marks_obtained);
      })
      .filter((v) => v !== null);
    return arr;
  }, [filteredStudents, marksMode, maxMarks]);

  const histogramMaxValue = useMemo(() => {
    return marksMode === "percent" ? 100 : maxMarks;
  }, [marksMode, maxMarks]);

  const stats = useMemo(() => computeStats(valuesForHistogram), [valuesForHistogram]);

  const histogram = useMemo(
    () =>
      buildHistogram({
        values: valuesForHistogram,
        maxValue: histogramMaxValue,
        binSize,
      }),
    [valuesForHistogram, histogramMaxValue, binSize]
  );

  const chartData = useMemo(() => {
    const labelSuffix = marksMode === "percent" ? "%" : "";
    return histogram.bins.map((b) => ({
      name: `${b.from}${labelSuffix}-${b.to}${labelSuffix}`,
      count: b.count,
      from: b.from,
      to: b.to,
    }));
  }, [histogram.bins, marksMode]);

  const openStudentDetail = useCallback((enrollmentId) => {
    setSelectedEnrollmentId(enrollmentId);
    setShowStudentDetail(true);
  }, []);

  const closeStudentDetail = useCallback(() => {
    setShowStudentDetail(false);
    setSelectedEnrollmentId(null);
  }, []);

  useEffect(() => {
    setPendingModelSelection(selectedModel);
  }, [selectedModel]);

  const applyModelSelectionGlobally = useCallback(() => {
    const model = normalizeModel(pendingModelSelection);
    setSelectedModel(model);
    setShowSettings(false);
    showToast(`Model applied: ${displayModelName(model)}`, "success");
  }, [pendingModelSelection, showToast]);

  const rerunSingleStudent = useCallback(
    async (enrollmentId) => {
      if (!enrollmentId) return;

      setConfirmState({
        open: true,
        title: "Re-run evaluation for this student?",
        message: `This will start evaluation again using '${selectedModel}'.`,
        confirmText: "Run evaluation",
        confirmTone: "primary",
        onConfirm: async () => {
          setConfirmLoading(true);
          try {
            showToast("Evaluation started...", "info");
            await startEvaluationJob({
              enrollmentIds: [enrollmentId],
              forceReevaluate: true,
              model: selectedModel,
            });
          } catch (e) {
            console.error("Rerun single error:", e);
            showToast(e.message || "Failed to start evaluation", "error");
          } finally {
            setConfirmLoading(false);
            setConfirmState({ open: false });
          }
        },
      });
    },
    [selectedModel, showToast, startEvaluationJob]
  );

  const ensureReasoningLoaded = useCallback(
    async (enrollmentId) => {
      const key = String(enrollmentId);
      if (reasoningByEnrollment[key]) return;
      if (reasoningLoadingByEnrollment[key]) return;
      await fetchStudentReasoning(enrollmentId);
    },
    [fetchStudentReasoning, reasoningByEnrollment, reasoningLoadingByEnrollment]
  );

  useEffect(() => {
    const ids = (students || [])
      .filter((s) => s?.enrollment_id)
      .map((s) => s.enrollment_id);
    if (ids.length === 0) return;

    fetchFeedbackPreviews({ enrollmentIds: ids, model: selectedModel }).catch((e) => {
      console.error("Preview fetch error:", e);
    });
  }, [fetchFeedbackPreviews, selectedModel, students]);

  const openCompare = useCallback(
    async (student) => {
      if (!student?.enrollment_id) return;
      setCompareStudent(student);
      setCompareOpen(true);
      setCompareLoading(true);
      setCompareError(null);
      setCompareData(null);

      try {
        const token = localStorage.getItem("accessToken");
        if (!token) throw new Error("Authentication required");
        const enrollmentId = student.enrollment_id;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000);

        const resp = await fetch(
          `${API_BASE_URL}/exams/${examId}/feedback/${enrollmentId}/compare`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            mode: "cors",
            signal: controller.signal,
          }
        ).finally(() => clearTimeout(timeoutId));
        if (!resp.ok) {
          const t = await resp.text().catch(() => "Unknown error");
          throw new Error(`API error (${resp.status}): ${t}`);
        }

        const data = await resp.json();
        if (!data || data.code !== 200 || !data.data) {
          throw new Error(data?.message || "Failed to load student feedback");
        }

        setCompareData(data.data);
      } catch (e) {
        console.error("Compare load error:", e);
        if (String(e?.name || "").toLowerCase().includes("abort")) {
          setCompareError("Comparison request timed out. Please try again.");
        } else {
          setCompareError(e.message || "Failed to load comparison");
        }
      } finally {
        setCompareLoading(false);
      }
    },
    [examId]
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-slate-50 via-white to-slate-50 text-slate-900">
      <div className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/80 backdrop-blur">
        <div className="px-5 md:px-7 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-xs text-slate-500">
                Model: <span className="font-medium text-slate-700">{displayModelName(selectedModel)}</span>
                {activeEvaluationJobId && (
                  <span className="ml-2">
                    Running: {evaluationProgress.completed}/{evaluationProgress.total}
                    {evaluationProgress.failed ? ` (failed ${evaluationProgress.failed})` : ""}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowSettings(true)}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm flex items-center gap-2"
              >
                <Settings className="w-4 h-4 text-slate-500" />
                <span>Settings</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm"
              >
                Back
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search students (name / roll no.)"
                  className="w-full pl-9 pr-3 py-2.5 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
                />
              </div>
            </div>

            <div className="md:col-span-3">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-2xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent/20"
                >
                  <option value="all">All</option>
                  <option value="evaluated">Evaluated</option>
                  <option value="not_evaluated">Not evaluated</option>
                </select>
              </div>
            </div>

            <div className="md:col-span-4">
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  value={tagFilter}
                  onChange={(e) => setTagFilter(e.target.value)}
                  placeholder="Filter by tag (e.g. low performer)"
                  className="w-full pl-9 pr-3 py-2.5 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 md:px-7 py-6 space-y-6">
        <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-accent/10 text-accent">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">Mark Distribution</div>
                <div className="text-xs text-slate-500">
                  Hover bars to see counts. Bin size controls grouping.
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center rounded-xl border border-slate-200 bg-white overflow-hidden">
                <button
                  type="button"
                  onClick={() => setMarksMode("marks")}
                  className={`px-3 py-2 text-sm ${
                    marksMode === "marks"
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Marks
                </button>
                <button
                  type="button"
                  onClick={() => setMarksMode("percent")}
                  className={`px-3 py-2 text-sm ${
                    marksMode === "percent"
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  %
                </button>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-xs text-slate-500">Bin</div>
                <input
                  type="number"
                  min={1}
                  max={marksMode === "percent" ? 50 : Math.max(1, Math.floor(maxMarks / 2))}
                  value={binSize}
                  onChange={(e) => setBinSize(Number(e.target.value) || 10)}
                  className="w-20 px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
                />
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-9">
              <div className="h-52 w-full rounded-2xl border border-slate-200 bg-white">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10, fill: "#64748B" }}
                      interval={Math.max(0, Math.floor(chartData.length / 12))}
                      axisLine={{ stroke: "#E2E8F0" }}
                      tickLine={{ stroke: "#E2E8F0" }}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#64748B" }}
                      axisLine={{ stroke: "#E2E8F0" }}
                      tickLine={{ stroke: "#E2E8F0" }}
                      allowDecimals={false}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(15, 118, 110, 0.08)" }}
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid #E2E8F0",
                        fontSize: 12,
                      }}
                      labelStyle={{ fontWeight: 600 }}
                    />
                    <Bar
                      dataKey="count"
                      fill="#0f766e"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={26}
                      onMouseMove={(state) => {
                        if (state && state.activePayload && state.activePayload[0]) {
                          const p = state.activePayload[0].payload;
                          setHoverBin(p);
                        }
                      }}
                      onMouseLeave={() => setHoverBin(null)}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="text-xs text-slate-500">Avg</div>
                  <div className="mt-1 text-lg font-semibold text-slate-900">
                    {stats.count ? stats.avg.toFixed(2) : "—"}
                    {marksMode === "percent" ? "%" : ""}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="text-xs text-slate-500">Std Dev</div>
                  <div className="mt-1 text-lg font-semibold text-slate-900">
                    {stats.count ? stats.stdDev.toFixed(2) : "—"}
                  </div>
                </div>

                {hoverBin && (
                  <div className="p-4 rounded-2xl bg-white border border-slate-200">
                    <div className="text-xs text-slate-500">Hovered bin</div>
                    <div className="mt-1 text-sm font-medium text-slate-800">
                      {hoverBin.from}–{hoverBin.to}
                      {marksMode === "percent" ? "%" : ""}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">Count: {hoverBin.count}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        <div className="flex items-center justify-between gap-3">
          <div className="text-sm text-slate-600">
            Showing <span className="font-medium text-slate-900">{filteredStudents.length}</span> of{" "}
            <span className="font-medium text-slate-900">{totalStudents || students.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fetchEnrollments()}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm"
              disabled={refreshing || loading}
            >
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
            <select
              value={pageSize}
              onChange={(e) => {
                setPage(1);
                setPageSize(Number(e.target.value) || 50);
              }}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm"
            >
              {[25, 50, 100, 150, 200].map((n) => (
                <option key={n} value={n}>
                  {n}/page
                </option>
              ))}
            </select>
            <select
              value={page}
              onChange={(e) => setPage(Number(e.target.value) || 1)}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm"
            >
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <option key={p} value={p}>
                  Page {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center gap-2 text-slate-600">
              <Loader className="w-5 h-5 animate-spin" />
              <span className="text-sm">Loading students…</span>
            </div>
          </div>
        ) : error ? (
          <div className="bg-white border border-red-200 rounded-2xl p-6">
            <div className="text-sm font-semibold text-red-700">Failed to load</div>
            <div className="mt-1 text-sm text-slate-600">{error}</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredStudents.map((s) => {
              const key = String(s.enrollment_id);
              const tags = tagsByEnrollment[key] || computeAutoTags(s);
              const preview = previewByEnrollment[key];
              const reasoning = (preview?.items || []).map((it) => ({
                questionNumber: it?.question_number,
                reasoning: it?.overall_feedback,
                marks: it?.marks,
              }));
              const reasoningLoading = previewLoading;

              return (
                <StudentCard
                  key={s.enrollment_id}
                  student={s}
                  maxMarks={maxMarks}
                  tags={tags}
                  reasoning={reasoning}
                  reasoningLoading={reasoningLoading}
                  onOpen={() => openCompare(s)}
                  onRerun={() => rerunSingleStudent(s.enrollment_id)}
                  rerunDisabled={Boolean(activeEvaluationJobId) || s.status === "not_uploaded"}
                />
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 14, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 14, scale: 0.99 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              className="absolute right-5 md:right-7 top-20 w-[360px] max-w-[calc(100vw-2.5rem)] bg-white border border-slate-200 rounded-2xl shadow-2xl p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-semibold text-slate-900">Settings</div>
                  <div className="mt-0.5 text-xs text-slate-500">
                    Choose model.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSettings(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 space-y-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-xs text-slate-500">Current model</div>
                  <div className="mt-1 text-sm font-medium text-slate-800">{displayModelName(selectedModel)}</div>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 bg-white">
                  <div className="text-xs font-semibold text-slate-700">Select model</div>
                  <div className="mt-2 space-y-2">
                    {[
                      { id: "current", label: "OpenAI" },
                      { id: "gemini", label: "Gemini" },
                    ].map((opt) => (
                      <label
                        key={opt.id}
                        className="flex items-center justify-between px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer"
                      >
                        <div className="text-sm text-slate-800 font-medium">{opt.label}</div>
                        <input
                          type="radio"
                          name="model"
                          value={opt.id}
                          checked={normalizeModel(pendingModelSelection) === opt.id}
                          onChange={() => setPendingModelSelection(opt.id)}
                        />
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={applyModelSelectionGlobally}
                  disabled={Boolean(activeEvaluationJobId)}
                  className={`w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    activeEvaluationJobId
                      ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                      : "bg-slate-900 hover:bg-slate-800 text-white"
                  }`}
                >
                  Apply
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal
        open={Boolean(confirmState?.open)}
        title={confirmState?.title}
        message={confirmState?.message}
        confirmText={confirmState?.confirmText}
        confirmTone={confirmState?.confirmTone}
        loading={confirmLoading}
        onCancel={() => (confirmLoading ? null : setConfirmState({ open: false }))}
        onConfirm={confirmState?.onConfirm}
      />

      <CompareModelsModal
        open={compareOpen}
        student={compareStudent}
        maxMarks={maxMarks}
        compareData={compareData}
        loading={compareLoading}
        error={compareError}
        onClose={() => {
          setCompareOpen(false);
          setCompareStudent(null);
          setCompareData(null);
          setCompareError(null);
        }}
      />

      <Suspense fallback={null}>
        {showStudentDetail && selectedEnrollmentId && (
          <StudentEvaluationLoader
            examId={examId}
            courseId={courseId}
            enrollmentId={selectedEnrollmentId}
          />
        )}
      </Suspense>

      <Toast show={toast.show} message={toast.message} type={toast.type} onClose={hideToast} />
    </div>
  );
};

export default ExamEvaluationDashboard;
