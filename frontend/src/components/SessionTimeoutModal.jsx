import { useState, useEffect } from "react";

export function SessionTimeoutModal({ isOpen, onClose, onConfirm }) {
    //tracks how much time is left on the countdown (starts at 10 for testing)
    const [timeLeft, setTimeLeft] = useState(10); // 10 seconds for testing
    //this becomes true when the timer hits 0 
    //changes the message shown to the user ("Times up")
    const [isTimeUp, setIsTimeUp] = useState(false);
    //Set to true when the user clicks "I'm Safe" button
    //When true, the modal shows friendly confirmation message instead of timer and warning 
    const [isConfirmedSafe, setIsConfirmedSafe] = useState(false);


    //When the modal opens (isOpen === true), this:
        //Resets timer to 10 seconds
        //Resets both flags (isTimeUp, isConfirmedSafe)
        //Starts a countdown interval that decreases timeLeft every second
        //When timeLeft hits 0, it:
        //Stops the timer
        //Sets isTimeUp = true so the message changes
    useEffect(() => {
        if (!isOpen) return;

        // Reset when modal opens
        setTimeLeft(10); // use 300 for 5 mins in production
        setIsTimeUp(false);
        setIsConfirmedSafe(false);

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setIsTimeUp(true);
                    return 0;
                }
                return prev - 1;
            });
    }, 1000);

    return () => clearInterval(timer);
    }, [isOpen]);

    if (!isOpen) return null; // Don't render anything if modal is not open

    
    //Converts raw seconds to a MM:SS format like "00:08" or "05:00"
    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, "0");
        const s = (seconds % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    };
    //Called when user clicks "I'm Safe"
    //Simply sets the flag to show a different message
    const handleConfirmSafe = () => {
        setIsConfirmedSafe(true);

        if (onConfirm) { // this prop is needed so the parent component (activesession) knows the user confirmed they were safe (otherwise the safety session wouldn't actually end)
            onConfirm();
        }

    };

// 1. Initial Countdown Modal 
// Rendered when: 
// - isConfirmedSafe === false 
// - isTimeUp === false

// 2. Times Up Warning 
// Rendered when: 
// - isConfirmedSafe = false
// - isTimeUp === true

// 3. Glad You're Safe 
// Rendered when: 
// - isConfirmedSafe === true
// (doesn't matter if time is up or not)



return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
    <div className="modal-box border-4 border-accent">
        {!isConfirmedSafe ? (
        <>
            <h2 className="text-3xl font-semibold mb-4 text-white">
            {isTimeUp ? "Time's up!" : "Your time is up!"}
            </h2>

            <p className="text-white mb-2">
            {isTimeUp
                ? "We’re contacting your emergency contact..."
                : "Are you safe?"}
            </p>

            <p className="text-white mb-4">
            {isTimeUp
                ? "If you're okay, click the button below to stop the alert."
                : "Please confirm within 5 minutes or we'll notify your emergency contact."}
            </p>

            <p className="text-xl font-mono text-error mb-4">
            {formatTime(timeLeft)}
            </p>

            <button
            onClick={handleConfirmSafe}
            className="btn btn-accent text-xl btn-wide font-bold"
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
            I'm Safe
            </button>
        </>
        ) : (
        <>
            <h2 className="text-xl font-semibold mb-4 text-accent">
            Glad you're safe!
            </h2>
            <p className="text-gray-700 mb-6">See you next time 👋</p>

            <button
            onClick={onClose}
            className="btn btn-outline btn-accent"
            >
            Close
            </button>
        </>
        )}
    </div>
    </div>
);
}
