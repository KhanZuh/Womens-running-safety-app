const app = require("../../app");
const supertest = require("supertest");
require("../mongodb_helper");
const EmergencyContact = require("../../models/emergencyContact");
const User = require("../../models/user");

describe("Emergency Contacts Controller", () => {
  let testUserId;

  beforeAll(async () => {
    // Created a test user to use for userId references
    // Auth hasn't been implemented yet so cannot grab userID from sign in
    const user = new User({
      email: "emergency-test@test.com",
      password: "12345678",
    });
    const savedUser = await user.save();
    testUserId = savedUser._id;
  });

  beforeEach(async () => {
    await EmergencyContact.deleteMany({});
  });

  afterAll(async () => {
    await EmergencyContact.deleteMany({});
    await User.deleteMany({});
  });

  describe("POST /emergencycontacts", () => {
    test("responds with 201 when emergency contact is created successfully", async () => {
      const testApp = supertest(app);
      const response = await testApp.post("/emergencycontacts").send({
        userId: testUserId,
        name: "John Doe",
        email: "john.doe@example.com",
      });

      expect(response.status).toEqual(201);
      expect(response.body.message).toEqual(
        "Emergency contact created successfully"
      );
      expect(response.body.emergencyContact.name).toEqual("John Doe");
      expect(response.body.emergencyContact.email).toEqual(
        "john.doe@example.com"
      );
      expect(response.body.emergencyContact.userId).toEqual(
        testUserId.toString()
      );
    });

    test("creates emergency contact in database", async () => {
      const testApp = supertest(app);
      await testApp.post("/emergencycontacts").send({
        userId: testUserId,
        name: "Jane Smith",
        email: "jane.smith@example.com",
      });

      const contacts = await EmergencyContact.find({ userId: testUserId });
      expect(contacts.length).toEqual(1);
      expect(contacts[0].name).toEqual("Jane Smith");
      expect(contacts[0].email).toEqual("jane.smith@example.com");
    });

    test("responds with 400 when required fields are missing", async () => {
      const testApp = supertest(app);
      const response = await testApp.post("/emergencycontacts").send({
        userId: testUserId,
        // missing name and email
      });

      expect(response.status).toEqual(400);
      expect(response.body.message).toEqual(
        "Failed to create emergency contact"
      );
    });

    test("responds with 400 when userId is missing", async () => {
      const testApp = supertest(app);
      const response = await testApp.post("/emergencycontacts").send({
        name: "John Doe",
        email: "john.doe@example.com",
        // missing userId
      });

      expect(response.status).toEqual(400);
      expect(response.body.message).toEqual(
        "Failed to create emergency contact"
      );
    });
  });
});
