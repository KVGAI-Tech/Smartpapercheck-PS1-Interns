import React, { useState, useEffect } from 'react';
import {
    FileUp, ArrowLeft, Upload, File, X, Users,
    ChevronRight, CheckCircle, Save, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import PDFViewer from '@/components/Dashboard/PDFViewer/PDFViewer';
import { Card } from '@/components/ui/card';

const AssignmentModal = ({ 
    isOpen, 
    onClose, 
    assignments, 
    onAssign, 
    instructors, 
    teachingAssistants 
  }) => {
    const [currentAssignments, setCurrentAssignments] = useState(
      assignments.map(assignment => ({
        ...assignment,
        assignees: assignment.assignees || []
      }))
    );
  
    useEffect(() => {
      setCurrentAssignments(
        assignments.map(assignment => ({
          ...assignment,
          assignees: assignment.assignees || []
        }))
      );
    }, [assignments]);
  
    const handleAssignment = (index, assignee) => {
      const newAssignments = [...currentAssignments];
      
      
      const isAlreadySelected = newAssignments[index].assignees
        .some(existing => existing.id === assignee.id);
      
      if (!isAlreadySelected) {
        
        newAssignments[index] = { 
          ...newAssignments[index], 
          assignees: [...newAssignments[index].assignees, assignee] 
        };
        setCurrentAssignments(newAssignments);
      }
    };
  
    const removeAssignee = (questionIndex, assigneeId) => {
      const newAssignments = [...currentAssignments];
      newAssignments[questionIndex] = {
        ...newAssignments[questionIndex],
        assignees: newAssignments[questionIndex].assignees
          .filter(assignee => assignee.id !== assigneeId)
      };
      setCurrentAssignments(newAssignments);
    };
  
    const handleSave = async () => {
      try {
        
        const payload = {
          exam_id: assignments[0]?.exam_id || null,
          questions: currentAssignments.map((assignment, index) => ({
            question_id: assignment.id,
            assignees: assignment.assignees.map(assignee => ({
              id: assignee.id,
              name: assignee.name,
              type: assignee.type
            }))
          }))
        };
  
        
        const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
            method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });
  
        const result = await response.json();
        console.log('Assignment API Response:', result);
  
        
        onAssign(currentAssignments);
        onClose();
      } catch (error) {
        console.error('Error saving assignments:', error);
        
      }
    };
  
    if (!isOpen) return null;
  
    const allEvaluators = [
      { id: 'self', name: 'Self', type: 'Instructor' },
      ...instructors.map(i => ({ ...i, type: 'Instructor' })),
      ...teachingAssistants.map(ta => ({ ...ta, type: 'TA' }))
    ];
  
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen p-4">
          <div 
            className="fixed inset-0 bg-black opacity-30" 
            onClick={onClose}
          />
          
          <div className="relative bg-white rounded-xl shadow-xl max-w-4xl w-full z-50">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                Assign Multiple Evaluators
              </h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
  
            <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              <div className="space-y-4">
                {currentAssignments.map((assignment, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-1">
                          Question {index + 1}
                        </h4>
                        <p className="text-xs text-gray-500">
                          Select multiple evaluators for this question
                        </p>
                      </div>
                      
                      <div className="relative">
                        <select
                          onChange={(e) => {
                            const id = e.target.value;
                            let assignee;
                            
                            if (id === 'self') {
                              assignee = { 
                                id: 'self', 
                                name: 'Self', 
                                type: 'Instructor' 
                              };
                            } else {
                              assignee = allEvaluators.find(
                                person => person.id.toString() === id
                              );
                            }
                            
                            handleAssignment(index, assignee);
                            
                            e.target.value = '';
                          }}
                          value=""
                          className="appearance-none pl-8 pr-10 py-2 border border-gray-200 rounded-lg text-sm 
                            focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
                        >
                          <option value="">Add Evaluator</option>
                          <option value="self">Self</option>
                          
                          <optgroup label="Instructors">
                            {instructors.map(instructor => (
                              <option 
                                key={`instructor-${instructor.id}`} 
                                value={instructor.id}
                              >
                                {instructor.name} (Instructor)
                              </option>
                            ))}
                          </optgroup>
                          
                          <optgroup label="Teaching Assistants">
                            {teachingAssistants.map(ta => (
                              <option 
                                key={`ta-${ta.id}`} 
                                value={ta.id}
                              >
                                {ta.name} (TA)
                              </option>
                            ))}
                          </optgroup>
                        </select>
                        
                        <Users className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
                        <ChevronRight className="absolute right-2 top-2.5 w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {assignment.assignees.map((assignee) => (
                        <div 
                          key={assignee.id} 
                          className="flex items-center justify-between bg-gray-50 p-2 rounded"
                        >
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">
                              {assignee.name} ({assignee.type})
                            </span>
                          </div>
                          <button
                            onClick={() => removeAssignee(index, assignee.id)}
                            className="p-1 hover:bg-gray-200 rounded-full"
                          >
                            <X className="w-4 h-4 text-gray-500" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
  
            <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Assignments
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
const EvaluationModal = ({ isOpen, onClose, exam, instructors, teachingAssistants }) => {
    const [currentStep, setCurrentStep] = useState('initial');
    const [answerSheets, setAnswerSheets] = useState(null);
    const [answerKey, setAnswerKey] = useState(null);
    const [pdfFile, setPdfFile] = useState(null);
    const [annotatedKey, setAnnotatedKey] = useState(null);
    const [assignments, setAssignments] = useState([]);
    const [showAnnotatedPdf, setShowAnnotatedPdf] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showAssignmentModal, setShowAssignmentModal] = useState(false);

    useEffect(() => {
        return () => {
            if (pdfFile) {
                URL.revokeObjectURL(pdfFile);
            }
            if (answerKey && answerKey instanceof File) {
                URL.revokeObjectURL(URL.createObjectURL(answerKey));
            }
        };
    }, [pdfFile, answerKey]);

    if (!isOpen) return null;

    const handleFileUpload = (file, type) => {
        if (type === 'key' && file) {
            setAnswerKey(file);
            setPdfFile(URL.createObjectURL(file));
            setCurrentStep('annotate');
        } else if (type === 'answers' && file) {
            setAnswerSheets(file);
            
            const defaultAssignments = [
                { id: 1, marks: 10, content: 'Question 1' },
                { id: 2, marks: 10, content: 'Question 2' },
                { id: 3, marks: 10, content: 'Question 3' },
                { id: 4, marks: 10, content: 'Question 4' }
            ];
            setAssignments(defaultAssignments);
        }
    };

    const handleAnnotationsSave = async (data) => {
        setIsSaving(true);
        try {
            setAnnotatedKey(data);
            
            const annotations = data.annotations.map(ann => ({
                ...ann,
                examId: exam.id,
                timestamp: new Date().toISOString()
            }));
            
            console.log('Saving annotations:', annotations);
            console.log('Annotated PDF URL:', data.annotatedPdfUrl);
            
            setCurrentStep('review');
        } catch (error) {
            console.error('Error saving annotations:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleAssignmentSave = (assignedQuestions) => {
        setAssignments(assignedQuestions);
        setShowAssignmentModal(false);
    };

    const examName = exam?.name || '';
    const courseTitle = exam?.courseTitle || '';

    const renderStep = () => {
        switch (currentStep) {
            case 'initial':
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <div className="bg-blue-50 rounded-full p-4 mx-auto w-16 h-16 flex items-center justify-center mb-4">
                                <FileUp className="w-8 h-8 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Start Evaluation Process
                            </h3>
                            <p className="text-sm text-gray-500 mb-6">
                                Choose what you would like to upload first
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                                onClick={() => setCurrentStep('upload-answers')}
                                className="flex items-center justify-center gap-3 p-6 border-2 border-dashed border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
                            >
                                <div className="text-center">
                                    <File className="w-8 h-8 text-gray-400 group-hover:text-blue-500 mx-auto mb-2" />
                                    <h4 className="font-medium text-gray-900 mb-1">Student Answer Sheets</h4>
                                    <p className="text-sm text-gray-500">Upload student submissions</p>
                                </div>
                            </button>

                            <button
                                onClick={() => setCurrentStep('upload-key')}
                                className="flex items-center justify-center gap-3 p-6 border-2 border-dashed border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
                            >
                                <div className="text-center">
                                    <CheckCircle className="w-8 h-8 text-gray-400 group-hover:text-blue-500 mx-auto mb-2" />
                                    <h4 className="font-medium text-gray-900 mb-1">Golden Answer Key</h4>
                                    <p className="text-sm text-gray-500">Upload evaluation key</p>
                                </div>
                            </button>
                        </div>
                    </div>
                );

                case 'upload-answers':
                    return (
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 mb-6">
                                <button
                                    onClick={() => setCurrentStep('initial')}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <ArrowLeft className="w-5 h-5 text-gray-500" />
                                </button>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Upload Answer Sheets
                                </h3>
                            </div>
    
                            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8">
                                <div className="text-center">
                                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <div className="mb-4">
                                        <h4 className="text-gray-900 font-medium mb-1">
                                            Drop your file here, or{' '}
                                            <label className="text-blue-600 hover:text-blue-700 cursor-pointer">
                                                browse
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept=".pdf"
                                                    onChange={(e) => handleFileUpload(e.target.files[0], 'answers')}
                                                />
                                            </label>
                                        </h4>
                                        <p className="text-sm text-gray-500">
                                            PDF files only, up to 10MB
                                        </p>
                                    </div>
                                </div>
                            </div>
    
                            {answerSheets && (
                                <div>
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-4">
                                        <div className="flex items-center gap-3">
                                            <File className="w-5 h-5 text-gray-500" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {answerSheets.name}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {(answerSheets.size / 1024 / 1024).toFixed(2)} MB
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setAnswerSheets(null)}
                                            className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                                        >
                                            <X className="w-4 h-4 text-gray-500" />
                                        </button>
                                    </div>
    
                                    <div className="flex justify-end">
                                        <Button
                                            onClick={() => setShowAssignmentModal(true)}
                                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                                        >
                                            Assign Questions
                                            <ChevronRight className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
    
            case 'upload-key':
                return (
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-6">
                            <button
                                onClick={() => setCurrentStep('initial')}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-500" />
                            </button>
                            <h3 className="text-lg font-semibold text-gray-900">
                                Upload Answer Key
                            </h3>
                        </div>

                        <div className="border-2 border-dashed border-gray-200 rounded-xl p-8">
                            <div className="text-center">
                                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <div className="mb-4">
                                    <h4 className="text-gray-900 font-medium mb-1">
                                        Drop your file here, or{' '}
                                        <label className="text-blue-600 hover:text-blue-700 cursor-pointer">
                                            browse
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept=".pdf"
                                                onChange={(e) => handleFileUpload(e.target.files[0], 'key')}
                                            />
                                        </label>
                                    </h4>
                                    <p className="text-sm text-gray-500">
                                        PDF files only, up to 10MB
                                    </p>
                                </div>
                            </div>
                        </div>

                        {answerKey && (
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <File className="w-5 h-5 text-gray-500" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {answerKey.name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {(answerKey.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setAnswerKey(null);
                                        setPdfFile(null);
                                    }}
                                    className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                                >
                                    <X className="w-4 h-4 text-gray-500" />
                                </button>
                            </div>
                        )}
                    </div>
                );

            case 'annotate':
                return (
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-6">
                            <button
                                onClick={() => setCurrentStep('upload-key')}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-500" />
                            </button>
                            <h3 className="text-lg font-semibold text-gray-900">
                                Annotate Answer Key
                            </h3>
                        </div>

                        <div className="h-[calc(90vh-200px)] w-full border rounded-lg overflow-hidden">
                            {pdfFile && (
                                <PDFViewer
                                    file={answerKey}  
                                    courseTitle={courseTitle}
                                    examName={examName}
                                    onAnnotationsUpdated={(data) => {
                                        console.log('Annotations:', data.annotations);
                                        handleAnnotationsSave(data);
                                    }}
                                />
                            )}

                        </div>
                    </div>
                );

            case 'review':
                return (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Review and Start Evaluation
                            </h3>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <h4 className="text-sm font-medium text-gray-900 mb-4">Assignments</h4>
                                <div className="space-y-2">
                                    {assignments.map((assignment, index) => (
                                        <div key={index} className="flex items-center justify-between text-sm">
                                            <span>Question {index + 1}:</span>
                                            <span className="font-medium">
                                                {assignment.assignee?.name || 'Unassigned'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium text-gray-900 mb-4">Answer Key</h4>
                                <div className="border rounded-lg p-4">
                                    <p className="text-sm text-gray-600">
                                        Answer key has been annotated with {annotatedKey?.annotations?.length || 0} marks
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <Button
                                onClick={() => setShowAnnotatedPdf(true)}
                                variant="outline"
                                className="gap-2"
                            >
                                View Annotations
                            </Button>
                            <Button
                                onClick={() => {
                                    console.log('Starting evaluation with:', {
                                        assignments,
                                        answerSheets,
                                        annotatedKey
                                    });
                                    onClose();
                                }}
                                className="gap-2"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Start Evaluation
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen p-4">
                <div className="fixed inset-0 bg-black opacity-30" onClick={onClose}></div>
                <div className="relative bg-white rounded-xl shadow-xl max-w-5xl w-full">
                    <div className="absolute top-4 right-4">
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                    <div className="p-6">
                        {renderStep()}
                    </div>
                </div>
            </div>

            <AssignmentModal 
                isOpen={showAssignmentModal}
                onClose={() => setShowAssignmentModal(false)}
                assignments={assignments}
                onAssign={handleAssignmentSave}
                instructors={instructors}
                teachingAssistants={teachingAssistants}
            />
        </div>
    );
};

export default EvaluationModal;
