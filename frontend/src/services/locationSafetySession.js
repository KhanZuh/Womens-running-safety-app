export const createLocationSafetySession = async ({
  userId,
  startCoords,
  endCoords,
}) => {
  const response = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/locationSafetySessions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        startCoords: {
          latitude: startCoords.lat,
          longitude: startCoords.lng,
        },
        endCoords: {
          latitude: endCoords.lat,
          longitude: endCoords.lng,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.message || "Failed to create location safety session"
    );
  }

  return response.json();
};

export const getLocationSafetySession = async (sessionId) => {
  const response = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/locationSafetySessions/${sessionId}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch location safety session");
  }

  return response.json();
};

export const updateSessionPosition = async (sessionId, latitude, longitude) => {
  const response = await fetch(
    `${
      import.meta.env.VITE_BACKEND_URL
    }/locationSafetySessions/${sessionId}/position`,
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

  return response.json();
};

export const checkInLocationSession = async (
  sessionId,
  checkInType = "safe"
) => {
  const response = await fetch(
    `${
      import.meta.env.VITE_BACKEND_URL
    }/locationSafetySessions/${sessionId}/checkin`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ checkInType }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to process check-in");
  }

  return response.json();
};

export const endLocationSession = async (sessionId) => {
  const response = await fetch(
    `${
      import.meta.env.VITE_BACKEND_URL
    }/locationSafetySessions/${sessionId}/end`,
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

  return response.json();
};
