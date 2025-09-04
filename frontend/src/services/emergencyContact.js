const BASE_URL = import.meta.env.VITE_BACKEND_URL; // or use an environment variable later

export async function getEmergencyContact(userId) {
  const response = await fetch(`${BASE_URL}/emergency-contacts/${userId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch emergency contact");
  }

  const data = await response.json();
  return data;
}
