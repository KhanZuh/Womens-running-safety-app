const request = require("supertest");

const app = require("../../app");
const Quote = require("../../models/quote");

require("../mongodb_helper");

describe("/quotes", () => {
  beforeEach(async () => {
    await Quote.deleteMany({});
  });

  describe("Get a quote", () => {

    test("return a random quote from the DB", async () => {
        const testQuote = {
            quote: "One run can change your day, many runs can change your life.",
            speaker: "Unknown"
        };

        await Quote.create(testQuote);

        const response = await request(app).get("/quotes");

        expect(response.status).toBe(200);
        expect(response.body.quote).toBe(testQuote.quote);
        expect(response.body.speaker).toBe(testQuote.speaker);
    });

    test("returns 404 if no quotes are in the database", async () => {
        const response = await request(app).get("/quotes");

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("No quotes found");
    });

    test("returns quote object with quote and speaker keys", async () => {
        const testQuote = {
            quote: "Run into your unknown.",
            speaker: "Becs Gentry"
        };

        await Quote.create(testQuote);

        const response = await request(app).get("/quotes");

        expect(response.body).toHaveProperty("quote");
        expect(response.body).toHaveProperty("speaker");
    });

  });
});