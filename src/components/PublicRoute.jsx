
// components/PublicRoute.jsx
import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const PublicRoute = ({ children }) => {
  const { user } = useContext(AuthContext);

  // Si ya hay token, redirigir al home
  if (user && user.token) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default PublicRoute;
