import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Tag } from "lucide-react";

const TagSelectionModal = ({ 
  open, 
  availableTags, 
  selectedTags, 
  onClose, 
  onToggleTag, 
  onCreateNew,
  onApply // Optional: if provided, "Done" will call this instead of just closing
}) => {
  if (!open) return null;

  const handleDone = () => {
    if (onApply) {
      onApply();
    } else {
      onClose();
    }
  };

  const customTags = useMemo(() => {
    return availableTags.filter(tag => tag.isCustom);
  }, [availableTags]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4"
        onClick={onClose}
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
              <div className="text-sm font-semibold text-slate-900">Manage Tags</div>
              <div className="mt-0.5 text-xs text-slate-500">
                Select existing tags or create new ones
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 max-h-[60vh] overflow-y-auto">
            {customTags.length > 0 ? (
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-700 mb-3">
                  Available Custom Tags
                </div>
                {customTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag.name);
                  return (
                    <button
                      key={tag.name}
                      type="button"
                      onClick={() => onToggleTag(tag.name)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                        isSelected
                          ? "border-slate-300 bg-slate-50"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full border-2"
                          style={{
                            backgroundColor: tag.color,
                            borderColor: tag.color,
                          }}
                        />
                        <span className="text-sm font-medium text-slate-800">
                          {tag.name}
                        </span>
                      </div>
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                          isSelected
                            ? "bg-slate-900 border-slate-900"
                            : "border-slate-300"
                        }`}
                      >
                        {isSelected && (
                          <svg
                            className="w-3 h-3 text-white"
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
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Tag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <div className="text-sm text-slate-600">No custom tags yet</div>
                <div className="text-xs text-slate-500 mt-1">
                  Create your first custom tag below
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={onCreateNew}
              className="mt-5 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-sm font-medium text-slate-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Tag</span>
            </button>
          </div>

          <div className="p-5 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={handleDone}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-sm font-medium text-white"
            >
              Done
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TagSelectionModal;
