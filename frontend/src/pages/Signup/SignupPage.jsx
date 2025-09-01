import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { signup } from "../../services/authentication";

export function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [preferredTimeOfDay, setPreferredTimeOfDay] = useState("");
  const [numberOfRunsPerWeek, setNumberOfRunsPerWeek] = useState(0);
  const [preferredTerrainTypes, setPreferredTerrainTypes] = useState("");

  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      await signup(email, password);
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
    setPreferredTimeOfDay(event.target.value);
  }
  
  function handleNumberOfRunsPerWeekChange(event) {
    setNumberOfRunsPerWeek(event.target.value);
  }

  function handlePreferredTerrainTypesChange(event) {
    setPreferredTerrainTypes(event.target.value);
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

        <label htmlFor="preferredTimeOfDay">Preferred Time Of Day to Run:</label>
        <input
          id="preferredTimeOfDay"
          type="text"
          value={preferredTimeOfDay}
          onChange={handlePreferredTimeOfDayChange}
        />
        <label htmlFor="numberOfRunsPerWeek">Number of Runs Per Week:</label>
        <input
          id="numberOfRunsPerWeek"
          type="number"
          value={numberOfRunsPerWeek}
          onChange={handleNumberOfRunsPerWeekChange}
        />
        <label htmlFor="preferredTerrainTypes">Preferred Terrain Types:</label>
        <select
        id="preferredTerrainTypes"
          type="text"
          value={preferredTerrainTypes}
          onChange={handlePreferredTerrainTypesChange}
        >
          <option value="Road">Road</option>
          <option value="Trail">Trail</option>
          <option value="Track">Track</option>
        </select>
          
          
        

        <input role="submit-button" id="submit" type="submit" value="Submit" />
      </form>
    </>
  );
}
