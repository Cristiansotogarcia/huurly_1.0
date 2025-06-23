
import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, File, X, Check, AlertCircle } from 'lucide-react';
import { storageService } from '@/lib/storage';

export interface UploadingFile {
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
  result?: any;
}

interface FileUploadProgressProps {
  uploadingFiles: UploadingFile[];
  onRemoveFile: (index: number) => void;
  onClearAll: () => void;
}

export const FileUploadProgress: React.FC<FileUploadProgressProps> = ({
  uploadingFiles,
  onRemoveFile,
  onClearAll
}) => {
  const formatFileSize = (bytes: number) => {
    return storageService.formatFileSize(bytes);
  };

  const getStatusIcon = (status: UploadingFile['status']) => {
    switch (status) {
      case 'uploading':
        return <Upload className="w-4 h-4 animate-pulse text-blue-500" />;
      case 'success':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  if (uploadingFiles.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900">
          Bestanden ({uploadingFiles.length})
        </h4>
        {uploadingFiles.some(f => f.status === 'success' || f.status === 'error') && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearAll}
            className="text-xs"
          >
            Wissen
          </Button>
        )}
      </div>

      {uploadingFiles.map((uploadingFile, index) => (
        <div
          key={index}
          className="border rounded-lg p-4 bg-white"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              {getStatusIcon(uploadingFile.status)}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {uploadingFile.file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(uploadingFile.file.size)}
                </p>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemoveFile(index)}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {uploadingFile.status === 'uploading' && (
            <Progress value={uploadingFile.progress} className="h-2" />
          )}

          {uploadingFile.status === 'error' && uploadingFile.error && (
            <p className="text-sm text-red-600 mt-2">
              {uploadingFile.error}
            </p>
          )}

          {uploadingFile.status === 'success' && (
            <p className="text-sm text-green-600 mt-2">
              Upload voltooid
            </p>
          )}
        </div>
      ))}
    </div>
  );
};
