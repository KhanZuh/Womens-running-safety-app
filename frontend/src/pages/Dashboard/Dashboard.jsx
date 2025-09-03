import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createSafetySession } from "../../services/safetySession";
import logo from '../../assets/logo-light-grey.png';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import LocationPicker from "../../components/LocationPicker";
import { createLocationSafetySession } from "../../services/locationSafetySession";



export function Dashboard() {

    const [sessionType, setSessionType] = useState('timer'); 
    const [startCoords, setStartCoords] = useState(null);
    const [endCoords, setEndCoords] = useState(null);
    const [mapCenter, setMapCenter] = useState([51.505, -0.09]); // Setting the Default to London
    const [selectedDuration, setSelectedDuration] = useState(null); 
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
            // need to debug: console log the full response and convert the object to a string - helped to identify nested structure
            // console.log('Full response structure:', JSON.stringify(data, null, 2)); 
            console.log('Received response:', data);
        
            // BUG FIX: Backend sending the session ID as _id inside a nested safetysession object - not as sessionId (this is a convention from MongoDB)
            if (!data.safetySession._id) {
                throw new Error('Invalid response - missing sessionId');
            }

            navigate(`/active/${data.safetySession._id}`);
            
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
    
    const handleStartLocationRun = async () => {
    console.log('Starting location-based run:', { startCoords, endCoords });

    if (!startCoords || !endCoords) {
        alert("Please select both start and end points on the map.");
        return;
    }

    try {
        const userId = "64ff0e2ab123456789abcdef";
        
        const data = await createLocationSafetySession({ 
            userId, 
            startCoords,
            endCoords
        });
        
        console.log('Location session created:', data);
        
        // Navigate to location session (not regular active session which was previous)
        navigate(`/location-session/${data.safetySession._id}`);
        
    } catch (err) {
        console.error('Error starting location run:', err);
        alert(`Failed to start location run: ${err.message}`);
    }
};


return (
    <>
        <Navbar />
        <main className="flex flex-col justify-center items-center min-h-screen w-full text-center space-y-6">
            <img src={logo} alt="SafeRun logo" className="w-72 mx-auto" />
            <h2 className="font-bold">Let someone know you're running - just in case.</h2>
            
            {/* Session Type Toggle */}
            <div className="flex gap-4 mb-6">
                <button
                    onClick={() => setSessionType('timer')}
                    className={`btn btn-sm ${sessionType === 'timer' ? 'btn-accent' : 'btn-outline btn-accent'}`}
                >
                    ⏱️ Timer Based
                </button>
                <button
                    onClick={() => setSessionType('location')}
                    className={`btn btn-sm ${sessionType === 'location' ? 'btn-accent' : 'btn-outline btn-accent'}`}
                >
                    📍 Location Based
                </button>
            </div>

            <div className="divider"></div>

            {/* Conditional rendering on session type selected */}
            {sessionType === 'timer' ? (
                <>
                    <p>How long will you run?</p>
                    <div className="flex flex-wrap justify-center gap-4">
                        {durations.map((duration) => {
                            const isSelected = selectedDuration === duration;
                            return (
                                <button
                                    key={duration}
                                    onClick={() => {
                                        console.log(`Duration selected: ${duration}`);
                                        setSelectedDuration(duration);
                                    }}
                                    className={`btn btn-sm ${isSelected ? 'btn-accent' : 'btn-outline btn-accent'}`}
                                >
                                    {duration}
                                </button>
                            );
                        })}
                    </div>
                </>
            ) : (
                // Location-based UI
                <>
                    <p>Your current location will be the start point. Select your destination on the map.</p>
                    <LocationPicker 
                        startCoords={startCoords}
                        endCoords={endCoords}
                        onStartChange={setStartCoords}
                        onEndChange={setEndCoords}
                        mapCenter={mapCenter}
                        setMapCenter={setMapCenter}
                    />
                </>
            )}

            {/* Update Start Run Button */}
            <button 
                onClick={sessionType === 'timer' ? handleStartRun : handleStartLocationRun} 
                className="btn btn-accent btn-sm btn-wide font-bold border-4"
                disabled={sessionType === 'location' && (!startCoords || !endCoords)}
            >
                Start Run
            </button>

            <div className="divider"></div>

            {/* Emergency contact section */}
            <h2 className="font-bold">Emergency Contact:</h2>
            <div className="bg-primary bg-opacity-10 border border-primary p-4 rounded-lg shadow-md">
                <p>Name: Jane Doe</p>
                <p>Email: janedoe@example.com</p>
            </div>
            </main>
            <Footer />
            </>
            );
        }
