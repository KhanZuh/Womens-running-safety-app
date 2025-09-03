import logo from '../assets/logo-light-grey.png';
import useLogout from "../hooks/useLogout";
import { PanicButtonActivePage } from "./PanicButtonActive";

const Navbar = ({ showPanicButton = false, sessionId, onPanicActivated }) => {

    const logout = useLogout();

    return (

        <div className = "px-4 mt-4">
            <div className="navbar bg-neutral rounded-lg shadow-md px-4">
                <div className="navbar-start">
                    <div className="dropdown">
                    <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
                        <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 6h16M4 12h16M4 18h7" />
                        </svg>
                    </div>
                    <ul
                        tabIndex={0}
                        className="menu menu-sm dropdown-content bg-neutral text-base-content rounded-box z-[1] mt-3 w-52 p-2 shadow">
                        {/* <li><a className="text-base-content hover:bg-neutral-focus rounded">Profile</a></li>
                        <li><a className="text-base-content hover:bg-neutral-focus rounded">Emergency Contacts</a></li> */}
                        <li>
                            <a
                                onClick={logout}
                                className="text-base-content hover:bg-neutral-focus rounded"
                            >
                                Log Out
                            </a>
                        </li>
                    </ul>
                    </div>
                </div>
                <div className="navbar-center">
                    <img src={logo} alt="SafeRun logo" className="w-20" />
                </div>
                <div className="navbar-end">
                    {showPanicButton && sessionId && (
                        <PanicButtonActivePage
                            sessionId = {sessionId}
                            onPanicActivated = {onPanicActivated}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Navbar;