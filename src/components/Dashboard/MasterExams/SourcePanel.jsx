/* eslint-disable react/prop-types */
import { useCallback, useRef, useState } from 'react';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileText,
  FolderPlus,
  Loader2,
  PanelLeftClose,
  PanelLeftOpen,
  RefreshCw,
  Trash2,
  UploadCloud,
  XCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_META = {
  pending: { label: 'Queued', tone: 'text-amber-700 bg-amber-50 border-amber-200', icon: Clock3, spin: false },
  processing: { label: 'Processing', tone: 'text-sky-700 bg-sky-50 border-sky-200', icon: Loader2, spin: true },
  completed: { label: 'Cards Ready', tone: 'text-emerald-700 bg-emerald-50 border-emerald-200', icon: CheckCircle2, spin: false },
  failed: { label: 'Failed', tone: 'text-rose-700 bg-rose-50 border-rose-200', icon: XCircle, spin: false },
};

const FILE_TYPE_ICONS = {
  pdf: '📄',
  docx: '📝',
  doc: '📝',
  png: '🖼️',
  jpg: '🖼️',
  jpeg: '🖼️',
  webp: '🖼️',
};

function getFileIcon(filename) {
  const ext = (filename || '').split('.').pop().toLowerCase();
  return FILE_TYPE_ICONS[ext] || '📄';
}

export default function SourcePanel({
  documents,
  sourceFolders,
  activeFolderId,
  setActiveFolderId,
  isUploading,
  uploadPercent,
  pendingDocs,
  completedDocs,
  totalCards,
  onFileUpload,
  onCreateFolder,
  onReprocessDocument,
  onDeleteDocument,
  collapsed,
  onToggleCollapse,
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files || []);
    if (files.length > 0 && onFileUpload) {
      // Create a synthetic event-like object
      onFileUpload({ target: { files } });
    }
  }, [onFileUpload]);

  if (collapsed) {
    return (
      <div className="flex w-12 flex-col items-center border-r border-slate-200 bg-white/80 py-4">
        <button
          type="button"
          onClick={onToggleCollapse}
          className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
          title="Expand source panel"
        >
          <PanelLeftOpen className="h-4 w-4" />
        </button>
        <div className="mt-4 flex flex-col items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700">
            {documents.length}
          </div>
          <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400 [writing-mode:vertical-lr]">
            Sources
          </div>
        </div>
      </div>
    );
  }

  return (
    <aside
      className="flex w-[320px] flex-col border-r border-slate-200 bg-gradient-to-b from-white to-slate-50/80"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3.5">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Source Import</div>
          <h2 className="mt-0.5 text-sm font-semibold text-slate-900">Upload & Manage</h2>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onCreateFolder}
            className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 hover:text-emerald-600"
            title="Create source folder"
          >
            <FolderPlus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onToggleCollapse}
            className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50"
            title="Collapse panel"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Upload zone */}
      <div className="px-4 pt-4 pb-2">
        <label
          className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-5 text-center transition-all ${
            isDragOver
              ? 'border-emerald-400 bg-emerald-50 shadow-inner'
              : isUploading
                ? 'border-sky-300 bg-sky-50/50'
                : 'border-slate-200 bg-slate-50/50 hover:border-emerald-300 hover:bg-emerald-50/50'
          }`}
        >
          <UploadCloud className={`mb-2 h-6 w-6 ${
            isDragOver ? 'text-emerald-600 animate-bounce' : isUploading ? 'text-sky-600 animate-pulse' : 'text-slate-400'
          }`} />
          <div className="text-xs font-semibold text-slate-700">
            {isDragOver ? 'Drop files here' : isUploading ? 'Uploading...' : 'Upload source files'}
          </div>
          <div className="mt-1 text-[10px] text-slate-400">
            PDF, DOCX, PNG, JPG · drag & drop or click
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp"
            multiple
            className="hidden"
            onChange={onFileUpload}
          />
        </label>

        {/* Upload progress */}
        {(isUploading || pendingDocs > 0) && (
          <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3">
            <div className="mb-1.5 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <span>Processing</span>
              <span>{isUploading ? `${uploadPercent}%` : `${pendingDocs} active`}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-500"
                style={{
                  width: `${isUploading ? uploadPercent : Math.min(90, (completedDocs / Math.max(documents.length, 1)) * 100)}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="mx-4 mt-1 mb-2 grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-white px-3 py-2 text-center shadow-sm border border-slate-100">
          <div className="text-sm font-bold text-slate-900">{documents.length}</div>
          <div className="text-[9px] font-medium uppercase tracking-wider text-slate-400">Sources</div>
        </div>
        <div className="rounded-xl bg-white px-3 py-2 text-center shadow-sm border border-slate-100">
          <div className="text-sm font-bold text-emerald-700">{completedDocs}</div>
          <div className="text-[9px] font-medium uppercase tracking-wider text-slate-400">Done</div>
        </div>
        <div className="rounded-xl bg-white px-3 py-2 text-center shadow-sm border border-slate-100">
          <div className="text-sm font-bold text-slate-900">{totalCards}</div>
          <div className="text-[9px] font-medium uppercase tracking-wider text-slate-400">Cards</div>
        </div>
      </div>

      {/* Content area - scrollable */}
      <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-4">
        {/* Source folders */}
        {sourceFolders.length > 0 && (
          <section>
            <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Folders</div>
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => setActiveFolderId('')}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-semibold transition ${
                  !activeFolderId
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'text-slate-600 hover:bg-slate-50 border border-transparent'
                }`}
              >
                <span>All Sources</span>
                <span className="text-[10px] text-slate-400">{documents.length}</span>
              </button>
              {sourceFolders.map((folder) => {
                const folderDocCount = documents.filter((d) => d.source_folder_id === folder.id).length;
                return (
                  <button
                    key={folder.id}
                    type="button"
                    onClick={() => setActiveFolderId((prev) => (prev === folder.id ? '' : folder.id))}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-semibold transition ${
                      activeFolderId === folder.id
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'text-slate-600 hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <span className="truncate">{folder.name}</span>
                    <span className="text-[10px] text-slate-400">{folderDocCount}</span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Document list */}
        <section>
          <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Imported Sources</div>
          {documents.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-6 text-center">
              <FileText className="mx-auto mb-2 h-6 w-6 text-slate-300" />
              <div className="text-xs font-medium text-slate-500">No source files uploaded yet</div>
              <div className="mt-1 text-[10px] text-slate-400">Upload PDFs, images, or docs above</div>
            </div>
          ) : (
            <div className="space-y-2">
              {documents.map((doc) => {
                const meta = STATUS_META[doc.parsed_status] || STATUS_META.pending;
                const StatusIcon = meta.icon;
                return (
                  <div
                    key={doc.id}
                    className="group/doc rounded-xl border border-slate-200 bg-white p-3 transition hover:border-slate-300 hover:shadow-sm"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="mt-0.5 text-base">{getFileIcon(doc.original_filename)}</span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-xs font-semibold text-slate-800">{doc.original_filename}</div>
                        <div className="mt-1 flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${meta.tone}`}>
                            <StatusIcon className={`h-2.5 w-2.5 ${meta.spin ? 'animate-spin' : ''}`} />
                            {meta.label}
                          </span>
                          {doc.page_count && (
                            <span className="text-[10px] text-slate-400">{doc.page_count} pg</span>
                          )}
                        </div>
                      </div>
                      {/* Actions */}
                      <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover/doc:opacity-100">
                        {doc.parsed_status === 'failed' && onReprocessDocument && (
                          <button
                            type="button"
                            onClick={() => onReprocessDocument(doc.id)}
                            className="rounded-md border border-amber-200 bg-amber-50 p-1 text-amber-600 hover:bg-amber-100"
                            title="Retry processing"
                          >
                            <RefreshCw className="h-3 w-3" />
                          </button>
                        )}
                        {onDeleteDocument && (
                          <button
                            type="button"
                            onClick={() => onDeleteDocument(doc.id)}
                            className="rounded-md border border-rose-200 bg-rose-50 p-1 text-rose-500 hover:bg-rose-100"
                            title="Delete source"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </aside>
  );
}
