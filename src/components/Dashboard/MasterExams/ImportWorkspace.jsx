/* eslint-disable react/prop-types */
import { useRef, useState } from 'react';
import {
  ArrowRight,
  Check,
  Cloud,
  Eye,
  History,
  Search,
  Sparkles,
  Trash2,
  Upload,
  AlertTriangle,
} from 'lucide-react';

function SourceRow({ doc, onView, onDelete }) {
  const status = doc.parsed_status || 'pending';
  const taskProgress = doc.task_progress || doc.parser_runtime?.progress || null;
  const current = taskProgress?.current || 0;
  const total = taskProgress?.total || 1;
  const progress = taskProgress?.percent || (total > 0 ? (current / total) * 100 : 0);
  const questionCount = doc.question_count || doc.questions_count || 0;

  const progressMessage = taskProgress?.message || 'AI extracting questions...';
  const statusMap = {
    pending:     { label: 'Uploading...', cls: 'ws-parse-status--parsing', icon: <span className="ws-spinner" /> },
    processing:  { label: progressMessage, cls: 'ws-parse-status--parsing', icon: <Sparkles size={12} /> },
    completed:   { label: `${questionCount} Questions Extracted`, cls: 'ws-parse-status--ok', icon: <Check size={12} /> },
    failed:      { label: 'Failed', cls: 'ws-parse-status--fail', icon: <AlertTriangle size={12} /> },
  };
  const st = statusMap[status] || statusMap.pending;

  return (
    <div className="ws-source-row" style={{ padding: '16px 20px', gridTemplateColumns: 'auto 1fr auto', gap: '20px' }}>
      <div style={{ fontSize: '20px' }}>📄</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ws-ink-900)' }}>
          {doc.original_filename || 'Untitled'}
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '13px', color: 'var(--ws-ink-500)' }}>
          <span>{st.label}</span>
          <span>·</span>
          <span style={{ color: status === 'completed' ? 'var(--ws-brand-700)' : 'var(--ws-ink-500)', fontWeight: 500 }}>
            {status === 'completed' ? 'Ready' : status === 'failed' ? 'Error' : 'Processing'}
          </span>
        </div>
        {status !== 'completed' && status !== 'failed' && (
          <div className="ws-progress" style={{ marginTop: '8px', maxWidth: '300px' }}>
            <div className="ws-progress__bar" style={{ width: `${Math.min(100, progress)}%` }} />
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button type="button" className="ws-btn ws-btn--sm ws-btn--ghost" onClick={() => onDelete?.(doc.id)} style={{ color: 'var(--ws-ink-500)' }}>
          <Trash2 size={14} />Delete
        </button>
      </div>
    </div>
  );
}

export default function ImportWorkspace({
  documents,
  onImportFiles,
  onDeleteDocument,
  onViewDocument,
  onContinue,
  isUploading,
  uploadBatchTotal,
  uploadBatchDone,
}) {
  const [dragOver, setDragOver] = useState(false);
  const [sourceSearch, setSourceSearch] = useState('');
  const fileInputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length > 0) onImportFiles?.(files);
  };

  const filteredDocs = sourceSearch
    ? documents.filter((d) => (d.original_filename || '').toLowerCase().includes(sourceSearch.toLowerCase()))
    : documents;
  const hasDocuments = documents.length > 0;

  const openFilePicker = () => {
    if (!isUploading) fileInputRef.current?.click();
  };

  return (
    <div className="ws-import-grid">
      <div className="ws-import-main ws-fade-up">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.doc,.png,.jpg,.jpeg,.zip,.tex"
          style={{ display: 'none' }}
          disabled={isUploading}
          onChange={(e) => {
            onImportFiles?.(Array.from(e.target.files || []));
            e.target.value = '';
          }}
        />

        {(!hasDocuments || isUploading) && (
          <div
            className={`ws-dropzone ${dragOver ? 'ws-dropzone--active' : ''} ${isUploading ? 'ws-dropzone--uploading' : ''}`}
            onDragOver={(e) => { if (!isUploading) { e.preventDefault(); setDragOver(true); } }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { if (!isUploading) handleDrop(e); }}
            onClick={openFilePicker}
            style={{ position: 'relative', overflow: 'hidden' }}
          >
            {isUploading ? (
              <div className="ws-upload-loading-overlay ws-fade-in" style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px 20px',
                gap: '16px',
                width: '100%',
                minHeight: '240px'
              }}>
                <div className="ws-upload-loading-spinner" style={{
                  position: 'relative',
                  width: '64px',
                  height: '64px'
                }}>
                  <span className="ws-spinner ws-spinner--large" style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    boxSizing: 'border-box',
                    width: '100%',
                    height: '100%',
                    borderWidth: '3px',
                    borderColor: 'var(--ws-ink-200)',
                    borderTopColor: 'var(--ws-brand)',
                    borderRadius: '50%',
                    animation: 'ws-spin 0.8s linear infinite'
                  }} />
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '24px',
                    height: '24px'
                  }}>
                    <Sparkles size={24} style={{
                      color: 'var(--ws-brand-700)',
                      animation: 'ws-pulseDot 1.5s infinite ease-in-out',
                      display: 'block'
                    }} />
                  </div>
                </div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--ws-ink-900)' }}>
                  {uploadBatchTotal > 1
                    ? `Uploading paper ${uploadBatchDone + 1} of ${uploadBatchTotal}...`
                    : 'Uploading question paper...'
                  }
                </div>
                <div style={{ fontSize: '13px', color: 'var(--ws-ink-500)', maxWidth: '360px', textAlign: 'center' }}>
                  Please keep this page open. We are sending the file to storage and preparing the AI vision model...
                </div>
                {uploadBatchTotal > 1 && (
                  <div className="ws-progress" style={{ width: '100%', maxWidth: '240px', height: '6px', borderRadius: '3px' }}>
                    <div className="ws-progress__bar" style={{
                      width: `${(uploadBatchDone / uploadBatchTotal) * 100}%`,
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="ws-dropzone__icon">
                  <Cloud size={28} strokeWidth={1.5} />
                </div>
                <div className="ws-dropzone__title">
                  <Sparkles size={18} style={{ display: 'inline', marginRight: 8, color: '#6a48d1' }} />
                  Drag & drop past papers — AI will extract questions automatically
                </div>
                <div className="ws-dropzone__sub">
                  Our AI will analyze your papers, extract individual questions with images, detect marks,
                  classify question types, and organize everything into ready-to-use cards.
                </div>
                <div className="ws-dropzone__formats">
                  <span className="ws-pill">PDF</span>
                  <span className="ws-pill">DOCX</span>
                  <span className="ws-pill">PNG · JPG</span>
                  <span className="ws-pill">LaTeX</span>
                </div>
                <div className="ws-dropzone__or">or</div>
                <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                  <button
                    type="button"
                    className="ws-btn ws-btn--primary"
                    onClick={(e) => { e.stopPropagation(); openFilePicker(); }}
                  >
                    <Upload size={16} />Browse files
                  </button>
                  <button type="button" className="ws-btn" onClick={(e) => e.stopPropagation()}>
                    <History size={16} />Pull from past course
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {hasDocuments && (
          <div className="ws-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--ws-ink-900)' }}>
                  Imported Sources
                </div>
                <div style={{ fontSize: '13px', color: 'var(--ws-ink-500)' }}>
                  {documents.length} source{documents.length === 1 ? '' : 's'} ready for review
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  type="button"
                  className="ws-btn"
                  onClick={openFilePicker}
                >
                  <Upload size={16} />Add more files
                </button>
                <div className="ws-input" style={{ width: '260px' }}>
                  <Search size={16} />
                  <input
                    placeholder="Search uploaded files..."
                    value={sourceSearch}
                    onChange={(e) => setSourceSearch(e.target.value)}
                  />
                </div>
              </div>
            </div>
            
            <div className="ws-sources-list" style={{ gap: '12px' }}>
              {filteredDocs.map((doc) => (
                <SourceRow
                  key={doc.id}
                  doc={doc}
                  onView={onViewDocument}
                  onDelete={onDeleteDocument}
                />
              ))}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button
                type="button"
                className="ws-btn ws-btn--primary"
                onClick={onContinue}
                style={{ padding: '10px 24px', fontSize: '15px' }}
              >
                Continue to Library <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
