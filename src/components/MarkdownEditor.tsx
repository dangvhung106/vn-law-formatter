import React, { useState } from 'react';
import Markdown from 'react-markdown';
import { Copy, Download, Check } from 'lucide-react';

interface MarkdownEditorProps {
  markdown: string;
  fileName: string;
}

export function MarkdownEditor({ markdown, fileName }: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.replace('.docx', '.md');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col w-full h-[calc(100vh-8rem)] max-w-[1280px] mx-auto mt-6 overflow-hidden bg-white border border-gray-200 rounded-[8px] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-between px-6 py-4 bg-softcloud border-b border-gray-200">
        <div className="flex space-x-1 bg-gray-200/50 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-1.5 text-[14px] font-medium rounded-[6px] transition-colors ${
              activeTab === 'preview' ? 'bg-deepsea text-white shadow-sm' : 'text-dove hover:text-kaitoke'
            }`}
          >
            Xem trước
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`px-4 py-1.5 text-[14px] font-medium rounded-[6px] transition-colors ${
              activeTab === 'code' ? 'bg-deepsea text-white shadow-sm' : 'text-dove hover:text-kaitoke'
            }`}
          >
            Mã Markdown
          </button>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-6 py-2 text-[14px] font-semibold text-kaitoke bg-transparent border-[1.5px] border-kaitoke rounded-[6px] hover:bg-kaitoke/5 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-kaitoke" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Đã copy' : 'Copy'}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-6 py-2 text-[14px] font-semibold text-white bg-deepsea rounded-[6px] hover:bg-deepsea-hover transition-colors shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]"
          >
            <Download className="w-4 h-4" />
            Tải xuống .md
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-white">
        {activeTab === 'preview' ? (
          <div className="p-8 prose max-w-none prose-headings:font-semibold prose-h1:text-center prose-h1:text-[36px] prose-h2:text-[24px] prose-h2:text-kaitoke prose-h3:text-kaitoke prose-a:text-actionblue prose-blockquote:border-l-deepsea prose-blockquote:bg-softcloud prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:not-italic prose-blockquote:text-dove">
            <Markdown>{markdown}</Markdown>
          </div>
        ) : (
          <textarea
            readOnly
            value={markdown}
            className="w-full h-full p-6 font-mono text-[14px] text-dove bg-softcloud resize-none focus:outline-none"
          />
        )}
      </div>
    </div>
  );
}
