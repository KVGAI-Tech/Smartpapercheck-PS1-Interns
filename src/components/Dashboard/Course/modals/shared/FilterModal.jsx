import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown } from "lucide-react";

const FilterModal = ({ 
  open, 
  onClose, 
  filters, 
  onApply,
  availableTags,
  maxMarks,
  buttonRef
}) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [expandedSections, setExpandedSections] = useState({
    tagsInclude: false,
    tagsExclude: false
  });
  const [position, setPosition] = useState({ top: 0, right: 0 });
  const modalRef = useRef(null);

  useEffect(() => {
    if (open && buttonRef?.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: buttonRect.bottom + 8,
        right: window.innerWidth - buttonRect.right
      });
    }
  }, [open, buttonRef]);

  useEffect(() => {
    if (open) {
      setLocalFilters(filters);
    }
  }, [open, filters]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target) && 
          buttonRef?.current && !buttonRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open, onClose, buttonRef]);

  if (!open) return null;

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters = {
      tags: { include: [], exclude: [] },
      status: [],
      range: {
        min: 0,
        max: localFilters.range.mode === 'percent' ? 100 : maxMarks,
        mode: localFilters.range.mode
      }
    };
    setLocalFilters(resetFilters);
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const toggleTagInclude = (tagName) => {
    setLocalFilters(prev => {
      const include = prev.tags.include.includes(tagName)
        ? prev.tags.include.filter(t => t !== tagName)
        : [...prev.tags.include, tagName];
      const exclude = prev.tags.exclude.filter(t => t !== tagName);
      return {
        ...prev,
        tags: { include, exclude }
      };
    });
  };

  const toggleTagExclude = (tagName) => {
    setLocalFilters(prev => {
      const exclude = prev.tags.exclude.includes(tagName)
        ? prev.tags.exclude.filter(t => t !== tagName)
        : [...prev.tags.exclude, tagName];
      const include = prev.tags.include.filter(t => t !== tagName);
      return {
        ...prev,
        tags: { include, exclude }
      };
    });
  };

  const setStatus = (status) => {
    setLocalFilters(prev => ({
      ...prev,
      status: status ? [status] : []
    }));
  };

  const updateRange = (field, value) => {
    setLocalFilters(prev => ({
      ...prev,
      range: { ...prev.range, [field]: Number(value) }
    }));
  };

  const toggleRangeMode = () => {
    setLocalFilters(prev => {
      const newMode = prev.range.mode === 'percent' ? 'marks' : 'percent';
      const newMax = newMode === 'percent' ? 100 : maxMarks;
      return {
        ...prev,
        range: {
          ...prev.range,
          mode: newMode,
          min: 0,
          max: newMax
        }
      };
    });
  };

  const allTags = [...new Set([
    ...availableTags.map(t => t.name),
    'Top performer',
    'Needs attention',
    'Perfect',
    'Not uploaded',
    'Pending evaluation'
  ])];

  const rangeMax = localFilters.range.mode === 'percent' ? 100 : maxMarks;
  const selectedStatus = localFilters.status[0] || '';

  return (
    <div
      ref={modalRef}
      style={{
        position: 'fixed',
        top: `${position.top}px`,
        right: `${position.right}px`,
      }}
      className="w-80 rounded-xl bg-white border border-slate-200 shadow-xl z-50"
    >
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        <div className="text-sm font-semibold text-slate-900">Filters</div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-3 max-h-[400px] overflow-y-auto space-y-3">
        {/* Tags Include Section */}
        <div>
          <div className="text-xs font-semibold text-slate-500 mb-2">TAGS</div>
          <button
            type="button"
            onClick={() => toggleSection('tagsInclude')}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <div className="text-sm text-slate-700">Include tags</div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">({localFilters.tags.include.length})</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${expandedSections.tagsInclude ? 'rotate-180' : ''}`} />
            </div>
          </button>
          
          <AnimatePresence initial={false}>
            {expandedSections.tagsInclude && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="space-y-1 mt-1 pl-3">
                  {allTags.map(tagName => {
                    const isSelected = localFilters.tags.include.includes(tagName);
                    return (
                      <label
                        key={`include-${tagName}`}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-slate-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleTagInclude(tagName)}
                          className="w-3.5 h-3.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900 focus:ring-1"
                        />
                        <span className="text-xs text-slate-700">{tagName}</span>
                      </label>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Tags Exclude Section */}
        <div className="pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => toggleSection('tagsExclude')}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <div className="text-sm text-slate-700">Exclude tags</div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">({localFilters.tags.exclude.length})</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${expandedSections.tagsExclude ? 'rotate-180' : ''}`} />
            </div>
          </button>
          
          <AnimatePresence initial={false}>
            {expandedSections.tagsExclude && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="space-y-1 mt-1 pl-3">
                  {allTags.map(tagName => {
                    const isSelected = localFilters.tags.exclude.includes(tagName);
                    return (
                      <label
                        key={`exclude-${tagName}`}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-slate-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleTagExclude(tagName)}
                          className="w-3.5 h-3.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900 focus:ring-1"
                        />
                        <span className="text-xs text-slate-700">{tagName}</span>
                      </label>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Status Section */}
        <div className="pt-2 border-t border-slate-100">
          <div className="text-xs font-semibold text-slate-500 mb-2">STATUS</div>
          <select
            value={selectedStatus}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-0"
          >
            <option value="">All statuses</option>
            <option value="evaluated">Evaluated</option>
            <option value="not_evaluated">Not Evaluated</option>
            <option value="not_uploaded">Not Uploaded</option>
          </select>
        </div>

        {/* Range Section */}
        <div className="pt-2 border-t border-slate-100">
          <div className="text-xs font-semibold text-slate-500 mb-2">RANGE</div>
          
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs text-slate-600">Mode</div>
            <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 overflow-hidden">
              <button
                type="button"
                onClick={() => localFilters.range.mode !== 'percent' && toggleRangeMode()}
                className={`px-2.5 py-1 text-xs font-medium transition-colors ${
                  localFilters.range.mode === 'percent'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                %
              </button>
              <button
                type="button"
                onClick={() => localFilters.range.mode !== 'marks' && toggleRangeMode()}
                className={`px-2.5 py-1 text-xs font-medium transition-colors ${
                  localFilters.range.mode === 'marks'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Marks
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-600">Selected range</span>
              <span className="text-xs font-medium text-slate-900">
                {localFilters.range.min}{localFilters.range.mode === 'percent' ? '%' : ''} - {localFilters.range.max}{localFilters.range.mode === 'percent' ? '%' : ''}
              </span>
            </div>
            
            <div className="relative px-2 py-4">
              <div className="relative h-1 bg-slate-300 rounded-full">
                <div 
                  className="absolute h-full bg-slate-900 rounded-full"
                  style={{
                    left: `${(localFilters.range.min / rangeMax) * 100}%`,
                    right: `${100 - (localFilters.range.max / rangeMax) * 100}%`
                  }}
                />
              </div>
              
              <input
                type="range"
                min={0}
                max={rangeMax}
                value={localFilters.range.min}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val <= localFilters.range.max) {
                    updateRange('min', val);
                  }
                }}
                className="absolute top-1/2 -translate-y-1/2 left-0 w-full h-1 bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-slate-900 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-0 [&::-webkit-slider-thumb]:shadow-sm [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-slate-900 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-sm"
                style={{ zIndex: localFilters.range.min > rangeMax / 2 ? 2 : 1 }}
              />
              
              <input
                type="range"
                min={0}
                max={rangeMax}
                value={localFilters.range.max}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val >= localFilters.range.min) {
                    updateRange('max', val);
                  }
                }}
                className="absolute top-1/2 -translate-y-1/2 left-0 w-full h-1 bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-slate-900 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-0 [&::-webkit-slider-thumb]:shadow-sm [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-slate-900 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-sm"
                style={{ zIndex: localFilters.range.max <= rangeMax / 2 ? 2 : 1 }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="p-3 border-t border-slate-200 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={handleReset}
          className="px-3 py-1.5 rounded-lg text-xs text-slate-600 hover:bg-slate-50 font-medium"
        >
          Reset
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 hover:bg-slate-50 font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-medium text-white"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;
