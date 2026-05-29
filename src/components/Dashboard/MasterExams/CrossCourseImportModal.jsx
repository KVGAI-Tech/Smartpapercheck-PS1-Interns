/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from 'react';
import { Check, Import, Loader2, Search, X } from 'lucide-react';
import toast from 'react-hot-toast';

import { fetchWorkspaceCards, listExamDocuments } from './examDocumentApi';
import { normalizeMasterExamCard } from './masterExamCardSchema';

const getWorkspaceMeta = (document = {}) => (
  document?.builder_layout_json?.questionWorkspace
  || document?.content_json?.attrs?.questionWorkspace
  || document?.content_json?.questionWorkspace
  || {}
);

const cleanText = (value = '') => value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

export default function CrossCourseImportModal({
  isOpen,
  currentWorkspaceId,
  onClose,
  onImport,
}) {
  const [workspaces, setWorkspaces] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [workspaceCards, setWorkspaceCards] = useState([]);
  const [loadingCards, setLoadingCards] = useState(false);
  const [selectedCardIds, setSelectedCardIds] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const load = async () => {
      try {
        setIsLoading(true);
        const docs = await listExamDocuments();
        const filtered = (docs || []).filter((doc) => {
          const meta = getWorkspaceMeta(doc);
          return String(doc.id) !== String(currentWorkspaceId) && (meta.courseId || meta.course_id || meta.courseName || meta.course_name);
        });
        setWorkspaces(filtered);
      } catch (error) {
        toast.error(error.message || 'Failed to load course workspaces');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [currentWorkspaceId, isOpen]);

  useEffect(() => {
    if (!selectedWorkspace) return;
    const loadCards = async () => {
      try {
        setLoadingCards(true);
        const cards = await fetchWorkspaceCards(selectedWorkspace.id);
        setWorkspaceCards((cards || []).map((card) => normalizeMasterExamCard(card)));
      } catch (error) {
        toast.error(error.message || 'Failed to load workspace questions');
      } finally {
        setLoadingCards(false);
      }
    };
    loadCards();
  }, [selectedWorkspace]);

  const filteredWorkspaces = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return workspaces;
    return workspaces.filter((workspace) => {
      const meta = getWorkspaceMeta(workspace);
      return [
        workspace.title,
        meta.courseName,
        meta.courseCode,
      ].filter(Boolean).join(' ').toLowerCase().includes(query);
    });
  }, [searchQuery, workspaces]);

  const filteredCards = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return workspaceCards;
    return workspaceCards.filter((card) => [
      card.question_body,
      card.subject,
      card.topic,
      ...(card.tags_json || []),
    ].filter(Boolean).join(' ').toLowerCase().includes(query));
  }, [searchQuery, workspaceCards]);

  const toggleCard = (cardId) => {
    setSelectedCardIds((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) next.delete(cardId);
      else next.add(cardId);
      return next;
    });
  };

  const handleImport = async () => {
    if (!selectedWorkspace || selectedCardIds.size === 0) return;
    try {
      setIsImporting(true);
      await onImport?.({
        sourceExamDocumentId: selectedWorkspace.id,
        cardIds: Array.from(selectedCardIds),
      });
      onClose();
      setSelectedWorkspace(null);
      setWorkspaceCards([]);
      setSelectedCardIds(new Set());
      setSearchQuery('');
    } finally {
      setIsImporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/20 backdrop-blur-sm" onClick={onClose}>
      <div className="mx-auto flex h-screen max-w-6xl items-center justify-center px-4 py-6" onClick={(event) => event.stopPropagation()}>
        <div className="grid h-[80vh] w-full max-w-5xl overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.12)] lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="border-r border-slate-200 bg-[#fafcfb]">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-5">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Import Questions</p>
                <h2 className="mt-1 text-lg font-semibold text-slate-950">Choose a course workspace</h2>
              </div>
              <button type="button" onClick={onClose} className="rounded-full border border-slate-200 p-2 text-slate-400 transition hover:bg-white hover:text-slate-700">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="px-5 py-4">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search courses or questions"
                  className="h-10 w-full rounded-full border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 outline-none"
                />
              </label>
            </div>
            <div className="h-full overflow-y-auto px-4 pb-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-12 text-sm text-slate-500">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading workspaces...
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredWorkspaces.map((workspace) => {
                    const meta = getWorkspaceMeta(workspace);
                    return (
                      <button
                        key={workspace.id}
                        type="button"
                        onClick={() => {
                          setSelectedWorkspace(workspace);
                          setSelectedCardIds(new Set());
                        }}
                        className={`w-full rounded-[24px] border px-4 py-3 text-left transition ${
                          selectedWorkspace?.id === workspace.id
                            ? 'border-accent/25 bg-[#f7fbf9]'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="text-sm font-medium text-slate-950">{meta.courseName || workspace.title}</div>
                        <div className="mt-1 text-xs text-slate-500">{meta.courseCode || 'Course workspace'}</div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </aside>

          <section className="flex min-h-0 flex-col">
            <div className="border-b border-slate-200 px-6 py-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Question Library</p>
              <h3 className="mt-1 text-lg font-semibold text-slate-950">
                {selectedWorkspace ? `Questions from ${getWorkspaceMeta(selectedWorkspace).courseName || selectedWorkspace.title}` : 'Select a workspace to review questions'}
              </h3>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
              {!selectedWorkspace ? (
                <div className="flex h-full items-center justify-center text-sm text-slate-500">
                  Pick a course workspace on the left to browse reusable questions.
                </div>
              ) : loadingCards ? (
                <div className="flex items-center justify-center py-12 text-sm text-slate-500">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading questions...
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredCards.map((card) => (
                    <button
                      key={card.id}
                      type="button"
                      onClick={() => toggleCard(card.id)}
                      className={`w-full rounded-[24px] border px-4 py-4 text-left transition ${
                        selectedCardIds.has(card.id)
                          ? 'border-accent/25 bg-[#f7fbf9]'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-slate-900">{cleanText(card.question_body) || 'Untitled question'}</div>
                          <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-500">
                            {card.subject ? <span>{card.subject}</span> : null}
                            {card.topic ? <span>{card.topic}</span> : null}
                            {card.difficulty ? <span>{card.difficulty}</span> : null}
                            <span>{card.marks || 0} marks</span>
                          </div>
                        </div>
                        {selectedCardIds.has(card.id) ? <Check className="h-4 w-4 text-accent" /> : null}
                      </div>
                    </button>
                  ))}
                  {filteredCards.length === 0 ? (
                    <div className="rounded-[24px] border border-dashed border-slate-200 bg-[#fafcfb] px-4 py-10 text-center text-sm text-slate-500">
                      No questions match this search.
                    </div>
                  ) : null}
                </div>
              )}
            </div>
            <div className="border-t border-slate-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-500">{selectedCardIds.size} questions selected</div>
                <button
                  type="button"
                  onClick={handleImport}
                  disabled={!selectedWorkspace || selectedCardIds.size === 0 || isImporting}
                  className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
                >
                  <span className="inline-flex items-center gap-2">
                    {isImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Import className="h-4 w-4" />}
                    Import selected
                  </span>
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
