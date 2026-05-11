import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RuteandoApp } from "./App.jsx";
import { PlacesProvider } from "./context/PlacesContext.jsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Auth } from "./views/Auth.jsx";
import { Support } from "./views/Support.jsx";
import "./styles/index.css";
import { AuthProvider } from "./context/AuthContext.jsx";
import PrivateRoute from "./components/ProtectedRoute.jsx";
import PublicRoute from "./components/PublicRoute.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <PlacesProvider>
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                <PublicRoute>
                  <Auth />
                </PublicRoute>
              }
            />
            <Route
              path="/home"
              element={
                <PrivateRoute>
                  <RuteandoApp />
                </PrivateRoute>
              }
            />
            <Route
              path="/support"
              element={
                <PrivateRoute>
                  <Support />
                </PrivateRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </PlacesProvider>
    </AuthProvider>
  </StrictMode>
);
