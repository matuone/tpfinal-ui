// context/AuthContext.jsx
import { createContext, useState, useEffect, useCallback, useRef } from "react";
import { login, register } from "../services/authService";

export const AuthContext = createContext();

const INACTIVITY_LIMIT_MS = 60 * 60 * 1000; // 60 minutos (igual al TTL del JWT)

const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // { email, token }
  const [loading, setLoading] = useState(false);
  const inactivityTimer = useRef(null);

  const handleLogout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("token");
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
  }, []);

  // Reinicia el temporizador de inactividad con cada interacción del usuario
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(() => {
      handleLogout();
    }, INACTIVITY_LIMIT_MS);
  }, [handleLogout]);

  const handleLogin = async (email, password) => {
    setLoading(true);
    try {
      const data = await login(email, password);
      setUser({ email, token: data.token });
      localStorage.setItem("token", data.token);
      resetInactivityTimer();
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
      resetInactivityTimer();
      return data.message;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Verificar token al montar y escuchar eventos de sesión expirada
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && !isTokenExpired(token)) {
      setUser({ email: null, token });
      resetInactivityTimer();
    } else if (token) {
      // Token guardado pero ya expiró → limpiar
      localStorage.removeItem("token");
    }

    const onSessionExpired = () => handleLogout();
    window.addEventListener("session-expired", onSessionExpired);

    return () => {
      window.removeEventListener("session-expired", onSessionExpired);
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, []);

  // Escuchar actividad del usuario para reiniciar el timer (solo si hay sesión)
  useEffect(() => {
    if (!user) return;
    const events = ["click", "touchstart", "keydown"];
    events.forEach((e) => window.addEventListener(e, resetInactivityTimer));
    return () => {
      events.forEach((e) => window.removeEventListener(e, resetInactivityTimer));
    };
  }, [user, resetInactivityTimer]);

  return (
    <AuthContext.Provider
      value={{ user, loading, handleLogin, handleRegister, handleLogout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
