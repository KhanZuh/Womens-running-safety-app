require("../mongodb_helper");
const SafetySession = require("../../models/safetySession");
const User = require("../../models/user");

describe("SafetySession model", () => {
  let testUserId;

  beforeAll(async () => {
    const user = new User({
      email: "model-test@test.com",
      password: "12345678",
      fullname: "Someone"
    });
    const savedUser = await user.save();
    testUserId = savedUser._id;
  });

  beforeEach(async () => {
    await SafetySession.deleteMany({});
  });

  afterAll(async () => {
    await User.deleteMany({});
  });

  test("has required fields", () => {
    const startTime = new Date();
    const scheduledEndTime = new Date(startTime.getTime() + 60 * 60 * 1000);

    const session = new SafetySession({
      userId: testUserId,
      duration: 60,
      startTime: startTime,
      scheduledEndTime: scheduledEndTime,
    });

    expect(session.userId).toEqual(testUserId);
    expect(session.duration).toEqual(60);
    expect(session.startTime).toEqual(startTime);
    expect(session.scheduledEndTime).toEqual(scheduledEndTime);
  });

  test("can save a safety session", async () => {
    const session = new SafetySession({
      userId: testUserId,
      duration: 30,
      startTime: new Date(),
      scheduledEndTime: new Date(Date.now() + 30 * 60 * 1000),
    });

    await session.save();
    const sessions = await SafetySession.find();

    expect(sessions.length).toEqual(1);
    expect(sessions[0].duration).toEqual(30);
  });
});
