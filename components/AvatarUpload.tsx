"use client";
import React, { useState } from "react";
import Dropzone from "react-dropzone";
import { createClient } from "@/utils/supabase/client";
import customToast from '@/components/CustomToast';
import LoadingSpinner from '@/components/LoadingSpinner';

interface AvatarUploadProps {
  userId: string;
  existingAvatarUrl?: string | null;
  onAvatarUploaded?: () => void;
}

export default function AvatarUpload({ userId, existingAvatarUrl, onAvatarUploaded }: AvatarUploadProps) {
  const supabase = createClient();
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(existingAvatarUrl || "");

  async function uploadAvatarToSupabase(file: File) {
    setUploading(true);
    console.log('Starting avatar upload process...', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      userId
    });

    try {
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        throw new Error("Please upload an image file (JPG, PNG, etc.)");
      }

      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("File size must be less than 5MB");
      }

      const filePath = `avatars/${userId}/${Date.now()}_${file.name}`;
      console.log('Uploading avatar to path:', filePath);

      const { data, error } = await supabase.storage
        .from("SPRING24")
        .upload(filePath, file);

      console.log('Upload result:', { data, error });

      if (error) {
        console.error('Supabase upload error:', error);
        throw new Error(error.message);
      }

      const url = supabase.storage.from("SPRING24").getPublicUrl(filePath).data.publicUrl;
      console.log('Avatar uploaded successfully to:', url);

      // Update or insert avatar in user_avatar table via API
      const response = await fetch('/api/upload-avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, avatarUrl: url })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save avatar');
      }

      console.log('Avatar URL saved to database successfully');

      setAvatarUrl(url);
      customToast("Avatar uploaded successfully!", "success");
      if (onAvatarUploaded) {
        onAvatarUploaded();
      }

      return url;
    } catch (error: any) {
      console.error("Upload error:", error);
      customToast(`Upload failed: ${error.message}`, 'error');
    } finally {
      setUploading(false);
    }
    return null;
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {avatarUrl && (
        <div className="mb-4 flex justify-center">
          <img
            src={avatarUrl}
            alt="Avatar"
            className="w-32 h-32 object-cover rounded-full border-4 border-blue-500"
          />
        </div>
      )}

      <Dropzone
        onDrop={(acceptedFiles) => {
          if (acceptedFiles[0]) {
            uploadAvatarToSupabase(acceptedFiles[0]);
          }
        }}
        accept={{
          'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
        }}
        multiple={false}
      >
        {({ getRootProps, getInputProps, isDragActive }) => (
          <section className="flex items-center justify-center">
            <div
              {...getRootProps({ className: "dropzone" })}
              className={`flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${
                isDragActive
                  ? "border-blue-500 bg-blue-900/30"
                  : "border-gray-500 bg-gray-800 hover:border-blue-500 hover:bg-gray-700"
              }`}
            >
              <input {...getInputProps()} />
              {uploading && (
                <div className="text-center">
                  <LoadingSpinner size="medium" fullScreen={false} />
                  <p className="text-lg text-gray-200">Uploading avatar...</p>
                </div>
              )}
              {!uploading && (
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="text-md text-gray-200">
                    {avatarUrl ? "Click to change avatar" : "Click or drag to upload avatar"}
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    JPG, PNG, GIF up to 5MB
                  </p>
                </div>
              )}
            </div>
          </section>
        )}
      </Dropzone>
    </div>
  );
}
