"use client"
import React, { useEffect, useState } from 'react';
import Dropzone from 'react-dropzone';
import {createClient} from '@/utils/supabase/client';
import {toast} from 'react-toastify';
import { ApplicationFileTypes } from '@/lib/types';


interface FileDropzoneProps {
    type: ApplicationFileTypes;
    setFileUrl: (url: string) => void;
}

export default function FileDropzone({ setFileUrl, type }: FileDropzoneProps) {

    const supabase = createClient();

    const [userId, setUserId] = useState("");
    const [uploading, setUploading] = useState(false);
    const [fileName, setFileName] = useState("");


    useEffect(() => {
        const fetchUser = async () => {
          const {
            data: { user },
          } = await supabase.auth.getUser();
         
          setUserId(user!.id);
        };
    
        fetchUser();
    }, []);

    async function uploadFileToSupabase(file: File) {
        setUploading(true);
        try {
          if (
            file.type === 'application/pdf' ||
            file.type ===
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          ) {
            const filePath = `${userId}/${Date.now()}_${file.name}`;
            const { data, error } = await supabase.storage
              .from('SPRING24')
              .upload(filePath, file);

            if (error) throw new Error(error.message);

            const url = `${
              supabase.storage.from('SPRING24').getPublicUrl(filePath).data
                .publicUrl
            }`;
            console.log('File uploaded successfully:', url);
            setFileName(file.name);
            setFileUrl(url);
            return url;
          } else {
            throw new Error(
              'Invalid file type. Only PDF and .docx files are allowed.'
            );
          }
        } catch (error: any) {
          console.error('Upload error:', error.message);
          toast.error(`Upload failed: ${error.message}`);
        } finally {
          setUploading(false);
        }
        return null;
    }

    return (
      <Dropzone onDrop={acceptedFiles => uploadFileToSupabase(acceptedFiles[0])}>
          {({ getRootProps, getInputProps }) => (
              <section className="flex justify-center items-center p-6">
                  <div {...getRootProps({ className: 'dropzone' })} className="flex flex-col justify-center items-center border-2 border-dashed border-gray-400 rounded-lg bg-gray-100 p-6 w-full max-w-xl cursor-pointer hover:border-gray-500">
                      <input {...getInputProps()} />
                      {uploading && <p className="text-gray-700 text-lg">Uploading...</p>}
                      {!uploading && fileName && <p className="text-green-500 text-lg">Uploaded: {fileName}</p>}
                      {!uploading && !fileName && <p className="text-gray-700 text-lg">{type === ApplicationFileTypes.COVER_LETTER ? "Optional: " : ""}Select or drag your {type} into here!</p>}
                  </div>
              </section>
          )}
      </Dropzone>
  );
}