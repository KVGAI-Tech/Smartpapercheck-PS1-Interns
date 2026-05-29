/* eslint-disable react/prop-types */
import { useState } from 'react';
import { Upload, FileText, Sparkles, CheckCircle2, AlertCircle, Loader } from 'lucide-react';
import { parsePaperWithAI } from './examDocumentApi';
import toast from 'react-hot-toast';

export default function AIPaperUpload({ examId, onCardsGenerated, paperTitle, courseCode, subject }) {
  const [uploading, setUploading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [progress, setProgress] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

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

        // Pass the cards to parent component
        if (onCardsGenerated) {
          onCardsGenerated(response.data.cards, response.data.paper_metadata);
        }
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

  return (
    <div className="ws-ai-paper-upload">
      <div className="ws-upload-card">
        <div className="ws-upload-card__icon">
          <Sparkles size={32} color="#6a48d1" />
        </div>
        
        <h3 className="ws-upload-card__title">
          AI-Powered Paper Import
        </h3>
        
        <p className="ws-upload-card__description">
          Upload your exam paper (PDF or image) and let AI automatically extract all questions,
          marks, images, and metadata. Supports multi-page PDFs and handwritten papers.
        </p>

        {!parsing && !result && (
          <label className="ws-btn ws-btn--primary ws-btn--large">
            <Upload size={18} />
            Upload Paper
            <input
              type="file"
              accept=".pdf,image/jpeg,image/jpg,image/png"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              disabled={uploading}
            />
          </label>
        )}

        {parsing && (
          <div className="ws-upload-progress">
            <Loader className="ws-spinner" size={24} />
            <p className="ws-upload-progress__text">{progress}</p>
            <p className="ws-upload-progress__subtext">
              This may take 30-60 seconds depending on paper length...
            </p>
          </div>
        )}

        {result && (
          <div className="ws-upload-result ws-upload-result--success">
            <CheckCircle2 size={24} color="#10b981" />
            <div>
              <p className="ws-upload-result__title">
                Successfully extracted {result.total_questions} questions
              </p>
              <p className="ws-upload-result__details">
                {result.sections?.length || 0} sections detected
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="ws-upload-result ws-upload-result--error">
            <AlertCircle size={24} color="#ef4444" />
            <div>
              <p className="ws-upload-result__title">Parsing failed</p>
              <p className="ws-upload-result__details">{error}</p>
            </div>
          </div>
        )}

        <div className="ws-upload-card__features">
          <div className="ws-feature-item">
            <FileText size={16} />
            <span>Extracts questions & marks</span>
          </div>
          <div className="ws-feature-item">
            <Sparkles size={16} />
            <span>Detects images & diagrams</span>
          </div>
          <div className="ws-feature-item">
            <CheckCircle2 size={16} />
            <span>Identifies question types</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .ws-ai-paper-upload {
          padding: 24px;
        }

        .ws-upload-card {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          border-radius: 16px;
          padding: 40px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          text-align: center;
        }

        .ws-upload-card__icon {
          width: 64px;
          height: 64px;
          margin: 0 auto 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ws-upload-card__title {
          font-size: 24px;
          font-weight: 700;
          color: var(--ws-ink-900);
          margin-bottom: 12px;
        }

        .ws-upload-card__description {
          font-size: 14px;
          color: var(--ws-ink-600);
          line-height: 1.6;
          margin-bottom: 32px;
        }

        .ws-btn--large {
          padding: 14px 32px;
          font-size: 16px;
        }

        .ws-upload-progress {
          padding: 32px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .ws-spinner {
          animation: spin 1s linear infinite;
          color: var(--ws-brand);
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .ws-upload-progress__text {
          font-size: 16px;
          font-weight: 600;
          color: var(--ws-ink-800);
        }

        .ws-upload-progress__subtext {
          font-size: 13px;
          color: var(--ws-ink-500);
        }

        .ws-upload-result {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 24px;
        }

        .ws-upload-result--success {
          background: #f0fdf4;
          border: 1px solid #86efac;
        }

        .ws-upload-result--error {
          background: #fef2f2;
          border: 1px solid #fca5a5;
        }

        .ws-upload-result__title {
          font-size: 15px;
          font-weight: 600;
          color: var(--ws-ink-900);
          margin-bottom: 4px;
        }

        .ws-upload-result__details {
          font-size: 13px;
          color: var(--ws-ink-600);
        }

        .ws-upload-card__features {
          display: flex;
          justify-content: center;
          gap: 24px;
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid var(--ws-ink-150);
        }

        .ws-feature-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: var(--ws-ink-600);
        }

        .ws-feature-item svg {
          color: var(--ws-brand);
        }
      `}</style>
    </div>
  );
}
