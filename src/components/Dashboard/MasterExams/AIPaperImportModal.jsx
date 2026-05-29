/* eslint-disable react/prop-types */
import { useState, useRef } from 'react';
import { X, Upload, Sparkles, CheckCircle2, AlertCircle, Loader, FileText } from 'lucide-react';
import { parsePaperWithAI } from './examDocumentApi';
import toast from 'react-hot-toast';

export default function AIPaperImportModal({
  examId,
  paperTitle,
  courseCode,
  subject,
  onClose,
  onCardsImported,
}) {
  const [uploading, setUploading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [progress, setProgress] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a PDF or image file (JPG, PNG)');
      return;
    }

    // Validate file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      toast.error('File size must be less than 50MB');
      return;
    }

    setUploading(true);
    setParsing(true);
    setError(null);
    setResult(null);
    setProgress('Uploading paper...');

    try {
      setProgress('AI is analyzing the paper...');
      
      const response = await parsePaperWithAI(examId, file, {
        paper_title: paperTitle,
        course_code: courseCode,
        subject: subject,
      });

      if (response.status === 'success') {
        setProgress('Extraction complete!');
        setResult(response.data);
        
        toast.success(
          `Successfully extracted ${response.data.total_questions} questions!`,
          { duration: 4000 }
        );
      } else {
        throw new Error(response.message || 'Failed to parse paper');
      }
    } catch (err) {
      console.error('Paper parsing error:', err);
      setError(err.message || 'Failed to parse paper');
      toast.error(err.message || 'Failed to parse paper');
    } finally {
      setUploading(false);
      setParsing(false);
    }
  };

  const handleImport = () => {
    if (result && result.cards) {
      onCardsImported(result.cards);
    }
  };

  return (
    <div className="ws-modal-overlay" onClick={onClose}>
      <div className="ws-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 600 }}>
        <div className="ws-modal-header">
          <div>
            <h2 className="ws-modal-title">Import Questions from Paper (AI)</h2>
            <p className="ws-modal-subtitle">
              Upload your exam paper and let AI extract all questions automatically
            </p>
          </div>
          <button type="button" className="ws-modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="ws-modal-body" style={{ padding: '32px' }}>
          {!parsing && !result && (
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: 80,
                  height: 80,
                  margin: '0 auto 24px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Sparkles size={40} color="white" />
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>
                AI-Powered Question Extraction
              </h3>

              <p style={{ fontSize: 14, color: 'var(--ws-ink-600)', marginBottom: 24, lineHeight: 1.6 }}>
                Upload your exam paper (PDF or image) and AI will automatically extract:
              </p>

              <div style={{ display: 'grid', gap: 12, marginBottom: 32, textAlign: 'left' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <CheckCircle2 size={20} color="#10b981" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <strong>Questions & Marks</strong>
                    <p style={{ fontSize: 13, color: 'var(--ws-ink-600)', margin: 0 }}>
                      Complete question text with allocated marks
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <CheckCircle2 size={20} color="#10b981" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <strong>Question Types & Difficulty</strong>
                    <p style={{ fontSize: 13, color: 'var(--ws-ink-600)', margin: 0 }}>
                      Automatically classifies question types and difficulty levels
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <CheckCircle2 size={20} color="#10b981" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <strong>Images & Diagrams</strong>
                    <p style={{ fontSize: 13, color: 'var(--ws-ink-600)', margin: 0 }}>
                      Detects and notes images associated with questions
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <CheckCircle2 size={20} color="#10b981" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <strong>Paper Metadata</strong>
                    <p style={{ fontSize: 13, color: 'var(--ws-ink-600)', margin: 0 }}>
                      Extracts title, duration, instructions, and sections
                    </p>
                  </div>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,image/jpeg,image/jpg,image/png"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                disabled={uploading}
              />

              <button
                type="button"
                className="ws-btn ws-btn--primary ws-btn--large"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                style={{ width: '100%' }}
              >
                <Upload size={18} />
                Choose Paper to Upload
              </button>

              <p style={{ fontSize: 12, color: 'var(--ws-ink-500)', marginTop: 12 }}>
                Supports PDF, JPG, PNG • Max 50MB • Processing takes 30-60 seconds
              </p>
            </div>
          )}

          {parsing && (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <Loader className="ws-spinner" size={48} style={{ margin: '0 auto 24px' }} />
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
                {progress}
              </h3>
              <p style={{ fontSize: 14, color: 'var(--ws-ink-600)' }}>
                This may take 30-60 seconds depending on paper length...
              </p>
            </div>
          )}

          {result && (
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: 20,
                  borderRadius: 12,
                  background: '#f0fdf4',
                  border: '1px solid #86efac',
                  marginBottom: 24,
                }}
              >
                <CheckCircle2 size={32} color="#10b981" style={{ flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
                    Successfully extracted {result.total_questions} questions
                  </h3>
                  <p style={{ fontSize: 13, color: 'var(--ws-ink-600)', margin: 0 }}>
                    {result.sections?.length || 0} sections detected
                  </p>
                </div>
              </div>

              {result.paper_metadata && (
                <div style={{ marginBottom: 24 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>
                    Paper Information
                  </h4>
                  <div style={{ display: 'grid', gap: 8, fontSize: 13 }}>
                    {result.paper_metadata.title && (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <span style={{ color: 'var(--ws-ink-500)', minWidth: 80 }}>Title:</span>
                        <span style={{ fontWeight: 600 }}>{result.paper_metadata.title}</span>
                      </div>
                    )}
                    {result.paper_metadata.total_marks && (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <span style={{ color: 'var(--ws-ink-500)', minWidth: 80 }}>Total Marks:</span>
                        <span style={{ fontWeight: 600 }}>{result.paper_metadata.total_marks}</span>
                      </div>
                    )}
                    {result.paper_metadata.duration && (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <span style={{ color: 'var(--ws-ink-500)', minWidth: 80 }}>Duration:</span>
                        <span style={{ fontWeight: 600 }}>{result.paper_metadata.duration}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div style={{ marginBottom: 24 }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>
                  Extracted Questions Preview
                </h4>
                <div style={{ maxHeight: 200, overflowY: 'auto', border: '1px solid var(--ws-ink-150)', borderRadius: 8, padding: 12 }}>
                  {result.cards?.slice(0, 5).map((card, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '8px 0',
                        borderBottom: idx < 4 ? '1px solid var(--ws-ink-100)' : 'none',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>
                          Q{card.question_number}: {card.question_text?.slice(0, 60)}...
                        </span>
                        <span style={{ fontSize: 12, color: 'var(--ws-ink-600)' }}>
                          {card.marks}M
                        </span>
                      </div>
                    </div>
                  ))}
                  {result.cards?.length > 5 && (
                    <div style={{ padding: '8px 0', fontSize: 12, color: 'var(--ws-ink-500)', textAlign: 'center' }}>
                      +{result.cards.length - 5} more questions
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: 20,
                borderRadius: 12,
                background: '#fef2f2',
                border: '1px solid #fca5a5',
              }}
            >
              <AlertCircle size={24} color="#ef4444" style={{ flexShrink: 0 }} />
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
                  Parsing failed
                </h3>
                <p style={{ fontSize: 13, color: 'var(--ws-ink-600)', margin: 0 }}>
                  {error}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="ws-modal-footer">
          <button type="button" className="ws-btn ws-btn--ghost" onClick={onClose}>
            Cancel
          </button>
          {result && (
            <button
              type="button"
              className="ws-btn ws-btn--primary"
              onClick={handleImport}
            >
              <FileText size={16} />
              Import {result.total_questions} Questions
            </button>
          )}
          {error && (
            <button
              type="button"
              className="ws-btn ws-btn--primary"
              onClick={() => {
                setError(null);
                setResult(null);
                fileInputRef.current?.click();
              }}
            >
              Try Again
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        .ws-spinner {
          animation: spin 1s linear infinite;
          color: var(--ws-brand);
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
