const mongoose = require("mongoose");
const LocationSafetySession = require("../../models/locationSafetySession");

// Mock MongoDB Memory Server for testing
const { MongoMemoryServer } = require("mongodb-memory-server");

describe("LocationSafetySession Model", () => {
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await LocationSafetySession.deleteMany({});
  });

  describe("Schema Validation", () => {
    test("should create a valid location safety session", async () => {
      const validSession = {
        userId: new mongoose.Types.ObjectId(),
        startCoords: {
          latitude: 51.5074,
          longitude: -0.0877,
        },
        endCoords: {
          latitude: 51.5055,
          longitude: -0.0754,
        },
        estimatedDistance: 1.2,
        estimatedDuration: 12,
      };

      const session = new LocationSafetySession(validSession);
      const savedSession = await session.save();

      expect(savedSession._id).toBeDefined();
      expect(savedSession.userId).toEqual(validSession.userId);
      expect(savedSession.startCoords.latitude).toBe(51.5074);
      expect(savedSession.status).toBe("active");
      expect(savedSession.checkInCount).toBe(0);
      expect(savedSession.reachedDestination).toBe(false);
      expect(savedSession.emergencyAlertSent).toBe(false);
    });

    test("should require userId", async () => {
      const invalidSession = new LocationSafetySession({
        startCoords: { latitude: 51.5074, longitude: -0.0877 },
        endCoords: { latitude: 51.5055, longitude: -0.0754 },
      });

      await expect(invalidSession.save()).rejects.toThrow("userId");
    });

    test("should require startCoords with latitude and longitude", async () => {
      const invalidSession = new LocationSafetySession({
        userId: new mongoose.Types.ObjectId(),
        startCoords: { latitude: 51.5074 }, // missing longitude
        endCoords: { latitude: 51.5055, longitude: -0.0754 },
      });

      await expect(invalidSession.save()).rejects.toThrow();
    });

    test("should require endCoords with latitude and longitude", async () => {
      const invalidSession = new LocationSafetySession({
        userId: new mongoose.Types.ObjectId(),
        startCoords: { latitude: 51.5074, longitude: -0.0877 },
        endCoords: { longitude: -0.0754 }, // missing latitude
      });

      await expect(invalidSession.save()).rejects.toThrow();
    });

    test("should only accept valid status values", async () => {
      const session = new LocationSafetySession({
        userId: new mongoose.Types.ObjectId(),
        startCoords: { latitude: 51.5074, longitude: -0.0877 },
        endCoords: { latitude: 51.5055, longitude: -0.0754 },
        status: "invalid_status",
      });

      await expect(session.save()).rejects.toThrow();
    });

    test("should set default values correctly", async () => {
      const session = new LocationSafetySession({
        userId: new mongoose.Types.ObjectId(),
        startCoords: { latitude: 51.5074, longitude: -0.0877 },
        endCoords: { latitude: 51.5055, longitude: -0.0754 },
      });

      const savedSession = await session.save();

      expect(savedSession.status).toBe("active");
      expect(savedSession.checkInCount).toBe(0);
      expect(savedSession.reachedDestination).toBe(false);
      expect(savedSession.emergencyAlertSent).toBe(false);
      expect(savedSession.startTime).toBeInstanceOf(Date);
    });
  });

  describe("Current Position Updates", () => {
    test("should update current position", async () => {
      const session = new LocationSafetySession({
        userId: new mongoose.Types.ObjectId(),
        startCoords: { latitude: 51.5074, longitude: -0.0877 },
        endCoords: { latitude: 51.5055, longitude: -0.0754 },
      });

      const savedSession = await session.save();

      savedSession.currentPosition = {
        latitude: 51.507,
        longitude: -0.085,
        timestamp: new Date(),
      };

      const updatedSession = await savedSession.save();

      expect(updatedSession.currentPosition.latitude).toBe(51.507);
      expect(updatedSession.currentPosition.longitude).toBe(-0.085);
      expect(updatedSession.currentPosition.timestamp).toBeInstanceOf(Date);
    });
  });
});
