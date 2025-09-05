import { Link } from "react-router-dom";
import logo from '../../assets/logo-light-grey.png';
import Tagline from "../../assets/Tagline-2.svg";

import "./HomePage.css";

export function HomePage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-base-200 text-center px-4">
      
      <div className="max-w-md w-full p-8 bg-base-100 rounded-lg shadow-lg space-y-6">
        <img src={logo} alt="SafeRun logo" className="w-72 mx-auto" />
        <img src={Tagline} alt="tagline" className="w-72 mx-auto" />

        <div className="flex flex-col items-center space-y-4">
          <Link to="/signup" className="btn btn-accent btn-wide font-semibold">
            Sign Up
          </Link>
          <Link to="/login" className="btn btn-outline btn-accent btn-wide font-semibold">
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}