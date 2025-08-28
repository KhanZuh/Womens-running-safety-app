import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

export const createSafetySession = async ({ userId, duration }) => {
  console.log('Making API request with:', { userId, duration });
  
  try {
    const response = await axios.post(`${API_BASE_URL}/safetySessions`, {
      userId,
      duration,
      startTime: new Date().toISOString()
    });
    
    console.log('API Response:', response.data);
    return response.data;
    
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    throw error;
  }
};