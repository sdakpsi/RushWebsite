"use client"
import React, { useState } from 'react';
export default function TestInput() {
  // State to store the input value
  const [inputValue, setInputValue] = useState('');

  // Function to handle input changes
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  // Function to handle form submission
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault(); // Prevent the form from refreshing the page
    console.log(inputValue); // Log the input value or handle it as needed
    setInputValue(''); // Optional: Clear the input field after submission
  };

  return (
    <form onSubmit={handleSubmit} className="input-container">
      <input
        type="text"
        placeholder="Type here..."
        className="input-field"
        value={inputValue}
        onChange={handleInputChange}
      />
      <button type="submit">Submit</button>
    </form>
  );
}