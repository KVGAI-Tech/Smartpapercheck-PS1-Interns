import React, { useState, useEffect } from 'react';
import { X, Loader2, FileText, Calendar, Filter, CheckCircle2 } from 'lucide-react';
import { getFinalizedExamPapers, importExamPaper, createExam } from '../api';
import toast from 'react-hot-toast';

const ImportExamPaperModal = ({ isOpen, onClose, courseId, onImportSuccess }) => {
  const [papers, setPapers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadPapers();
    }
  }, [isOpen]);

  const loadPapers = async () => {
    setIsLoading(true);
    try {
      const response = await getFinalizedExamPapers();
      const paperList = response?.data || [];
      // Only show FINALIZED papers
      setPapers(paperList.filter(p => p.status === 'FINALIZED'));
    } catch (error) {
      toast.error(error.message || 'Failed to load finalized papers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async () => {
    if (!selectedPaper) return;
    
    setIsSubmitting(true);
    try {
      // 1. Create a conduct exam in the course
      const newExamData = {
        exam_name: selectedPaper.title || 'Imported Exam',
        full_marks: selectedPaper.total_marks || 100,
        exam_type: 'conduct', // Or any logic to determine
        is_active: false,
        duration_minutes: selectedPaper.duration ? parseInt(selectedPaper.duration) : null,
      };
      
      const examResponse = await createExam(courseId, newExamData);
      const newExam = examResponse?.data;
      
      if (!newExam?.id) {
        throw new Error('Failed to create new exam for importing');
      }

      // 2. Import paper into this new exam
      await importExamPaper(newExam.id, selectedPaper.id);
      
      toast.success('Paper imported successfully');
      onImportSuccess(newExam);
      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to import paper');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const filteredPapers = papers.filter(p => 
    p.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.course_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5 shrink-0">
          <div>
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="h-5 w-5 text-accent" />
              Import from Master Exam
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Select a finalized paper to create a new exam in this course.
            </p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 border-b border-gray-100 shrink-0">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title or course name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
          {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
            </div>
          ) : filteredPapers.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-12 text-center bg-white">
              <FileText className="mb-4 h-12 w-12 text-gray-300" />
              <h4 className="text-sm font-semibold text-gray-900">No finalized papers found</h4>
              <p className="mt-1 text-sm text-gray-500 max-w-sm">
                You haven't finalized any papers yet, or none match your search.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredPapers.map((paper) => (
                <div
                  key={paper.id}
                  onClick={() => setSelectedPaper(paper)}
                  className={`group relative cursor-pointer rounded-xl border-2 p-5 transition-all ${
                    selectedPaper?.id === paper.id
                      ? 'border-accent bg-accent/5'
                      : 'border-gray-200 bg-white hover:border-accent/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h4 className="truncate font-semibold text-gray-900" title={paper.title}>
                        {paper.title || 'Untitled Paper'}
                      </h4>
                      {paper.course_name && (
                        <p className="mt-1 truncate text-sm text-gray-500">
                          {paper.course_name}
                        </p>
                      )}
                      <div className="mt-4 flex items-center gap-4 text-xs font-medium text-gray-500">
                        <div className="flex items-center gap-1.5 rounded-md bg-gray-100 px-2 py-1">
                          <span className="text-gray-900">{paper.total_marks || 0}</span> Marks
                        </div>
                        {paper.duration && (
                          <div className="flex items-center gap-1.5 rounded-md bg-gray-100 px-2 py-1">
                            <span className="text-gray-900">{paper.duration}</span> Mins
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 rounded-md bg-blue-50 px-2 py-1 text-blue-700">
                          v{paper.published_version}
                        </div>
                      </div>
                    </div>
                    {selectedPaper?.id === paper.id && (
                      <CheckCircle2 className="h-6 w-6 shrink-0 text-accent" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4 shrink-0 bg-white">
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!selectedPaper || isSubmitting}
            className="flex items-center gap-2 rounded-xl bg-accent px-6 py-2.5 text-sm font-bold text-white transition hover:bg-accent/90 disabled:opacity-50"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Import and Create Exam
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportExamPaperModal;
