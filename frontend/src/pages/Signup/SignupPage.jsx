import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { signup } from "../../services/authentication";

export function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [preferredTimeOfDay, setPreferredTimeOfDay] = useState([]);
  const [numberOfRunsPerWeek, setNumberOfRunsPerWeek] = useState(0);
  const [preferredTerrainTypes, setPreferredTerrainTypes] = useState([]);

  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      await signup({
        email,
        password,
        preferredTimeOfDay,
        numberOfRunsPerWeek,
        preferredTerrainTypes,
      });
      navigate("/login");
    } catch (err) {
      console.error(err);
      navigate("/signup");
    }
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
      setPreferredTimeOfDay((prev) => prev.filter((type) => type != value))
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
      <h2>Signup</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email:</label>
        <input
          id="email"
          type="text"
          value={email}
          onChange={handleEmailChange}
        />
        <label htmlFor="password">Password:</label>
        <input
          placeholder="Password"
          id="password"
          type="password"
          value={password}
          onChange={handlePasswordChange}
        />
        <fieldset>
          <legend>Preferred Time Of Day to Run</legend>
          <label>
            <input
              type="checkbox"
              value="Morning"
              checked={preferredTimeOfDay.includes("Morning")}
              onChange={handlePreferredTimeOfDayChange}

            />
            Morning
          </label>
          <label>
            <input
              type="checkbox"
              value="Afternoon"
              checked={preferredTimeOfDay.includes("Afternoon")}
              onChange={handlePreferredTimeOfDayChange}

            />
            Afternoon
          </label>
          <label>
            <input
              type="checkbox"
              value="Evening"
              checked={preferredTimeOfDay.includes("Evening")}
              onChange={handlePreferredTimeOfDayChange}

            />
            Evening
          </label>




        </fieldset>


        <label htmlFor="numberOfRunsPerWeek">Number of Runs Per Week:</label>
        <input
          id="numberOfRunsPerWeek"
          type="number"
          value={numberOfRunsPerWeek}
          onChange={handleNumberOfRunsPerWeekChange}
        />
        <fieldset>
          <legend>Preferred Terrain Types:</legend>

          <label>
            <input
              type="checkbox"
              value="Road"
              checked={preferredTerrainTypes.includes("Road")}
              onChange={handlePreferredTerrainTypesChange}
            />
            Road
          </label>

          <label>
            <input
              type="checkbox"
              value="Trail"
              checked={preferredTerrainTypes.includes("Trail")}
              onChange={handlePreferredTerrainTypesChange}
            />
            Trail
          </label>

          <label>
            <input
              type="checkbox"
              value="Track"
              checked={preferredTerrainTypes.includes("Track")}
              onChange={handlePreferredTerrainTypesChange}
            />
            Track
          </label>
        </fieldset>

        <input role="submit-button" id="submit" type="submit" value="Submit" />
      </form>
    </>
  );
}
