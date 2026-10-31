export const API_URL =
  import.meta.env.VITE_API_URL ||
  (typeof window !== "undefined" && window.location.origin.includes("5173")
    ? "http://localhost:5000"
    : "https://taskflow-ai-jom0.onrender.com");

export const WS_URL =
  import.meta.env.VITE_WS_URL ||
  (typeof window !== "undefined" && window.location.origin.includes("5173")
    ? "http://localhost:5000"
    : "https://taskflow-ai-jom0.onrender.com");
