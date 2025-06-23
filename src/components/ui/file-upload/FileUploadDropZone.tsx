
import React from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { storageService } from '@/lib/storage';

interface FileUploadDropZoneProps {
  onDrop: (files: File[]) => void;
  acceptedFileTypes: string[];
  maxSize: number;
  maxFiles: number;
  disabled: boolean;
  className?: string;
}

export const FileUploadDropZone: React.FC<FileUploadDropZoneProps> = ({
  onDrop,
  acceptedFileTypes,
  maxSize,
  maxFiles,
  disabled,
  className
}) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes.reduce((acc, type) => {
      acc[`.${type}`] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxSize,
    maxFiles,
    disabled
  });

  const formatFileSize = (bytes: number) => {
    return storageService.formatFileSize(bytes);
  };

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
        isDragActive ? "border-dutch-blue bg-blue-50" : "border-gray-300 hover:border-gray-400",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <input {...getInputProps()} />
      <Upload className="w-8 h-8 mx-auto mb-4 text-gray-400" />
      
      {isDragActive ? (
        <p className="text-dutch-blue font-medium">Laat bestanden hier vallen...</p>
      ) : (
        <div>
          <p className="text-gray-600 mb-2">
            Sleep bestanden hierheen of <span className="text-dutch-blue font-medium">klik om te selecteren</span>
          </p>
          <p className="text-sm text-gray-500">
            Toegestane formaten: {acceptedFileTypes.join(', ')} (max {formatFileSize(maxSize)})
          </p>
        </div>
      )}
    </div>
  );
};
