"use client";
import React, { useEffect, useState } from "react";
import Dropzone from "react-dropzone";
import { createClient } from "@/utils/supabase/client";
import customToast from '@/components/CustomToast';

interface PhotoUploadProps {
  onPhotoUploaded: (url: string) => void;
  existingPhotoUrl?: string;
}

export default function PhotoUpload({ onPhotoUploaded, existingPhotoUrl }: PhotoUploadProps) {
  const supabase = createClient();
  const [userId, setUserId] = useState("");
  const [uploading, setUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(existingPhotoUrl || "");

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUserId(user.id);
      }
    };

    fetchUser();
  }, []);

  async function uploadPhotoToSupabase(file: File) {
    setUploading(true);
    console.log('Starting photo upload process...', { 
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

      const filePath = `photos/${userId}/${Date.now()}_${file.name}`;
      console.log('Uploading photo to path:', filePath);
      
      const { data, error } = await supabase.storage
        .from("SPRING24")
        .upload(filePath, file);

      console.log('Upload result:', { data, error });

      if (error) {
        console.error('Supabase upload error:', error);
        throw new Error(error.message);
      }

      const url = supabase.storage.from("SPRING24").getPublicUrl(filePath).data.publicUrl;
      console.log('Photo uploaded successfully to:', url);
      
      // Update user's photo_url in the database
      const { error: updateError } = await supabase
        .from('users')
        .update({ photo_url: url })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating user photo_url:', updateError);
        throw new Error('Failed to save photo URL to database');
      }
      
      console.log('Photo URL saved to database successfully');
      
      setPhotoUrl(url);
      onPhotoUploaded(url);

      
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
      {(photoUrl || existingPhotoUrl) && (
        <div className="mb-4 flex justify-center">
          <img 
            src={photoUrl || existingPhotoUrl} 
            alt="Your photo" 
            className="w-32 h-32 object-cover rounded-full border-4 border-blue-500"
          />
        </div>
      )}

      <Dropzone
        onDrop={(acceptedFiles) => {
          if (acceptedFiles[0]) {
            uploadPhotoToSupabase(acceptedFiles[0]);
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
                  ? "border-blue-500 bg-blue-50" 
                  : "border-gray-400 bg-gray-100 hover:border-gray-500"
              }`}
            >
              <input {...getInputProps()} />
              {uploading && (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                  <p className="text-lg text-gray-700">Uploading photo...</p>
                </div>
              )}
              {!uploading && (
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="text-md text-gray-700">
                    {(photoUrl || existingPhotoUrl) ? "Click to change your photo" : "Click or drag to upload your photo"}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
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