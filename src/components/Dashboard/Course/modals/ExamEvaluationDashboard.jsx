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
  Plus,
  XCircle,
  Briefcase,
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
import TagSelectionModal from "./shared/TagSelectionModal";
import CreateTagModal from "./shared/CreateTagModal";
import FilterModal from "./shared/FilterModal";
import JobsListModal from "./shared/JobsListModal";

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

// Helper function to convert hex to RGB
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

const getTagStyle = (tag, customColor) => {
  // If custom color is provided, create lighter background version
  if (customColor) {
    const rgb = hexToRgb(customColor);
    if (rgb) {
      return {
        bg: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`,
        text: customColor,
        border: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`,
        icon: customColor,
        isCustom: true,
      };
    }
  }

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

// Custom tooltip for comparison chart
const ComparisonTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  
  const data = payload[0].payload;
  
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-lg">
      <div className="text-xs font-semibold text-slate-900">
        {data.studentName}
      </div>
      <div className="text-xs text-slate-500 mt-0.5">
        ID: {data.fullId}
      </div>
      <div className="mt-2 space-y-1">
        {payload.map((entry) => {
          const rawValue = entry.dataKey === "openai" ? data.openaiRaw : data.geminiRaw;
          return (
            <div key={entry.name} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-xs text-slate-700">{entry.name}</span>
              </div>
              <span className="text-xs font-medium text-slate-900">
                {rawValue !== null ? `${rawValue}/${data.maxMarks}` : "N/A"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Custom tooltip for problems chart
const ProblemsTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  
  const data = payload[0].payload;
  
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-lg">
      <div className="text-xs font-semibold text-slate-900">
        Question {data.questionNumber}
      </div>
      <div className="text-xs text-slate-500 mt-0.5">
        Max: {data.maxMarks?.toFixed(2) || "N/A"}
      </div>
      <div className="mt-2 space-y-1">
        {payload.map((entry) => {
          const count = entry.dataKey === "openai" ? data.openaiCount : data.geminiCount;
          const rawValue = entry.dataKey === "openai" ? data.openaiRaw : data.geminiRaw;
          return (
            <div key={entry.name} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-xs text-slate-700">{entry.name}</span>
              </div>
              <span className="text-xs font-medium text-slate-900">
                Avg: {rawValue?.toFixed(2)} ({count} students)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
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
  autoTags,
  customTags,
  customTagsMap,
  onOpen,
  onRerun,
  onManageTags,
  onRemoveTag,
  rerunDisabled,
  reasoning,
  reasoningLoading,
  isSelected,
  onToggleSelection,
}) => {
  const [hoveredTag, setHoveredTag] = useState(null);
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
      className={`bg-white border border-slate-200 rounded-2xl p-4 hover:shadow-md transition-all ${
        isSelected ? 'opacity-100' : 'opacity-40'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
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
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleSelection(student.enrollment_id)}
              className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 focus:ring-2 cursor-pointer"
              title="Select student"
            />
        </div>
      </div>

      {(autoTags.length > 0 || customTags.length > 0) && (
        <div className="mt-3 flex flex-wrap gap-2 items-center">
          {autoTags.map((t) => {
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
          {customTags.map((tagName) => {
            const tagData = customTagsMap[tagName];
            const st = getTagStyle(tagName, tagData?.color);
            const isHovered = hoveredTag === tagName;
            
            return (
              <span
                key={tagName}
                className={`group relative inline-flex items-center gap-1 px-2 py-1 pr-${isHovered ? '6' : '2'} rounded-full border text-xs transition-all ${st.isCustom ? '' : st.border + ' ' + st.bg + ' ' + st.text}`}
                title={tagName}
                onMouseEnter={() => setHoveredTag(tagName)}
                onMouseLeave={() => setHoveredTag(null)}
                style={st.isCustom ? {
                  backgroundColor: st.bg,
                  borderColor: st.border,
                  color: st.text
                } : {}}
              >
                <Tag 
                  className={`w-3.5 h-3.5 ${st.isCustom ? '' : st.icon}`}
                  style={st.isCustom ? { color: st.icon } : {}}
                />
                <span className="max-w-[160px] truncate">{tagName}</span>
                {isHovered && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveTag(tagName);
                    }}
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-slate-900 hover:bg-slate-800 flex items-center justify-center transition-colors"
                    title="Remove tag"
                  >
                    <X className="w-2.5 h-2.5 text-white" />
                  </button>
                )}
              </span>
            );
          })}
          <button
            type="button"
            onClick={onManageTags}
            className="inline-flex items-center justify-center w-6 h-6 rounded-full border-2 border-dashed border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-500 hover:text-slate-700 transition-colors"
            title="Manage tags"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {autoTags.length === 0 && customTags.length === 0 && (
        <div className="mt-3">
          <button
            type="button"
            onClick={onManageTags}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 border-dashed border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-xs font-medium text-slate-600 hover:text-slate-700 transition-colors"
            title="Add tags"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Tags</span>
          </button>
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
  const [searchLoading, setSearchLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);

  const loadMoreSentinelRef = useRef(null);
  const loadMoreObserverRef = useRef(null);
  const manualPageChangeRef = useRef(false);
  const latestRequestIdRef = useRef(0);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("");
  
  // New advanced filter state
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    tags: {
      include: [],
      exclude: []
    },
    status: [],
    range: {
      min: 0,
      max: 100,
      mode: 'percent' // 'percent' or 'marks'
    }
  });

    const maxMarks = useMemo(() => {
    const any = students.find((s) => Number.isFinite(s?.max_marks) && s.max_marks > 0);
    return any?.max_marks || 100;
  }, [students]);

  // Update range max when maxMarks changes
  useEffect(() => {
    setFilters(prev => {
      if (prev.range.mode === 'marks' && prev.range.max !== maxMarks) {
        return {
          ...prev,
          range: {
            ...prev.range,
            max: maxMarks
          }
        };
      }
      return prev;
    });
  }, [maxMarks]);

  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState(null);
  const [showStudentDetail, setShowStudentDetail] = useState(false);

  const [marksMode, setMarksMode] = useState("marks"); // marks | percent
  const [binSize, setBinSize] = useState(10);
  const [hoverBin, setHoverBin] = useState(null);

  // Model comparison state
  const [graphMode, setGraphMode] = useState("distribution"); // distribution | comparison | problems
  const [selectedModels, setSelectedModels] = useState(new Set(["current", "gemini"]));
  const [comparisonDataCache, setComparisonDataCache] = useState({});
  const [comparisonDataLoading, setComparisonDataLoading] = useState(false);
  
  // Problems tab state
  const [problemsData, setProblemsData] = useState([]);
  const [problemsDataLoading, setProblemsDataLoading] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  const [showSettings, setShowSettings] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const [selectedModel, setSelectedModel] = useState("current");
  const [pendingModelSelection, setPendingModelSelection] = useState("current");

  const localSelectedModelKey = useMemo(
    () => `eval_dashboard_selected_model:${examId}`,
    [examId]
  );

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

  // Custom tags state
  const localCustomTagsKey = useMemo(
    () => `eval_dashboard_custom_tags:${examId}`,
    [examId]
  );
  const [customTagsMap, setCustomTagsMap] = useState({});
  const [customTagsByEnrollment, setCustomTagsByEnrollment] = useState({});
  
  // Tag modals state
  const [tagModalOpen, setTagModalOpen] = useState(false);
  const [createTagModalOpen, setCreateTagModalOpen] = useState(false);
  const [selectedEnrollmentForTags, setSelectedEnrollmentForTags] = useState(null);
  const [tagCreationLoading, setTagCreationLoading] = useState(false);
  
  // Tag edit/delete state
  const [editingTag, setEditingTag] = useState(null);
  const [deletingTag, setDeletingTag] = useState(null);
  
  // Bulk tag modal state
  const [createTagFromBulk, setCreateTagFromBulk] = useState(false);
  
  // Bulk evaluation modal state
  const [showBulkEvaluateModal, setShowBulkEvaluateModal] = useState(false);
  const [jobName, setJobName] = useState("");
  
  // Jobs list modal state
  const [showJobsModal, setShowJobsModal] = useState(false);
  
  // Filter button ref
  const filterButtonRef = useRef(null);
  
  // Bulk selection state
  const [selectedStudents, setSelectedStudents] = useState(new Set());
  const [showBulkTagModal, setShowBulkTagModal] = useState(false);
  const [bulkSelectedTags, setBulkSelectedTags] = useState([]);

  const [reasoningByEnrollment, setReasoningByEnrollment] = useState({});
  const [reasoningLoadingByEnrollment, setReasoningLoadingByEnrollment] = useState({});

  const [previewByEnrollmentByModel, setPreviewByEnrollmentByModel] = useState({});
  const [previewLoading, setPreviewLoading] = useState(false);
  const previewRequestedIdsRef = useRef({});
  const previewInFlightRef = useRef({});

  const [confirmState, setConfirmState] = useState({ open: false });
  const [confirmLoading, setConfirmLoading] = useState(false);

  const [compareOpen, setCompareOpen] = useState(false);
  const [compareStudent, setCompareStudent] = useState(null);
  const [compareLoading, setCompareLoading] = useState(false);
  const [compareError, setCompareError] = useState(null);
  const [compareData, setCompareData] = useState(null);

  const lastServerTagStateRef = useRef(null);
  const saveTagsTimerRef = useRef(null);
  const tagStateHydratedRef = useRef(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(localSelectedModelKey);
      const model = normalizeModel(raw || "");
      if (model && model !== selectedModel) {
        setSelectedModel(model);
      }
    } catch {
      // ignore
    }
  }, [localSelectedModelKey]);

  useEffect(() => {
    // Switching model must reload enrollments from the beginning to avoid mixing
    // OpenAI/Gemini marks across pages.
    manualPageChangeRef.current = true;
    setStudents([]);
    setPage(1);

    // Reset preview fetch bookkeeping so we fetch previews for the new model.
    previewRequestedIdsRef.current = { ...(previewRequestedIdsRef.current || {}), [selectedModel]: new Set() };
    previewInFlightRef.current = { ...(previewInFlightRef.current || {}), [selectedModel]: false };
  }, [selectedModel]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(localTagsKey);
      if (raw) setTagsByEnrollment(JSON.parse(raw));
    } catch {
      setTagsByEnrollment({});
    }
  }, [localTagsKey]);

  useEffect(() => {
    let canceled = false;

    const loadFromServer = async () => {
      if (!examId) return;
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const readLocalSnapshot = () => {
        try {
          const rawAuto = localStorage.getItem(localTagsKey);
          const rawTags = localStorage.getItem(localCustomTagsKey);
          const rawEnrollmentTags = localStorage.getItem(`${localCustomTagsKey}_enrollments`);
          return {
            tags_by_enrollment: rawAuto ? JSON.parse(rawAuto) : {},
            custom_tags_map: rawTags ? JSON.parse(rawTags) : {},
            custom_tags_by_enrollment: rawEnrollmentTags ? JSON.parse(rawEnrollmentTags) : {},
          };
        } catch {
          return {
            tags_by_enrollment: {},
            custom_tags_map: {},
            custom_tags_by_enrollment: {},
          };
        }
      };

      const isEmptyState = (state) => {
        const a = state?.tags_by_enrollment || {};
        const b = state?.custom_tags_map || {};
        const c = state?.custom_tags_by_enrollment || {};
        return (
          Object.keys(a).length === 0 &&
          Object.keys(b).length === 0 &&
          Object.keys(c).length === 0
        );
      };

      const localSnapshot = readLocalSnapshot();

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000);
        const resp = await fetch(`${API_BASE_URL}/exams/${examId}/dashboard-tags`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          mode: "cors",
          signal: controller.signal,
        }).finally(() => clearTimeout(timeoutId));

        if (!resp.ok) return;
        const data = await resp.json();
        const payload = data?.data;
        if (!payload || canceled) return;

        const serverState = {
          tags_by_enrollment: payload.tags_by_enrollment || {},
          custom_tags_map: payload.custom_tags_map || {},
          custom_tags_by_enrollment: payload.custom_tags_by_enrollment || {},
        };

        // Prefer server state if it has data.
        // If server is empty but local has data (from previous localStorage usage),
        // do a one-time sync of local -> server.
        if (!isEmptyState(serverState)) {
          lastServerTagStateRef.current = JSON.stringify(serverState);
          setTagsByEnrollment(serverState.tags_by_enrollment);
          setCustomTagsMap(serverState.custom_tags_map);
          setCustomTagsByEnrollment(serverState.custom_tags_by_enrollment);
        } else if (!isEmptyState(localSnapshot)) {
          const raw = JSON.stringify(localSnapshot);
          await fetch(`${API_BASE_URL}/exams/${examId}/dashboard-tags`, {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            mode: "cors",
            body: raw,
          }).catch(() => {
            // ignore
          });
          lastServerTagStateRef.current = raw;
        } else {
          lastServerTagStateRef.current = JSON.stringify(serverState);
        }
      } catch {
        // ignore; localStorage fallback remains
      } finally {
        tagStateHydratedRef.current = true;
      }
    };

    loadFromServer();
    return () => {
      canceled = true;
    };
  }, [examId, localTagsKey, localCustomTagsKey]);

  useEffect(() => {
    try {
      localStorage.setItem(localTagsKey, JSON.stringify(tagsByEnrollment));
    } catch {
      // ignore
    }
  }, [localTagsKey, tagsByEnrollment]);

  // Load custom tags from localStorage
  useEffect(() => {
    try {
      const rawTags = localStorage.getItem(localCustomTagsKey);
      const rawEnrollmentTags = localStorage.getItem(`${localCustomTagsKey}_enrollments`);
      if (rawTags) setCustomTagsMap(JSON.parse(rawTags));
      if (rawEnrollmentTags) setCustomTagsByEnrollment(JSON.parse(rawEnrollmentTags));
    } catch {
      setCustomTagsMap({});
      setCustomTagsByEnrollment({});
    }
  }, [localCustomTagsKey]);

  // Save custom tags to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(localCustomTagsKey, JSON.stringify(customTagsMap));
    } catch {
      // ignore
    }
  }, [localCustomTagsKey, customTagsMap]);

  useEffect(() => {
    try {
      localStorage.setItem(`${localCustomTagsKey}_enrollments`, JSON.stringify(customTagsByEnrollment));
    } catch {
      // ignore
    }
  }, [localCustomTagsKey, customTagsByEnrollment]);

  useEffect(() => {
    if (!examId) return;
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    // Prevent initial empty state from overwriting server before hydration completes.
    if (!tagStateHydratedRef.current) return;

    const state = {
      tags_by_enrollment: tagsByEnrollment || {},
      custom_tags_map: customTagsMap || {},
      custom_tags_by_enrollment: customTagsByEnrollment || {},
    };
    const raw = JSON.stringify(state);

    if (raw === lastServerTagStateRef.current) return;

    if (saveTagsTimerRef.current) clearTimeout(saveTagsTimerRef.current);
    saveTagsTimerRef.current = setTimeout(async () => {
      try {
        const resp = await fetch(`${API_BASE_URL}/exams/${examId}/dashboard-tags`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          mode: "cors",
          body: raw,
        });
        if (!resp.ok) return;
        lastServerTagStateRef.current = raw;
      } catch {
        // ignore
      }
    }, 650);

    return () => {
      if (saveTagsTimerRef.current) clearTimeout(saveTagsTimerRef.current);
    };
  }, [examId, tagsByEnrollment, customTagsMap, customTagsByEnrollment]);

  const showToast = useCallback((message, type = "success") => {
    setToast({ show: true, message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast({ show: false, message: "", type: "success" });
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(String(searchQuery || "").trim());
    }, 350);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const fetchEnrollments = useCallback(async (opts = {}) => {
    const requestId = ++latestRequestIdRef.current;
    try {
      if (!examId) throw new Error("Exam ID is missing");

      const targetPage = Number(opts.pageOverride || page || 1) || 1;
      const replace = Boolean(opts.replace || targetPage === 1);

      if (replace) {
        if (students.length === 0) setLoading(true);
        else setRefreshing(true);
      } else {
        setLoadingMore(true);
      }

      setError(null);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 600000);

      const search = String(debouncedSearch || "").trim();
      if (search) setSearchLoading(true);

      const resp = await fetch(
        `${API_BASE_URL}/exams/${examId}/enrollments/list?page=${encodeURIComponent(
          targetPage
        )}&page_size=${encodeURIComponent(pageSize)}&model=${encodeURIComponent(selectedModel)}${
          search ? `&search=${encodeURIComponent(search)}` : ""
        }`,
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
      if (requestId !== latestRequestIdRef.current) return;
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

      setStudents((prev) => {
        if (replace) return formatted;

        const seen = new Set((prev || []).map((p) => String(p.enrollment_id)));
        const next = [...(prev || [])];
        for (const s of formatted) {
          const k = String(s.enrollment_id);
          if (!seen.has(k)) {
            seen.add(k);
            next.push(s);
          }
        }
        return next;
      });
    } catch (e) {
      if (requestId !== latestRequestIdRef.current) return;
      console.error("Dashboard fetch enrollments error:", e);
      setError(e.message || "Failed to load enrollments");
    } finally {
      if (requestId !== latestRequestIdRef.current) return;
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
      setSearchLoading(false);
    }
  }, [examId, page, pageSize, selectedModel, debouncedSearch]);

  useEffect(() => {
    const forceReplace = Boolean(manualPageChangeRef.current);
    manualPageChangeRef.current = false;
    fetchEnrollments({ pageOverride: page, replace: page === 1 || forceReplace });
  }, [fetchEnrollments]);

  useEffect(() => {
    manualPageChangeRef.current = true;
    setStudents([]);
    setPage(1);
    setTotalPages(1);
    setTotalStudents(0);
  }, [debouncedSearch]);

  useEffect(() => {
    if (!loadMoreSentinelRef.current) return;
    if (loadMoreObserverRef.current) {
      loadMoreObserverRef.current.disconnect();
      loadMoreObserverRef.current = null;
    }

    const el = loadMoreSentinelRef.current;
    loadMoreObserverRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries && entries[0];
        if (!entry || !entry.isIntersecting) return;
        if (loading || refreshing || loadingMore || searchLoading) return;
        if (page >= totalPages) return;
        setPage((p) => p + 1);
      },
      { root: null, rootMargin: "600px", threshold: 0 }
    );

    loadMoreObserverRef.current.observe(el);
    return () => {
      if (loadMoreObserverRef.current) {
        loadMoreObserverRef.current.disconnect();
        loadMoreObserverRef.current = null;
      }
    };
  }, [loading, refreshing, loadingMore, searchLoading, page, totalPages]);

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
    async ({ enrollmentIds, forceReevaluate, model, jobName }) => {
      if (!examId) throw new Error("Exam ID is missing");
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Authentication required");

      const ids = Array.isArray(enrollmentIds) ? enrollmentIds : [];
      if (ids.length === 0) throw new Error("No students selected");
    try {
      const resp = await fetch(`${API_BASE_URL}/celery/${examId}/evaluations/jobs`, {
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

      // Store job name in localStorage if provided
      if (jobName && jobName.trim()) {
        const storageKey = `job_names:${examId}`;
        const jobNames = JSON.parse(localStorage.getItem(storageKey) || "{}");
        const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
        jobNames[jobId] = {
          name: jobName.trim(),
          createdBy: currentUser.name || currentUser.email || "You",
          createdAt: new Date().toISOString(),
          model: model || "current",
          studentCount: ids.length,
        };
        localStorage.setItem(storageKey, JSON.stringify(jobNames));
      }

      setActiveEvaluationJobId(jobId);
      setEvaluationProgress({ completed: 0, total: ids.length, failed: 0, status: "running" });

      stopEvaluationJobPolling();
      evaluationJobPollRef.current = setInterval(() => {
        pollEvaluationJob(jobId);
      }, 4000);

      await pollEvaluationJob(jobId);
      
      return jobId;
    } catch (e) {
      console.error("Failed to start evaluation job:", e);
      throw e;
    }
    },
    [examId, pollEvaluationJob, stopEvaluationJobPolling]
  );

  const fetchStudentReasoning = useCallback(async () => {}, []);

  const fetchFeedbackPreviews = useCallback(
    async ({ enrollmentIds, model }) => {
      if (!examId) return;
      const ids = Array.isArray(enrollmentIds) ? enrollmentIds.filter(Boolean) : [];
      if (ids.length === 0) return;

      const selected = normalizeModel(model || "current");

      const requestedBucket = previewRequestedIdsRef.current[selected] || new Set();
      const uniqueIds = Array.from(new Set(ids.map((x) => String(x))));
      const toFetch = uniqueIds.filter((id) => !requestedBucket.has(id));
      if (toFetch.length === 0) return;

      if (previewInFlightRef.current[selected]) return;
      previewInFlightRef.current[selected] = true;

      // Mark requested upfront so we don't loop if the backend returns no preview for some ids.
      toFetch.forEach((id) => requestedBucket.add(id));
      previewRequestedIdsRef.current[selected] = requestedBucket;

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
            enrollment_ids: toFetch,
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
        setPreviewByEnrollmentByModel((prev) => {
          const updated = { ...(prev || {}) };
          updated[selected] = { ...(updated[selected] || {}), ...(previews || {}) };
          return updated;
        });
      } finally {
        setPreviewLoading(false);
        previewInFlightRef.current[selected] = false;
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

  // T@GS
  const computeAutoTags = useCallback(
    (student) => {
      const tags = [];
      const addTag = (t) => {
        if (!t) return;
        if (!tags.includes(t)) tags.push(t);
      };

      const score = Number.isFinite(student?.marks_obtained) ? Number(student.marks_obtained) : null;
      const uploaded = student?.status && student.status !== "not_uploaded";

      if (!uploaded) addTag("Not uploaded");
      if (uploaded && score == null) addTag("Pending evaluation");

      if (score != null && maxMarks > 0) {
        const pct = (score / maxMarks) * 100;
        if (pct >= 90) addTag("Top performer");
        if (pct === 100) addTag("Perfect");
        if (pct < 45) addTag("Needs attention");
      }

      return tags;
    },
    [maxMarks]
  );

  // T@GS
  const filteredStudents = useMemo(() => {
    return (students || []).filter((s) => {
      // Get all tags for this student (auto + custom)
      const autoTags = computeAutoTags(s);
      const customTags = customTagsByEnrollment[String(s.enrollment_id)] || [];
      const allStudentTags = [...autoTags, ...customTags];

      // Tag include filter
      if (filters.tags.include.length > 0) {
        const hasIncludedTag = filters.tags.include.some(tag => 
          allStudentTags.includes(tag)
        );
        if (!hasIncludedTag) return false;
      }

      // Tag exclude filter
      if (filters.tags.exclude.length > 0) {
        const hasExcludedTag = filters.tags.exclude.some(tag => 
          allStudentTags.includes(tag)
        );
        if (hasExcludedTag) return false;
      }

      // Status filter
      if (filters.status.length > 0) {
        const evaluated = s.marks_obtained !== null && s.marks_obtained !== undefined;
        const notUploaded = s.status === "not_uploaded";
        
        const matchesStatus = filters.status.some(status => {
          if (status === 'evaluated') return evaluated;
          if (status === 'not_evaluated') return !evaluated && !notUploaded;
          if (status === 'not_uploaded') return notUploaded;
          return false;
        });
        
        if (!matchesStatus) return false;
      }

      // Range filter
      const score = Number.isFinite(s.marks_obtained) ? s.marks_obtained : null;
      if (score !== null && maxMarks > 0) {
        const value = filters.range.mode === 'percent' 
          ? (score / maxMarks) * 100 
          : score;
        
        if (value < filters.range.min || value > filters.range.max) {
          return false;
        }
      }

      return true;
    });
  }, [students, filters, customTagsByEnrollment, computeAutoTags, maxMarks]);

  const valuesForHistogram = useMemo(() => {
    // Use selected students if any are selected, otherwise use all filtered students
    const studentsToUse = selectedStudents.size > 0 
      ? filteredStudents.filter(s => selectedStudents.has(s.enrollment_id))
      : filteredStudents;
      
    const arr = studentsToUse
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
  }, [filteredStudents, marksMode, maxMarks, selectedStudents]);

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

  // Comparison chart data
  const comparisonChartData = useMemo(() => {
    if (graphMode !== "comparison") return [];
    
    // Filter students who have been evaluated
    let evaluatedStudents = filteredStudents.filter(s => 
      s.marks_obtained !== null && s.marks_obtained !== undefined
    );
    
    // If students are selected, only show selected students
    if (selectedStudents.size > 0) {
      evaluatedStudents = evaluatedStudents.filter(s => 
        selectedStudents.has(s.enrollment_id)
      );
    }
    
    // Sort by enrollment ID
    const sorted = [...evaluatedStudents].sort((a, b) => 
      String(a.enrollment_id).localeCompare(String(b.enrollment_id))
    );
    
    // Transform to chart format
    return sorted.map((student) => {
      const enrollmentId = String(student.enrollment_id);
      
      // Get comparison data from cache or use current marks
      const compData = comparisonDataCache[student.enrollment_id];
      
      const currentMarks = compData?.models?.current?.marks ?? 
                          (normalizeModel(student.evaluation_model) === "current" ? student.marks_obtained : null);
      const geminiMarks = compData?.models?.gemini?.marks ?? 
                         (normalizeModel(student.evaluation_model) === "gemini" ? student.marks_obtained : null);
      
      const studentMaxMarks = student.max_marks || maxMarks;
      
      // Convert to percentage if in percent mode
      const openaiValue = currentMarks !== null 
        ? (marksMode === "percent" ? (currentMarks / studentMaxMarks) * 100 : currentMarks)
        : null;
      const geminiValue = geminiMarks !== null 
        ? (marksMode === "percent" ? (geminiMarks / studentMaxMarks) * 100 : geminiMarks)
        : null;
      
      return {
        name: student.roll_number || enrollmentId,
        fullId: student.roll_number || enrollmentId,
        studentName: student.student_name,
        enrollmentId: student.enrollment_id,
        maxMarks: studentMaxMarks,
        openai: openaiValue,
        gemini: geminiValue,
        // Store raw marks for tooltip
        openaiRaw: currentMarks,
        geminiRaw: geminiMarks,
      };
    }).filter(item => {
      // Only include students with at least one selected model's data
      return (selectedModels.has("current") && item.openai !== null) ||
             (selectedModels.has("gemini") && item.gemini !== null);
    });
  }, [graphMode, filteredStudents, comparisonDataCache, selectedModels, maxMarks, selectedStudents, marksMode]);

  // Problems chart data
  const problemsChartData = useMemo(() => {
    if (graphMode !== "problems") return [];
    
    return problemsData.map(problem => {
      const data = {
        name: problem.questionId,
        questionNumber: problem.questionNumber,
        maxMarks: problem.maxMarks || maxMarks / 10, // Fallback
      };
      
      if (selectedModels.has("current") && problem.currentCount > 0) {
        const rawAvg = problem.currentAvg;
        const displayValue = marksMode === "percent" && problem.maxMarks 
          ? (rawAvg / problem.maxMarks) * 100 
          : rawAvg;
        
        data.openai = displayValue;
        data.openaiRaw = rawAvg;
        data.openaiCount = problem.currentCount;
      }
      
      if (selectedModels.has("gemini") && problem.geminiCount > 0) {
        const rawAvg = problem.geminiAvg;
        const displayValue = marksMode === "percent" && problem.maxMarks 
          ? (rawAvg / problem.maxMarks) * 100 
          : rawAvg;
        
        data.gemini = displayValue;
        data.geminiRaw = rawAvg;
        data.geminiCount = problem.geminiCount;
      }
      
      return data;
    }).filter(item => {
      // Only include questions with at least one selected model's data
      return (selectedModels.has("current") && item.openai !== undefined) ||
             (selectedModels.has("gemini") && item.gemini !== undefined);
    });
  }, [graphMode, problemsData, selectedModels, marksMode, maxMarks]);

  // Fetch problems data for all students

  const fetchProblemsData = useCallback(async () => {
    if (!examId) return;
    setProblemsDataLoading(true);

    try {
      // Use ONLY cached comparison data from students whose compare was opened.
      const questionMap = new Map();
      Object.values(comparisonDataCache || {}).forEach((compData) => {
        if (!compData || !compData.fullData) return;

        const modelEvals = compData.fullData.model_evaluations || {};
        ["current", "gemini"].forEach((modelKey) => {
          const modelData = modelEvals[modelKey];
          if (!modelData || !modelData.evaluations) return;
          const evaluations = modelData.evaluations;

          Object.entries(evaluations).forEach(([qKey, qData]) => {
            const qNum = String(qKey).startsWith("question_")
              ? Number(String(qKey).split("_")[1])
              : Number(String(qKey).replace(/\D/g, ""));
            if (!Number.isFinite(qNum)) return;

            const questionId = `Q${qNum}`;
            if (!questionMap.has(questionId)) {
              questionMap.set(questionId, {
                questionNumber: qNum,
                questionId,
                models: {
                  current: { marks: [], students: [] },
                  gemini: { marks: [], students: [] },
                },
              });
            }

            const question = questionMap.get(questionId);
            const marks = qData.total_marks;
            const qMax = qData.max_marks || null;

            if (Number.isFinite(marks)) {
              question.models[modelKey].marks.push(marks);
              if (qMax && Number.isFinite(qMax) && !question.maxMarks) {
                question.maxMarks = qMax;
              }
            }
          });
        });
      });

      const problemsArray = Array.from(questionMap.values())
        .map((q) => {
          const currentMarks = q.models.current.marks;
          const geminiMarks = q.models.gemini.marks;
          const currentStats = computeStats(currentMarks);
          const geminiStats = computeStats(geminiMarks);

          const questionMaxMarks =
            q.maxMarks ||
            Math.max(
              currentMarks.length > 0 ? Math.max(...currentMarks) : 0,
              geminiMarks.length > 0 ? Math.max(...geminiMarks) : 0
            ) ||
            maxMarks / 10;

          return {
            ...q,
            maxMarks: questionMaxMarks,
            currentAvg: currentStats.avg,
            geminiAvg: geminiStats.avg,
            currentMax: currentStats.max,
            geminiMax: geminiStats.max,
            currentMin: currentStats.min,
            geminiMin: geminiStats.min,
            currentStdDev: currentStats.stdDev,
            geminiStdDev: geminiStats.stdDev,
            currentCount: currentStats.count,
            geminiCount: geminiStats.count,
            difference: currentStats.avg - geminiStats.avg,
          };
        })
        .sort((a, b) => a.questionNumber - b.questionNumber);

      setProblemsData(problemsArray);
    } catch (e) {
      console.error("Failed to compute problems data:", e);
      showToast("Failed to compute problems data", "error");
    } finally {
      setProblemsDataLoading(false);
    }
  }, [examId, comparisonDataCache, maxMarks, showToast]);

  useEffect(() => {
    if (graphMode === "problems") {
      fetchProblemsData();
    }
  }, [graphMode, fetchProblemsData]);

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
    try {
      localStorage.setItem(localSelectedModelKey, model);
    } catch {
      // ignore
    }
    setShowSettings(false);
    showToast(`Model applied: ${displayModelName(model)}`, "success");
  }, [localSelectedModelKey, pendingModelSelection, showToast]);

  // EV@LUATE
  const rerunSingleStudent = useCallback(
    async (enrollmentId) => {
      if (!enrollmentId) return;

      setConfirmState({
        open: true,
        title: "Re-run evaluation for this student?",
        message: `This will start evaluation again using '${displayModelName(selectedModel)}'.`,
        confirmText: "Run evaluation",
        confirmTone: "primary",
        onConfirm: async () => {
          setConfirmLoading(true);
          try {
            showToast("Evaluation started...", "info");
            const student = students.find(s => s.enrollment_id === enrollmentId);
            const jobName = student ? `Re-evaluate ${student.student_name}` : `Re-evaluate Student`;
            await startEvaluationJob({
              enrollmentIds: [enrollmentId],
              forceReevaluate: true,
              model: selectedModel,
              jobName: jobName,
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
    [selectedModel, showToast, startEvaluationJob, students]
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
      .map((s) => String(s.enrollment_id));
    if (ids.length === 0) return;

    const bucket = previewByEnrollmentByModel?.[selectedModel] || {};
    const requested = previewRequestedIdsRef.current?.[selectedModel] || new Set();
    const missing = ids.filter((id) => !bucket[id] && !requested.has(id));
    if (missing.length === 0) return;

    const t = setTimeout(() => {
      fetchFeedbackPreviews({ enrollmentIds: missing, model: selectedModel }).catch((e) => {
        console.error("Preview fetch error:", e);
      });
    }, 250);

    return () => clearTimeout(t);
  }, [fetchFeedbackPreviews, selectedModel, students, previewByEnrollmentByModel]);

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

        // If we already have it cached, use it immediately and skip the network.
        const cached = comparisonDataCache?.[enrollmentId];
        if (cached?.fullData) {
          const cachedModels = cached.fullData?.model_evaluations || {};
          const cachedCurrentEvals = cachedModels?.current?.evaluations || {};
          const cachedGeminiEvals = cachedModels?.gemini?.evaluations || {};

          const hasCurrent =
            cachedModels?.current?.total_marks !== null &&
            cachedModels?.current?.total_marks !== undefined;
          const hasGemini =
            cachedModels?.gemini?.total_marks !== null &&
            cachedModels?.gemini?.total_marks !== undefined;

          const hasCurrentEvals =
            cachedCurrentEvals && Object.keys(cachedCurrentEvals).length > 0;
          const hasGeminiEvals =
            cachedGeminiEvals && Object.keys(cachedGeminiEvals).length > 0;

          // If cache indicates Gemini exists but OpenAI is missing/empty, refetch.
          // This prevents the UI from getting stuck with stale compare payloads.
          const shouldRefetch =
            (hasGemini || hasGeminiEvals) && !(hasCurrent || hasCurrentEvals);

          if (!shouldRefetch) {
            setCompareData(cached.fullData);
            setCompareLoading(false);
            return;
          }
        }

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

        // Cache for charts/problems view without triggering additional requests.
        setComparisonDataCache((prev) => {
          const updated = { ...(prev || {}) };
          updated[enrollmentId] = {
            models: {
              current: {
                marks: data.data?.model_evaluations?.current?.total_marks,
                maxMarks: data.data?.max_marks,
              },
              gemini: {
                marks: data.data?.model_evaluations?.gemini?.total_marks,
                maxMarks: data.data?.max_marks,
              },
            },
            fullData: data.data,
          };
          return updated;
        });
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
    [examId, comparisonDataCache]
  );

  // Custom tag handlers
  const openTagModal = useCallback((enrollmentId) => {
    setSelectedEnrollmentForTags(enrollmentId);
    setTagModalOpen(true);
  }, []);

  const closeTagModal = useCallback(() => {
    setTagModalOpen(false);
    setSelectedEnrollmentForTags(null);
  }, []);

  const openCreateTagModal = useCallback(() => {
    setCreateTagModalOpen(true);
  }, []);

  const closeCreateTagModal = useCallback(() => {
    setCreateTagModalOpen(false);
    setEditingTag(null);
  }, []);

  const handleToggleTag = useCallback((tagName) => {
    if (!selectedEnrollmentForTags) return;

    setCustomTagsByEnrollment(prev => {
      const key = String(selectedEnrollmentForTags);
      const existing = prev[key] || [];
      
      if (existing.includes(tagName)) {
        // Remove tag
        return {
          ...prev,
          [key]: existing.filter(t => t !== tagName)
        };
      } else {
        // Add tag
        return {
          ...prev,
          [key]: [...existing, tagName]
        };
      }
    });
  }, [selectedEnrollmentForTags]);

  const handleRemoveTag = useCallback((enrollmentId, tagName) => {
    setCustomTagsByEnrollment(prev => {
      const key = String(enrollmentId);
      const existing = prev[key] || [];
      return {
        ...prev,
        [key]: existing.filter(t => t !== tagName)
      };
    });
    showToast(`Tag "${tagName}" removed`, "success");
  }, [showToast]);

  const handleEditTag = useCallback((tagName) => {
    const tagData = customTagsMap[tagName];
    if (!tagData) return;
    setEditingTag(tagData);
    setCreateTagModalOpen(true);
  }, [customTagsMap]);

  const handleUpdateTag = useCallback(({ name, color }) => {
    if (!editingTag) return;
    
    setTagCreationLoading(true);
    const oldName = editingTag.name;
    
    // Update tag in customTagsMap
    setCustomTagsMap(prev => {
      const updated = { ...prev };
      if (oldName !== name) {
        delete updated[oldName];
      }
      updated[name] = { name, color, isCustom: true };
      return updated;
    });

    // Update tag name in all students if name changed
    if (oldName !== name) {
      setCustomTagsByEnrollment(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(key => {
          const tags = updated[key] || [];
          if (tags.includes(oldName)) {
            updated[key] = tags.map(t => t === oldName ? name : t);
          }
        });
        return updated;
      });
    }

    setTagCreationLoading(false);
    setCreateTagModalOpen(false);
    setEditingTag(null);
    showToast(`Tag "${name}" updated successfully`, "success");
  }, [editingTag, showToast]);

  const handleDeleteTag = useCallback((tagName) => {
    setDeletingTag(tagName);
    
    // Count usage
    const usageCount = Object.values(customTagsByEnrollment).filter(
      tags => tags.includes(tagName)
    ).length;

    setConfirmState({
      open: true,
      title: "Delete Tag",
      message: `Are you sure you want to delete "${tagName}"? ${usageCount > 0 ? `This will remove it from ${usageCount} student${usageCount > 1 ? 's' : ''}.` : 'This tag is not currently assigned to any students.'}`,
      confirmText: "Delete",
      confirmTone: "danger",
      onConfirm: async () => {
        setConfirmLoading(true);
        
        // Remove from customTagsMap
        setCustomTagsMap(prev => {
          const updated = { ...prev };
          delete updated[tagName];
          return updated;
        });

        // Remove from all students
        setCustomTagsByEnrollment(prev => {
          const updated = { ...prev };
          Object.keys(updated).forEach(key => {
            updated[key] = (updated[key] || []).filter(t => t !== tagName);
          });
          return updated;
        });

        setConfirmLoading(false);
        setConfirmState({ open: false });
        setDeletingTag(null);
        showToast(`Tag "${tagName}" deleted`, "success");
      },
    });
  }, [customTagsByEnrollment, showToast]);

    const handleCreateTag = useCallback(({ name, color }) => {
    if (editingTag) {
      // Edit mode
      handleUpdateTag({ name, color });
    } else {
      // Create mode
      setTagCreationLoading(true);
      
      // Add to custom tags map
      setCustomTagsMap(prev => ({
        ...prev,
        [name]: { name, color, isCustom: true }
      }));

      // Auto-assign to current student if modal is open for a student
      if (selectedEnrollmentForTags) {
        setCustomTagsByEnrollment(prev => {
          const key = String(selectedEnrollmentForTags);
          const existing = prev[key] || [];
          if (!existing.includes(name)) {
            return {
              ...prev,
              [key]: [...existing, name]
            };
          }
          return prev;
        });
      }

      setTagCreationLoading(false);
      setCreateTagModalOpen(false);
      
      // If created from bulk modal, reopen bulk modal
      if (createTagFromBulk) {
        setCreateTagFromBulk(false);
        // Small delay to ensure smooth transition
        setTimeout(() => setShowBulkTagModal(true), 100);
      }
      
      showToast(`Tag "${name}" created successfully`, "success");
    }
  }, [editingTag, handleUpdateTag, selectedEnrollmentForTags, createTagFromBulk, showToast]);

  const availableCustomTags = useMemo(() => {
    return Object.values(customTagsMap);
  }, [customTagsMap]);

  const tagUsageStats = useMemo(() => {
    const stats = {};
    Object.values(customTagsMap).forEach(tag => {
      const count = Object.values(customTagsByEnrollment).filter(
        tags => tags.includes(tag.name)
      ).length;
      stats[tag.name] = count;
    });
    return stats;
  }, [customTagsMap, customTagsByEnrollment]);

  const handleApplyFilters = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.tags.include.length > 0) count += filters.tags.include.length;
    if (filters.tags.exclude.length > 0) count += filters.tags.exclude.length;
    if (filters.status.length > 0) count += filters.status.length;
    const rangeMax = filters.range.mode === 'percent' ? 100 : maxMarks;
    if (filters.range.min !== 0 || filters.range.max !== rangeMax) count += 1;
    return count;
  }, [filters, maxMarks]);

  const clearAllFilters = useCallback(() => {
    setFilters({
      tags: { include: [], exclude: [] },
      status: [],
      range: {
        min: 0,
        max: 100,
        mode: 'percent'
      }
    });
  }, []);

  // Bulk selection handlers
  const toggleStudentSelection = useCallback((enrollmentId) => {
    setSelectedStudents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(enrollmentId)) {
        newSet.delete(enrollmentId);
      } else {
        newSet.add(enrollmentId);
      }
      return newSet;
    });
  }, []);

  const selectAllStudents = useCallback(() => {
    const allIds = new Set(filteredStudents.map(s => s.enrollment_id));
    setSelectedStudents(allIds);
  }, [filteredStudents]);

  const deselectAllStudents = useCallback(() => {
    setSelectedStudents(new Set());
  }, []);

  const handleBulkTagAssign = useCallback((tagName) => {
    // Toggle tag in temporary selection
    setBulkSelectedTags(prev => {
      if (prev.includes(tagName)) {
        return prev.filter(t => t !== tagName);
      } else {
        return [...prev, tagName];
      }
    });
  }, []);

  const applyBulkTags = useCallback(() => {
    if (bulkSelectedTags.length === 0) {
      showToast("Please select at least one tag", "warning");
      return;
    }

    setCustomTagsByEnrollment(prev => {
      const updated = { ...prev };
      selectedStudents.forEach(enrollmentId => {
        const key = String(enrollmentId);
        const existing = updated[key] || [];
        const newTags = [...existing];
        
        bulkSelectedTags.forEach(tagName => {
          if (!newTags.includes(tagName)) {
            newTags.push(tagName);
          }
        });
        
        updated[key] = newTags;
      });
      return updated;
    });
    
    showToast(
      `${bulkSelectedTags.length} tag${bulkSelectedTags.length > 1 ? 's' : ''} assigned to ${selectedStudents.size} student${selectedStudents.size > 1 ? 's' : ''}`, 
      "success"
    );
    setBulkSelectedTags([]);
    setShowBulkTagModal(false);
  }, [bulkSelectedTags, selectedStudents, showToast]);

  // Model comparison handlers
  const toggleModel = useCallback((modelId) => {
    setSelectedModels(prev => {
      const newSet = new Set(prev);
      
      // Ensure at least one model is always selected
      if (newSet.has(modelId) && newSet.size === 1) {
        showToast("At least one model must be selected", "warning");
        return prev;
      }
      
      if (newSet.has(modelId)) {
        newSet.delete(modelId);
      } else {
        newSet.add(modelId);
      }
      
      return newSet;
    });
  }, [showToast]);

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
                onClick={() => setShowJobsModal(true)}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm flex items-center gap-2"
              >
                <Briefcase className="w-4 h-4 text-slate-500" />
                <span>Jobs</span>
                {activeEvaluationJobId && (
                  <span className="px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold">
                    1
                  </span>
                )}
              </button>
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

          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1">
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

            {/* Active Filters Display */}
            {activeFiltersCount > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                {filters.tags.include.map(tag => (
                  <span
                    key={`filter-include-${tag}`}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs border border-emerald-200"
                  >
                    <CheckCircle className="w-3 h-3" />
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => setFilters(prev => ({
                        ...prev,
                        tags: {
                          ...prev.tags,
                          include: prev.tags.include.filter(t => t !== tag)
                        }
                      }))}
                      className="ml-1 hover:bg-emerald-100 rounded"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {filters.tags.exclude.map(tag => (
                  <span
                    key={`filter-exclude-${tag}`}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-50 text-rose-700 text-xs border border-rose-200"
                  >
                    <XCircle className="w-3 h-3" />
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => setFilters(prev => ({
                        ...prev,
                        tags: {
                          ...prev.tags,
                          exclude: prev.tags.exclude.filter(t => t !== tag)
                        }
                      }))}
                      className="ml-1 hover:bg-rose-100 rounded"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {filters.status.map(status => (
                  <span
                    key={`filter-status-${status}`}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs border border-indigo-200"
                  >
                    <span className="capitalize">{status.replace('_', ' ')}</span>
                    <button
                      type="button"
                      onClick={() => setFilters(prev => ({
                        ...prev,
                        status: prev.status.filter(s => s !== status)
                      }))}
                      className="ml-1 hover:bg-indigo-100 rounded"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {(filters.range.min !== 0 || filters.range.max !== (filters.range.mode === 'percent' ? 100 : maxMarks)) && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 text-amber-700 text-xs border border-amber-200">
                    <span>
                      {filters.range.min}{filters.range.mode === 'percent' ? '%' : ''} - {filters.range.max}{filters.range.mode === 'percent' ? '%' : ''}
                    </span>
                    <button
                      type="button"
                      onClick={() => setFilters(prev => ({
                        ...prev,
                        range: {
                          ...prev.range,
                          min: 0,
                          max: prev.range.mode === 'percent' ? 100 : maxMarks
                        }
                      }))}
                      className="ml-1 hover:bg-amber-100 rounded"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-xs text-slate-500 hover:text-slate-700 underline"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Filter Button */}
            <button
              ref={filterButtonRef}
              type="button"
              onClick={() => setShowFilterModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-sm font-medium text-slate-700 transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-slate-900 text-white text-xs font-semibold">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="px-5 md:px-7 py-4">
        <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="bg-white border border-slate-200 rounded-xl p-3">
          {/* Top row: Title, Controls, Stats */}
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-slate-900">Mark Distribution</span>
              
              {/* Marks/% Toggle */}
              <div className="flex items-center rounded-lg border border-slate-200 bg-white overflow-hidden">
                <button
                  type="button"
                  onClick={() => setMarksMode("marks")}
                  className={`px-2.5 py-1.5 text-xs ${
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
                  className={`px-2.5 py-1.5 text-xs ${
                    marksMode === "percent"
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  %
                </button>
              </div>

              {/* Mode-specific controls */}
              {graphMode === "distribution" && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Bin</span>
                  <input
                    type="number"
                    min={1}
                    max={marksMode === "percent" ? 50 : Math.max(1, Math.floor(maxMarks / 2))}
                    value={binSize}
                    onChange={(e) => setBinSize(Number(e.target.value) || 10)}
                    className="w-16 px-2 py-1 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-slate-300"
                  />
                </div>
              )}

              {graphMode === "comparison" && (
                <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white">
                  <span className="text-xs text-slate-500">Models:</span>
                  {[
                    { id: "current", label: "OpenAI", color: "#6366F1" },
                    { id: "gemini", label: "Gemini", color: "#10B981" }
                  ].map(model => (
                    <label key={model.id} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedModels.has(model.id)}
                        onChange={() => toggleModel(model.id)}
                        className="w-3.5 h-3.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900 focus:ring-1 cursor-pointer"
                      />
                      <span className="text-xs text-slate-700">{model.label}</span>
                      <div 
                        className="w-2.5 h-2.5 rounded" 
                        style={{ backgroundColor: model.color }}
                      />
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Stats on the right */}
            <div className="flex items-center gap-4">
              {graphMode === "distribution" ? (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-400">Avg:</span>
                    <span className="text-sm font-semibold text-slate-900">
                      {stats.count ? (marksMode === "percent" ? `${stats.avg.toFixed(1)}%` : stats.avg.toFixed(2)) : "—"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-400">Std Dev:</span>
                    <span className="text-sm font-semibold text-slate-900">
                      {stats.count ? stats.stdDev.toFixed(2) : "—"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-400">Max:</span>
                    <span className="text-sm font-semibold text-slate-900">
                      {stats.count ? (marksMode === "percent" ? `${stats.max.toFixed(1)}%` : stats.max.toFixed(2)) : "—"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-400">Min:</span>
                    <span className="text-sm font-semibold text-slate-900">
                      {stats.count ? (marksMode === "percent" ? `${stats.min.toFixed(1)}%` : stats.min.toFixed(2)) : "—"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-400">Total:</span>
                    <span className="text-sm font-semibold text-slate-900">
                      {maxMarks}
                    </span>
                  </div>
                </>
              ) : graphMode === "comparison" ? (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-400">Students:</span>
                    <span className="text-sm font-semibold text-slate-900">
                      {comparisonChartData.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-400">Total:</span>
                    <span className="text-sm font-semibold text-slate-900">
                      {maxMarks}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-400">Questions:</span>
                    <span className="text-sm font-semibold text-slate-900">
                      {problemsChartData.length}
                    </span>
                  </div>
                  {selectedQuestion && (
                    <>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-slate-400">Selected:</span>
                        <span className="text-sm font-semibold text-slate-900">
                          Q{selectedQuestion.questionNumber}
                        </span>
                      </div>
                      {selectedModels.has("current") && selectedQuestion.currentCount > 0 && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-indigo-600">OpenAI Avg:</span>
                          <span className="text-sm font-semibold text-indigo-700">
                            {marksMode === "percent" && selectedQuestion.maxMarks
                              ? ((selectedQuestion.currentAvg / selectedQuestion.maxMarks) * 100).toFixed(2) + "%"
                              : selectedQuestion.currentAvg.toFixed(2)}
                          </span>
                        </div>
                      )}
                      {selectedModels.has("gemini") && selectedQuestion.geminiCount > 0 && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-emerald-600">Gemini Avg:</span>
                          <span className="text-sm font-semibold text-emerald-700">
                            {marksMode === "percent" && selectedQuestion.maxMarks
                              ? ((selectedQuestion.geminiAvg / selectedQuestion.maxMarks) * 100).toFixed(2) + "%"
                              : selectedQuestion.geminiAvg.toFixed(2)}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Chart area with left sidebar */}
          <div className="flex gap-3">
            {/* Left sidebar - Mode selection */}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setGraphMode("distribution")}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  graphMode === "distribution"
                    ? "bg-slate-900 text-white"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                Distribution
              </button>
              <button
                type="button"
                onClick={() => setGraphMode("comparison")}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  graphMode === "comparison"
                    ? "bg-slate-900 text-white"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                Comparison
              </button>
              <button
                type="button"
                onClick={() => setGraphMode("problems")}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  graphMode === "problems"
                    ? "bg-slate-900 text-white"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                Problems
              </button>
            </div>

            {/* Chart */}
            <div className="flex-1 h-64 rounded-lg border border-slate-200 bg-white">
              {comparisonDataLoading && (graphMode === "comparison" || graphMode === "problems") ? (
                <div className="h-full flex items-center justify-center">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Loader className="w-3.5 h-3.5 animate-spin" />
                    <span>Loading {graphMode} data…</span>
                  </div>
                </div>
              ) : problemsDataLoading && graphMode === "problems" ? (
                <div className="h-full flex items-center justify-center">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Loader className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing questions…</span>
                  </div>
                </div>
              ) : graphMode === "comparison" && comparisonChartData.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-xs text-slate-600">No evaluation data available</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Students need to be evaluated by at least one model</div>
                  </div>
                </div>
              ) : graphMode === "problems" && problemsChartData.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-xs text-slate-600">No question data available</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Students need to be evaluated with detailed feedback</div>
                  </div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  {graphMode === "distribution" ? (
                    <BarChart data={chartData} margin={{ top: 40, right: 40, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 10, fill: "#64748B" }}
                        interval={Math.max(0, Math.floor(chartData.length / 12))}
                        axisLine={{ stroke: "#E2E8F0" }}
                        tickLine={{ stroke: "#E2E8F0" }}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: "#64748B" }}
                        axisLine={{ stroke: "#E2E8F0" }}
                        tickLine={{ stroke: "#E2E8F0" }}
                        allowDecimals={false}
                      />
                      <Tooltip
                        cursor={{ fill: "rgba(15, 118, 110, 0.08)" }}
                        contentStyle={{
                          borderRadius: 8,
                          border: "1px solid #E2E8F0",
                          fontSize: 11,
                        }}
                        labelStyle={{ fontWeight: 600 }}
                      />
                      <Bar
                        dataKey="count"
                        fill="#0f766e"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={24}
                        onMouseMove={(state) => {
                          if (state && state.activePayload && state.activePayload[0]) {
                            const p = state.activePayload[0].payload;
                            setHoverBin(p);
                          }
                        }}
                        onMouseLeave={() => setHoverBin(null)}
                      />
                    </BarChart>
                  ) : graphMode === "comparison" ? (
                    <BarChart data={comparisonChartData} margin={{ top: 40, right: 40, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis 
                        dataKey="name"
                        tick={{ fontSize: 10, fill: "#64748B" }}
                        axisLine={{ stroke: "#E2E8F0" }}
                        tickLine={{ stroke: "#E2E8F0" }}
                      />
                      <YAxis 
                        tick={{ fontSize: 10, fill: "#64748B" }}
                        axisLine={{ stroke: "#E2E8F0" }}
                        tickLine={{ stroke: "#E2E8F0" }}
                        allowDecimals={false}
                      />
                      <Tooltip content={<ComparisonTooltip />} />
                      {selectedModels.has("current") && (
                        <Bar 
                          dataKey="openai" 
                          fill="#6366F1" 
                          name="OpenAI"
                          radius={[4, 4, 0, 0]}
                          maxBarSize={36}
                        />
                      )}
                      {selectedModels.has("gemini") && (
                        <Bar 
                          dataKey="gemini" 
                          fill="#10B981" 
                          name="Gemini"
                          radius={[4, 4, 0, 0]}
                          maxBarSize={36}
                        />
                      )}
                    </BarChart>
                  ) : (
                    <BarChart 
                      data={problemsChartData} 
                      margin={{ top: 40, right: 40, left: 0, bottom: 20 }}
                      onClick={(data) => {
                        if (data && data.activePayload && data.activePayload[0]) {
                          const clickedQuestion = problemsData.find(
                            p => p.questionId === data.activePayload[0].payload.name
                          );
                          setSelectedQuestion(clickedQuestion);
                        }
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis 
                        dataKey="name"
                        tick={{ fontSize: 10, fill: "#64748B" }}
                        axisLine={{ stroke: "#E2E8F0" }}
                        tickLine={{ stroke: "#E2E8F0" }}
                      />
                      <YAxis 
                        tick={{ fontSize: 10, fill: "#64748B" }}
                        axisLine={{ stroke: "#E2E8F0" }}
                        tickLine={{ stroke: "#E2E8F0" }}
                        allowDecimals={true}
                        label={{ value: 'Average Marks', angle: -90, position: 'insideLeft', style: { fontSize: 10, fill: '#64748B' } }}
                      />
                      <Tooltip content={<ProblemsTooltip />} />
                      {selectedModels.has("current") && (
                        <Bar 
                          dataKey="openai" 
                          fill="#6366F1" 
                          name="OpenAI"
                          radius={[4, 4, 0, 0]}
                          maxBarSize={48}
                        />
                      )}
                      {selectedModels.has("gemini") && (
                        <Bar 
                          dataKey="gemini" 
                          fill="#10B981" 
                          name="Gemini"
                          radius={[4, 4, 0, 0]}
                          maxBarSize={48}
                        />
                      )}
                    </BarChart>
                  )}
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </motion.div>

        {/* Problems Detail Table */}
        {graphMode === "problems" && problemsData.length > 0 && (
          <motion.div 
            variants={fadeInUp} 
            initial="hidden" 
            animate="visible" 
            className="mt-4 bg-white border border-slate-200 rounded-xl overflow-hidden"
          >
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-900">Question Analysis</div>
              <div className="text-xs text-slate-500">
                Click on a question to see student details
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-slate-700">Question</th>
                    {selectedModels.has("current") && (
                      <>
                        <th className="px-4 py-3 text-center font-medium text-indigo-700">OpenAI Avg</th>
                        <th className="px-4 py-3 text-center font-medium text-indigo-600">OpenAI Min</th>
                        <th className="px-4 py-3 text-center font-medium text-indigo-600">OpenAI Max</th>
                        <th className="px-4 py-3 text-center font-medium text-indigo-600">OpenAI StdDev</th>
                        <th className="px-4 py-3 text-center font-medium text-indigo-600">OpenAI Count</th>
                      </>
                    )}
                    {selectedModels.has("gemini") && (
                      <>
                        <th className="px-4 py-3 text-center font-medium text-emerald-700">Gemini Avg</th>
                        <th className="px-4 py-3 text-center font-medium text-emerald-600">Gemini Min</th>
                        <th className="px-4 py-3 text-center font-medium text-emerald-600">Gemini Max</th>
                        <th className="px-4 py-3 text-center font-medium text-emerald-600">Gemini StdDev</th>
                        <th className="px-4 py-3 text-center font-medium text-emerald-600">Gemini Count</th>
                      </>
                    )}
                    {selectedModels.has("current") && selectedModels.has("gemini") && (
                      <th className="px-4 py-3 text-center font-medium text-slate-700">Difference</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {problemsData.map((problem) => {
                    const isSelected = selectedQuestion?.questionId === problem.questionId;
                    const questionMaxMarks = problem.maxMarks || maxMarks / 10;
                    
                    // Helper function to format value based on marks mode
                    const formatValue = (value) => {
                      if (marksMode === "percent" && questionMaxMarks) {
                        return ((value / questionMaxMarks) * 100).toFixed(2) + "%";
                      }
                      return value.toFixed(2);
                    };
                    
                    return (
                      <tr 
                        key={problem.questionId} 
                        className={`hover:bg-slate-50 cursor-pointer transition-colors ${
                          isSelected ? 'bg-indigo-50' : ''
                        }`}
                        onClick={() => setSelectedQuestion(problem)}
                      >
                        <td className="px-4 py-3 text-slate-900 font-medium">
                          {problem.questionId}
                        </td>
                        {selectedModels.has("current") && (
                          <>
                            <td className="px-4 py-3 text-center text-indigo-900 font-semibold">
                              {problem.currentCount > 0 ? formatValue(problem.currentAvg) : "—"}
                            </td>
                            <td className="px-4 py-3 text-center text-indigo-700">
                              {problem.currentCount > 0 ? formatValue(problem.currentMin) : "—"}
                            </td>
                            <td className="px-4 py-3 text-center text-indigo-700">
                              {problem.currentCount > 0 ? formatValue(problem.currentMax) : "—"}
                            </td>
                            <td className="px-4 py-3 text-center text-indigo-700">
                              {problem.currentCount > 0 ? formatValue(problem.currentStdDev) : "—"}
                            </td>
                            <td className="px-4 py-3 text-center text-indigo-700">
                              {problem.currentCount}
                            </td>
                          </>
                        )}
                        {selectedModels.has("gemini") && (
                          <>
                            <td className="px-4 py-3 text-center text-emerald-900 font-semibold">
                              {problem.geminiCount > 0 ? formatValue(problem.geminiAvg) : "—"}
                            </td>
                            <td className="px-4 py-3 text-center text-emerald-700">
                              {problem.geminiCount > 0 ? formatValue(problem.geminiMin) : "—"}
                            </td>
                            <td className="px-4 py-3 text-center text-emerald-700">
                              {problem.geminiCount > 0 ? formatValue(problem.geminiMax) : "—"}
                            </td>
                            <td className="px-4 py-3 text-center text-emerald-700">
                              {problem.geminiCount > 0 ? formatValue(problem.geminiStdDev) : "—"}
                            </td>
                            <td className="px-4 py-3 text-center text-emerald-700">
                              {problem.geminiCount}
                            </td>
                          </>
                        )}
                        {selectedModels.has("current") && selectedModels.has("gemini") && (
                          <td className={`px-4 py-3 text-center font-semibold ${
                            problem.difference > 0 
                              ? 'text-indigo-700' 
                              : problem.difference < 0 
                              ? 'text-emerald-700' 
                              : 'text-slate-700'
                          }`}>
                            {problem.currentCount > 0 && problem.geminiCount > 0 
                              ? (problem.difference > 0 ? '+' : '') + formatValue(problem.difference)
                              : "—"}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Selected Question Student Details */}
        {graphMode === "problems" && selectedQuestion && (
          <motion.div 
            variants={fadeInUp} 
            initial="hidden" 
            animate="visible" 
            className="mt-4 bg-white border border-slate-200 rounded-xl overflow-hidden"
          >
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-900">
                  Question {selectedQuestion.questionNumber} - Student Scores
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Detailed breakdown by model
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedQuestion(null)}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
              {selectedModels.has("current") && selectedQuestion.models.current.students.length > 0 && (
                <div className="rounded-xl border border-indigo-200 bg-indigo-50/30 overflow-hidden">
                  <div className="px-4 py-3 bg-indigo-100 border-b border-indigo-200">
                    <div className="text-sm font-semibold text-indigo-900">
                      OpenAI Evaluations ({selectedQuestion.models.current.students.length})
                    </div>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-indigo-50 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium text-indigo-700">Student</th>
                          <th className="px-3 py-2 text-left font-medium text-indigo-700">Roll No</th>
                          <th className="px-3 py-2 text-center font-medium text-indigo-700">Marks</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-indigo-100">
                        {selectedQuestion.models.current.students
                          .sort((a, b) => b.marks - a.marks)
                          .map((student, idx) => (
                            <tr key={`${student.enrollmentId}-${idx}`} className="hover:bg-indigo-50">
                              <td className="px-3 py-2 text-slate-900">{student.name}</td>
                              <td className="px-3 py-2 text-slate-700">{student.rollNumber}</td>
                              <td className="px-3 py-2 text-center text-indigo-900 font-semibold">
                                {student.marks.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {selectedModels.has("gemini") && selectedQuestion.models.gemini.students.length > 0 && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/30 overflow-hidden">
                  <div className="px-4 py-3 bg-emerald-100 border-b border-emerald-200">
                    <div className="text-sm font-semibold text-emerald-900">
                      Gemini Evaluations ({selectedQuestion.models.gemini.students.length})
                    </div>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-emerald-50 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium text-emerald-700">Student</th>
                          <th className="px-3 py-2 text-left font-medium text-emerald-700">Roll No</th>
                          <th className="px-3 py-2 text-center font-medium text-emerald-700">Marks</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-emerald-100">
                        {selectedQuestion.models.gemini.students
                          .sort((a, b) => b.marks - a.marks)
                          .map((student, idx) => (
                            <tr key={`${student.enrollmentId}-${idx}`} className="hover:bg-emerald-50">
                              <td className="px-3 py-2 text-slate-900">{student.name}</td>
                              <td className="px-3 py-2 text-slate-700">{student.rollNumber}</td>
                              <td className="px-3 py-2 text-center text-emerald-900 font-semibold">
                                {student.marks.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      <div className="px-5 md:px-7 py-6 space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="text-sm text-slate-600">
              Showing <span className="font-medium text-slate-900">{filteredStudents.length}</span> of{" "}
              <span className="font-medium text-slate-900">{totalStudents || students.length}</span>
            </div>
            {filteredStudents.length > 0 && (
              <>
                <div className="h-4 w-px bg-slate-300" />
                <button
                  type="button"
                  onClick={selectAllStudents}
                  className="text-xs text-slate-600 hover:text-slate-900 underline font-medium"
                >
                  Select all
                </button>
                {selectedStudents.size > 0 && (
                  <>
                    <button
                      type="button"
                      onClick={deselectAllStudents}
                      className="text-xs text-slate-600 hover:text-slate-900 underline font-medium"
                    >
                      Deselect all
                    </button>
                    <div className="h-4 w-px bg-slate-300" />
                    <div className="text-xs text-slate-600">
                      <span className="font-medium text-slate-900">{selectedStudents.size}</span> selected
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowBulkTagModal(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-medium text-white transition-colors"
                    >
                      <Tag className="w-3.5 h-3.5" />
                      <span>Assign Tag</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowBulkEvaluateModal(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-xs font-medium text-white transition-colors"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Evaluate</span>
                    </button>
                  </>
                )}
              </>
            )}
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
                manualPageChangeRef.current = true;
                setStudents([]);
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
              onChange={(e) => {
                manualPageChangeRef.current = true;
                setStudents([]);
                setPage(Number(e.target.value) || 1);
              }}
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

        {loading || searchLoading ? (
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
              const autoTags = computeAutoTags(s);
              const customTags = customTagsByEnrollment[key] || [];
              const preview = (previewByEnrollmentByModel?.[selectedModel] || {})[key];
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
                  autoTags={autoTags}
                  customTags={customTags}
                  customTagsMap={customTagsMap}
                  reasoning={reasoning}
                  reasoningLoading={reasoningLoading}
                  onOpen={() => openCompare(s)}
                  onRerun={() => rerunSingleStudent(s.enrollment_id)}
                  onManageTags={() => openTagModal(s.enrollment_id)}
                  onRemoveTag={(tagName) => handleRemoveTag(s.enrollment_id, tagName)}
                  rerunDisabled={Boolean(activeEvaluationJobId) || s.status === "not_uploaded"}
                  isSelected={selectedStudents.has(s.enrollment_id)}
                  onToggleSelection={toggleStudentSelection}
                />
              );
            })}

            <div ref={loadMoreSentinelRef} className="col-span-full h-1" />

            {loadingMore && (
              <div className="col-span-full flex items-center justify-center py-6 text-slate-600">
                <div className="flex items-center gap-2">
                  <Loader className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Loading more…</span>
                </div>
              </div>
            )}
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

                {/* Tag Management Section */}
                <div className="pt-3 mt-3 border-t border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xs font-semibold text-slate-700">Tag Management</div>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingTag(null);
                        setCreateTagModalOpen(true);
                      }}
                      className="px-2 py-1 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 inline-flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>New</span>
                    </button>
                  </div>

                  {Object.keys(customTagsMap).length > 0 ? (
                    <div className="space-y-2 max-h-[240px] overflow-y-auto">
                      {Object.values(customTagsMap).map((tag) => {
                        const usageCount = tagUsageStats[tag.name] || 0;
                        const rgb = hexToRgb(tag.color);
                        const bgColor = rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)` : '#f1f5f9';
                        const borderColor = rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)` : '#e2e8f0';
                        
                        return (
                          <div
                            key={tag.name}
                            className="flex items-center justify-between px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50"
                          >
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <div
                                className="w-3 h-3 rounded-full flex-shrink-0"
                                style={{ backgroundColor: tag.color }}
                              />
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-medium text-slate-800 truncate">
                                  {tag.name}
                                </div>
                                <div className="text-[10px] text-slate-500">
                                  {usageCount} student{usageCount !== 1 ? 's' : ''}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button
                                type="button"
                                onClick={() => handleEditTag(tag.name)}
                                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700"
                                title="Edit tag"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteTag(tag.name)}
                                className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-500 hover:text-rose-600"
                                title="Delete tag"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-6 px-3 rounded-xl bg-slate-50 border border-slate-200">
                      <Tag className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <div className="text-xs text-slate-600">No custom tags yet</div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        Create tags to organize students
                      </div>
                    </div>
                  )}
                </div>
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
            model={selectedModel}
          />
        )}
      </Suspense>

      <TagSelectionModal
        open={tagModalOpen}
        availableTags={availableCustomTags}
        selectedTags={customTagsByEnrollment[String(selectedEnrollmentForTags)] || []}
        onClose={closeTagModal}
        onToggleTag={handleToggleTag}
        onCreateNew={openCreateTagModal}
      />

      <CreateTagModal
        open={createTagModalOpen}
        onClose={closeCreateTagModal}
        onCreate={handleCreateTag}
        loading={tagCreationLoading}
        editMode={Boolean(editingTag)}
        initialData={editingTag}
      />

      <FilterModal
        open={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        filters={filters}
        onApply={handleApplyFilters}
        availableTags={availableCustomTags}
        maxMarks={maxMarks}
        buttonRef={filterButtonRef}
      />

      {/* Bulk Tag Assignment Modal */}
      <TagSelectionModal
        open={showBulkTagModal}
        availableTags={availableCustomTags}
        selectedTags={bulkSelectedTags}
        onClose={() => {
          setShowBulkTagModal(false);
          setBulkSelectedTags([]);
        }}
        onToggleTag={handleBulkTagAssign}
        onCreateNew={() => {
          setShowBulkTagModal(false);
          setCreateTagFromBulk(true);
          setEditingTag(null);
          setCreateTagModalOpen(true);
        }}
        onApply={applyBulkTags}
      />

      {/* Bulk Evaluation Modal */}
      <AnimatePresence>
        {showBulkEvaluateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4"
            onClick={() => setShowBulkEvaluateModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.99 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-2xl"
            >
              <div className="p-5 border-b border-slate-200 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-900">Evaluate Students</div>
                  <div className="mt-0.5 text-xs text-slate-500">
                    Select AI model to evaluate {selectedStudents.size} student{selectedStudents.size > 1 ? 's' : ''}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowBulkEvaluateModal(false)}
                  className="p-2 rounded-xl hover:bg-slate-100 text-slate-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* Job Name Input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Job Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={jobName}
                    onChange={(e) => setJobName(e.target.value)}
                    placeholder="e.g., Midterm Evaluation - Batch 1"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <p className="text-xs text-slate-500 mt-1.5">
                    Give this job a name to easily identify it later
                  </p>
                </div>

                {/* Model Selection */}
                <div>
                  <div className="text-xs font-semibold text-slate-700 mb-3">
                    Choose AI Model
                  </div>
                  
                  {[
                    { 
                      id: 'current', 
                      label: 'OpenAI', 
                      description: 'GPT-4 based evaluation',
                      icon: '🤖',
                      color: 'indigo'
                    },
                    { 
                      id: 'gemini', 
                      label: 'Gemini', 
                      description: 'Google Gemini evaluation',
                      icon: '✨',
                      color: 'emerald'
                    }
                  ].map((model) => (
                    <button
                      key={model.id}
                      type="button"
                      onClick={async () => {
                        setShowBulkEvaluateModal(false);
                        
                        try {
                          showToast(`Starting evaluation with ${model.label}...`, "info");
                          
                          const enrollmentIds = Array.from(selectedStudents);
                          await startEvaluationJob({
                            enrollmentIds,
                            forceReevaluate: true,
                            model: model.id,
                            jobName: jobName,
                          });
                          
                          // Clear form and selection
                          setJobName("");
                          deselectAllStudents();
                        } catch (e) {
                          console.error("Bulk evaluation error:", e);
                          showToast(e.message || "Failed to start evaluation", "error");
                        }
                      }}
                      className={`w-full flex items-start gap-4 px-4 py-4 rounded-xl border-2 transition-all hover:border-${model.color}-300 hover:bg-${model.color}-50 border-slate-200 bg-white mb-3 last:mb-0`}
                    >
                      <div className="text-2xl">{model.icon}</div>
                      <div className="flex-1 text-left">
                        <div className="text-sm font-semibold text-slate-900">{model.label}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{model.description}</div>
                      </div>
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-5 border-t border-slate-200 bg-slate-50 rounded-b-2xl">
                <div className="flex items-start gap-2 text-xs text-slate-600">
                  <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-slate-700">Note:</div>
                    <div className="mt-0.5">
                      This will re-evaluate all selected students. Existing evaluations will be overwritten.
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Toast show={toast.show} message={toast.message} type={toast.type} onClose={hideToast} />
      
      {/* Jobs List Modal */}
      <JobsListModal
        open={showJobsModal}
        onClose={() => setShowJobsModal(false)}
        examId={examId}
        activeJobId={activeEvaluationJobId}
        onJobSelect={(jobId) => {
          setActiveEvaluationJobId(jobId);
          stopEvaluationJobPolling();
          evaluationJobPollRef.current = setInterval(() => {
            pollEvaluationJob(jobId);
          }, 4000);
          pollEvaluationJob(jobId);
        }}
        currentUser={
          typeof localStorage !== 'undefined' 
            ? JSON.parse(localStorage.getItem("user") || "{}") 
            : {}
        }
      />
    </div>
  );
};

export default ExamEvaluationDashboard;
