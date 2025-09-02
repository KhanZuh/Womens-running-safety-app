import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createSafetySession } from "../../services/safetySession";
import logo from "../../assets/logo-light-grey.png";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export function Dashboard() {
  const [selectedDuration, setSelectedDuration] = useState(null); // Using state to manage selected duration
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const response = await fetch(`http://localhost:3000/users/${userId}`);
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

    console.log("Starting run with duration:", numericDuration);

    if (!selectedDuration) {
      alert("Please select a duration before starting the run.");
      return;
    }

    try {
      const userId = "64ff0e2ab123456789abcdef";
      console.log("Calling createSafetySession with:", {
        userId,
        duration: numericDuration,
      });

      const data = await createSafetySession({
        userId,
        duration: numericDuration,
      });
      // need to debug: console log the full response and convert the object to a string - helped to identify nested structure
      // console.log('Full response structure:', JSON.stringify(data, null, 2));
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

  const durations = ["30 minutes", "1 hour", "2 hours"];

  return (
    <>
      <Navbar />
      <main className="flex flex-col justify-center items-center min-h-screen w-full text-center space-y-6">
        {/* <h1>SafeRun</h1> */}
        <img src={logo} alt="SafeRun logo" className="w-72 mx-auto" />

        <h2 className="font-bold">
          Let someone know you're running - just in case.
        </h2>
        <p>Enter your estimated run and we'll handle the rest.</p>

        <div className="divider"></div>

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
                className={`btn btn-sm ${isSelected ? "btn-accent" : "btn-outline btn-accent"}`}
              >
                {duration}
              </button>
            );
          })}
        </div>

        <button
          onClick={handleStartRun}
          className="btn btn-accent btn-sm btn-wide font-bold border-4"
        >
          Start Run
        </button>

        <div className="divider"></div>

        {loading ? (
          <p>Loading user info...</p>
        ) : user?.emergencyContact ? (
          <>
            <h2 className="font-bold">Emergency Contact:</h2>
            <div className="bg-primary bg-opacity-10 border border-primary p-4 rounded-lg shadow-md">
              <p>
                <strong>Name:</strong> {user.emergencyContact.name}
              </p>
              <p>
                <strong>Phone:</strong> {user.emergencyContact.phoneNumber}
              </p>
              <p>
                <strong>Relationship:</strong>{" "}
                {user.emergencyContact.relationship}
              </p>
            </div>
          </>
        ) : (
          <p>No emergency contact info available.</p>
        )}
      </main>
      <Footer />
    </>
  );
}
