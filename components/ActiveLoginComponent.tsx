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
    <div className="text-foreground">
      <p className="text-sm sm:text-lg">
        You are not marked as active, enter the password.
      </p>
      <form
        onSubmit={handleSubmit}
        className="mt-4 flex items-center justify-center gap-2"
      >
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          className="rounded-lg border-2 border-border bg-background px-4 py-2 text-foreground transition duration-300 placeholder:text-muted-foreground focus:border-blue-500 focus:outline-none"
          placeholder="Enter the password"
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded bg-blue-600 px-6 py-2 text-white transition duration-300 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? 'Verifying...' : 'Submit'}
        </button>
      </form>
    </div>
  );
}
