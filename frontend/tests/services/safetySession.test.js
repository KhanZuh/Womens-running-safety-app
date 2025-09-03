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
    const mockResponseData = {
        sessionId: "12345",
        message: "Safety session started successfully",
    };

    // Mock global fetch
    global.fetch = vi.fn(() =>
        Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponseData),
        })
    );

    const result = await createSafetySession({
        userId: "user123",
        duration: 30,
    });

    expect(result).toEqual(mockResponseData);
    expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/safetySessions"),
        expect.objectContaining({
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: "user123", duration: 30 }),
        })
    );
    });

    it("should throw an error on failure", async () => {
    global.fetch = vi.fn(() =>
        Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: "Something went wrong" }),
        })
    );

    await expect(
        createSafetySession({ userId: "user123", duration: 30 })
    ).rejects.toThrow("Something went wrong");
    });

    it("should throw an error if the request fails", async () => {
    const userId = "user123";
    const duration = 30;

    mock.onPost(API_URL).reply(500);

    await expect(createSafetySession(userId, duration)).rejects.toThrow();
    });
});
