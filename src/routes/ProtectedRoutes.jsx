
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ProtectedRoutes = ({ roles, children }) => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/');
    }
  }, [token, navigate]);

  if (!token) {
    return null; // atau loading spinner
  }

  return children;
};

export default ProtectedRoutes;
