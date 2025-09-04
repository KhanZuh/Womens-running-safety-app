import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  createLocationSafetySession,
  getLocationSafetySession,
  updateSessionPosition,
  checkInLocationSession,
  endLocationSession,
} from "../../src/services/locationSafetySession";

// Mock fetch globally
global.fetch = vi.fn();

describe("locationSafetySession service", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();

    // Set default environment variable
    import.meta.env.VITE_BACKEND_URL = "http://localhost:3000";
  });

  describe("createLocationSafetySession", () => {
    it("should create a location safety session successfully", async () => {
      const mockResponse = {
        message: "Location safety session created successfully",
        safetySession: {
          _id: "64ff0e2ab123456789abcdef",
          userId: "64ff0e2ab123456789abcdef",
          startCoords: { latitude: 51.5074, longitude: -0.0877 },
          endCoords: { latitude: 51.5055, longitude: -0.0754 },
          estimatedDistance: 0.88,
          estimatedDuration: 9,
          status: "active",
          nextCheckInDue: "2025-01-01T11:00:00.000Z",
        },
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse),
      });

      const sessionData = {
        userId: "64ff0e2ab123456789abcdef",
        startCoords: { lat: 51.5074, lng: -0.0877 },
        endCoords: { lat: 51.5055, lng: -0.0754 },
      };

      const result = await createLocationSafetySession(sessionData);

      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:3000/locationSafetySessions",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: "64ff0e2ab123456789abcdef",
            startCoords: { latitude: 51.5074, longitude: -0.0877 },
            endCoords: { latitude: 51.5055, longitude: -0.0754 },
          }),
        }
      );

      expect(result).toEqual(mockResponse);
    });

    it("should handle API errors with error message", async () => {
      const mockErrorResponse = {
        message: "Invalid coordinates provided",
        error: "Validation failed",
      };

      fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: vi.fn().mockResolvedValue(mockErrorResponse),
      });

      const sessionData = {
        userId: "test-user-id",
        startCoords: { lat: 51.5074, lng: -0.0877 },
        endCoords: { lat: 51.5055, lng: -0.0754 },
      };

      await expect(createLocationSafetySession(sessionData)).rejects.toThrow(
        "Invalid coordinates provided"
      );
    });

    it("should handle API errors without error message", async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: vi.fn().mockResolvedValue({}),
      });

      const sessionData = {
        userId: "test-user-id",
        startCoords: { lat: 51.5074, lng: -0.0877 },
        endCoords: { lat: 51.5055, lng: -0.0754 },
      };

      await expect(createLocationSafetySession(sessionData)).rejects.toThrow(
        "Failed to create location safety session"
      );
    });
  });

  describe("getLocationSafetySession", () => {
    it("should fetch a location safety session successfully", async () => {
      const mockResponse = {
        message: "Location safety session retrieved successfully",
        safetySession: {
          _id: "session-123",
          userId: "user-456",
          status: "active",
          currentPosition: { latitude: 51.507, longitude: -0.085 },
        },
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse),
      });

      const result = await getLocationSafetySession("session-123");

      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:3000/locationSafetySessions/session-123"
      );
      expect(result).toEqual(mockResponse);
    });

    it("should handle fetch errors", async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(
        getLocationSafetySession("non-existent-session")
      ).rejects.toThrow("Failed to fetch location safety session");
    });
  });

  describe("updateSessionPosition", () => {
    it("should update position successfully", async () => {
      const mockResponse = {
        message: "Position updated successfully",
        safetySession: {
          currentPosition: { latitude: 51.507, longitude: -0.085 },
        },
        distanceToDestination: 0.5,
        reachedDestination: false,
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse),
      });

      const result = await updateSessionPosition("session-123", 51.507, -0.085);

      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:3000/locationSafetySessions/session-123/position",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ latitude: 51.507, longitude: -0.085 }),
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it("should handle position update errors", async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(
        updateSessionPosition("session-123", 51.507, -0.085)
      ).rejects.toThrow("Failed to update position");
    });
  });

  describe("checkInLocationSession", () => {
    it("should handle safe check-in", async () => {
      const mockResponse = {
        message: "Check-in recorded successfully",
        safetySession: {
          checkInCount: 1,
          lastCheckIn: "2025-01-01T11:00:00.000Z",
          nextCheckInDue: "2025-01-01T11:45:00.000Z",
          status: "active",
        },
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse),
      });

      const result = await checkInLocationSession("session-123", "safe");

      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:3000/locationSafetySessions/session-123/checkin",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ checkInType: "safe" }),
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it("should handle emergency check-in", async () => {
      const mockResponse = {
        message: "Emergency alert sent successfully",
        safetySession: {
          status: "emergency",
          emergencyAlertSent: true,
          emergencyAlertTime: "2025-01-01T11:00:00.000Z",
        },
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse),
      });

      const result = await checkInLocationSession("session-123", "emergency");

      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:3000/locationSafetySessions/session-123/checkin",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ checkInType: "emergency" }),
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it("should default to safe check-in when type not specified", async () => {
      const mockResponse = {
        message: "Check-in recorded successfully",
        safetySession: { checkInCount: 1, status: "active" },
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse),
      });

      await checkInLocationSession("session-123");

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({ checkInType: "safe" }),
        })
      );
    });

    it("should handle check-in errors", async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(
        checkInLocationSession("session-123", "safe")
      ).rejects.toThrow("Failed to process check-in");
    });
  });

  describe("endLocationSession", () => {
    it("should end session successfully", async () => {
      const mockResponse = {
        message: "Location safety session ended successfully",
        safetySession: {
          status: "completed",
          endTime: "2025-01-01T12:00:00.000Z",
        },
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse),
      });

      const result = await endLocationSession("session-123");

      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:3000/locationSafetySessions/session-123/end",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it("should handle end session errors", async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(endLocationSession("non-existent-session")).rejects.toThrow(
        "Failed to end session"
      );
    });
  });

  describe("Network and edge cases", () => {
    it("should handle network errors", async () => {
      fetch.mockRejectedValueOnce(new Error("Network connection failed"));

      const sessionData = {
        userId: "test-user-id",
        startCoords: { lat: 51.5074, lng: -0.0877 },
        endCoords: { lat: 51.5055, lng: -0.0754 },
      };

      await expect(createLocationSafetySession(sessionData)).rejects.toThrow(
        "Network connection failed"
      );
    });

    it("should handle missing environment variable gracefully", async () => {
      const originalUrl = import.meta.env.VITE_BACKEND_URL;
      delete import.meta.env.VITE_BACKEND_URL;

      fetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({}),
      });

      await getLocationSafetySession("session-123");

      expect(fetch).toHaveBeenCalledWith(
        "undefined/locationSafetySessions/session-123"
      );

      import.meta.env.VITE_BACKEND_URL = originalUrl;
    });
  });
});
