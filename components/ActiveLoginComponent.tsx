'use client';
import { redirect } from 'next/navigation';
import React, { useState } from 'react';
export default function ActiveLoginComponent() {
  const [inputValue, setInputValue] = useState<string>('');

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent the form from actually submitting

    if (inputValue === process.env.NEXT_PUBLIC_ACTIVE_PASSWORD) {
      // Call your API function here
      console.log('Correct phrase entered. Make API call here.');
      makeApiCall(); // This is where you can later define your API call logic
    } else {
      console.log('Incorrect phrase. No API call made.');
    }
  };

  const makeApiCall = async () => {
    console.log('Making API call...');
    await fetch('/api/is-active', { method: 'POST' });
    window.location.reload(); // This will reload the page
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
