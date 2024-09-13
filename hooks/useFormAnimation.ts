import { useState, useEffect } from 'react';

export function useFormAnimation() {
  const [showingForm, setShowingForm] = useState(false);
  const [animationClass, setAnimationClass] = useState('');
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    setAnimationClass('');
    setAnimationKey((prevKey) => prevKey + 1);
    setTimeout(() => {
      setAnimationClass('fadeInUp');
    }, 0);
  }, [showingForm]);

  return { showingForm, setShowingForm, animationClass, animationKey };
}