import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { signup } from "../../services/authentication";
import logo from "../../assets/logo-light-grey.png";

export function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [preferredTimeOfDay, setPreferredTimeOfDay] = useState([]);
  const [numberOfRunsPerWeek, setNumberOfRunsPerWeek] = useState(0);
  const [preferredTerrainTypes, setPreferredTerrainTypes] = useState([]);
  const [fullname, setFullname] = useState("");
  const [error, setError] = useState("");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [emergencyRelationship, setEmergencyRelationship] = useState("");

  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setError(""); // clear any previous error
    try {
      await signup({
        email,
        password,
        fullname,
        preferredTimeOfDay,
        numberOfRunsPerWeek,
        preferredTerrainTypes,
        emergencyContact: {
          name: emergencyName,
          phoneNumber: emergencyPhone,
          relationship: emergencyRelationship,
        }
      });
      navigate("/login");
    } catch (err) {
      const errorMsg = err.message || "Signup failed";
      setError(errorMsg);
    }
  }

  function handleFullnameChange(event) {
    setFullname(event.target.value);
  }

  function handleEmailChange(event) {
    setEmail(event.target.value);
  }

  function handlePasswordChange(event) {
    setPassword(event.target.value);
  }

  function handlePreferredTimeOfDayChange(event) {
    const { value, checked } = event.target;

    if (checked) {
      // Add to array
      setPreferredTimeOfDay((prev) => [...prev, value]);
    } else {
      // Remove from array
      setPreferredTimeOfDay((prev) => prev.filter((type) => type != value));
    }
  }

  function handleNumberOfRunsPerWeekChange(event) {
    setNumberOfRunsPerWeek(event.target.value);
  }

  function handlePreferredTerrainTypesChange(event) {
    const { value, checked } = event.target;

    if (checked) {
      // Add to array
      setPreferredTerrainTypes((prev) => [...prev, value]);
    } else {
      // Remove from array
      setPreferredTerrainTypes((prev) => prev.filter((type) => type !== value));
    }
  }

  return (
    <>
      <img src={logo} alt="SafeRun logo" className="w-72 mt-8 mx-auto" />
      <h2 className="text-3xl font-bold mb-6 mt-8 text-white text-center">Sign Up</h2>

      {error && (
        <div className="text-red-500 text-center font-semibold mb-4">
          {error}
        </div>
      )}
      <div className="max-w-md mx-auto p-8 text-white bg-base-200 rounded-lg shadow-lg">
        <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
          <label className="flex flex-col">
            Full Name:
            <input
              id="fullname"
              type="text"
              value={fullname}
              onChange={handleFullnameChange}
              className="input input-bordered mt-2"
              placeholder="Your Full name"
              required
            />
          </label>

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

          <fieldset className="flex flex-col space-y-3">
            <legend className="font-semibold text-lg">
              Preferred Time Of Day to Run
            </legend>
            {["Morning", "Afternoon", "Evening"].map((time) => (
              <label
                key={time}
                className="cursor-pointer flex items-center space-x-3"
              >
                <input
                  type="checkbox"
                  value={time}
                  checked={preferredTimeOfDay.includes(time)}
                  onChange={handlePreferredTimeOfDayChange}
                  className="checkbox checkbox-accent"
                />
                <span>{time}</span>
              </label>
            ))}
          </fieldset>

          <label className="flex flex-col">
            Number of Runs Per Week:
            <input
              id="numberOfRunsPerWeek"
              type="number"
              min={0}
              value={numberOfRunsPerWeek}
              onChange={handleNumberOfRunsPerWeekChange}
              className="input input-bordered mt-2"
              placeholder="e.g. 3"
            />
          </label>

          <fieldset className="flex flex-col space-y-3">
            <legend className="font-semibold text-lg">
              Preferred Terrain Types
            </legend>
            {["Road", "Trail", "Track"].map((terrain) => (
              <label
                key={terrain}
                className="cursor-pointer flex items-center space-x-3"
              >
                <input
                  type="checkbox"
                  value={terrain}
                  checked={preferredTerrainTypes.includes(terrain)}
                  onChange={handlePreferredTerrainTypesChange}
                  className="checkbox checkbox-accent"
                />
                <span>{terrain}</span>
              </label>
            ))}
          </fieldset>
          <label className="flex flex-col">
            Emergency Contact Name:
            <input
              type="text"
              className="input input-bordered mt-2"
              value={emergencyName}
              onChange={(e) => setEmergencyName(e.target.value)}
              required
            />
          </label>

          <label className="flex flex-col">
            Emergency Contact Phone:
            <input
              type="tel"
              className="input input-bordered mt-2"
              value={emergencyPhone}
              onChange={(e) => setEmergencyPhone(e.target.value)}
              required
            />
          </label>

          <label className="flex flex-col">
            Emergency Contact Relationship:
            <input
              type="text"
              className="input input-bordered mt-2"
              value={emergencyRelationship}
              onChange={(e) => setEmergencyRelationship(e.target.value)}
              required
            />
          </label>

          <button
            type="submit"
            className="btn btn-accent self-center btn-wide font-bold border-4"
          >
            Submit
          </button>
        </form>

        <p className="mt-6 text-center">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-accent hover:underline font-semibold"
          >
            Login here
          </a>
        </p>
      </div>
    </>
  );
}
