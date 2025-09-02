const app = require("../../app");
const supertest = require("supertest");
require("../mongodb_helper");
const SafetySession = require("../../models/safetySession");
const User = require("../../models/user");
const { overDueSession } = require("../../controllers/safetySession");
const { sendSessionOverdueNotifications } = require("../../lib/twilio");

jest.mock('../../lib/twilio', () => ({
  sendSessionStartNotifications: jest.fn().mockResolvedValue({
    success: true
  }),
  sendSessionOverdueNotifications: jest.fn().mockResolvedValue({
    success: true
  }),
  sendSessionEndNotifications: jest.fn().mockResolvedValue({
    success: true
  })
}));

describe("Safety Session Controller", () => {
  let testUserId;

  beforeAll(async () => {
    // Created a test user to use for userId references
    // Auth hasn't been implemented yet so cannot grab userID from sign in
    const user = new User({
      email: "safety-test@test.com",
      password: "12345678",
    });
    const savedUser = await user.save();
    testUserId = savedUser._id;
  });

  afterAll(async () => {
    await SafetySession.deleteMany({});
    await User.deleteMany({});
  });

  describe("POST /safetySessions", () => {
    beforeEach(async () => {
      await SafetySession.deleteMany({});
    });

    test("responds with 201 when safety session is created successfully", async () => {
      const testApp = supertest(app);
      const response = await testApp.post("/safetySessions").send({
        userId: testUserId,
        duration: 60, // e.g. 60 minutes
      });

      expect(response.status).toEqual(201);
      expect(response.body.message).toEqual(
        "Safety session started successfully"
      );
      expect(response.body.safetySession.userId).toEqual(testUserId.toString());
      expect(response.body.safetySession.duration).toEqual(60);
      expect(response.body.safetySession.startTime).toBeDefined();
      expect(response.body.safetySession.scheduledEndTime).toBeDefined();
    });

    test("creates safety session in database with correct times", async () => {
      const testApp = supertest(app);
      const duration = 30;

      await testApp.post("/safetySessions").send({
        userId: testUserId,
        duration: duration,
      });

      const sessions = await SafetySession.find({ userId: testUserId });
      expect(sessions.length).toEqual(1);

      const session = sessions[0];
      expect(session.duration).toEqual(duration);
      expect(session.startTime).toBeInstanceOf(Date);
      expect(session.scheduledEndTime).toBeInstanceOf(Date);

      // Check that scheduledEndTime is startTime + duration minutes
      const expectedEndTime = new Date(
        session.startTime.getTime() + duration * 60 * 1000
      );
      expect(session.scheduledEndTime.getTime()).toEqual(
        expectedEndTime.getTime()
      );
    });

    test("responds with 400 when required fields are missing", async () => {
      const testApp = supertest(app);
      const response = await testApp.post("/safetySessions").send({
        userId: testUserId,
        // missing duration
      });

      expect(response.status).toEqual(400);
      expect(response.body.message).toEqual("Failed to create safety session");
    });
  });

  describe("PATCH /safetySessions/:id/checkin", () => {
    let sessionId;

    beforeEach(async () => {
      // Creating a safety session for testing
      const session = new SafetySession({
        userId: testUserId,
        duration: 60,
        startTime: new Date(),
        scheduledEndTime: new Date(Date.now() + 60 * 60 * 1000),
      });
      const savedSession = await session.save();
      sessionId = savedSession._id;
    });

    afterEach(async () => {
      await SafetySession.deleteMany({});
    });

    test("responds with 200 when check-in is successful", async () => {
      const testApp = supertest(app);
      const response = await testApp.patch(
        `/safetySessions/${sessionId}/checkin`
      );

      expect(response.status).toEqual(200);
      expect(response.body.message).toEqual(
        "Check-in successful! You're safe."
      );
      expect(response.body.safetySession.actualEndTime).toBeDefined();
    });

    test("updates safety session with actualEndTime", async () => {
      const testApp = supertest(app);
      const beforeCheckIn = new Date();

      await testApp.patch(`/safetySessions/${sessionId}/checkin`);

      const updatedSession = await SafetySession.findById(sessionId);
      expect(updatedSession.actualEndTime).toBeInstanceOf(Date);
      expect(updatedSession.actualEndTime.getTime()).toBeGreaterThanOrEqual(
        beforeCheckIn.getTime()
      );
    });

    test("responds with 404 when session doesn't exist", async () => {
      const testApp = supertest(app);
      const fakeId = "507f1f77bcf86cd799439011";

      const response = await testApp.patch(`/safetySessions/${fakeId}/checkin`);

      expect(response.status).toEqual(404);
      expect(response.body.message).toEqual("Safety session not found");
    });

    test("responds with 400 when session ID is invalid", async () => {
      const testApp = supertest(app);
      const response = await testApp.patch(
        "/safetySessions/invalid-id/checkin"
      );

      expect(response.status).toEqual(400);
      expect(response.body.message).toEqual("Failed to check in");
    });
  });

  describe("overDueSession", () => {
    beforeEach(async () => {
      await SafetySession.deleteMany({});
      jest.clearAllMocks();
    });
    test("sends notification for overdue session", async () => {
      const session = new SafetySession({
        userId: testUserId,
        duration: 30, 
        startTime: new Date(Date.now() - 35 * 60 * 1000),
        scheduledEndTime: new Date(Date.now() - 5 * 60 * 1000),
        actualEndTime: null, 
        overdueNotificationSent: false,
      });
      await session.save();
      await overDueSession();
      expect(sendSessionOverdueNotifications).toHaveBeenCalledTimes(1);
      const updatedSession = await SafetySession.findById(session._id)
      expect(updatedSession.overdueNotificationSent).toBe(true)
    })

    test("does not send notification for overdue session that already had notification sent", async () => {
      const session = new SafetySession({
        userId: testUserId,
        duration: 30, 
        startTime: new Date(Date.now() - 35 * 60 * 1000),
        scheduledEndTime: new Date(Date.now() - 5 * 60 * 1000),
        actualEndTime: null, 
        overdueNotificationSent: true,
      });
      await session.save();
      await overDueSession();
      expect(sendSessionOverdueNotifications).not.toHaveBeenCalled();
    })

    test("does not send notification for sessions that user have already been checked in", async () => {
      const session = new SafetySession({
        userId: testUserId,
        duration: 30, 
        startTime: new Date(Date.now() - 35 * 60 * 1000),
        scheduledEndTime: new Date(Date.now() - 5 * 60 * 1000),
        actualEndTime: new Date(Date.now() - 2 * 60 * 1000),
        overdueNotificationSent: false,
      });
      await session.save();
      await overDueSession();
      expect(sendSessionOverdueNotifications).not.toHaveBeenCalled();
    })
  })

  describe("POST /safetySessions/:id/panic", () => {
    let sessionId;

    beforeEach(async () => {
      // Creating a safety session for testing
      const session = new SafetySession({
        userId: testUserId,
        duration: 60,
        startTime: new Date(),
        scheduledEndTime: new Date(Date.now() + 60 * 60 * 1000),
        panicButtonPressed: false
      });
      const savedSession = await session.save();
      sessionId = savedSession._id;
    });

    afterEach(async () => {
      await SafetySession.deleteMany({});
    });

    test("responds with 200 when panic button is pressed successfully", async () => {
      const testApp = supertest(app);
      const response = await testApp.post(`/safetySessions/${sessionId}/panic`).send({
        userId: testUserId
      });

      expect(response.status).toEqual(200);
      expect(response.body.message).toEqual("User pressed the panic button during the SafeRun.");
      expect(response.body.smsSent).toBeDefined();
    });

    test("updates safety session with panicButtonPressed", async () => {
      const testApp = supertest(app);
      
      await testApp.post(`/safetySessions/${sessionId}/panic`).send({
        userId: testUserId
      });

      const updatedSession = await SafetySession.findById(sessionId);
      expect(updatedSession.panicButtonPressed).toBe(true);
    });

    test("responds with 404 when session doesn't exist", async () => {
      const testApp = supertest(app);
      const fakeId = "507f1f77bcf86cd799439011";

      const response = await testApp.post(`/safetySessions/${fakeId}/panic`).send({
        userId: testUserId
      });

      expect(response.status).toEqual(404);
      expect(response.body.message).toEqual("Safety session not found");
    });

    test("responds with 400 when session ID is invalid", async () => {
      const testApp = supertest(app);
      const response = await testApp.post("/safetySessions/invalid-id/panic").send({
        userId: testUserId
      });

      expect(response.status).toEqual(400);
      expect(response.body.message).toEqual("Failed to activate panic button.");
    });
  });
});

