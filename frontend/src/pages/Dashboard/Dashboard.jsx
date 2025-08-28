import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createSafetySession } from "../../services/safetySession";
// //Testing the Modal: Delete after before pushing
// import { SessionTimeoutModal } from "../../components/SessionTimeoutModal";    
// //End 
export function Dashboard() {
//     //Testing the Modal: Delete after before pushing
//     const [modalOpen, setModalOpen] = useState(false);
// //End 
    const [selectedDuration, setSelectedDuration] = useState(null); // Using state to manage selected duration
    const navigate = useNavigate();


//     //Testing the Modal: Delete after before pushing
//     useEffect(() => {
//         const timer = setTimeout(() => {
//             setModalOpen(true);
//         }, 5000); // 5s for testing

//         return () => clearTimeout(timer);
//     }, []);
// // End 



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
        const numericDuration = durationToMinutes(selectedDuration);
        
        console.log('Starting run with duration:', numericDuration);

        if (!selectedDuration) {
            alert("Please select a duration before starting the run.");
            return;
        }

        try {
            const userId = "64ff0e2ab123456789abcdef";
            console.log('Calling createSafetySession with:', { userId, duration: numericDuration });

            const data = await createSafetySession({ 
                userId, 
                duration: numericDuration 
            });

            console.log('Received response:', data);
            
            if (!data || !data.sessionId) {
                throw new Error('Invalid response - missing sessionId');
            }

            navigate("/active", { 
                state: { 
                    sessionId: data.sessionId, 
                    duration: numericDuration 
                } 
            });
            
        } catch (err) {
            console.error('Error details:', {
                status: err.response?.status,
                data: err.response?.data,
                message: err.message
            });
            
            alert(`Failed to start run: ${err.message}`);
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


{/* Testing the Modal: Delete after before pushing */}
            <SessionTimeoutModal
    isOpen={modalOpen}
    onClose={() => setModalOpen(false)}
    onConfirm={() => {
        console.log("User confirmed they’re safe");
        setModalOpen(false);
    }}
    //End
/>
        </>
    );
}