import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import { createSafetySession } from "../../src/services/safetySession"; 

describe("createSafetySession", () => {
    const mock = new AxiosMockAdapter(axios);
    const API_URL = "http://localhost:3000/safety-session";

    afterEach(() => {
        mock.reset(); // Reset the mock after each test
    });

    it("should post data and return session info", async () => {
        const mockResponse = { sessionId: "12345" };
        const userId = "user123";
        const duration = 30;

        mock.onPost(API_URL).reply(201, mockResponse); //Tells the mock adapter: “When a POST request is made to this URL, respond with status 201 and this mock data.”

        const result = await createSafetySession(userId, duration); //Calls the actual service function we're testing (createSafetySession)

        expect(result).toEqual(mockResponse); //Verifies that the service returns exactly what the API gave back
    });

    it("should throw an error if the request fails", async () => {
        const userId = "user123";
        const duration = 30;

        mock.onPost(API_URL).reply(500);

        await expect(createSafetySession(userId, duration)).rejects.toThrow();
    });
});
