const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export async function createSafetySession(data) {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/safetySessions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create session");
    }

    return await response.json();
  } catch (err) {
    console.error("Error creating safety session:", err);
    throw err;
  }
}

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

export const panicButtonActivePage = async (sessionId) => {
  try {
   const response = await fetch(
      `${BACKEND_URL}/safetySessions/${sessionId}/panic`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // 👈 Again no Auth header - as we aren't using auth yet
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to activate panic button");
    }

    const data = await response.json();
    return data.safetySession;
  } catch (error) {
    console.error("Error extending safety session:", error);
    throw error;
  }
};