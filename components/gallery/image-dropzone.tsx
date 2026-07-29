'use client';

import { useRef, useState } from 'react';
import { Camera, ImagePlus, UploadCloud } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface ImageDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  className?: string;
}

/**
 * 2 nút riêng biệt (Camera / Thư viện) thay vì 1 input chung, vì trên mobile
 * `capture="environment"` sẽ MỞ THẲNG camera thay vì bảng chọn — đúng yêu cầu
 * "chụp ảnh trực tiếp từ camera" thay vì phải qua 1 bước chọn nguồn ảnh.
 */
export function ImageDropzone({ onFilesSelected, className }: ImageDropzoneProps) {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const libraryInputRef = useRef<HTMLInputElement>(null);

  function handleFileList(fileList: FileList | null) {
    if (!fileList) return;
    const files = Array.from(fileList).filter((f) => f.type.startsWith('image/'));
    if (files.length > 0) onFilesSelected(files);
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDraggingOver(true);
      }}
      onDragLeave={() => setIsDraggingOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDraggingOver(false);
        handleFileList(e.dataTransfer.files);
      }}
      className={cn(
        'flex flex-col items-center gap-3 rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors',
        isDraggingOver ? 'border-primary bg-primary/5' : 'border-border',
        className
      )}
    >
      <UploadCloud className="h-6 w-6 text-muted-foreground" strokeWidth={1.6} />
      <p className="text-sm text-muted-foreground">Kéo thả ảnh vào đây, hoặc</p>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-sm font-medium transition-colors hover:bg-accent"
        >
          <Camera className="h-4 w-4" />
          Chụp ảnh
        </button>
        <button
          type="button"
          onClick={() => libraryInputRef.current?.click()}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-sm font-medium transition-colors hover:bg-accent"
        >
          <ImagePlus className="h-4 w-4" />
          Chọn ảnh
        </button>
      </div>

      {/* input camera: capture="environment" mở thẳng camera sau trên điện thoại */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          handleFileList(e.target.files);
          e.target.value = '';
        }}
      />
      {/* input thư viện: cho chọn nhiều ảnh cùng lúc */}
      <input
        ref={libraryInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          handleFileList(e.target.files);
          e.target.value = '';
        }}
      />
    </div>
  );
}
