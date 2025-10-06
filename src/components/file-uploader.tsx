'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileImage, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
}

const MAX_SIZE_MB = 20;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
const ACCEPTED_FORMATS = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
};

export function FileUploader({ onFileSelect }: FileUploaderProps) {
  const { toast } = useToast();
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      if (rejectedFiles.length > 0) {
        toast({
          title: 'Upload Error',
          description: `File must be JPG, PNG, or WEBP and under ${MAX_SIZE_MB}MB.`,
          variant: 'destructive',
        });
        return;
      }

      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setPreview(URL.createObjectURL(file));
        onFileSelect(file);
      }
    },
    [onFileSelect, toast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FORMATS,
    maxSize: MAX_SIZE_BYTES,
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={`flex aspect-video w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors
      ${isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-2 text-center text-muted-foreground">
        <UploadCloud className="size-12" />
        <p className="text-lg font-semibold text-foreground">
          {isDragActive ? 'Drop the image here' : 'Drag & drop an image, or click to select'}
        </p>
        <p className="text-sm">Supports: JPG, PNG, WEBP (max 20MB)</p>
      </div>
    </div>
  );
}
