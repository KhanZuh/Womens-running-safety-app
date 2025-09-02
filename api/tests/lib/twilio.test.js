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
const mockSendSMS = jest.fn();
const mockSendSessionStartNotifications = jest.fn();
const mockSendSessionEndNotifications = jest.fn();
const mockSendSessionExtensionNotifications = jest.fn();
const mockSendSessionOverdueNotifications = jest.fn();

jest.mock('../../lib/twilio', () => {
  return {
    sendSMS: mockSendSMS,
    sendSessionStartNotifications: mockSendSessionStartNotifications,
    sendSessionEndNotifications: mockSendSessionEndNotifications,
    sendSessionExtensionNotifications: mockSendSessionExtensionNotifications,
    sendSessionOverdueNotifications: mockSendSessionOverdueNotifications,
    twilio_number: '+1234567890'
  };
});

const { sendSMS, sendSessionStartNotifications, sendSessionEndNotifications, sendSessionExtensionNotifications, sendSessionOverdueNotifications} = require('../../lib/twilio');

describe('Twilio Service', () => {
  const emergencyNumber = '+11234567890';
  
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


  describe('sendSessionEndNotifications', () => {
    test('should send session end notification successfully', async () => {
      const mockResponse = { sid: 'SM1234567890', status: 'sent' };
      mockSendSessionEndNotifications.mockResolvedValue(mockResponse);
      
      const actualEndTime = new Date();
      actualEndTime.setHours(14, 56, 3);
      const session = { actualEndTime };
      const result = await sendSessionEndNotifications(null, session);
      expect(mockSendSessionEndNotifications).toHaveBeenCalledWith(null, session);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('sendSessionExtensionNotifications', () => {
    test('should send session extension notification successfully', async () => {
      const mockResponse = { sid: 'SM1234567890', status: 'sent' };
      mockSendSessionExtensionNotifications.mockResolvedValue(mockResponse);
      
      const scheduledEndTime = new Date();
      scheduledEndTime.setHours(14, 56, 3);
      const session = { scheduledEndTime };
      const result = await sendSessionExtensionNotifications(null, session);
      expect(mockSendSessionExtensionNotifications).toHaveBeenCalledWith(null, session);
      expect(result).toEqual(mockResponse);
    });
  });

  describe("sendSessionOverdueNotifications", () => {
    test("Should send overdue notifications with correct message", async () => {
      const mockResponse = {sid: 'SM1234567890', status: 'sent'};
      mockSendSessionOverdueNotifications.mockResolvedValue(mockResponse)
      const scheduledEndTime = new Date();
      scheduledEndTime.setHours(14, 30, 0); // 2.30pm
      const session = { scheduledEndTime, userId: '123' };
      const result = await sendSessionOverdueNotifications(null, session);
      expect(mockSendSessionOverdueNotifications).toHaveBeenCalledWith(null, session);
      expect(result).toEqual(mockResponse);
    })
  })
});