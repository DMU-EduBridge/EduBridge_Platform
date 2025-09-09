'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, FileText, Image as ImageIcon, File } from 'lucide-react';

interface FileUploadProps {
  onUpload: (file: { url: string; filename: string; size: number; type: string }) => void; // eslint-disable-line no-unused-vars
  accept?: string;
  maxSize?: number; // MB
  className?: string;
}

export function FileUpload({ onUpload, accept, maxSize = 10, className }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{
    url: string;
    filename: string;
    size: number;
    type: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 파일 크기 체크
    if (file.size > maxSize * 1024 * 1024) {
      alert(`파일 크기는 ${maxSize}MB 이하여야 합니다.`);
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      setUploadedFile(result);
      onUpload(result);
    } catch (error) {
      console.error('Upload error:', error);
      alert('파일 업로드에 실패했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="h-4 w-4" aria-hidden="true" />;
    if (type.includes('pdf')) return <FileText className="h-4 w-4" aria-hidden="true" />;
    return <File className="h-4 w-4" aria-hidden="true" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />

      {!uploadedFile ? (
        <div
          className="cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-6 text-center transition-colors hover:border-gray-400"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="mx-auto mb-2 h-8 w-8 text-gray-400" />
          <p className="mb-1 text-sm text-gray-600">파일을 클릭하거나 드래그하여 업로드하세요</p>
          <p className="text-xs text-gray-500">
            최대 {maxSize}MB, {accept ? accept.split(',').join(', ') : '모든 파일 형식'}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getFileIcon(uploadedFile.type)}
              <div>
                <p className="text-sm font-medium text-gray-900">{uploadedFile.filename}</p>
                <p className="text-xs text-gray-500">{formatFileSize(uploadedFile.size)}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemoveFile}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {isUploading && (
        <div className="text-center">
          <div className="mx-auto mb-2 h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-sm text-gray-600">업로드 중...</p>
        </div>
      )}
    </div>
  );
}
