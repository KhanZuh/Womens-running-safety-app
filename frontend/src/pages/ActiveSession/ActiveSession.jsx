import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export const ActiveSession = () => {

  const [session, setSession] = useState(null);           // Stores session data from API
  const [timeRemaining, setTimeRemaining] = useState(0);  // Milliseconds left in timer
  const [isLoading, setIsLoading] = useState(true);       // Loading state for UX
  const [error, setError] = useState(null);               // Error handling
  
  // Navigation hooks 
  const { sessionId } = useParams();  // Gets sessionId from URL: /active/:sessionId
  const navigate = useNavigate();      
  
  // Radial progress element - need to caluclate progress percentage
  const progressPercentage = session 
    ? ((session.duration * 60 * 1000 - timeRemaining) / (session.duration * 60 * 1000)) * 100 
    : 0;
  
  // Format milliseconds into MM:SS display
  // https://stackoverflow.com/questions/29816872/how-can-i-convert-milliseconds-to-hhmmss-format-using-javascript
  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Implementing session data through fetch from API  
  useEffect(() => {
    const fetchSession = async () => {
      try {
        setIsLoading(true);

        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/safetySessions/${sessionId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch session');
        }
        
        const data = await response.json();
        setSession(data.safetySession);
        
        // Calculate initial time remaining
        const now = new Date().getTime();
        const endTime = new Date(data.safetySession.scheduledEndTime).getTime();
        const remaining = Math.max(0, endTime - now);
        setTimeRemaining(remaining);
        
      } catch (error) {
        console.error('Error fetching session:', error);
        setError('Failed to load safety session. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (sessionId) {
      fetchSession();
    }
  }, [sessionId]);

  // TIMER LOGIC 
  useEffect(() => {
    if (!session) return; // e.g. Don't start timer until there is session data available

    // Set up interval to update every second
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const endTime = new Date(session.scheduledEndTime).getTime();
      const remaining = Math.max(0, endTime - now);
      
      setTimeRemaining(remaining);
      
      // Handle timer completion - for now just showing an alert - in future, this is where the modal showing the safety check in logic would be implemented.
      if (remaining === 0) {
        console.log('Timer completed! Time to check safety.');
        alert('Your run time is up! Please confirm you are safe.');
      }
    }, 1000); // Update every 1000ms (1 second)

    
    return () => {
      clearInterval(timer);  // Cleanup when component unmounts
    };
  }, [session]); // Re-run when session changes


  const handleEndSession = async () => {
    try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/safetySessions/${sessionId}/checkin`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to end session');
      }

      const data = await response.json();
      console.log('Session ended successfully:', data);
      
      // Navigate back to dashboard 
      navigate('/dashboard');
      
    } catch (error) {
      console.error('Error ending session:', error);
      alert('Failed to end session. Please try again.');
    }
  };


  const handleExtendTime = async () => {
    try {
      // For now, we'll implement this as updating the session manually - endpoint added to backend
          const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/safetySessions/${sessionId}/extend`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          additionalMinutes: 15
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to extend session');
      }

      const data = await response.json();
      setSession(data.safetySession);
      
      // Recalculate time remaining
      const now = new Date().getTime();
      const endTime = new Date(data.safetySession.scheduledEndTime).getTime();
      const remaining = Math.max(0, endTime - now);
      setTimeRemaining(remaining);
      
      console.log('Session extended successfully');
      
    } catch (error) {
      console.error('Error extending session:', error);
      alert('Failed to extend session. Please try again.');
    }
  };


  // Render the loading state, error state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      </div>
    );
  }
  
  // Render the UI

  return (
    <div className="min-h-screen bg-base-100 flex flex-col items-center justify-center p-4">
      {/* Header Text */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">
          🏃‍♀️ You're on a run!
        </h1>
        <p className="text-base-content/70">
          We'll check in when time is up
        </p>
      </div>

      {/* Radial Progress Timer */}
      <div className="mb-8">
        <div 
          className="radial-progress text-primary text-4xl font-mono" 
          style={{ 
            "--value": progressPercentage, 
            "--size": "12rem", 
            "--thickness": "8px" 
          }}
          role="progressbar"
        >
          <span className="text-2xl font-bold">
            {formatTime(timeRemaining)}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-4 w-full max-w-sm">
        <button 
          onClick={handleEndSession}
          className="btn btn-success btn-lg"
        >
          👌 I'm Safe Now - End Session
        </button>
        
        <button 
          onClick={handleExtendTime}
          className="btn btn-outline btn-secondary"
        >
          ⏰ Extend Time +15 mins
        </button>
      </div>
    </div>
  );
};
