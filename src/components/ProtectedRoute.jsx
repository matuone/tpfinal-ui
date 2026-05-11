// components/PrivateRoute.jsx
import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const PrivateRoute = ({ children }) => {
  const { user } = useContext(AuthContext);

  // Si no hay token, redirigir al login
  if (!user || !user.token) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;