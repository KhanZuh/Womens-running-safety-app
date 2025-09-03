import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { useNavigate } from "react-router-dom";
import { signup } from "../../src/services/authentication";

import { SignupPage } from "../../src/pages/Signup/SignupPage";

// Mocking React Router's useNavigate function
vi.mock("react-router-dom", () => {
  const navigateMock = vi.fn();
  const useNavigateMock = () => navigateMock; // Create a mock function for useNavigate
  return { useNavigate: useNavigateMock };
});

// Mocking the signup service
vi.mock("../../src/services/authentication", () => {
  const signupMock = vi.fn();
  return { signup: signupMock };
});

// Reusable function for filling out signup form
async function completeSignupForm() {
  const user = userEvent.setup();

  const fullnameInputEl = screen.getByLabelText(/full name/i);
  const emailInputEl = screen.getByLabelText(/email/i);
  const passwordInputEl = screen.getByLabelText(/password/i);
  const emergencyNameEl = screen.getByLabelText(/emergency contact name/i);
  const emergencyPhoneEl = screen.getByLabelText(/emergency contact phone/i);
  const emergencyRelationshipEl = screen.getByLabelText(
    /emergency contact relationship/i
  );
  const submitButtonEl = screen.getByRole("button", { name: /submit/i });

  await user.type(fullnameInputEl, "Testy McTest");
  await user.type(emailInputEl, "test@email.com");
  await user.type(passwordInputEl, "12345678"); // must be at least 8 chars
  await user.type(emergencyNameEl, "John Doe");
  await user.type(emergencyPhoneEl, "123-456-7890");
  await user.type(emergencyRelationshipEl, "Brother");

  await user.click(submitButtonEl);
}

describe("Signup Page", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test("allows a user to signup", async () => {
    render(<SignupPage />);

    await completeSignupForm();

    expect(signup).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "test@email.com",
        password: "12345678",
        fullname: "Testy McTest",
        emergencyContact: expect.objectContaining({
          name: "John Doe",
          phoneNumber: "123-456-7890",
          relationship: "Brother",
        }),
      })
    );
  });

  test("navigates to /login on successful signup", async () => {
    render(<SignupPage />);

    const navigateMock = useNavigate();

    await completeSignupForm();

    expect(navigateMock).toHaveBeenCalledWith("/login");
  });

  test("shows error message on unsuccessful signup", async () => {
    signup.mockRejectedValue(new Error("Error signing up"));

    render(<SignupPage />);
    await completeSignupForm();

    // navigate should not be called
    const navigateMock = useNavigate();
    expect(navigateMock).not.toHaveBeenCalled();

    // assert error message is shown
    const errorMessage = await screen.findByText(/error signing up/i);
    expect(errorMessage).to.exist; // Chai syntax
  });
});
