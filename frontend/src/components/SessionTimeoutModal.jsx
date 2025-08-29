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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full text-center">
            {!isConfirmedSafe ? (
            <>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
            {isTimeUp ? "Time's up!" : "Your time is up!"}
            </h2>

            <p className="text-gray-700 mb-2">
            {isTimeUp
                ? "We’re contacting your emergency contact..."
                : "Are you safe?"}
            </p>

            <p className="text-gray-700 mb-4">
            {isTimeUp
                ? "If you're okay, click the button below to stop the alert."
                : "Please confirm within 5 minutes or we'll notify your emergency contact."}
            </p>

            <p className="text-xl font-mono text-red-600 mb-4">
            {formatTime(timeLeft)}
            </p>

            <button
                onClick={handleConfirmSafe}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
                I'm Safe
            </button>
            </>
        ) : (
            <>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Glad you're safe!
            </h2>
            <p className="text-gray-700 mb-6">See you next time 👋</p>

            <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
            >
                Close
            </button>
            </>
        )}
        </div>
    </div>
    );
}
