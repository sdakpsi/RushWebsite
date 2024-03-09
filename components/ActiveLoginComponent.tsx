'use client';
import { toast } from 'react-toastify';
import React, { useState } from 'react';
export default function ActiveLoginComponent() {
  const [inputValue, setInputValue] = useState<string>('');

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); 

    if (inputValue === process.env.NEXT_PUBLIC_ACTIVE_PASSWORD) {
      markAsActive(); 
    } else {
      toast.error('Incorrect password. Please try again.');
    }
  };

  const markAsActive = async () => {
    await fetch('/api/is-active', { method: 'POST' });
    toast.success('You have been marked as active!');
    window.location.reload(); 
  };

  return (
    <div>
      <p className="text-sm sm:text-lg">You are not marked as active, enter the password.</p>
      <form
        onSubmit={handleSubmit}
        className="flex mt-4 justify-center items-center gap-2"
      >
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          className="px-4 py-2 rounded-lg border-2 border-gray-300 focus:outline-none focus:border-blue-500 transition duration-300 text-black"
          placeholder="Enter the password"
        />

        <button
          type="submit"
          className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition duration-300"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
