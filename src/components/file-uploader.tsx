
'use client';

import { useState, useCallback, type ReactNode } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import imageCompression from 'browser-image-compression';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  tips?: ReactNode;
}

const MAX_SIZE_MB = 20;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
const COMPRESSION_MAX_SIZE_MB = 1.5;

const ACCEPTED_FORMATS = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
};

export function FileUploader({ onFileSelect, tips }: FileUploaderProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[], rejectedFiles: any[]) => {
      if (rejectedFiles.length > 0) {
        toast({
          title: 'Upload Error',
          description: `File must be JPG, PNG, or WEBP and under ${MAX_SIZE_MB}MB.`,
          variant: 'destructive',
        });
        return;
      }

      if (acceptedFiles.length > 0) {
        setIsUploading(true);
        let file = acceptedFiles[0];

        try {
            console.log(`Original file size: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
            
            const options = {
                maxSizeMB: COMPRESSION_MAX_SIZE_MB,
                maxWidthOrHeight: 1024,
                useWebWorker: true,
            };

            const compressedFile = await imageCompression(file, options);
            console.log(`Compressed file size: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);

            file = new File([compressedFile], file.name, { type: compressedFile.type });

        } catch (error) {
            console.error('Image compression failed:', error);
            toast({
                title: 'Compression Error',
                description: 'Could not compress the image. Please try a smaller file.',
                variant: 'destructive',
            });
        }

        onFileSelect(file);
        // setIsUploading(false) will be handled by the parent component logic
      }
    },
    [onFileSelect, toast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FORMATS,
    maxSize: MAX_SIZE_BYTES,
    multiple: false,
    disabled: isUploading,
  });

  return (
    <div
      {...getRootProps()}
      className={`flex h-full w-full p-4 flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors
      ${isUploading ? 'cursor-default' : 'cursor-pointer'}
      ${isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-2 text-center text-muted-foreground">
        {isUploading ? (
            <>
                <Loader2 className="size-12 animate-spin text-primary" />
                <p className="text-lg font-semibold text-foreground">Preparing your image...</p>
                <p className="text-sm">Compressing and getting things ready.</p>
            </>
        ) : (
            <>
                <UploadCloud className="size-12" />
                <p className="text-lg font-semibold text-foreground">
                    {isDragActive ? 'Drop the image here' : 'Drag & drop an image, or click to select'}
                </p>
                <p className="text-sm">Supports: JPG, PNG, WEBP (max ${MAX_SIZE_MB}MB). Will be compressed to ~${COMPRESSION_MAX_SIZE_MB}MB.</p>
                {tips && <div className="mt-4">{tips}</div>}
            </>
        )}
      </div>
    </div>
  );
}
