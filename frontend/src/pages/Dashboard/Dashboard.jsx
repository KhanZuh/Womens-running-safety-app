import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createSafetySession } from "../../services/safetySession";


export function Dashboard() {
    const [selectedDuration, setSelectedDuration] = useState(null); // Using state to manage selected duration
    const navigate = useNavigate();

    function durationToMinutes(duration) { // Convert duration string to minutes
        if (!duration) return null;

        if (duration.includes("hour")) { // checks if duration is in hours
            const hours = parseInt(duration); // extract the number 
            return isNaN(hours) ? null : hours * 60; // checks whether the value is a number - if it is, multiply by 60 to convert to minutes, in NaN, return null
        } else if (duration.includes("minute")) { //checks if duration is in minutes ... same as above 
            const minutes = parseInt(duration);
            return isNaN(minutes) ? null : minutes;
        }
        return null;
    }

    const handleStartRun = async () => {
        const numericDuration = durationToMinutes(selectedDuration); // Convert selected duration to numeric minutes

        if (selectedDuration) {
            console.log(`Run started for ${numericDuration} minutes!`);
        } else {
            alert("Please select a duration before starting the run.");
            return;
        }

        try {
        const userId = "64ff0e2ab123456789abcdef";

        const data = await createSafetySession({ userId, duration: numericDuration });
        const { sessionId } = data;

        console.log("Safety session started:", sessionId);
        navigate("/active", { state: { sessionId, duration: numericDuration } });
        console.log("Run started, sessionId:", sessionId);
    } catch (err) {
        console.error("Failed to start safety session:", err);
    }
    };

    const durations = ['30 minutes', '1 hour', '2 hours'];

    return (
        <>
            <h1>Dashboard</h1>
            <p>Let someone know you're running - Just in case.</p>
            <p>Enter your estimated run and we'll handle the rest.</p>
            <p>How long will you run?</p>

            <div>
                {durations.map((duration) => (
                    <button
                        key={duration}
                        onClick={() => {
                            console.log(`Duration selected: ${duration}`);
                            setSelectedDuration(duration);
                        }}
                    >
                        {duration}
                    </button>
                ))}
            </div>

            <h3>Emergency Contact:</h3>
            <p>Name: Jane Doe</p>
            <p>Email: janedoe@example.com</p>

            <button onClick={handleStartRun}>Start Run</button>
        </>
    );
}