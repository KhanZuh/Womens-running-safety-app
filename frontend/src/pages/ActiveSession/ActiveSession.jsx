import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SessionTimeoutModal } from "../../components/SessionTimeoutModal";
import { PanicButtonActivePage } from "../../components/PanicButtonActive";
import Navbar from "../../components/Navbar";

export const ActiveSession = () => {
  const [session, setSession] = useState(null); // Stores session data from API
  const [timeRemaining, setTimeRemaining] = useState(0); // Milliseconds left in timer
  const [isLoading, setIsLoading] = useState(true); // Loading state for UX
  const [error, setError] = useState(null); // Error handling
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const [isPanicActivated, setIsPanicActivated] = useState(false);

  // Navigation hooks
  const { sessionId } = useParams(); // Gets sessionId from URL: /active/:sessionId
  const navigate = useNavigate();

  // Radial progress element - need to caluclate progress percentage
  // Old calculation was incremnting the progress bar - flipped the logic so that it noew decrements e.g. countdown style
  // Shows remianing time - NEW (vs elapsed time - OLD)
  const progressPercentage = session
    ? (timeRemaining / (session.duration * 60 * 1000)) * 100 // remaining divided by total
    : 0;

  // Format milliseconds into MM:SS display
  // https://stackoverflow.com/questions/29816872/how-can-i-convert-milliseconds-to-hhmmss-format-using-javascript
  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // Implementing session data through fetch from API
  useEffect(() => {
    const fetchSession = async () => {
      try {
        setIsLoading(true);

        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/safetySessions/${sessionId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch session");
        }

        const data = await response.json();
        setSession(data.safetySession);

        // Calculate initial time remaining
        const now = new Date().getTime();
        const endTime = new Date(data.safetySession.scheduledEndTime).getTime();
        const remaining = Math.max(0, endTime - now);
        setTimeRemaining(remaining);
      } catch (error) {
        console.error("Error fetching session:", error);
        setError("Failed to load safety session. Please try again.");
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
    if (!session || isPanicActivated) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const endTime = new Date(session.scheduledEndTime).getTime();
      const remaining = Math.max(0, endTime - now);

      setTimeRemaining(remaining);

      if (remaining === 0) {
        console.log("Timer completed! Time to check safety.");
        setShowTimeoutModal(true);
        setTimeRemaining(0); // resetting the main timer state after modal appears - prevent any conflicts arising
        clearInterval(timer);
      }
    }, 1000);

    return () => {
      clearInterval(timer); // Cleanup when component unmounts
    };
  }, [session, isPanicActivated]);

  const handleEndSession = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/safetySessions/${sessionId}/checkin`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to end session");
      }

      const data = await response.json();
      console.log("Session ended successfully:", data);

      // Navigate back to dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error("Error ending session:", error);
      alert("Failed to end session. Please try again.");
    }
  };

  const handleExtendTime = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/safetySessions/${sessionId}/extend`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            additionalMinutes: 15,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to extend session");
      }

      const data = await response.json();
      setSession(data.safetySession);

      // Recalculate time remaining
      const now = new Date().getTime();
      const endTime = new Date(data.safetySession.scheduledEndTime).getTime();
      const remaining = Math.max(0, endTime - now);
      setTimeRemaining(remaining);

      console.log("Session extended successfully");
    } catch (error) {
      console.error("Error extending session:", error);
      alert("Failed to extend session. Please try again.");
    }
  };

  const handlePanicActivated = () => {
    setIsPanicActivated(true);
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
    <main>
      <Navbar
        showPanicButton={!isPanicActivated}
        sessionId={sessionId}
        onPanicActivated={handlePanicActivated}
      />
      <div className="min-h-screen bg-base-100 flex flex-col items-center justify-center p-4">
        {isPanicActivated && <div />}

        {/* Header Text */}
        <div className="text-center mb-8">
          <h1 className="text-2xl text-white font-bold mb-2">
            {isPanicActivated
              ? "We've contacted your emergency contact"
              : "You're on a run!"}
          </h1>
          <p className="text-base-content/70 text-white">
            {isPanicActivated
              ? "Help is on the way"
              : "We'll check in when time is up"}
          </p>
        </div>

        {/* Radial Progress Timer */}
        {!isPanicActivated && (
          <div className="mb-8">
            <div
              className="radial-progress text-primary text-4xl font-mono"
              style={{
                "--value": progressPercentage,
                "--size": "12rem",
                "--thickness": "8px",
              }}
              role="progressbar"
            >
              <span className="text-2xl font-bold">
                {formatTime(timeRemaining)}
              </span>
            </div>
          </div>
        )}
        {/* Action Buttons */}
        <div className="flex flex-col gap-4 w-full max-w-sm">
          {!isPanicActivated && <div className="divider"></div>}
          <button
            onClick={handleEndSession}
            className="btn btn-accent font-bold  border-4"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z"
              />
            </svg>
            I'm Safe Now - End Session
          </button>
          {!isPanicActivated && (
            <button
              onClick={handleExtendTime}
              className="btn btn-outline btn-primary"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
              Extend Time +15 mins
            </button>
          )}
        </div>
        {/* Session time out Modal */}
        <SessionTimeoutModal
          isOpen={showTimeoutModal}
          onClose={() => {
            setShowTimeoutModal(false);
            navigate("/dashboard");
          }}
          onConfirm={() => {
            handleEndSession(); // call check-in API when user confirms the are safe
            setShowTimeoutModal(false);
          }}
        />
      </div>
    </main>
  );
};
