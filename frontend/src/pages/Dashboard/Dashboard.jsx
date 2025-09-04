import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createSafetySession } from "../../services/safetySession";
import { createLocationSafetySession } from "../../services/locationSafetySession";
import logo from "../../assets/logo-light-grey.png";
import Tagline from "../../assets/Tagline-2.svg";
import Navbar from "../../components/Navbar";
import Quote from '../../components/Quote';
import LocationPicker from "../../components/LocationPicker";

export function Dashboard() {

    const [sessionType, setSessionType] = useState('timer'); 
    const [startCoords, setStartCoords] = useState(null);
    const [endCoords, setEndCoords] = useState(null);
    const [mapCenter, setMapCenter] = useState([51.505, -0.09]); // Default to London
    const [selectedDuration, setSelectedDuration] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();


    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userId = localStorage.getItem("userId");
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/${userId}`);
                const data = await response.json();
                setUser(data);
                console.log("Fetched user from backend:", data);
            } catch (error) {
                console.error("Failed to load user:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    function durationToMinutes(duration) {
        // Convert duration string to minutes
        if (!duration) return null;

        if (duration.includes("hour")) {
            // checks if duration is in hours
            const hours = parseInt(duration); // extract the number
            return isNaN(hours) ? null : hours * 60; // checks whether the value is a number - if it is, multiply by 60 to convert to minutes, in NaN, return null
        } else if (duration.includes("minute")) {
            //checks if duration is in minutes ... same as above
            const minutes = parseInt(duration);
            return isNaN(minutes) ? null : minutes;
        }
        return null;
    }

    const handleStartRun = async () => {
        const numericDuration = durationToMinutes(selectedDuration);

        if (!selectedDuration) {
            alert("Please select a duration before starting the run.");
            return;
        }

        try {

            const userId = localStorage.getItem("userId");
            console.log("Calling createSafetySession with:", {
                userId,
                duration: numericDuration,
            });

            const data = await createSafetySession({
                userId,
                duration: numericDuration,
            });
            console.log("Received response:", data);

            // BUG FIX: Backend sending the session ID as _id inside a nested safetysession object - not as sessionId (this is a convention from MongoDB)
            if (!data.safetySession._id) {
                throw new Error("Invalid response - missing sessionId");
            }

            navigate(`/active/${data.safetySession._id}`);
        } catch (err) {
            console.error("Error details:", {
                status: err.response?.status,
                data: err.response?.data,
                message: err.message,
            });

            alert(`Failed to start run: ${err.message}`);
        }
    };


    const handleStartLocationRun = async () => {
        console.log('Starting location-based run:', { startCoords, endCoords });

        if (!startCoords || !endCoords) {
            alert("Please select both start and end points on the map.");
            return;
        }

        try {
            const userId = localStorage.getItem("userId");
            
            const data = await createLocationSafetySession({ 
                userId, 
                startCoords,
                endCoords
            });
            
            console.log('Location session created:', data);
            
            // Navigate to location session (not regular active session)
            navigate(`/location-session/${data.safetySession._id}`);
            
        } catch (err) {
            console.error('Error starting location run:', err);
            alert(`Failed to start location run: ${err.message}`);
        }
    };
    
  const durations = ["2 minutes", "1 hour", "2 hours"];

  return (
    <>
      <Navbar />
      <main className="flex flex-col justify-center items-center min-h-screen w-full text-center space-y-6 pt-20 pb-20">
        <img src={logo} alt="SafeRun logo" className="w-72 mx-auto" />
        <img src={Tagline} alt="tagline" className="w-72 mx-auto" />

        {/* Conditional rendering based on session type instead of always showing timer description */}
        {sessionType === "timer" && (
          <p >Enter your estimated run and we'll handle the rest.</p>
        )}

        {/* Session Type Toggle */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setSessionType("timer")}
            className={`btn btn-sm ${sessionType === "timer" ? "btn-accent" : "btn-outline btn-accent"}`}
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
                d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
            Timer Based
          </button>
          <button
            onClick={() => setSessionType("location")}
            className={`btn btn-sm ${sessionType === "location" ? "btn-accent" : "btn-outline btn-accent"}`}
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
                d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
              />
            </svg>
            Location Based
          </button>
        </div>

        <div className="divider mx-8"></div>

        {/* Conditional rendering based on session type */}
        {sessionType === "timer" ? (
          <>
            <p className="text-white font-bold ">How long will you run?</p>
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
                    className={`btn btn-sm ${isSelected ? "btn-accent" : "btn-outline btn-accent"}`}
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
            <p className="text-white">
              Your current location will be the start point. Select your
              destination on the map.
            </p>
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

        {/* Dynamic Start Run button that handles both session types */}
        <button
          onClick={
            sessionType === "timer" ? handleStartRun : handleStartLocationRun
          }
          className="btn btn-accent btn-sm btn-wide font-bold border-4"
          disabled={sessionType === "location" && (!startCoords || !endCoords)}
        >
          Start Run
        </button>

        <div className="divider mx-8"></div>

        <Quote />

        <div className="divider mx-8"></div>

        {/* Emergecy contact display*/}
        {loading ? (
          <p>Loading user info...</p>
        ) : user?.emergencyContact ? (
          <>
            <h2 className="font-bold text-white">Emergency Contact:</h2>
            <div className="bg-primary bg-opacity-10 border border-primary p-4 rounded-lg shadow-md">
              <p className="text-white">
                <strong>Name:</strong> {user.emergencyContact.name}
              </p>
              <p className="text-white">
                <strong>Phone:</strong> {user.emergencyContact.phoneNumber}
              </p>
              <p className="text-white">
                <strong>Relationship:</strong>{" "}
                {user.emergencyContact.relationship}
              </p>
            </div>
          </>
        ) : (
          <p className="text-white">No emergency contact info available.</p>
        )}
      </main>
    </>
  );
}
