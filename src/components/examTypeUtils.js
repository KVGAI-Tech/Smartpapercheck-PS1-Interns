export const getExamVariant = (exam) => {
  const examType = String(exam?.exam_type || '').toLowerCase();
  const conductVariant = String(exam?.conduct_variant || '').toLowerCase();

  if (examType === 'evaluated') {
    return 'evaluated';
  }

  if (examType === 'portal_mcq') {
    return 'portal_mcq';
  }

  if (examType === 'conduct') {
    if (conductVariant === 'subjective' || conductVariant === 'hybrid') {
      return 'conduct';
    }
    return 'portal_mcq';
  }

  const examMode = String(exam?.exam_mode || '').toLowerCase();
  if (examMode === 'offline') return 'evaluated';
  if (examMode === 'online') {
    if (conductVariant === 'portal_mcq') {
      return 'portal_mcq';
    }
    return 'conduct';
  }

  return examType || 'evaluated';
};

export const isPortalMcqExam = (exam) => getExamVariant(exam) === 'portal_mcq';

export const isSubjectiveConductExam = (exam) => getExamVariant(exam) === 'conduct';

export const isEvaluatedExam = (exam) => getExamVariant(exam) === 'evaluated';

// Hybrid Exam Engine: check if exam contains mixed question types
export const isHybridConductExam = (exam) => {
  return isSubjectiveConductExam(exam) && String(exam?.conduct_variant || '').toLowerCase() === 'hybrid';
};
