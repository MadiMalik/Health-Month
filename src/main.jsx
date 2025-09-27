import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";

// Ensure a sessionId exists for this browser session (persisted in localStorage)
const SESSION_KEY = "health_month_session_id";
let sessionId = localStorage.getItem(SESSION_KEY);
if (!sessionId) {
  const fallback = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
  const gen = (window.crypto && typeof window.crypto.randomUUID === "function")
    ? window.crypto.randomUUID()
    : fallback();
  sessionId = gen;
  localStorage.setItem(SESSION_KEY, sessionId);
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);