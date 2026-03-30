'use client';
import customToast from '@/components/CustomToast';
import React, { useState } from 'react';
export default function ActiveLoginComponent() {
  const [inputValue, setInputValue] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!inputValue.trim()) {
      customToast('Please enter the password.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/is-active', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: inputValue }),
      });
      const data = await res.json();

      if (res.ok) {
        customToast('You have been marked as active!', 'success');
        window.location.reload();
      } else {
        customToast(data.message || 'Incorrect password. Please try again.', 'error');
      }
    } catch {
      customToast('Something went wrong. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
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
          className="px-4 py-2 rounded-lg border-2 border-gray-600 focus:outline-none focus:border-blue-500 transition duration-300 text-white bg-gray-800"
          placeholder="Enter the password"
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Verifying...' : 'Submit'}
        </button>
      </form>
    </div>
  );
}
