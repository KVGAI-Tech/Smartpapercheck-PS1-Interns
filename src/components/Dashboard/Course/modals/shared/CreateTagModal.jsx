import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader, Tag } from "lucide-react";

const PRESET_COLORS = [
  { name: "Red", value: "#EF4444" },
  { name: "Orange", value: "#F97316" },
  { name: "Amber", value: "#F59E0B" },
  { name: "Yellow", value: "#EAB308" },
  { name: "Lime", value: "#84CC16" },
  { name: "Green", value: "#22C55E" },
  { name: "Emerald", value: "#10B981" },
  { name: "Teal", value: "#14B8A6" },
  { name: "Cyan", value: "#06B6D4" },
  { name: "Sky", value: "#0EA5E9" },
  { name: "Blue", value: "#3B82F6" },
  { name: "Indigo", value: "#6366F1" },
  { name: "Violet", value: "#8B5CF6" },
  { name: "Purple", value: "#A855F7" },
  { name: "Fuchsia", value: "#D946EF" },
  { name: "Pink", value: "#EC4899" },
  { name: "Rose", value: "#F43F5E" },
  { name: "Slate", value: "#64748B" },
];

const CreateTagModal = ({ open, onClose, onCreate, loading, editMode = false, initialData = null }) => {
  const [tagName, setTagName] = useState("");
  const [tagColor, setTagColor] = useState(PRESET_COLORS[0].value);
  const [error, setError] = useState("");

  // Initialize form when opening in edit mode
  React.useEffect(() => {
    if (open && editMode && initialData) {
      setTagName(initialData.name || "");
      setTagColor(initialData.color || PRESET_COLORS[0].value);
    } else if (open && !editMode) {
      setTagName("");
      setTagColor(PRESET_COLORS[0].value);
    }
  }, [open, editMode, initialData]);

  if (!open) return null;

  // Helper function to convert hex to RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const handleCreate = () => {
    const trimmedName = tagName.trim();
    
    if (!trimmedName) {
      setError("Tag name is required");
      return;
    }

    if (trimmedName.length < 2) {
      setError("Tag name must be at least 2 characters");
      return;
    }

    if (trimmedName.length > 30) {
      setError("Tag name must be less than 30 characters");
      return;
    }

    onCreate({ name: trimmedName, color: tagColor });
    setTagName("");
    setTagColor(PRESET_COLORS[0].value);
    setError("");
  };

  const handleClose = () => {
    if (loading) return;
    setTagName("");
    setTagColor(PRESET_COLORS[0].value);
    setError("");
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center px-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.99 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-2xl"
        >
          <div className="p-5 border-b border-slate-200 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-900">
                {editMode ? "Edit Tag" : "Create Custom Tag"}
              </div>
              <div className="mt-0.5 text-xs text-slate-500">
                {editMode ? "Update tag name and color" : "Add a new tag with custom name and color"}
              </div>
            </div>
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 disabled:opacity-50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Tag Name
              </label>
              <input
                type="text"
                value={tagName}
                onChange={(e) => {
                  setTagName(e.target.value);
                  setError("");
                }}
                placeholder="e.g., Needs Review, High Priority"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                disabled={loading}
                maxLength={30}
              />
              {error && (
                <div className="mt-1.5 text-xs text-rose-600">{error}</div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Tag Color
              </label>
              <div className="grid grid-cols-6 gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setTagColor(color.value)}
                    disabled={loading}
                    className={`relative w-full aspect-square rounded-xl border-2 transition-all ${
                      tagColor === color.value
                        ? "border-slate-900 scale-110"
                        : "border-transparent hover:scale-105"
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  >
                    {tagColor === color.value && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-white drop-shadow-lg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs text-slate-500 mb-2">Preview</div>
              {(() => {
                const rgb = hexToRgb(tagColor);
                const bgColor = rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)` : '#f1f5f9';
                const borderColor = rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)` : '#e2e8f0';
                
                return (
                  <span
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full border text-xs"
                    style={{
                      backgroundColor: bgColor,
                      borderColor: borderColor,
                      color: tagColor
                    }}
                  >
                    <Tag className="w-3.5 h-3.5" style={{ color: tagColor }} />
                    <span className="max-w-[160px] truncate">
                      {tagName.trim() || "Tag Name"}
                    </span>
                  </span>
                );
              })()}
            </div>
          </div>

          <div className="p-5 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreate}
              disabled={loading || !tagName.trim()}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-sm font-medium text-white disabled:opacity-60 inline-flex items-center gap-2"
            >
              {loading && <Loader className="w-4 h-4 animate-spin" />}
              <span>{editMode ? "Update Tag" : "Create Tag"}</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CreateTagModal;
