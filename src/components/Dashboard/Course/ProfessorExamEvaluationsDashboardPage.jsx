import React, { Suspense } from "react";
import { useNavigate, useParams } from "react-router-dom";

const ExamEvaluationDashboard = React.lazy(() =>
  import("./modals/ExamEvaluationDashboard")
);

const ProfessorExamEvaluationsDashboardPage = () => {
  const navigate = useNavigate();
  const { courseId, examId } = useParams();

  return (
    <div className="h-full min-h-0 min-w-0 overflow-x-hidden">
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent" />
          </div>
        }
      >
        <ExamEvaluationDashboard
          examId={examId}
          courseId={courseId}
          onClose={() => {
            navigate(`/courses/${courseId}`, {
              state: { activeTab: "exams" },
            });
          }}
        />
      </Suspense>
    </div>
  );
};

export default ProfessorExamEvaluationsDashboardPage;
