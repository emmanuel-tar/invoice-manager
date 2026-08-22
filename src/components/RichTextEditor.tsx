import React, { useRef, useEffect, useState } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered, 
  Quote, 
  Code, 
  Highlighter, 
  RemoveFormatting, 
  Eye, 
  Code2,
  Tag,
  CheckSquare
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  minHeight?: string;
  maxHeight?: string;
  readOnly?: boolean;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Add client background, billing preferences, payment terms, or special instructions...',
  minHeight = '140px',
  maxHeight = '320px',
  readOnly = false,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<'visual' | 'html'>('visual');
  const [activeFormats, setActiveFormats] = useState<Record<string, boolean>>({});

  // Sync external value to contentEditable when not actively typing
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== (value || '')) {
      if (document.activeElement !== editorRef.current) {
        editorRef.current.innerHTML = value || '';
      }
    }
  }, [value]);

  const updateActiveFormats = () => {
    if (typeof document === 'undefined') return;
    setActiveFormats({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      strikeThrough: document.queryCommandState('strikeThrough'),
      insertUnorderedList: document.queryCommandState('insertUnorderedList'),
      insertOrderedList: document.queryCommandState('insertOrderedList'),
    });
  };

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      // If only contains <br> or whitespace, normalize to empty string
      if (html === '<br>' || html.trim() === '') {
        onChange('');
      } else {
        onChange(html);
      }
    }
    updateActiveFormats();
  };

  const execCmd = (command: string, arg: string | undefined = undefined) => {
    if (readOnly) return;
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand(command, false, arg);
    handleInput();
  };

  const handleInsertTag = (tagText: string, colorClass: string) => {
    if (readOnly) return;
    const badgeHtml = `&nbsp;<span class="inline-block px-2 py-0.5 text-[11px] font-bold rounded-md ${colorClass}">${tagText}</span>&nbsp;`;
    execCmd('insertHTML', badgeHtml);
  };

  const handleInsertChecklist = () => {
    if (readOnly) return;
    const checklistHtml = `<p><strong>[ ] </strong>Follow up on billing</p>`;
    execCmd('insertHTML', checklistHtml);
  };

  if (readOnly) {
    return (
      <div 
        className="prose prose-sm max-w-none text-slate-700 leading-relaxed text-xs overflow-y-auto"
        dangerouslySetInnerHTML={{ __html: value || '<em class="text-slate-400">No notes recorded.</em>' }}
      />
    );
  }

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all shadow-xs flex flex-col">
      {/* Formatting Toolbar */}
      <div className="bg-slate-50/90 border-b border-slate-200/80 px-2.5 py-1.5 flex items-center justify-between gap-1 flex-wrap text-slate-600">
        <div className="flex items-center gap-0.5 flex-wrap">
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); execCmd('bold'); }}
            className={`p-1.5 rounded-md hover:bg-slate-200 transition-colors ${activeFormats.bold ? 'bg-blue-100 text-blue-700 font-bold' : ''}`}
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); execCmd('italic'); }}
            className={`p-1.5 rounded-md hover:bg-slate-200 transition-colors ${activeFormats.italic ? 'bg-blue-100 text-blue-700' : ''}`}
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); execCmd('underline'); }}
            className={`p-1.5 rounded-md hover:bg-slate-200 transition-colors ${activeFormats.underline ? 'bg-blue-100 text-blue-700' : ''}`}
            title="Underline (Ctrl+U)"
          >
            <Underline className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); execCmd('strikeThrough'); }}
            className={`p-1.5 rounded-md hover:bg-slate-200 transition-colors ${activeFormats.strikeThrough ? 'bg-blue-100 text-blue-700' : ''}`}
            title="Strikethrough"
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </button>

          <div className="w-[1px] h-4 bg-slate-200 mx-1" />

          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); execCmd('formatBlock', '<h3>'); }}
            className="px-1.5 py-1 rounded-md text-[11px] font-bold hover:bg-slate-200 transition-colors flex items-center gap-0.5"
            title="Subheading (H3)"
          >
            <Heading3 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); execCmd('formatBlock', '<p>'); }}
            className="px-1.5 py-1 rounded-md text-[11px] font-semibold hover:bg-slate-200 transition-colors"
            title="Paragraph"
          >
            P
          </button>

          <div className="w-[1px] h-4 bg-slate-200 mx-1" />

          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); execCmd('insertUnorderedList'); }}
            className={`p-1.5 rounded-md hover:bg-slate-200 transition-colors ${activeFormats.insertUnorderedList ? 'bg-blue-100 text-blue-700' : ''}`}
            title="Bullet List"
          >
            <List className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); execCmd('insertOrderedList'); }}
            className={`p-1.5 rounded-md hover:bg-slate-200 transition-colors ${activeFormats.insertOrderedList ? 'bg-blue-100 text-blue-700' : ''}`}
            title="Numbered List"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); execCmd('formatBlock', '<blockquote>'); }}
            className="p-1.5 rounded-md hover:bg-slate-200 transition-colors"
            title="Quote / Callout"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); execCmd('hiliteColor', '#fef08a'); }}
            className="p-1.5 rounded-md hover:bg-slate-200 transition-colors text-amber-600"
            title="Highlight Text"
          >
            <Highlighter className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); execCmd('removeFormat'); }}
            className="p-1.5 rounded-md hover:bg-slate-200 transition-colors text-slate-400 hover:text-slate-700"
            title="Clear Formatting"
          >
            <RemoveFormatting className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick Tag insertion & View toggles */}
        <div className="flex items-center gap-1.5">
          <div className="hidden sm:flex items-center gap-1">
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); handleInsertTag('Net-30', 'bg-blue-100 text-blue-800 border border-blue-200'); }}
              className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
            >
              +Net-30
            </button>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); handleInsertTag('VIP Partner', 'bg-amber-100 text-amber-800 border border-amber-200'); }}
              className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition-colors"
            >
              +VIP
            </button>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); handleInsertTag('Tax Exempt', 'bg-emerald-100 text-emerald-800 border border-emerald-200'); }}
              className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
            >
              +Exempt
            </button>
          </div>

          <button
            type="button"
            onClick={() => setMode(mode === 'visual' ? 'html' : 'visual')}
            className={`p-1 rounded text-[10px] font-mono font-bold flex items-center gap-1 transition-colors ${
              mode === 'html' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-200'
            }`}
            title={mode === 'visual' ? 'Switch to HTML Code' : 'Switch to Visual Editor'}
          >
            {mode === 'visual' ? <Code2 className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{mode === 'visual' ? 'HTML' : 'Visual'}</span>
          </button>
        </div>
      </div>

      {/* Editor Body */}
      {mode === 'visual' ? (
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onKeyUp={updateActiveFormats}
          onMouseUp={updateActiveFormats}
          style={{ minHeight, maxHeight }}
          className="p-3 text-xs text-slate-800 focus:outline-none overflow-y-auto leading-relaxed rich-notes-editor font-sans"
          data-placeholder={placeholder}
        />
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ minHeight, maxHeight }}
          className="p-3 text-xs font-mono text-slate-800 bg-slate-900 text-emerald-400 focus:outline-none overflow-y-auto w-full resize-none leading-relaxed"
          placeholder="<p>Enter raw HTML content...</p>"
        />
      )}

      {/* Footer Info */}
      <div className="bg-slate-50 border-t border-slate-100 px-3 py-1 text-[10px] text-slate-400 flex items-center justify-between">
        <span>Rich-text formatted & persisted to client record</span>
        <span>{value ? `${value.replace(/<[^>]*>/g, '').length} chars` : 'Empty note'}</span>
      </div>
    </div>
  );
};
