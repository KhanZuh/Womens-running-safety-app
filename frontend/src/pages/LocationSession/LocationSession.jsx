import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import Navbar from "../../components/Navbar";

// Custom icons for different markers
// Replace the existing startIcon and endIcon with these improved versions
const startIcon = new L.Icon({
  iconUrl:
    "data:image/svg+xml;base64," +
    btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" width="32" height="32">
            <circle cx="16" cy="16" r="14" fill="#22c55e" stroke="white" stroke-width="3"/>
            <text x="16" y="13" text-anchor="middle" fill="white" font-size="8" font-weight="bold">S</text>
            <text x="16" y="21" text-anchor="middle" fill="white" font-size="6">START</text>
        </svg>
    `),
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

const endIcon = new L.Icon({
  iconUrl:
    "data:image/svg+xml;base64," +
    btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" width="32" height="32">
            <circle cx="16" cy="16" r="14" fill="#ef4444" stroke="white" stroke-width="3"/>
            <text x="16" y="13" text-anchor="middle" fill="white" font-size="8" font-weight="bold">E</text>
            <text x="16" y="21" text-anchor="middle" fill="white" font-size="6">END</text>
        </svg>
    `),
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

const currentLocationIcon = new L.Icon({
  iconUrl:
    "data:image/svg+xml;base64," +
    btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" width="24" height="24">
            <circle cx="12" cy="12" r="10" fill="#3b82f6" stroke="white" stroke-width="3"/>
            <circle cx="12" cy="12" r="4" fill="white"/>
        </svg>
    `),
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
});

export default function LocationSession() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  // Session state
  const [session, setSession] = useState(null);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [distanceToDestination, setDistanceToDestination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check-in modal state
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [checkInTimer, setCheckInTimer] = useState(null);
  const [timeUntilCheckIn, setTimeUntilCheckIn] = useState(null);

  // GPS tracking
  const [watchId, setWatchId] = useState(null);

  // Fetch session data
  useEffect(() => {
    fetchSession();
  }, [sessionId]);

  // Start GPS tracking
  useEffect(() => {
    if (session) {
      startLocationTracking();
    }

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [session]);

  // Check-in timer
  useEffect(() => {
    if (session && session.nextCheckInDue) {
      const checkInterval = setInterval(() => {
        const now = new Date().getTime();
        const checkInTime = new Date(session.nextCheckInDue).getTime();
        const timeLeft = checkInTime - now;

        if (timeLeft <= 0) {
          // Time for check-in
          setShowCheckInModal(true);
          startCheckInCountdown();
          clearInterval(checkInterval);
        } else {
          setTimeUntilCheckIn(timeLeft);
        }
      }, 1000);

      return () => clearInterval(checkInterval);
    }
  }, [session]);

  const fetchSession = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/locationSafetySessions/${sessionId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch session");
      }

      const data = await response.json();
      setSession(data.safetySession);
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching session:", err);
      setError(err.message);
      setIsLoading(false);
    }
  };

  const startLocationTracking = () => {
    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by this browser");
      return;
    }

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentPosition({ lat: latitude, lng: longitude });
        updatePositionOnServer(latitude, longitude);
      },
      (error) => {
        console.error("Error getting location:", error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );

    setWatchId(id);
  };

  const updatePositionOnServer = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/locationSafetySessions/${sessionId}/position`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ latitude, longitude }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update position");
      }

      const data = await response.json();

      // Update session if status changed
      if (data.safetySession.status !== session?.status) {
        setSession(data.safetySession);
      }

      setDistanceToDestination(data.distanceToDestination);

      // If reached destination, redirect to dashboard
      if (data.reachedDestination) {
        alert("You have reached your destination safely!");
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error updating position:", error);
    }
  };

  const startCheckInCountdown = () => {
    // Give user 5 minutes to respond
    const countdown = setTimeout(
      () => {
        if (showCheckInModal) {
          handleEmergencyAlert();
        }
      },
      5 * 60 * 1000
    ); // 5 minutes

    setCheckInTimer(countdown);
  };

  const handleSafeCheckIn = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/locationSafetySessions/${sessionId}/checkin`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ checkInType: "safe" }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to check in");
      }

      const data = await response.json();
      setSession(data.safetySession);
      setShowCheckInModal(false);
      clearTimeout(checkInTimer);

      console.log("Safe check-in completed");
    } catch (error) {
      console.error("Error during check-in:", error);
      alert("Failed to check in. Please try again.");
    }
  };

  const handleEmergencyAlert = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/locationSafetySessions/${sessionId}/checkin`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ checkInType: "emergency" }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to send emergency alert");
      }

      const data = await response.json();
      setSession(data.safetySession);
      setShowCheckInModal(false);
      clearTimeout(checkInTimer);

      alert("An Emergency alert has been sent to your emergency contact!");
    } catch (error) {
      console.error("Error sending emergency alert:", error);
      alert("Failed to send emergency alert. Please try again.");
    }
  };

  const handleEndSession = async () => {
    if (!confirm("Are you sure you want to end this session?")) {
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/locationSafetySessions/${sessionId}/end`,
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

      navigate("/dashboard");
    } catch (error) {
      console.error("Error ending session:", error);
      alert("Failed to end session. Please try again.");
    }
  };

  // Format time remaining until next check-in
  const formatTimeRemaining = (milliseconds) => {
    if (!milliseconds) return "";

    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);

    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  // Calculate map center
  const getMapCenter = () => {
    if (currentPosition) {
      return [currentPosition.lat, currentPosition.lng];
    }
    if (session) {
      return [session.startCoords.latitude, session.startCoords.longitude];
    }
    return [51.505, -0.09]; // Default to London
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-base-100 flex flex-col items-center p-4">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold mt-8 mb-4 text-white">
            You're on a location-based run!
          </h1>
          <p className="text-sm mb-4 text-white">We'll check in after a period of no movement</p>
        </div>

        {/* Status Info */}
        <div className="w-full max-w-4xl text-white mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="stat bg-base-200 rounded-lg p-4">
              <div className="stat-title text-white">Distance to Destination</div>
              <div className="stat-value text-2xl">
                {distanceToDestination !== null
                  ? `${(distanceToDestination * 1000).toFixed(0)}m`
                  : "Calculating..."}
              </div>
            </div>

            <div className="stat bg-base-200 rounded-lg p-4">
              <div className="stat-title text-white">Check-ins Completed</div>
              <div className="stat-value text-2xl">
                {session?.checkInCount || 0}
              </div>
            </div>

            <div className="stat bg-base-200 rounded-lg p-4">
              <div className="stat-title text-white">Next Check-in</div>
              <div className="stat-value text-lg">
                {timeUntilCheckIn
                  ? formatTimeRemaining(timeUntilCheckIn)
                  : "Ready"}
              </div>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="w-full max-w-4xl mb-4">
          <div
            className="border-2 border-gray-300 rounded-lg overflow-hidden"
            style={{ height: "400px" }}
          >
            <MapContainer
              center={getMapCenter()}
              zoom={14}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                url={`https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${import.meta.env.VITE_GEOAPIFY_API_KEY}`}
                attribution='&copy; <a href="https://www.geoapify.com/">Geoapify</a> | &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />

              {/* Start Point */}
              {session && (
                <Marker
                  position={[
                    session.startCoords.latitude,
                    session.startCoords.longitude,
                  ]}
                  icon={startIcon}
                >
                  <Popup>
                    <div className="text-center">
                      <div className="font-bold text-green-600">
                        🟢 Start Point
                      </div>
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* End Point */}
              {session && (
                <Marker
                  position={[
                    session.endCoords.latitude,
                    session.endCoords.longitude,
                  ]}
                  icon={endIcon}
                >
                  <Popup>
                    <div className="text-center">
                      <div className="font-bold text-red-600">🔴 End Point</div>
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* Current Position */}
              {currentPosition && (
                <Marker
                  position={[currentPosition.lat, currentPosition.lng]}
                  icon={currentLocationIcon}
                >
                  <Popup>
                    <div className="text-center">
                      <div className="font-bold text-blue-600">
                        📍 You Are Here
                      </div>
                      <div className="text-xs">
                        {currentPosition.lat.toFixed(4)},{" "}
                        {currentPosition.lng.toFixed(4)}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              )}
            </MapContainer>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-4">
          <button
            onClick={handleSafeCheckIn}
            className="btn btn-accent font-bold border-4 self-center"
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
                d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
            I'm Safe (Manual Check-in)
          </button>

          <button
            onClick={handleEndSession}
            className="btn btn-outline btn-secondary"
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
                d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636"
              />
            </svg>
            End Session
          </button>
        </div>
      </div>

      {/* Check-in Modal */}
      {showCheckInModal && (
        <div className="modal modal-open safety-check-modal">
          <div className="modal-box border-4 border-accent">
            <h3 className="font-bold text-white text-2xl mb-4"> Safety Check Time!</h3>
            <p className="mb-4 text-white">
              It's been {session?.checkInCount === 0 ? "1 hour" : "45 minutes"}{" "}
              since your last check-in.
            </p>
            <p className="mb-6 text-white">Are you safe and continuing your run?</p>

            <div className="modal-action flex flex-col">
              <button onClick={handleSafeCheckIn} className="btn btn-accent mb-4 font-bold border-4 self-center">
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
                I'm Safe - Continue Run
              </button>
              <button onClick={handleEmergencyAlert} className="btn btn-outline btn-secondary">
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
                    d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.25-8.25-3.286Zm0 13.036h.008v.008H12v-.008Z"
                  />
                </svg>
                Need Help - Alert Contact
              </button>
            </div>

            <div className="mt-4 text-center text-sm white">
              Emergency contact will be notified automatically if no response in
              5 minutes
            </div>
          </div>
        </div>
      )}
    </>
  );
}
