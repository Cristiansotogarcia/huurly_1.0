
import React, { useCallback, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { storageService } from '@/lib/storage';
import { documentService, DocumentType } from '@/services/DocumentService';
import { cn } from '@/lib/utils';
import { FileUploadDropZone } from './file-upload/FileUploadDropZone';
import { FileUploadProgress, UploadingFile } from './file-upload/FileUploadProgress';
import { FileUploadHelp } from './file-upload/FileUploadHelp';

export interface FileUploadProps {
  onUploadComplete?: (result: any) => void;
  onUploadError?: (error: Error) => void;
  documentType?: DocumentType;
  maxFiles?: number;
  maxSize?: number;
  acceptedFileTypes?: string[];
  className?: string;
  disabled?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onUploadComplete,
  onUploadError,
  documentType = 'identiteitsbewijs',
  maxFiles = 1,
  maxSize = 10 * 1024 * 1024, // 10MB
  acceptedFileTypes = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'],
  className,
  disabled = false,
}) => {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (disabled) return;

    if (acceptedFiles.length > maxFiles) {
      toast({
        title: "Te veel bestanden",
        description: `Je kunt maximaal ${maxFiles} bestand(en) tegelijk uploaden.`,
        variant: "destructive"
      });
      return;
    }

    const newUploadingFiles: UploadingFile[] = acceptedFiles.map(file => ({
      file,
      progress: 0,
      status: 'uploading'
    }));

    setUploadingFiles(newUploadingFiles);

    for (let i = 0; i < acceptedFiles.length; i++) {
      const file = acceptedFiles[i];
      
      try {
        const validation = storageService.validateFile(file);
        if (!validation.isValid) {
          throw new Error(validation.error);
        }

        setUploadingFiles(prev => prev.map((uf, index) => 
          index === i ? { ...uf, progress: 10 } : uf
        ));

        const result = await documentService.uploadDocument(file, documentType);

        if (!result.success) {
          throw result.error || new Error('Upload mislukt');
        }

        setUploadingFiles(prev => prev.map((uf, index) => 
          index === i ? { 
            ...uf, 
            progress: 100, 
            status: 'success',
            result: result.data
          } : uf
        ));

        toast({
          title: "Upload succesvol",
          description: `${file.name} is succesvol geüpload.`
        });

        if (onUploadComplete) {
          onUploadComplete(result.data);
        }

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Upload mislukt';
        
        setUploadingFiles(prev => prev.map((uf, index) => 
          index === i ? { 
            ...uf, 
            status: 'error',
            error: errorMessage
          } : uf
        ));

        toast({
          title: "Upload mislukt",
          description: `${file.name}: ${errorMessage}`,
          variant: "destructive"
        });

        if (onUploadError) {
          onUploadError(error instanceof Error ? error : new Error(errorMessage));
        }
      }
    }
  }, [documentType, maxFiles, disabled, toast, onUploadComplete, onUploadError]);

  const removeFile = (index: number) => {
    setUploadingFiles(prev => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setUploadingFiles([]);
  };

  return (
    <div className={cn("space-y-4", className)}>
      <FileUploadDropZone
        onDrop={onDrop}
        acceptedFileTypes={acceptedFileTypes}
        maxSize={maxSize}
        maxFiles={maxFiles}
        disabled={disabled}
      />

      <FileUploadProgress
        uploadingFiles={uploadingFiles}
        onRemoveFile={removeFile}
        onClearAll={clearAll}
      />

      <FileUploadHelp
        maxFiles={maxFiles}
        maxSize={maxSize}
        acceptedFileTypes={acceptedFileTypes}
      />
    </div>
  );
};

export default FileUpload;
