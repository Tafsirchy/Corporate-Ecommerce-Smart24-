'use client';

import React, { useRef, useState } from 'react';
import { UploadCloud, Trash2 } from 'lucide-react';
import { OptimizedImage } from './OptimizedImage';
import { toast } from 'react-toastify';
import { apiClient } from '@/context/AuthContext';

interface ImageUploadProps {
  images: string[];
  setImages: (images: string[]) => void;
  multiple?: boolean;
  disabled?: boolean;
  label?: string;
  maxFiles?: number;
}

export function ImageUpload({ images, setImages, multiple = false, disabled = false, label = "Upload Images", maxFiles = 10 }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = async (files: FileList | File[]) => {
    const validFiles = Array.from(files).filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`File ${file.name} is larger than 5MB.`);
        return false;
      }
      if (!file.type.startsWith('image/')) {
        toast.error(`File ${file.name} is not an image.`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    if (!multiple && images.length + validFiles.length > 1) {
      toast.error('Only one image allowed.');
      return;
    }

    if (images.length + validFiles.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} images allowed.`);
      return;
    }

    setIsUploading(true);
    let uploadedUrls = [];

    for (const file of validFiles) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await apiClient.post('/upload/image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res.data?.url) {
          uploadedUrls.push(res.data.url);
        }
      } catch (error: any) {
        toast.error(`Failed to upload ${file.name}: ${error.response?.data?.message || 'Unknown error'}`);
      }
    }

    if (uploadedUrls.length > 0) {
      if (multiple) {
        setImages([...images, ...uploadedUrls]);
      } else {
        setImages([uploadedUrls[0]]);
      }
      toast.success(uploadedUrls.length === 1 ? 'Image uploaded' : `${uploadedUrls.length} images uploaded`);
    }

    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled || isUploading) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium text-foreground">{label}</label>}
      
      <div 
        className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors
          ${isDragOver ? 'border-black bg-gray-50' : 'border-gray-200 bg-white hover:border-gray-300'}
          ${(disabled || isUploading) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
      >
        <UploadCloud className="h-8 w-8 text-gray-400 mb-3" />
        <p className="text-sm font-medium mb-1">
          {isUploading ? 'Uploading...' : 'Click or drag image to upload'}
        </p>
        <p className="text-xs text-gray-500">Max 5MB (JPEG, PNG, WEBP)</p>
        
        <input 
          ref={fileInputRef}
          type="file" 
          accept="image/*" 
          multiple={multiple}
          onChange={handleFileChange} 
          disabled={disabled || isUploading}
          className="hidden"
        />
      </div>

      {images.length > 0 && (
        <div className="flex flex-wrap gap-3 mt-4">
          {images.map((img, i) => (
            <div key={i} className="relative group">
              <OptimizedImage 
                src={img} 
                alt="Preview" 
                width={120} 
                height={120} 
                containerClassName="h-28 w-28 shrink-0 rounded-lg border bg-white shadow-sm" 
                className="object-contain rounded-lg p-1" 
              />
              <button
                type="button"
                onClick={async (e) => {
                  e.stopPropagation();
                  try {
                    await apiClient.delete('/upload/image', { data: { url: img } });
                  } catch (error) {
                    console.error('Failed to delete image from server', error);
                  }
                  setImages(images.filter((_, index) => index !== i));
                }}
                disabled={disabled || isUploading}
                className="absolute -top-3 -right-3 min-w-[44px] min-h-[44px] flex items-center justify-center bg-red-500 text-white rounded-full opacity-100 shadow-md hover:bg-red-600 disabled:opacity-50"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
