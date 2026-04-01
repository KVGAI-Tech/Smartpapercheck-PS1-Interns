/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  Eye,
  Loader2,
  Trophy,
  Users,
  XCircle,
} from "lucide-react";
import {
  getConductExamAnalytics,
  getConductExamResults,
} from "./api";
import CombinedChartCard from "./shared/CombinedChartCard";

const StatCard = ({ title, value, icon: Icon }) => (
  <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="mt-2 text-2xl font-semibold text-gray-900">{value}</p>
      </div>
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
        <Icon className="h-5 w-5" />
      </div>
    </div>
  </div>
);

const ProfessorConductExamEvaluatePage = () => {
  const navigate = useNavigate();
  const { courseId, examId } = useParams();

  const [analytics, setAnalytics] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("score_desc");
  const [performanceFilter, setPerformanceFilter] = useState("all");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [analyticsResp, resultsResp] = await Promise.all([
          getConductExamAnalytics(examId),
          getConductExamResults(examId),
        ]);

        if (cancelled) return;

        setAnalytics(analyticsResp?.data || null);
        setResults(resultsResp?.data?.results || []);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load conduct exam evaluation data.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [examId]);

  const filteredResults = useMemo(() => {
    let next = [...results];

    if (performanceFilter === "top") {
      next = next.filter((row) => row.score !== null && row.score >= 70);
    } else if (performanceFilter === "low") {
      next = next.filter((row) => row.score !== null && row.score < 50);
    }

    switch (sortBy) {
      case "score_asc":
        next.sort((a, b) => (a.score ?? 101) - (b.score ?? 101));
        break;
      case "name_asc":
        next.sort((a, b) => a.student_name.localeCompare(b.student_name));
        break;
      case "score_desc":
      default:
        next.sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
        break;
    }

    return next;
  }, [performanceFilter, results, sortBy]);

  const handleOpenAnswers = (student) => {
    navigate(`/courses/${courseId}/exams/${examId}/review/${student.student_id}`, {
      state: {
        courseName: analytics?.course?.course_name,
        courseCode: analytics?.course?.course_code,
        examName: analytics?.exam?.exam_name,
        studentName: student.student_name,
      },
    });
  };

  const handleExportCsv = () => {
    const header = ["Student Name", "Roll Number", "Score", "Status", "Submission Status"];
    const rows = filteredResults.map((row) => [
      row.student_name,
      row.roll_number,
      row.score ?? "Pending",
      row.status,
      row.submission_status,
    ]);
    const csvContent = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `exam-${examId}-results.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const summary = analytics?.summary || {};
  const trendData = analytics?.trend || [];
  const distributionData = analytics?.distribution || [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <button
            onClick={() => navigate(`/courses/${courseId}`, { state: { activeTab: "exams" } })}
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-accent"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Exams
          </button>
          <h1 className="text-3xl font-semibold text-gray-900">
            {analytics?.exam?.exam_name || "MCQ Evaluation"}
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Review scores, attempt patterns, and per-student answers for this portal MCQ exam.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={performanceFilter}
            onChange={(e) => setPerformanceFilter(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm focus:border-accent focus:outline-none"
          >
            <option value="all">All Students</option>
            <option value="top">Top Performers</option>
            <option value="low">Low Performers</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm focus:border-accent focus:outline-none"
          >
            <option value="score_desc">Sort by Score</option>
            <option value="score_asc">Lowest First</option>
            <option value="name_asc">Name A-Z</option>
          </select>
          <button
            onClick={handleExportCsv}
            className="rounded-xl border border-accent/20 bg-accent/10 px-4 py-2 text-sm font-medium text-accent transition hover:bg-accent/15"
          >
            Export CSV
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex min-h-[320px] items-center justify-center rounded-3xl border border-gray-100 bg-white shadow-sm">
          <Loader2 className="mr-3 h-6 w-6 animate-spin text-accent" />
          <span className="text-sm text-gray-500">Loading evaluation data...</span>
        </div>
      )}

      {!loading && error && (
        <div className="rounded-3xl border border-red-100 bg-red-50 p-6 text-red-700 shadow-sm">
          <h2 className="text-lg font-semibold">Unable to load evaluation data</h2>
          <p className="mt-2 text-sm">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard title="Average Score" value={`${summary.average_score ?? 0}%`} icon={BarChart3} />
            <StatCard title="Highest Score" value={`${summary.highest_score ?? 0}%`} icon={Trophy} />
            <StatCard title="Lowest Score" value={`${summary.lowest_score ?? 0}%`} icon={XCircle} />
            <StatCard title="Total Attempts" value={summary.total_attempts ?? 0} icon={Users} />
          </div>

          <CombinedChartCard
            performanceTrendData={trendData}
            scoreDistributionData={distributionData}
          />

          <div className="rounded-3xl border border-gray-100 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-6 py-5">
              <h2 className="text-lg font-semibold text-gray-900">Student Performance</h2>
              <p className="mt-1 text-sm text-gray-500">
                Review submitted MCQ attempts and drill into each student’s answers.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50/80">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Student Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Score</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Submission</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredResults.map((row) => (
                    <tr key={row.enrollment_id} className="hover:bg-gray-50/60">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{row.student_name}</div>
                        <div className="text-xs text-gray-500">{row.roll_number || "No roll number"}</div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-800">
                        {row.score !== null ? `${row.score}%` : "Pending"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                            row.status === "pass"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {row.status === "pass" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                          {row.status === "pass" ? "Pass" : "Fail"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {row.submission_status === "submitted" ? "Submitted" : "Not Submitted"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleOpenAnswers(row)}
                          className="inline-flex items-center gap-2 rounded-xl border border-accent/20 bg-accent/10 px-4 py-2 text-sm font-medium text-accent transition hover:bg-accent/15"
                        >
                          <Eye className="h-4 w-4" />
                          View Answers
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!filteredResults.length && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">
                        No student results match the selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProfessorConductExamEvaluatePage;
