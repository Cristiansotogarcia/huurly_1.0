
import React from 'react';
import { storageService } from '@/lib/storage';

interface FileUploadHelpProps {
  maxFiles: number;
  maxSize: number;
  acceptedFileTypes: string[];
}

export const FileUploadHelp: React.FC<FileUploadHelpProps> = ({
  maxFiles,
  maxSize,
  acceptedFileTypes
}) => {
  const formatFileSize = (bytes: number) => {
    return storageService.formatFileSize(bytes);
  };

  return (
    <div className="text-xs text-gray-500 space-y-1">
      <p>• Maximaal {maxFiles} bestand(en) per keer</p>
      <p>• Maximale bestandsgrootte: {formatFileSize(maxSize)}</p>
      <p>• Toegestane formaten: {acceptedFileTypes.join(', ')}</p>
    </div>
  );
};
