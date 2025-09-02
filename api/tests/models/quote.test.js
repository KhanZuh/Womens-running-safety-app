require("../mongodb_helper");
const Quote = require("../../models/quote");

describe("Quote model", () => {
  beforeEach(async () => {
    await Quote.deleteMany({});
  });

  it("has a quote", () => {
    const quote = new Quote({
      quote: "This is a really great and inspiring quote",
      speaker: "John C. Reilly"
    });
    expect(quote.quote).toEqual("This is a really great and inspiring quote");
  });

  it("has a speaker", () => {
    const quote = new Quote({
      quote: "This is a really great and inspiring quote",
      speaker: "John C. Reilly"
    });
    expect(quote.speaker).toEqual("John C. Reilly");
  });

  it("can list all quotes", async () => {
    const quotes = await Quote.find();
    expect(quotes).toEqual([]);
  });

});