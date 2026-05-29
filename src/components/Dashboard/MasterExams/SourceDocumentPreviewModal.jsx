/* eslint-disable react/prop-types */
import { useMemo, useState } from 'react';
import { ExternalLink, FileText, Loader2, X } from 'lucide-react';

import { PageViewer } from '../Course/modals/PageViewer/PageViewer';

function buildPageEntries(parseDebug) {
  const pages = Array.isArray(parseDebug?.pages) ? parseDebug.pages : [];
  return pages
    .filter((page) => page?.page_image_url)
    .map((page) => ({
      id: page.id || `page-${page.page_number}`,
      label: `Page ${page.page_number}`,
      imageUrl: page.page_image_url,
      pageNumber: page.page_number,
    }));
}

export default function SourceDocumentPreviewModal({
  document,
  parseDebug,
  loading = false,
  onClose,
}) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const pages = useMemo(() => buildPageEntries(parseDebug), [parseDebug]);
  const [selectedPageIndex, setSelectedPageIndex] = useState(0);
  const selectedPage = pages[selectedPageIndex] || null;

  if (!document) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="mx-auto flex h-screen max-w-[1500px] items-stretch p-4 lg:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex min-h-0 w-full overflow-hidden rounded-[28px] bg-white shadow-2xl ring-1 ring-slate-900/10">
          <aside className="flex w-[300px] shrink-0 flex-col border-r border-slate-200 bg-slate-50">
            <div className="border-b border-slate-200 px-5 py-4">
              <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">Uploaded Document</div>
              <h2 className="mt-2 line-clamp-2 text-lg font-semibold text-slate-900">{document.original_filename}</h2>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                {document.page_count ? <span>{document.page_count} pages</span> : null}
                {document.parsed_status ? <span className="capitalize">{document.parsed_status}</span> : null}
              </div>
              {document.file_url ? (
                <a
                  href={document.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Open original file
                </a>
              ) : null}
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-3">
              {loading ? (
                <div className="flex h-full items-center justify-center text-sm text-slate-500">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading preview...
                </div>
              ) : pages.length > 0 ? (
                <div className="space-y-2">
                  {pages.map((page, index) => (
                    <button
                      key={page.id}
                      type="button"
                      onClick={() => {
                        setSelectedPageIndex(index);
                        setZoomLevel(1);
                      }}
                      className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition ${
                        index === selectedPageIndex
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                          : 'border-transparent bg-white text-slate-700 hover:border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold">{page.label}</div>
                        <div className="text-[11px] text-slate-400">View uploaded page</div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-500">
                  Document page previews are not available yet for this source.
                </div>
              )}
            </div>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col bg-slate-950">
            <header className="flex shrink-0 items-center justify-between border-b border-slate-800 px-5 py-4 text-white">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">Document Preview</div>
                <div className="mt-1 text-sm font-semibold">
                  {selectedPage?.label || 'Preview unavailable'}
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-700 bg-slate-900 text-slate-300 transition hover:bg-slate-800 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <div className="min-h-0 flex-1">
              {selectedPage?.imageUrl ? (
                <PageViewer
                  url={selectedPage.imageUrl}
                  zoomLevel={zoomLevel}
                  onZoomIn={() => setZoomLevel((prev) => Math.min(prev + 0.25, 3))}
                  onZoomOut={() => setZoomLevel((prev) => Math.max(prev - 0.25, 0.5))}
                  onZoomReset={() => setZoomLevel(1)}
                />
              ) : (
                <div className="flex h-full items-center justify-center px-6 text-center text-sm text-slate-400">
                  No document page preview available for this source yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
