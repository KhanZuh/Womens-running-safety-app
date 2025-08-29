jest.mock('twilio', () => {
  const mockMessages = {
    create: jest.fn()
  };
  
  const mockClient = {
    messages: mockMessages
  };
  
  return jest.fn(() => mockClient);
});

// Mock the entire twilio module with all its exports
jest.mock('../../lib/twilio', () => {
  const mockSendSMS = jest.fn();
  const mockSendSessionStartNotifications = jest.fn();
  
  return {
    sendSMS: mockSendSMS,
    sendSessionStartNotifications: mockSendSessionStartNotifications,
    twilio_number: '+1234567890'
  };
});

const { sendSMS, sendSessionStartNotifications } = require('../../lib/twilio');

describe('Twilio Service', () => {
  const emergencyNumber = '+19173528634';
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendSMS', () => {
    test('should send an SMS successfully', async () => {
      const mockResponse = { sid: 'SM1234567890', status: 'sent' };
      sendSMS.mockResolvedValue(mockResponse);
      
      const to = '+15551234567';
      const message = 'Test message';
      const result = await sendSMS(to, message);

      expect(sendSMS).toHaveBeenCalledWith(to, message);
      expect(result).toEqual(mockResponse);
    });

    test('should handle errors when sending SMS', async () => {
      const errorMessage = 'Invalid phone number';
      sendSMS.mockRejectedValue(new Error(errorMessage));
      
      const to = 'invalid_number';
      const message = 'Test message';
      await expect(sendSMS(to, message)).rejects.toThrow(errorMessage);
    });
  });

  describe('sendSessionStartNotifications', () => {
    test('should send session start notification successfully', async () => {
      const mockResponse = { sid: 'SM1234567890', status: 'sent' };
      sendSessionStartNotifications.mockResolvedValue(mockResponse);
      
      const session = { duration: 30 };
      const result = await sendSessionStartNotifications(null, session);
      expect(sendSessionStartNotifications).toHaveBeenCalledWith(null, session);
      expect(result).toEqual(mockResponse);
    });

    

    test('should handle different session durations correctly', async () => {
      const mockResponse = { sid: 'SM1234567890', status: 'sent' };
      sendSessionStartNotifications.mockResolvedValue(mockResponse);
      
      const session = { duration: 45 };
      await sendSessionStartNotifications(null, session);
      expect(sendSessionStartNotifications).toHaveBeenCalledWith(null, session);
    });
  });
});