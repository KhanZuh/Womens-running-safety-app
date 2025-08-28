const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const createSafetySession = async (userId, duration) => {
  try {
    const response = await fetch(`${BACKEND_URL}/safetySessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // 👈 Usually this would have the Auth header - but we aren't using auth yet
      },
      body: JSON.stringify({
        userId,
        duration,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create safety session");
    }

    const data = await response.json();
    return data.safetySession;
  } catch (error) {
    console.error("Error creating safety session:", error);
    throw error;
  }
};

// Get safety session by ID
export const getSafetySession = async (sessionId) => {
  try {
    const response = await fetch(`${BACKEND_URL}/safetySessions/${sessionId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // 👈 Again no Auth header - as we aren't using auth yet
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch safety session");
    }

    const data = await response.json();
    return data.safetySession;
  } catch (error) {
    console.error("Error fetching safety session:", error);
    throw error;
  }
};

// End safety session e.g. check-in
export const endSafetySession = async (sessionId) => {
  try {
    const response = await fetch(
      `${BACKEND_URL}/safetySessions/${sessionId}/checkin`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          // 👈 Again no Auth header - as we aren't using auth yet
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to end safety session");
    }

    const data = await response.json();
    return data.safetySession;
  } catch (error) {
    console.error("Error ending safety session:", error);
    throw error;
  }
};

// Extend safety session duration
export const extendSafetySession = async (
  sessionId,
  additionalMinutes = 15
) => {
  try {
    const response = await fetch(
      `${BACKEND_URL}/safetySessions/${sessionId}/extend`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          // 👈 Again no Auth header - as we aren't using auth yet
        },
        body: JSON.stringify({
          additionalMinutes,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to extend safety session");
    }

    const data = await response.json();
    return data.safetySession;
  } catch (error) {
    console.error("Error extending safety session:", error);
    throw error;
  }
};
