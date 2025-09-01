import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { login } from "../../services/authentication";
import logo from "../../assets/logo-light-grey.png";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      const token = await login(email, password);
      localStorage.setItem("token", token);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      navigate("/login");
    }
  }

  function handleEmailChange(event) {
    setEmail(event.target.value);
  }

  function handlePasswordChange(event) {
    setPassword(event.target.value);
  }

  return (
    <>
      <img src={logo} alt="SafeRun logo" className="w-72 mx-auto" />
      <h2 className="text-3xl font-bold mb-6 text-center">Login</h2>

      <div className="max-w-md mx-auto p-8 bg-base-200 rounded-lg shadow-lg">
        <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
          <label className="flex flex-col">
            Email:
            <input
              id="email"
              type="email"
              value={email}
              onChange={handleEmailChange}
              className="input input-bordered mt-2"
              placeholder="you@example.com"
              required
            />
          </label>

          <label className="flex flex-col">
            Password:
            <input
              id="password"
              type="password"
              value={password}
              onChange={handlePasswordChange}
              className="input input-bordered mt-2"
              placeholder="********"
              required
            />
          </label>

          <button
            type="submit"
            className="btn btn-accent btn-wide font-bold border-4"
          >
            Submit
          </button>
        </form>
      </div>

      <p className="mt-6 text-center">
        Don&apos;t have an account?{" "}
        <a href="/signup" className="text-accent hover:underline font-semibold">
          Sign up here
        </a>
      </p>
    </>
  );
}
