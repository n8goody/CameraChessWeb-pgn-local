import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { RootState } from '../types';
import { gameSetError } from '../slices/gameSlice';

export const ErrorAnnouncer = () => {
  // Pull the current error state from Redux
  const error = useSelector((state: RootState) => state.game.error);
  
  // Initialize the dispatch hook to talk back to Redux
  const dispatch = useDispatch();
  
  // Reference the hidden audio element
  const audioPlayerRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // Only run if there is an actual error message
    if (error) {
      console.warn("Camera dispatched error:", error);

      // Play the audio
      if (audioPlayerRef.current) {
        audioPlayerRef.current.currentTime = 0;
        audioPlayerRef.current.volume = 1.0;
        audioPlayerRef.current.play().catch(e => 
          console.error("Audio blocked by browser policy:", e)
        );
      }

      // Show the modern toast notification
      toast.error(`Illegal Move: ${error}`, {
        duration: 4000,
        style: { 
          background: '#333', 
          color: '#fff',
          borderRadius: '10px',
          padding: '16px'
        }
      });

      // Clear the error in Redux immediately so the state is 
      // ready to catch the next illegal move
      dispatch(gameSetError(null));
    }
  }, [error, dispatch]);

  return (
    // Invisible audio player; ensure error.mp3 is in your public/ folder
    <audio ref={audioPlayerRef} src="/error.mp3" preload="auto" />
  );
};