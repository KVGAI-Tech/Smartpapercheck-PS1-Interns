import React from 'react';
import { 
  Search, Plus, Edit2, Trash2, GraduationCap,
  Calendar, Clock, BookOpen, FileText
} from 'lucide-react';

const ExamsTab = ({
  exams,
  searchQuery,
  onSearchChange,
  onAdd,
  onEdit,
  onDelete,
  onEvaluate
}) => {
    
    const handleEvaluate = (exam) => {
        setShowEvaluationModal(true);
        setSelectedExam(exam);
      };
      
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search exams..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Schedule Exam
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {exams.map((exam) => (
          <div key={exam.id} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-lg font-medium text-gray-900">{exam.name}</h4>
                <div className="mt-1">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    exam.status === 'Completed' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {exam.status}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {exam.status !== 'Completed' && (
                  <button
                    onClick={() => onEvaluate(exam)}
                    className="p-1 text-green-600 hover:text-green-900"
                    title="Start Evaluation"
                  >
                    <GraduationCap className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={() => onEdit(exam)}
                  className="p-1 text-blue-600 hover:text-blue-900"
                  title="Edit Exam"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => onDelete(exam)}
                  className="p-1 text-red-600 hover:text-red-900"
                  title="Delete Exam"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{new Date(exam.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>{exam.duration} minutes</span>
                </div>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <BookOpen className="w-4 h-4 mr-2" />
                <span>Type: {exam.type}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <FileText className="w-4 h-4 mr-2" />
                <span>Syllabus: {exam.syllabus}</span>
              </div>

              {exam.questionBreakdown && (
                <div className="border-t border-gray-100 pt-3 mt-3">
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    Question Breakdown:
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(exam.questionBreakdown).map(([type, count]) => (
                      count > 0 && (
                        <div key={type} className="flex items-center text-sm text-gray-600">
                          <span className="w-3 h-3 rounded-full bg-blue-100 mr-2"></span>
                          <span className="capitalize">{type}: {count}</span>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExamsTab;