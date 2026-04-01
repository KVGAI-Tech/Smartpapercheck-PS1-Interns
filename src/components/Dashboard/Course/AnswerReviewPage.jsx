/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getConductExamQuestions, getConductExamStudentAnswers } from "./api";

const OPTION_LABELS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const stripHtml = (value) => {
  const source = String(value ?? "");

  if (typeof window !== "undefined" && typeof window.DOMParser !== "undefined") {
    const parser = new window.DOMParser();
    const doc = parser.parseFromString(source, "text/html");
    return (doc.body.textContent || "").trim();
  }

  return source.replace(/<[^>]*>/g, "").trim();
};

const matchesValue = (left, right) =>
  String(left ?? "").trim().toLowerCase() === String(right ?? "").trim().toLowerCase();

const normalizeOption = (option, index) => {
  if (typeof option === "string") {
    return {
      id: `option_${index + 1}`,
      body: stripHtml(option),
    };
  }

  return {
    id: option?.option_id ?? option?.id ?? option?.value ?? `option_${index + 1}`,
    body: stripHtml(option?.option_body ?? option?.option_text ?? option?.label ?? option?.text ?? ""),
  };
};

const findMatchingOptionId = (options, value) => {
  const match = options.find((option) => matchesValue(option.id, value) || matchesValue(option.body, value));
  return match?.id ?? null;
};

const normalizeQuestionRecord = (question) => ({
  question_id: question.question_id ?? question.id ?? question.question_number,
  question_number: Number(question.question_number ?? question.id ?? 0) || 0,
  question_text: stripHtml(question.question_text || question.question || "Question text unavailable"),
  options: Array.isArray(question.mcq_options ?? question.options ?? question.question_options)
    ? (question.mcq_options ?? question.options ?? question.question_options)
        .map(normalizeOption)
        .filter((option) => option.body)
    : [],
  correct_answer: stripHtml(question.correct_answer ?? question.answer_key ?? "Not configured"),
  correct_option_ids: Array.isArray(question.correct_option_ids)
    ? question.correct_option_ids
    : question.correct_option_id
      ? [question.correct_option_id]
      : [],
});

const normalizeAnswerRecord = (answer) => {
  const rawStudentAnswer = answer.selected_answer ?? answer.student_answer ?? answer.selected_option_text ?? "";
  const studentAnswer = stripHtml(
    typeof rawStudentAnswer === "string" ? rawStudentAnswer.trim() : String(rawStudentAnswer || "")
  ) || "Not Answered";
  const correctAnswer = stripHtml(answer.correct_answer ?? answer.answer_key ?? "Not configured");
  const isCorrect =
    studentAnswer !== "Not Answered" &&
    (matchesValue(studentAnswer, correctAnswer) || answer.is_correct || answer.status === "correct");

  return {
    question_id: answer.question_id ?? answer.id ?? answer.question_number,
    question_number: Number(answer.question_number ?? answer.question_id ?? 0) || 0,
    student_answer: studentAnswer,
    correct_answer: correctAnswer,
    status: isCorrect ? "correct" : "incorrect",
    selected_option_id: answer.selected_option_id ?? null,
    correct_option_ids: Array.isArray(answer.correct_option_ids)
      ? answer.correct_option_ids
      : answer.correct_option_id
        ? [answer.correct_option_id]
        : [],
  };
};

const mergeQuestionAndAnswerData = (questions, answers) => {
  const answersById = new Map();
  const answersByNumber = new Map();

  answers.forEach((answer) => {
    if (answer.question_id !== null && answer.question_id !== undefined) {
      answersById.set(String(answer.question_id), answer);
    }
    if (answer.question_number !== null && answer.question_number !== undefined) {
      answersByNumber.set(String(answer.question_number), answer);
    }
  });

  return questions.map((question) => {
    const matchedAnswer =
      answersById.get(String(question.question_id)) ??
      answersByNumber.get(String(question.question_number)) ??
      null;

    const studentAnswer = matchedAnswer?.student_answer || "Not Answered";
    const correctAnswer = matchedAnswer?.correct_answer ?? question.correct_answer;
    const selectedOptionId =
      matchedAnswer?.selected_option_id ??
      findMatchingOptionId(question.options, studentAnswer);
    const correctOptionIds =
      matchedAnswer?.correct_option_ids?.length
        ? matchedAnswer.correct_option_ids
        : question.correct_option_ids;
    const status =
      matchedAnswer?.status ??
      (studentAnswer !== "Not Answered" && matchesValue(studentAnswer, correctAnswer) ? "correct" : "incorrect");

    return {
      question_id: question.question_id,
      question_number: question.question_number,
      question_text: question.question_text,
      options: question.options,
      student_answer: studentAnswer,
      correct_answer: correctAnswer,
      status,
      selected_option_id: selectedOptionId,
      correct_option_ids: correctOptionIds,
    };
  });
};

const OptionItem = ({ option, optionLabel, isSelected, isCorrect }) => {
  const stateClassName = isSelected && isCorrect
    ? "border-green-200 bg-green-100/80"
    : isCorrect
      ? "border-green-200 bg-green-50/80"
      : isSelected
        ? "border-red-200 bg-white"
        : "border-gray-200 bg-white";

  const textClassName = isCorrect ? "text-green-900" : "text-gray-800";

  return (
    <div className={`rounded-md border px-4 py-3 transition ${stateClassName}`}>
      <div className="flex items-start gap-3">
        <span className="text-sm font-medium text-gray-600">({optionLabel})</span>
        <p className={`min-w-0 text-sm leading-6 ${textClassName}`}>{option.body}</p>
      </div>
    </div>
  );
};

const QuestionCard = ({ answer }) => {
  const hasOptions = Array.isArray(answer.options) && answer.options.length > 0;
  const isCorrect = answer.status === "correct";

  return (
    <article className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm shadow-gray-200/60">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
            Question {answer.question_number}
          </p>
          <h2 className="mt-3 text-lg font-semibold leading-8 text-gray-950">
            {answer.question_text}
          </h2>
        </div>

        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
            isCorrect ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"
          }`}
        >
          {isCorrect ? "Correct" : "Incorrect"}
        </span>
      </div>

      {hasOptions ? (
        <div className={`mt-6 rounded-xl border p-4 ${isCorrect ? "border-green-100 bg-green-50/50" : "border-gray-200 bg-gray-50/70"}`}>
          <div className="space-y-3">
            {answer.options.map((option, index) => {
              const optionLabel = OPTION_LABELS[index] || `${index + 1}`;
              const isSelected =
                answer.selected_option_id
                  ? matchesValue(option.id, answer.selected_option_id)
                  : matchesValue(option.body, answer.student_answer);
              const isCorrectOption =
                answer.correct_option_ids?.length
                  ? answer.correct_option_ids.some((correctId) => matchesValue(option.id, correctId))
                  : matchesValue(option.body, answer.correct_answer);

              return (
                <OptionItem
                  key={`${answer.question_id}-${optionLabel}`}
                  option={option}
                  optionLabel={optionLabel}
                  isSelected={isSelected}
                  isCorrect={isCorrectOption}
                />
              );
            })}
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50/70 px-4 py-4 text-sm text-gray-700">
          <span className="font-medium text-gray-900">Student Selected:</span>{" "}
          <span>{answer.student_answer}</span>
        </div>
      )}

      <div className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
          Correct Answer
        </p>
        <div className="mt-2 rounded-xl border border-green-100 bg-green-50/80 px-4 py-3">
          <p className="text-sm font-medium text-green-900">{answer.correct_answer}</p>
        </div>
      </div>
    </article>
  );
};

const AnswerReviewPage = () => {
  const { examId, studentId } = useParams();

  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const [questionsResponse, answersResponse] = await Promise.all([
          getConductExamQuestions(examId),
          getConductExamStudentAnswers(examId, studentId),
        ]);

        const questionsPayload = questionsResponse?.data || {};
        const answersPayload = answersResponse?.data || {};
        const normalizedQuestions = Array.isArray(questionsPayload.questions)
          ? questionsPayload.questions.map((question) => normalizeQuestionRecord(question))
          : questionsPayload.question_number
            ? [normalizeQuestionRecord(questionsPayload)]
            : [];
        const normalizedAnswers = Array.isArray(answersPayload.answers)
          ? answersPayload.answers.map((answer) => normalizeAnswerRecord(answer))
          : [];
        const finalData = normalizedQuestions.length
          ? mergeQuestionAndAnswerData(normalizedQuestions, normalizedAnswers)
          : normalizedAnswers;

        console.log("Merged Question Data:", finalData);

        if (!cancelled) {
          setAnswers(finalData);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError.message || "Failed to load answer review.");
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
  }, [examId, studentId]);

  const summary = useMemo(() => {
    const correct = answers.filter((answer) => answer.status === "correct").length;
    const incorrect = answers.length - correct;

    return {
      total: answers.length,
      correct,
      incorrect,
    };
  }, [answers]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-gray-950">Answer Review</h1>
        <p className="mt-3 text-sm text-gray-600">
          {summary.total} Question{summary.total === 1 ? "" : "s"} • {summary.correct} Correct • {summary.incorrect} Incorrect
        </p>
      </div>

      {loading ? (
        <div className="mt-10 text-sm text-gray-500">Loading answers...</div>
      ) : error ? (
        <div className="mt-10 text-sm text-red-600">{error}</div>
      ) : !answers.length ? (
        <div className="mt-10 text-sm text-gray-500">No submitted answers were found for this student.</div>
      ) : (
        <div className="mt-10 space-y-6">
          {answers.map((answer) => (
            <QuestionCard key={answer.question_id} answer={answer} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AnswerReviewPage;
