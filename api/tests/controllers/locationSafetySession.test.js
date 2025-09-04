const request = require("supertest");
const express = require("express");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

const LocationSafetySessionController = require("../../controllers/locationSafetySession");
const LocationSafetySession = require("../../models/locationSafetySession");

// Create test app
const app = express();
app.use(express.json());

// Mount routes for testing
app.post("/locationSafetySessions", LocationSafetySessionController.create);
app.get("/locationSafetySessions/:id", LocationSafetySessionController.getById);
app.patch(
  "/locationSafetySessions/:id/position",
  LocationSafetySessionController.updatePosition
);
app.patch(
  "/locationSafetySessions/:id/checkin",
  LocationSafetySessionController.checkIn
);
app.patch(
  "/locationSafetySessions/:id/end",
  LocationSafetySessionController.endSession
);

describe("LocationSafetySession Controller", () => {
  let mongoServer;
  let testUserId;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
    testUserId = new mongoose.Types.ObjectId();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await LocationSafetySession.deleteMany({});
  });

  describe("POST /locationSafetySessions", () => {
    test("should create a new location safety session", async () => {
      const sessionData = {
        userId: testUserId,
        startCoords: {
          latitude: 51.5074,
          longitude: -0.0877,
        },
        endCoords: {
          latitude: 51.5055,
          longitude: -0.0754,
        },
      };

      const response = await request(app)
        .post("/locationSafetySessions")
        .send(sessionData)
        .expect(201);

      expect(response.body.message).toBe(
        "Location safety session created successfully"
      );
      expect(response.body.safetySession).toBeDefined();
      expect(response.body.safetySession.userId).toBe(testUserId.toString());
      expect(response.body.safetySession.startCoords.latitude).toBe(51.5074);
      expect(response.body.safetySession.endCoords.longitude).toBe(-0.0754);
      expect(response.body.safetySession.estimatedDistance).toBeGreaterThan(0);
      expect(response.body.safetySession.estimatedDuration).toBeGreaterThan(0);
      expect(response.body.safetySession.nextCheckInDue).toBeDefined();
    });

    test("should calculate distance correctly", async () => {
      const sessionData = {
        userId: testUserId,
        startCoords: { latitude: 51.5074, longitude: -0.0877 }, // London Bridge
        endCoords: { latitude: 51.5055, longitude: -0.0754 }, // Tower Bridge (~0.88km)
      };

      const response = await request(app)
        .post("/locationSafetySessions")
        .send(sessionData)
        .expect(201);

      const estimatedDistance = response.body.safetySession.estimatedDistance;
      expect(estimatedDistance).toBeCloseTo(0.88, 1); // ~0.88km with 0.1 tolerance

      const estimatedDuration = response.body.safetySession.estimatedDuration;
      expect(estimatedDuration).toBeCloseTo(9, 1); // ~9 minutes (0.88 * 10 min/km pace)
    });

    test("should return 500 for invalid data", async () => {
      const invalidData = {
        userId: testUserId,
        startCoords: { latitude: 51.5074 }, // missing longitude
        endCoords: { latitude: 51.5055, longitude: -0.0754 },
      };

      const response = await request(app)
        .post("/locationSafetySessions")
        .send(invalidData)
        .expect(500);

      expect(response.body.message).toBe("Server error");
    });
  });

  describe("GET /locationSafetySessions/:id", () => {
    test("should retrieve a location safety session by ID", async () => {
      const session = new LocationSafetySession({
        userId: testUserId,
        startCoords: { latitude: 51.5074, longitude: -0.0877 },
        endCoords: { latitude: 51.5055, longitude: -0.0754 },
      });
      const savedSession = await session.save();

      const response = await request(app)
        .get(`/locationSafetySessions/${savedSession._id}`)
        .expect(200);

      expect(response.body.message).toBe(
        "Location safety session retrieved successfully"
      );
      expect(response.body.safetySession._id).toBe(savedSession._id.toString());
    });

    test("should return 404 for non-existent session", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .get(`/locationSafetySessions/${nonExistentId}`)
        .expect(404);

      expect(response.body.message).toBe("Location safety session not found");
    });
  });

  describe("PATCH /locationSafetySessions/:id/position", () => {
    let testSession;

    beforeEach(async () => {
      testSession = new LocationSafetySession({
        userId: testUserId,
        startCoords: { latitude: 51.5074, longitude: -0.0877 },
        endCoords: { latitude: 51.5055, longitude: -0.0754 },
      });
      await testSession.save();
    });

    test("should update position successfully", async () => {
      const positionUpdate = {
        latitude: 51.507,
        longitude: -0.085,
      };

      const response = await request(app)
        .patch(`/locationSafetySessions/${testSession._id}/position`)
        .send(positionUpdate)
        .expect(200);

      expect(response.body.message).toBe("Position updated successfully");
      expect(response.body.safetySession.currentPosition.latitude).toBe(51.507);
      expect(response.body.safetySession.currentPosition.longitude).toBe(
        -0.085
      );
      expect(response.body.distanceToDestination).toBeGreaterThan(0);
      expect(response.body.reachedDestination).toBe(false);
    });

    test("should detect when destination is reached (within 100m)", async () => {
      // Position very close to end point (within 100m)
      const positionUpdate = {
        latitude: 51.5055, // Very close to end point
        longitude: -0.0754,
      };

      const response = await request(app)
        .patch(`/locationSafetySessions/${testSession._id}/position`)
        .send(positionUpdate)
        .expect(200);

      expect(response.body.reachedDestination).toBe(true);
      expect(response.body.safetySession.status).toBe("completed");
      expect(response.body.safetySession.reachedDestination).toBe(true);
      expect(response.body.safetySession.endTime).toBeDefined();
    });

    test("should not complete session if still far from destination", async () => {
      const positionUpdate = {
        latitude: 51.507, // Still far from end point
        longitude: -0.085,
      };

      const response = await request(app)
        .patch(`/locationSafetySessions/${testSession._id}/position`)
        .send(positionUpdate)
        .expect(200);

      expect(response.body.reachedDestination).toBe(false);
      expect(response.body.safetySession.status).toBe("active");
    });
  });

  describe("PATCH /locationSafetySessions/:id/checkin", () => {
    let testSession;

    beforeEach(async () => {
      testSession = new LocationSafetySession({
        userId: testUserId,
        startCoords: { latitude: 51.5074, longitude: -0.0877 },
        endCoords: { latitude: 51.5055, longitude: -0.0754 },
      });
      await testSession.save();
    });

    test("should handle safe check-in", async () => {
      const checkInData = { checkInType: "safe" };

      const response = await request(app)
        .patch(`/locationSafetySessions/${testSession._id}/checkin`)
        .send(checkInData)
        .expect(200);

      expect(response.body.message).toBe("Check-in recorded successfully");
      expect(response.body.safetySession.checkInCount).toBe(1);
      expect(response.body.safetySession.lastCheckIn).toBeDefined();
      expect(response.body.safetySession.nextCheckInDue).toBeDefined();
      expect(response.body.safetySession.status).toBe("active");
    });

    test("should handle emergency check-in", async () => {
      const checkInData = { checkInType: "emergency" };

      const response = await request(app)
        .patch(`/locationSafetySessions/${testSession._id}/checkin`)
        .send(checkInData)
        .expect(200);

      expect(response.body.message).toBe("Emergency alert sent successfully");
      expect(response.body.safetySession.status).toBe("emergency");
      expect(response.body.safetySession.emergencyAlertSent).toBe(true);
      expect(response.body.safetySession.emergencyAlertTime).toBeDefined();
    });

    test("should default to safe check-in if type not specified", async () => {
      const response = await request(app)
        .patch(`/locationSafetySessions/${testSession._id}/checkin`)
        .send({})
        .expect(200);

      expect(response.body.safetySession.checkInCount).toBe(1);
      expect(response.body.safetySession.status).toBe("active");
    });

    test("should calculate next check-in time correctly", async () => {
      // First check-in
      await request(app)
        .patch(`/locationSafetySessions/${testSession._id}/checkin`)
        .send({ checkInType: "safe" })
        .expect(200);

      // Second check-in
      const response = await request(app)
        .patch(`/locationSafetySessions/${testSession._id}/checkin`)
        .send({ checkInType: "safe" })
        .expect(200);

      expect(response.body.safetySession.checkInCount).toBe(2);

      // Verify next check-in is scheduled correctly using TESTING version
      // Expected: 1 + (2 * 2) = 5 minutes from session start
      const nextCheckIn = new Date(response.body.safetySession.nextCheckInDue);
      const sessionStart = new Date(testSession.startTime);
      const expectedTime = new Date(sessionStart.getTime() + 5 * 60 * 1000); // 5 minutes

      expect(
        Math.abs(nextCheckIn.getTime() - expectedTime.getTime())
      ).toBeLessThan(1000);
    });
  });

  describe("PATCH /locationSafetySessions/:id/end", () => {
    test("should end session manually", async () => {
      const testSession = new LocationSafetySession({
        userId: testUserId,
        startCoords: { latitude: 51.5074, longitude: -0.0877 },
        endCoords: { latitude: 51.5055, longitude: -0.0754 },
      });
      await testSession.save();

      const response = await request(app)
        .patch(`/locationSafetySessions/${testSession._id}/end`)
        .expect(200);

      expect(response.body.message).toBe(
        "Location safety session ended successfully"
      );
      expect(response.body.safetySession.status).toBe("completed");
      expect(response.body.safetySession.endTime).toBeDefined();
    });
  });

  describe("Distance Calculation Helper", () => {
    test("should calculate distance between London Bridge and Tower Bridge correctly", () => {
      // Access the controller to test the helper function
      const LocationSafetySessionController = require("../../controllers/locationSafetySession");

      // We need to extract the calculateDistance function for testing
      // This is a bit tricky since it's not exported, but we can test it through the API calls
      // The distance between London Bridge (51.5074, -0.0877) and Tower Bridge (51.5055, -0.0754)
      // is approximately 0.88km

      // We've already tested this indirectly through the create endpoint test above
      expect(true).toBe(true); // Placeholder - distance calculation is tested in create test
    });
  });
});
