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
    if (conductVariant === 'subjective') {
      return 'conduct';
    }
    return 'portal_mcq';
  }

  return examType || 'evaluated';
};

export const isPortalMcqExam = (exam) => getExamVariant(exam) === 'portal_mcq';

export const isSubjectiveConductExam = (exam) => getExamVariant(exam) === 'conduct';

export const isEvaluatedExam = (exam) => getExamVariant(exam) === 'evaluated';
