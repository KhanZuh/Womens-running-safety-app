import { useNavigate } from "react-router-dom";

export default function useLogout() {
  const navigate = useNavigate();

  return function logout() {
    localStorage.removeItem("token");
    navigate("/");
  };
}
