/* eslint-disable react/prop-types */
import { useMemo } from 'react';
import { X, Sparkles, AlertTriangle, Layers, History, Clock, Wand2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AIAssistantDrawer({ open, onClose, cards, sections, paperSettings }) {
  const cardsById = useMemo(() => {
    const map = {};
    cards.forEach((c) => { map[c.id] = c; });
    return map;
  }, [cards]);

  const { totalMarks, bloom, count, repeatCount } = useMemo(() => {
    let tMarks = 0;
    const blm = {};
    let c = 0;
    let repeats = 0;
    sections.forEach((sec) => {
      (sec.cardIds || []).forEach((id) => {
        const q = cardsById[id];
        if (!q) return;
        const m = Number(q.marks) || 0;
        tMarks += m;
        const bLevel = q.parsed_metadata?.bloom_taxonomy || 'Remember';
        blm[bLevel] = (blm[bLevel] || 0) + m;
        if ((q.parsed_metadata?.repeat_count || 0) > 0) repeats++;
        c += 1;
      });
    });
    return { totalMarks: tMarks, bloom: blm, count: c, repeatCount: repeats };
  }, [sections, cardsById]);

  if (!open) return null;

  const targetMarks = paperSettings?.totalMarks || 100;
  const timeEst = Math.round(count * 12 + totalMarks * 1.2);

  const apply = (action) => {
    toast.success(`Action applied: ${action}`);
    if (action === 'Auto-build paper') onClose();
  };

  return (
    <>
      <div className="ws-ai-drawer-backdrop" onClick={onClose} />
      <aside className="ws-ai-drawer">
        <div className="ws-ai-drawer__head">
          <h3 style={{ color: '#4a2db8', fontWeight: 600 }}>
            <Sparkles size={16} color="#6a48d1" /> Paper Assistant
          </h3>
          <button type="button" className="ws-btn ws-btn--icon ws-btn--ghost" onClick={onClose}>
            <X size={16} />
          </button>
        </div>
        <div className="ws-ai-drawer__body">
          <div style={{ fontSize: 12.5, color: 'var(--ws-ink-500)' }}>
            Based on your current paper of <strong>{count}</strong> question{count === 1 ? '' : 's'} ({totalMarks}M, ~{timeEst} min):
          </div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['Balance difficulty', 'Fill marks gap', 'Estimate time', 'Detect duplicates'].map((c) => (
              <button key={c} type="button" className="ws-btn ws-btn--sm ws-btn--soft" onClick={() => apply(c)}>
                {c}
              </button>
            ))}
          </div>

          {/* Suggestion 1: Marks Gap */}
          {totalMarks < targetMarks && (
            <div className="ws-ai-suggestion">
              <div className="ws-ai-suggestion__head">
                <AlertTriangle size={12} /> Marks gap
              </div>
              <div className="ws-ai-suggestion__title">
                Your paper is at {totalMarks} of {targetMarks} marks — {targetMarks - totalMarks} short.
              </div>
              <div className="ws-ai-suggestion__body">
                I can suggest medium-difficulty Apply-level questions from your library to close the gap.
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button type="button" className="ws-btn ws-btn--sm ws-btn--primary" onClick={() => apply('Auto-fill marks')}>
                  <Wand2 size={12} /> Auto-fill {targetMarks - totalMarks}M
                </button>
              </div>
            </div>
          )}

          {/* Suggestion 2: Bloom's */}
          <div className="ws-ai-suggestion">
            <div className="ws-ai-suggestion__head">
              <Layers size={12} /> Bloom&rsquo;s coverage
            </div>
            <div className="ws-ai-suggestion__title">
              Heavy on Analyze/Create. Light on Remember &amp; Apply.
            </div>
            <div className="ws-ai-suggestion__body">
              Consider adding short-answer Remember questions to bring the paper closer to a balanced 30/30/40 split.
            </div>
            <div className="ws-dist" style={{ marginTop: 4 }}>
              {['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'].map((b, i) => {
                const colors = ['#cfd8d8', '#a4cdc3', '#7fbfae', '#5ba98e', '#3a8068', '#1c5d47'];
                const v = bloom[b] || 0;
                const tot = Object.values(bloom).reduce((a, x) => a + x, 0) || 1;
                return <div key={b} style={{ flex: v / tot, background: colors[i], minWidth: v ? 6 : 0 }} title={`${b}: ${v}M`} />;
              })}
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
              <button type="button" className="ws-btn ws-btn--sm ws-btn--primary" onClick={() => apply('Rebalance Bloom\'s')}>
                <Wand2 size={12} /> Apply rebalance
              </button>
            </div>
          </div>

          {/* Suggestion 3: Repetition */}
          {repeatCount > 0 && (
            <div className="ws-ai-suggestion">
              <div className="ws-ai-suggestion__head">
                <History size={12} /> Repetition risk
              </div>
              <div className="ws-ai-suggestion__title">{repeatCount} questions appeared in recent past papers.</div>
              <div className="ws-ai-suggestion__body">
                Students may have practice answers from past papers. Consider swapping them.
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button type="button" className="ws-btn ws-btn--sm" onClick={() => apply('Show alternatives')}>Show alternatives</button>
              </div>
            </div>
          )}

          {/* Final Action */}
          <div className="ws-ai-suggestion" style={{ background: 'linear-gradient(180deg, #eef6f1, #ffffff)', borderColor: 'var(--ws-brand-100)' }}>
            <div className="ws-ai-suggestion__head" style={{ color: 'var(--ws-brand-700)' }}>
              <Wand2 size={12} /> Auto-build paper
            </div>
            <div className="ws-ai-suggestion__title">Build a balanced paper for me</div>
            <div className="ws-ai-suggestion__body">
              I&rsquo;ll select questions targeting balanced difficulty, Bloom&rsquo;s coverage, and minimal overlap with past years.
            </div>
            <button
              type="button"
              className="ws-btn ws-btn--primary ws-btn--sm"
              onClick={() => apply('Auto-build paper')}
              style={{ alignSelf: 'flex-start', marginTop: 4 }}
            >
              <Sparkles size={12} /> Generate draft
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
