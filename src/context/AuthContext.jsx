// context/AuthContext.jsx
import { createContext, useState, useEffect } from "react";
import { login, register } from "../services/authService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // { email, token }
  const [loading, setLoading] = useState(false);

  const handleLogin = async (email, password) => {
    setLoading(true);
    try {
      const data = await login(email, password);
      setUser({ email, token: data.token });
      localStorage.setItem("token", data.token);
      return data.message;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (email, password) => {
    setLoading(true);
    try {
      const data = await register(email, password);
      setUser({ email, token: data.token });
      localStorage.setItem("token", data.token);
      return data.message;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("token");
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // Podrías validar el token en el backend
      setUser({ email: null, token });
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, handleLogin, handleRegister, handleLogout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
