/* eslint-disable react/prop-types */
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  CheckCircle2,
  Clock3,
  FileText,
  FolderPlus,
  Loader2,
  PanelLeftClose,
  PanelLeftOpen,
  Pencil,
  RefreshCw,
  Search,
  Trash2,
  UploadCloud,
  XCircle,
} from 'lucide-react';

const STATUS_META = {
  pending: { label: 'Queued', tone: 'text-amber-700', icon: Clock3, spin: false },
  processing: { label: 'Processing', tone: 'text-sky-700', icon: Loader2, spin: true },
  completed: { label: 'Ready', tone: 'text-emerald-700', icon: CheckCircle2, spin: false },
  failed: { label: 'Failed', tone: 'text-rose-700', icon: XCircle, spin: false },
};

const getExtension = (filename = '') => {
  const ext = filename.split('.').pop()?.toUpperCase();
  return ext || 'FILE';
};

const formatStageLabel = (stage = '') => (
  String(stage || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
);

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
  onRenameDocument,
  onDeleteDocument,
  onOpenDocumentPreview,
  collapsed,
  onToggleCollapse,
  searchQuery,
  onSearchQueryChange,
  showFolders = true,
  allowFolderCreation = true,
  allowCollapse = true,
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [localSearch, setLocalSearch] = useState('');
  const fileInputRef = useRef(null);

  const effectiveSearch = searchQuery !== undefined ? searchQuery : localSearch;
  const setEffectiveSearch = onSearchQueryChange || setLocalSearch;
  const normalizedSearch = effectiveSearch.trim().toLowerCase();

  const visibleDocuments = useMemo(() => (
    normalizedSearch
      ? documents.filter((doc) => [
          doc.original_filename,
          doc.document_kind,
          doc.parsed_status,
          ...(Object.values(doc.source_metadata_json || {})),
        ].filter(Boolean).join(' ').toLowerCase().includes(normalizedSearch))
      : documents
  ), [documents, normalizedSearch]);

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(event.dataTransfer.files || []);
    if (files.length > 0 && onFileUpload) {
      onFileUpload({ target: { files } });
    }
  }, [onFileUpload]);

  if (collapsed) {
    return (
      <div className="flex w-16 shrink-0 flex-col items-center rounded-[28px] border border-slate-200/80 bg-white/90 py-4 shadow-[0_16px_40px_rgba(15,23,42,0.04)]">
        <button
          type="button"
          onClick={onToggleCollapse}
          className="flex h-10 w-10 items-center justify-center rounded-2xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          title="Expand import panel"
        >
          <PanelLeftOpen className="h-4 w-4" />
        </button>
        <div className="mt-5 flex flex-col items-center gap-2">
          <div className="rounded-full bg-[#eef6f3] px-2.5 py-1 text-[11px] font-semibold text-accent">
            {documents.length}
          </div>
          <div className="text-[10px] uppercase tracking-[0.22em] text-slate-400 [writing-mode:vertical-lr]">
            Imports
          </div>
        </div>
      </div>
    );
  }

  return (
    <aside
      className="flex w-[340px] shrink-0 flex-col overflow-hidden rounded-[32px] border border-slate-200/80 bg-white/92 shadow-[0_20px_50px_rgba(15,23,42,0.04)]"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex items-start justify-between border-b border-slate-100 px-5 py-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Imports</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-950">Source documents</h2>
          <p className="mt-1 text-xs leading-6 text-slate-500">Lightweight uploads, fast review, no clutter.</p>
        </div>
        <div className="flex items-center gap-1.5">
          {allowFolderCreation ? (
            <button
              type="button"
              onClick={onCreateFolder}
              className="flex h-10 w-10 items-center justify-center rounded-2xl text-slate-400 transition hover:bg-slate-100 hover:text-accent"
              title="Create folder"
            >
              <FolderPlus className="h-4 w-4" />
            </button>
          ) : null}
          {allowCollapse ? (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="flex h-10 w-10 items-center justify-center rounded-2xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              title="Collapse panel"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>

      <div className="px-5 pt-5">
        <label
          className={`flex cursor-pointer flex-col rounded-[28px] border px-5 py-5 text-left transition ${
            isDragOver
              ? 'border-accent bg-[#eef6f3]'
              : isUploading
                ? 'border-sky-200 bg-sky-50/70'
                : 'border-slate-200 bg-[#fafcfb] hover:border-slate-300 hover:bg-white'
          }`}
        >
          <UploadCloud className={`h-5 w-5 ${
            isDragOver ? 'text-accent' : isUploading ? 'text-sky-600' : 'text-slate-400'
          }`} />
          <div className="mt-3 text-sm font-medium text-slate-950">
            {isDragOver ? 'Drop files here' : 'Drop PDFs, DOCX, or Images here'}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            or click to upload and continue working while extraction runs in the background
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

        {(isUploading || pendingDocs > 0) && (
          <div className="mt-4 rounded-[24px] border border-slate-200 bg-white px-4 py-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>{isUploading ? 'Uploading files' : 'Extraction in progress'}</span>
              <span>{isUploading ? `${uploadPercent}%` : `${pendingDocs} active`}</span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-accent transition-all duration-500"
                style={{
                  width: `${isUploading ? uploadPercent : Math.min(90, (completedDocs / Math.max(documents.length, 1)) * 100)}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="px-5 pb-4 pt-5">
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span>{documents.length} sources</span>
          <span className="h-1 w-1 rounded-full bg-slate-300" />
          <span>{completedDocs} ready</span>
          <span className="h-1 w-1 rounded-full bg-slate-300" />
          <span>{totalCards} questions</span>
        </div>
      </div>

      <div className="px-5 pb-4">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={effectiveSearch}
            onChange={(event) => setEffectiveSearch(event.target.value)}
            placeholder="Search imports"
            className="h-10 w-full rounded-full border border-slate-200 bg-[#fafcfb] pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-slate-300"
          />
        </label>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-5">
        {showFolders && sourceFolders.length > 0 && (
          <section className="mb-6">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Folders</div>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setActiveFolderId('')}
                className={`flex w-full items-center justify-between rounded-2xl px-3 py-2 text-left text-sm transition ${
                  !activeFolderId ? 'bg-[#eef6f3] text-accent' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>All Sources</span>
                <span className="text-xs text-slate-400">{visibleDocuments.length}</span>
              </button>
              {sourceFolders.map((folder) => {
                const folderDocCount = visibleDocuments.filter((doc) => doc.source_folder_id === folder.id).length;
                return (
                  <button
                    key={folder.id}
                    type="button"
                    onClick={() => setActiveFolderId((prev) => (prev === folder.id ? '' : folder.id))}
                    className={`flex w-full items-center justify-between rounded-2xl px-3 py-2 text-left text-sm transition ${
                      activeFolderId === folder.id ? 'bg-[#eef6f3] text-accent' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate">{folder.name}</span>
                    <span className="text-xs text-slate-400">{folderDocCount}</span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        <section>
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Recent Imports</div>
          {visibleDocuments.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-slate-200 bg-[#fafcfb] px-5 py-10 text-center">
              <FileText className="mx-auto h-6 w-6 text-slate-300" />
              <div className="mt-3 text-sm text-slate-500">
                {documents.length === 0 ? 'No source files uploaded yet.' : 'No imports match this search.'}
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              {visibleDocuments.map((doc) => {
                const meta = STATUS_META[doc.parsed_status] || STATUS_META.pending;
                const StatusIcon = meta.icon;
                const taskProgress = doc.task_progress || doc.parser_runtime?.progress || null;
                const stageLabel = taskProgress?.stage ? formatStageLabel(taskProgress.stage) : null;
                return (
                  <div
                    key={doc.id}
                    className="group rounded-[24px] border border-transparent px-4 py-3 transition hover:border-slate-200 hover:bg-[#fafcfb]"
                  >
                    <button
                      type="button"
                      onClick={() => onOpenDocumentPreview?.(doc)}
                      className="flex w-full items-start gap-3 text-left"
                    >
                      <div className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                        {getExtension(doc.original_filename)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-slate-950">{doc.original_filename}</div>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <span className={`inline-flex items-center gap-1 ${meta.tone}`}>
                            <StatusIcon className={`h-3 w-3 ${meta.spin ? 'animate-spin' : ''}`} />
                            {meta.label}
                          </span>
                          {stageLabel ? <span>{stageLabel}</span> : null}
                          {doc.page_count ? <span>{doc.page_count} pages</span> : null}
                        </div>
                        {taskProgress?.message ? (
                          <div className="mt-1 text-[11px] leading-5 text-slate-400">
                            {taskProgress.message}
                          </div>
                        ) : null}
                      </div>
                    </button>

                    <div className="mt-3 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      {doc.parsed_status === 'failed' && onReprocessDocument ? (
                        <button
                          type="button"
                          onClick={() => onReprocessDocument(doc.id)}
                          className="rounded-full border border-amber-200 px-3 py-1 text-xs font-medium text-amber-700 transition hover:bg-amber-50"
                        >
                          <span className="inline-flex items-center gap-1.5">
                            <RefreshCw className="h-3 w-3" />
                            Retry
                          </span>
                        </button>
                      ) : null}
                      {onRenameDocument ? (
                        <button
                          type="button"
                          onClick={() => onRenameDocument(doc)}
                          className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                        >
                          <span className="inline-flex items-center gap-1.5">
                            <Pencil className="h-3 w-3" />
                            Rename
                          </span>
                        </button>
                      ) : null}
                      {onDeleteDocument ? (
                        <button
                          type="button"
                          onClick={() => onDeleteDocument(doc.id)}
                          className="rounded-full border border-rose-200 px-3 py-1 text-xs font-medium text-rose-600 transition hover:bg-rose-50"
                        >
                          <span className="inline-flex items-center gap-1.5">
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </span>
                        </button>
                      ) : null}
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
