import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { RootState } from '../types'; // Adjust this import path if needed

export const ErrorAnnouncer = () => {
  // Listen to the error state in Redux
  const error = useSelector((state: RootState) => state.game.error);

  useEffect(() => {
    // Every time 'error' changes, if it is not null, trigger the alarm!
    if (error) {
      console.warn("Camera dispatched error:", error);
      
      // 1. Play the sound
      const audio = new Audio('/error.mp3');
      audio.volume = 1.0;
      audio.play().catch(e => console.error("Audio blocked by browser:", e));
      
      // 2. Show the sleek Toast notification
      toast.error(`Illegal Move: ${error}`, {
        duration: 4000,
        style: { background: '#333', color: '#fff' }
      });
    }
  }, [error]); // This tells React to run this effect only when 'error' changes

  // This component doesn't render any visible HTML
  return null; 
};