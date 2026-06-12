/* eslint-disable react/prop-types */
import './workspace.css';

export default function PaperPreviewRenderer({ paperDocument, paperSettings }) {
  if (paperDocument?.error) {
    return <div style={{ color: 'red', padding: 20 }}>Error rendering preview: {paperDocument.error}</div>;
  }
  if (!paperDocument || !paperDocument.pageDescriptors) {
    return <div style={{ padding: 20, textAlign: 'center', color: '#666' }}>Initializing preview...</div>;
  }

  return (
    <div className="ws-paper-preview-container">
      {paperDocument.pageDescriptors.map((page) => (
        <div
          key={page.id}
          className="ws-paper-preview-page"
          style={{
            width: 'min(100%, 794px)',
            minHeight: 1123,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {page.headerMode !== 'none' && (
            <div className={`ws-paper-preview-header ${page.headerMode === 'full' ? 'ws-paper-preview-header--full' : 'ws-paper-preview-header--repeat'}`}>
              <div className="ws-paper-preview-header__title">{page.header.title}</div>
              {page.headerMode === 'full' && page.header.institution && (
                <div className="ws-paper-preview-header__subtitle">{page.header.institution}</div>
              )}
              {page.headerMode === 'full' && page.header.subtitle && (
                <div className="ws-paper-preview-header__subtitle">{page.header.subtitle}</div>
              )}
              {page.headerMode === 'full' && (
                <div className="ws-paper-preview-header__meta">
                  <div><strong>Course</strong><span>{page.header.course || 'Not set'}</span></div>
                  <div><strong>Subject</strong><span>{page.header.subject || 'Not set'}</span></div>
                  <div><strong>Subject Code</strong><span>{page.header.subjectCode || 'Not set'}</span></div>
                  <div><strong>Duration</strong><span>{page.header.examTime || '3 Hours'}</span></div>
                  <div><strong>Max Marks</strong><span>{page.header.totalMarks || 100}</span></div>
                </div>
              )}
              {page.headerMode === 'full' && page.header.instructions && page.header.instructions.length > 0 && (
                <div className="ws-paper-preview-header__instructions">
                  <strong>General Instructions:</strong>
                  <BlockRenderer blocks={page.header.instructions} />
                </div>
              )}
            </div>
          )}

          <div
            className="ws-paper-preview-content"
            style={{
              position: 'relative',
              minHeight: page.contentHeight || 0,
            }}
          >
            {page.items.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '100px 20px', color: '#999', fontStyle: 'italic', fontFamily: 'var(--ws-font-sans)' }}>
                No questions added to the paper yet.
              </div>
            ) : page.items.map((item) => {
              if (item.type === 'sectionHeader') {
                return (
                  <div
                    key={item.id}
                    className="ws-paper-preview-section"
                    style={{
                      position: 'absolute',
                      top: item.yOffset || 0,
                      left: 0,
                      right: 0,
                      marginBottom: 0,
                    }}
                  >
                    <div className="ws-paper-preview-section__head">
                      <div className="ws-paper-preview-section__title">{item.title}</div>
                      {paperSettings?.showSectionMarks !== false && (
                        <div className="ws-paper-preview-section__marks">{item.marks} marks</div>
                      )}
                    </div>
                    {item.instructions && item.instructions.length > 0 && (
                      <div className="ws-paper-preview-section__instructions">
                        <BlockRenderer blocks={item.instructions} />
                      </div>
                    )}
                  </div>
                );
              }

              // Question Segment
              return (
                <div
                  key={item.id}
                  className="ws-paper-preview-q"
                  style={{
                    position: 'absolute',
                    top: item.yOffset || 0,
                    left: 0,
                    right: 0,
                    marginBottom: 0,
                  }}
                >
                  <div className="ws-paper-preview-q__left">
                    {item.showNumber === false ? '' : `Q${item.questionDisplayNumber || item.questionNumber || item.questionLabel}.`}
                  </div>
                  <div className="ws-paper-preview-q__body">
                    {(item.body?.blocks || item.blocks) && (item.body?.blocks || item.blocks).length > 0 && (
                      <BlockRenderer blocks={item.body?.blocks || item.blocks} />
                    )}
                    {item.images && item.images.length > 0 && (
                      <div className="ws-paper-preview-q__images">
                        {item.images.map((img, idx) => (
                          <img key={img.id || idx} src={img.url} alt="Question figure" />
                        ))}
                      </div>
                    )}
                    {item.answerArea && item.answerArea.mode !== 'none' && (
                      <AnswerAreaRenderer area={item.answerArea} />
                    )}
                  </div>
                  <div className="ws-paper-preview-q__right">
                    {paperSettings?.showQuestionMarks !== false && item.showMarks !== false && item.marks > 0 && `[${item.marks}]`}
                  </div>
                </div>
              );
            })}
          </div>
          
          {page.footerEnabled && (
             <div className="ws-paper-preview-footer">
               Page {page.pageNumber} of {paperDocument.pageDescriptors.length}
             </div>
          )}
        </div>
      ))}
    </div>
  );
}

function BlockRenderer({ blocks }) {
  if (!blocks || !blocks.length) return null;
  return (
    <div className="ws-paper-preview-blocks">
      {blocks.map((block, idx) => {
        if (block.type === 'paragraph') {
          return (
            <p key={idx} className="ws-paper-preview-p">
              <InlineRenderer inlines={block.inlines} />
            </p>
          );
        }
        if (block.type === 'list') {
          const Tag = block.ordered ? 'ol' : 'ul';
          return (
            <Tag key={idx} className="ws-paper-preview-list">
              {block.items.map((item, itemIdx) => (
                <li key={itemIdx}>
                  <InlineRenderer inlines={item.inlines} />
                </li>
              ))}
            </Tag>
          );
        }
        if (block.type === 'options') {
          return (
            <div key={idx} className="ws-paper-preview-options">
              {block.options.map((opt) => (
                <div key={opt.id} className="ws-paper-preview-option">
                  <span className="ws-paper-preview-option-key">({opt.key})</span>
                  <div className="ws-paper-preview-option-content">
                    <BlockRenderer blocks={opt.blocks} />
                  </div>
                </div>
              ))}
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}

function InlineRenderer({ inlines }) {
  if (!inlines || !inlines.length) return null;
  return inlines.map((inline, idx) => {
    let classes = [];
    if (inline.marks?.bold) classes.push('ws-bold');
    if (inline.marks?.italic) classes.push('ws-italic');
    if (inline.marks?.code) classes.push('ws-code');
    const className = classes.join(' ');
    
    // Add a trailing space if not the last inline to replicate PdfInlineContent behavior
    const textContent = `${inline.text}${idx < inlines.length - 1 ? ' ' : ''}`;

    if (className) {
      return <span key={idx} className={className}>{textContent}</span>;
    }
    return <span key={idx}>{textContent}</span>;
  });
}

function AnswerAreaRenderer({ area }) {
  if (area.mode === 'lined' || area.mode === 'steps') {
    return (
      <div className="ws-paper-preview-answer-lined">
        {Array.from({ length: area.lines || 3 }).map((_, i) => (
          <div key={i} className="ws-paper-preview-answer-line"></div>
        ))}
      </div>
    );
  }
  if (area.mode === 'graph') {
    return (
      <div 
        className="ws-paper-preview-answer-graph" 
        style={{ height: area.height || 150 }}
      ></div>
    );
  }
  return (
    <div 
      className="ws-paper-preview-answer-blank" 
      style={{ height: area.height || 100 }}
    ></div>
  );
}
