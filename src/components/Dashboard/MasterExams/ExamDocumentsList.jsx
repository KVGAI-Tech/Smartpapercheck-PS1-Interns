import React, { useRef } from 'react';
import { FilePenLine, Files, Plus, Trash2, Upload } from 'lucide-react';

const statusStyles = {
  draft: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  ready_for_parsing: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  archived: 'bg-gray-100 text-gray-600 ring-1 ring-gray-200',
};

const formatDate = (value) => {
  if (!value) return 'Just now';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Just now';
  return parsed.toLocaleString();
};

const ExamDocumentsList = ({
  documents,
  activeDocumentId,
  isLoading,
  onCreate,
  onUpload,
  onOpen,
  onDelete,
}) => {
  const fileInputRef = useRef(null);

  return (
    <div className="flex h-full min-h-[620px] flex-col rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Your Documents</h3>
          <p className="mt-1 text-sm text-gray-500">Uploads and drafts stay here for quick access.</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt,.html,.htm"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                onUpload(file);
              }
              event.target.value = '';
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 text-sm font-medium text-gray-700 transition hover:-translate-y-0.5 hover:bg-gray-50"
          >
            <Upload className="h-4 w-4" />
            Upload
          </button>
          <button
            type="button"
            onClick={onCreate}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-700 transition hover:-translate-y-0.5 hover:bg-gray-100"
            aria-label="Create new document"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3">
        {isLoading ? (
          <div className="px-3 py-10 text-sm text-gray-500">Loading documents...</div>
        ) : documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 px-6 py-12 text-center">
            <Files className="mb-3 h-9 w-9 text-gray-300" />
            <p className="text-sm font-medium text-gray-700">No documents yet</p>
            <p className="mt-1 text-sm text-gray-500">
              Upload a paper or create a blank draft to get started.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {documents.map((document) => {
              const isActive = document.id === activeDocumentId;
              return (
                <li
                  key={document.id}
                  className={`flex items-start justify-between gap-3 rounded-2xl border px-4 py-4 shadow-sm transition ${
                    isActive
                      ? 'border-accent/20 bg-accent/5'
                      : 'border-transparent bg-white hover:-translate-y-0.5 hover:border-gray-200 hover:bg-gray-50/80'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onOpen(document.id)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-semibold text-gray-900">
                          {document.title || 'Untitled Exam Document'}
                        </span>
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${statusStyles[document.status] || statusStyles.draft}`}>
                          {document.status?.replaceAll('_', ' ') || 'draft'}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                        <span>Version {document.version || 1}</span>
                        <span>Updated {formatDate(document.updated_at || document.created_at)}</span>
                      </div>
                    </div>
                  </button>
                  <div className="flex items-center gap-2 pl-2">
                    <button
                      type="button"
                      onClick={() => onOpen(document.id)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
                      aria-label={`Open ${document.title || 'document'}`}
                    >
                      <FilePenLine className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(document)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 transition hover:bg-red-50 hover:text-red-600"
                      aria-label={`Archive ${document.title || 'document'}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ExamDocumentsList;
