require("../mongodb_helper");
const EmergencyContact = require("../../models/emergencyContact");
const User = require("../../models/user");

describe("EmergencyContact model", () => {
  let testUserId;

  beforeAll(async () => {
    const user = new User({
      email: "model-test@test.com",
      password: "12345678",
    });
    const savedUser = await user.save();
    testUserId = savedUser._id;
  });

  beforeEach(async () => {
    await EmergencyContact.deleteMany({});
  });

  afterAll(async () => {
    await User.deleteMany({});
  });

  test("has a userId, name, and email", () => {
    const contact = new EmergencyContact({
      userId: testUserId,
      name: "John Doe",
      phoneNumber: "+447534330301",
    });

    expect(contact.userId).toEqual(testUserId);
    expect(contact.name).toEqual("John Doe");
    expect(contact.phoneNumber).toEqual("+447534330301");
  });

  test("can save an emergency contact", async () => {
    const contact = new EmergencyContact({
      userId: testUserId,
      name: "Jane Smith",
      phoneNumber: "+447534330301",
    });

    await contact.save();
    const contacts = await EmergencyContact.find();

    expect(contacts.length).toEqual(1);
    expect(contacts[0].name).toEqual("Jane Smith");
    expect(contacts[0].phoneNumber).toEqual("+447534330301");
  });
});
