import React, { useEffect, useRef } from 'react';
import { FileText, Folder } from 'lucide-react';

const FolderItem = ({
  item,
  selected = false,
  isRenaming = false,
  renameValue = '',
  onRenameChange,
  onRenameSubmit,
  onSelect,
  onOpen,
  onContextMenu,
}) => {
  const inputRef = useRef(null);
  const isFolder = item.type === 'folder';
  const exam = item.exam;
  const isConductExam = exam?.exam_type === 'conduct';

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      onDoubleClick={() => onOpen(item)}
      onContextMenu={(event) => onContextMenu(event, item)}
      className={`group ${
        isFolder
          ? `flex w-[112px] flex-col items-center justify-start gap-2.5 px-2 py-2 text-center transition-all duration-200 ease-in-out ${
              selected
                ? 'scale-[1.03]'
                : 'bg-transparent hover:scale-[1.02]'
            }`
          : `flex w-full items-center gap-4 rounded-xl px-4 py-3 text-left transition-all duration-200 ease-in-out ${
              selected
                ? 'scale-[1.01] bg-accent/10'
                : 'bg-transparent hover:scale-[1.01] hover:bg-gray-100/80'
            }`
      }`}
    >
      <div className={`inline-flex shrink-0 items-center justify-center ${
        isFolder
          ? `transition-all duration-200 ease-in-out ${
              selected
                ? 'text-accent shadow-[0_0_14px_rgba(34,197,94,0.28)]'
                : 'text-accent/85 group-hover:text-accent'
            }`
          : 'rounded-xl bg-gradient-to-br from-accent via-emerald-500 to-teal-400 px-3.5 py-3 text-white'
      }`}>
        {isFolder ? <Folder className="h-12 w-12" strokeWidth={1.5} /> : <FileText className="h-7 w-7" strokeWidth={1.75} />}
      </div>

      <div className={`${isFolder ? 'w-full' : 'min-w-0 flex-1'}`}>
        {isRenaming ? (
          <input
            ref={inputRef}
            value={renameValue}
            onChange={(event) => onRenameChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') onRenameSubmit();
              if (event.key === 'Escape') onRenameSubmit(true);
            }}
            onBlur={() => onRenameSubmit()}
            onClick={(event) => event.stopPropagation()}
            className={`w-full rounded-lg border border-accent bg-white px-3 py-2 text-sm font-medium text-gray-900 outline-none ring-2 ring-accent/10 ${
              isFolder ? 'text-center' : ''
            }`}
          />
        ) : (
          <>
            <div className={`truncate font-medium text-gray-800 transition-colors duration-200 group-hover:text-accent ${
              isFolder ? 'text-sm' : 'text-base sm:text-lg'
            }`}>
              {item.name}
            </div>
            {!isFolder && (
              <div className="mt-0.5 text-sm text-gray-500">
                {`${isConductExam ? 'MCQ Exam' : 'Evaluated Exam'}${exam?.full_marks != null ? ` • ${exam.full_marks} marks` : ''}${exam?.has_questions ? ' • Ready' : ' • Draft'}`}
              </div>
            )}
          </>
        )}
      </div>
    </button>
  );
};

export default FolderItem;
