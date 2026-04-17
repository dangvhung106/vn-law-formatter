import React, { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { MarkdownEditor } from './components/MarkdownEditor';
import { parseDocxToMarkdown } from './lib/parser';
import { Scale, Loader2, ArrowLeft } from 'lucide-react';
import { ApiKeySettings } from './components/ApiKeySettings';

export default function App() {
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = async (file: File) => {
    setIsProcessing(true);
    setFileName(file.name);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const md = await parseDocxToMarkdown(arrayBuffer);
      setMarkdown(md);
    } catch (error) {
      console.error('Error parsing file:', error);
      alert('Đã xảy ra lỗi khi xử lý file. Vui lòng thử lại.');
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setMarkdown(null);
    setFileName('');
  };

  return (
    <div className="min-h-screen bg-softcloud font-sans">
      <header className="bg-kaitoke border-b border-kaitoke shadow-sm">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-deepsea rounded-[6px]">
              <Scale className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              VN Law Formatter
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {markdown && (
              <button
                onClick={reset}
                className="flex items-center gap-2 text-sm font-medium text-white/80 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Chuyển đổi file khác
              </button>
            )}
            <ApiKeySettings />
          </div>
        </div>
      </header>

      <main className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {isProcessing ? (
          <div className="flex flex-col items-center justify-center h-64 mt-10">
            <Loader2 className="w-12 h-12 text-deepsea animate-spin mb-4" />
            <p className="text-[24px] font-semibold text-kaitoke">Đang xử lý văn bản...</p>
            <p className="text-[16px] text-dove mt-2">Quá trình này có thể mất vài giây tùy thuộc vào độ dài của văn bản.</p>
          </div>
        ) : !markdown ? (
          <div className="flex flex-col items-center">
            <div className="text-center mb-10">
              <h2 className="text-[36px] font-semibold text-kaitoke mb-4">Chuyển đổi văn bản pháp luật</h2>
              <p className="text-[16px] text-dove max-w-2xl mx-auto leading-relaxed">
                Công cụ tự động chuẩn hóa văn bản quy phạm pháp luật Việt Nam (Luật, Nghị định, Thông tư...) từ định dạng Word (.docx) sang Markdown.
              </p>
            </div>
            <FileUpload onFileSelect={handleFileSelect} />
          </div>
        ) : (
          <MarkdownEditor markdown={markdown} fileName={fileName} />
        )}
      </main>
    </div>
  );
}
