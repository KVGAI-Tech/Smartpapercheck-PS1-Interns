import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, ImageIcon, Tag } from 'lucide-react';

export default function QuestionEditModal({ card, onClose, onSave, onDelete }) {
  const [formData, setFormData] = useState({
    question_body: '',
    marks: 0,
    question_type: '',
    difficulty: '',
    tags_json: [],
    image_urls: [],
  });
  const [tagInput, setTagInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (card) {
      setFormData({
        question_body: card.question_body || '',
        marks: card.marks || 0,
        question_type: card.question_type || '',
        difficulty: card.difficulty || '',
        tags_json: card.tags_json || [],
        image_urls: card.image_urls || [],
      });
      setTagInput((card.tags_json || []).join(', '));
    }
  }, [card]);

  if (!card) return null;

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTagChange = (value) => {
    setTagInput(value);
    handleChange('tags_json', value.split(',').map(s => s.trim()).filter(Boolean));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(card.id, formData);
      onClose();
    } catch (err) {
      console.error('Save failed', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    await onDelete(card.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative mx-4 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Edit Question</h2>
            <p className="text-xs text-slate-500">Card #{card.id} • {card.question_type || 'General'}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
            <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* Question Body */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Question Body</label>
            <textarea
              value={formData.question_body}
              onChange={(e) => handleChange('question_body', e.target.value)}
              rows={10}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm leading-relaxed text-slate-800 outline-none transition-colors focus:border-accent focus:bg-white focus:ring-1 focus:ring-accent/20"
              placeholder="Enter the full question text with any subparts..."
            />
          </div>

          {/* Image Gallery */}
          {formData.image_urls.length > 0 && (
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                <ImageIcon className="h-4 w-4" /> Extracted Images ({formData.image_urls.length})
              </label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {formData.image_urls.map((url, idx) => (
                  <div key={idx} className="group relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                    <img
                      src={url}
                      alt={`Question image ${idx + 1}`}
                      className="h-40 w-full object-contain p-2"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                      <span className="w-full truncate px-2 pb-1.5 text-[10px] font-medium text-white">Image {idx + 1}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metadata Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Marks</label>
              <input
                type="number"
                value={formData.marks}
                onChange={(e) => handleChange('marks', parseFloat(e.target.value) || 0)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm outline-none focus:border-accent focus:bg-white"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Type</label>
              <select
                value={formData.question_type}
                onChange={(e) => handleChange('question_type', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm outline-none focus:border-accent focus:bg-white"
              >
                <option value="">Select Type</option>
                <option value="Subjective">Subjective</option>
                <option value="MCQ">Multiple Choice</option>
                <option value="Coding">Coding</option>
                <option value="Short Answer">Short Answer</option>
                <option value="Numerical">Numerical</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Difficulty</label>
              <select
                value={formData.difficulty}
                onChange={(e) => handleChange('difficulty', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm outline-none focus:border-accent focus:bg-white"
              >
                <option value="">Select Difficulty</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
              <Tag className="h-4 w-4" /> Tags (comma separated)
            </label>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => handleTagChange(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm outline-none focus:border-accent focus:bg-white"
              placeholder="e.g. Digital Logic, K-Map, Boolean Algebra"
            />
            {formData.tags_json.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {formData.tags_json.map((tag, idx) => (
                  <span key={idx} className="rounded-full bg-accent/10 px-2.5 py-1 text-[11px] font-medium text-accent">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t bg-slate-50 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-xl bg-accent px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
