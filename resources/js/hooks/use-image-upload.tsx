// Add this file to your hooks directory
// e.g. /resources/js/hooks/use-image-upload.ts

import { useState, useRef } from "react";
import axios from "axios";

interface UseImageUploadProps {
  articleUuid: string;
  onUpload?: (imageUrl: string) => void;
  onError?: (message: string) => void;
}

export function useImageUpload({ 
  articleUuid, 
  onUpload, 
  onError 
}: UseImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target?.files?.[0];
    if (!file) return;

    // Clear previous state
    setError(null);
    setUploading(true);

    // Create local preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Create form data for upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('article_uuid', articleUuid);

    try {
      const response = await axios.post('/articles/media', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUploading(false);

      if (response.data.success && response.data.media) {
        // It's important to note we're using the full URL from the response
        // not creating our own URL
        console.log('Upload successful:', response.data.media);
        
        // Call the onUpload callback with the media URL
        onUpload?.(response.data.media.url);
      } else {
        const errorMsg = 'Upload failed: Invalid response format';
        setError(errorMsg);
        onError?.(errorMsg);
      }
    } catch (err: any) {
      setUploading(false);
      const errorMsg = err.response?.data?.error || 'Upload failed';
      setError(errorMsg);
      onError?.(errorMsg);
      console.error('Upload error:', err);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return {
    previewUrl,
    uploading,
    error,
    fileInputRef,
    handleFileChange,
    handleRemove,
  };
}