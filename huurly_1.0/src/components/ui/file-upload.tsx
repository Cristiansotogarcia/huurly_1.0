import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { storageService } from '@/lib/storage';
import { documentService } from '@/services/DocumentService';
import { Upload, File, X, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FileUploadProps {
  onUploadComplete?: (result: any) => void;
  onUploadError?: (error: Error) => void;
  documentType?: 'identity' | 'payslip';
  maxFiles?: number;
  maxSize?: number;
  acceptedFileTypes?: string[];
  className?: string;
  disabled?: boolean;
}

interface UploadingFile {
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
  result?: any;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onUploadComplete,
  onUploadError,
  documentType = 'identity',
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

    // Validate file count
    if (acceptedFiles.length > maxFiles) {
      toast({
        title: "Te veel bestanden",
        description: `Je kunt maximaal ${maxFiles} bestand(en) tegelijk uploaden.`,
        variant: "destructive"
      });
      return;
    }

    // Initialize uploading files
    const newUploadingFiles: UploadingFile[] = acceptedFiles.map(file => ({
      file,
      progress: 0,
      status: 'uploading'
    }));

    setUploadingFiles(newUploadingFiles);

    // Upload files one by one
    for (let i = 0; i < acceptedFiles.length; i++) {
      const file = acceptedFiles[i];
      
      try {
        // Validate file
        const validation = storageService.validateFile(file);
        if (!validation.isValid) {
          throw new Error(validation.error);
        }

        // Update progress to show validation passed
        setUploadingFiles(prev => prev.map((uf, index) => 
          index === i ? { ...uf, progress: 10 } : uf
        ));

        // Upload document
        const result = await documentService.uploadDocument(file, documentType);

        if (!result.success) {
          throw result.error || new Error('Upload mislukt');
        }

        // Update to success
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
        
        // Update to error
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

  const removeFile = (index: number) => {
    setUploadingFiles(prev => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setUploadingFiles([]);
  };

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

  return (
    <div className={cn("space-y-4", className)}>
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          isDragActive ? "border-dutch-blue bg-blue-50" : "border-gray-300 hover:border-gray-400",
          disabled && "opacity-50 cursor-not-allowed"
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

      {/* Uploading Files */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">
              Bestanden ({uploadingFiles.length})
            </h4>
            {uploadingFiles.some(f => f.status === 'success' || f.status === 'error') && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAll}
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
                  onClick={() => removeFile(index)}
                  className="h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Progress Bar */}
              {uploadingFile.status === 'uploading' && (
                <Progress value={uploadingFile.progress} className="h-2" />
              )}

              {/* Error Message */}
              {uploadingFile.status === 'error' && uploadingFile.error && (
                <p className="text-sm text-red-600 mt-2">
                  {uploadingFile.error}
                </p>
              )}

              {/* Success Message */}
              {uploadingFile.status === 'success' && (
                <p className="text-sm text-green-600 mt-2">
                  Upload voltooid
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Help Text */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• Maximaal {maxFiles} bestand(en) per keer</p>
        <p>• Maximale bestandsgrootte: {formatFileSize(maxSize)}</p>
        <p>• Toegestane formaten: {acceptedFileTypes.join(', ')}</p>
      </div>
    </div>
  );
};

export default FileUpload;
