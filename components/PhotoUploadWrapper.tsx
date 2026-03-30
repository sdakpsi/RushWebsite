"use client";
import React, { useState } from 'react';
import PhotoUpload from '@/components/PhotoUpload';
import { useQueryClient } from '@tanstack/react-query';
import customToast from '@/components/CustomToast';

interface PhotoUploadWrapperProps {
  existingPhotoUrl?: string | null;
}

export default function PhotoUploadWrapper({ existingPhotoUrl }: PhotoUploadWrapperProps) {
  const [photoUploaded, setPhotoUploaded] = useState(!!existingPhotoUrl);
  const queryClient = useQueryClient();

  const handlePhotoUploaded = (url: string) => {
    setPhotoUploaded(true);
    customToast('Photo uploaded! You can now access the application.', 'success');
    
    // Wait a moment to ensure the upload is fully processed, then invalidate the cache
    setTimeout(() => {
      console.log('Invalidating React Query cache after photo upload');
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    }, 1000);
  };

  return (
    <div>
      <PhotoUpload 
        onPhotoUploaded={handlePhotoUploaded}
        existingPhotoUrl={existingPhotoUrl || undefined}
      />
      {photoUploaded && !existingPhotoUrl &&(
        <div className="mt-4 text-center">
          <p className="text-green-600 font-medium">
            ✓ Photo uploaded successfully!
          </p>
          <p className="text-sm text-gray-400 mt-1">
            The application button will appear shortly...
          </p>
        </div>
      )}
    </div>
  );
}