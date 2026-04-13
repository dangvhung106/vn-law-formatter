import React, { useCallback, useState } from 'react';
import { UploadCloud, FileText } from 'lucide-react';
import { cn } from '../lib/utils';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
}

export function FileUpload({ onFileSelect }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && (file.name.endsWith('.docx') || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
        onFileSelect(file);
      } else {
        alert('Vui lòng chọn file .docx');
      }
    },
    [onFileSelect]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "flex flex-col items-center justify-center w-full max-w-2xl p-12 mx-auto mt-10 border-2 border-dashed rounded-[8px] transition-colors duration-200 ease-in-out cursor-pointer shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]",
        isDragging ? "border-deepsea bg-deepsea/5" : "border-gray-300 bg-white hover:bg-gray-50"
      )}
    >
      <input
        type="file"
        accept=".docx"
        onChange={handleFileInput}
        className="hidden"
        id="file-upload"
      />
      <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full cursor-pointer">
        <div className="p-4 mb-4 bg-softcloud rounded-full shadow-sm">
          <UploadCloud className="w-10 h-10 text-deepsea" />
        </div>
        <h3 className="mb-2 text-[24px] font-semibold text-kaitoke">Tải lên văn bản pháp luật</h3>
        <p className="mb-6 text-[16px] text-dove text-center max-w-md leading-relaxed">
          Kéo thả file .docx vào đây hoặc click để chọn file. Hệ thống sẽ tự động chuyển đổi sang định dạng Markdown chuẩn.
        </p>
        <div className="flex items-center gap-2 px-4 py-2 text-[14px] font-medium text-kaitoke bg-softcloud border border-gray-200 rounded-lg">
          <FileText className="w-4 h-4" />
          <span>Chỉ hỗ trợ file .docx</span>
        </div>
      </label>
    </div>
  );
}
