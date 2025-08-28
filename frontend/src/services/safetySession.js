import axios from "axios";

export async function createSafetySession(userId, duration) {
    try {
        const response = await axios.post("http://localhost:3000/safety-session", {
            userId,
            duration,
        });
        return response.data; // Return the entire response data
    } catch (err) {
        console.error("Failed to create safety session:", err);
        throw err; // Re-throw the error for further handling if needed
    }
}   