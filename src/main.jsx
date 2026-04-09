import { Component, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

class RootErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error("App crashed at root:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="w-full max-w-lg rounded-3xl border border-[#fecaca] bg-[#fff1f2] p-6 text-[#9f1239]">
            <h1 className="text-xl font-bold">Something went wrong</h1>
            <p className="mt-2 text-sm">
              The app hit a runtime error. Please hard refresh the page (Ctrl+Shift+R). If it continues, sign out and
              sign in again.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    if (import.meta.env.PROD) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Service worker registration is optional for failures.
      });
      return;
    }

    // Avoid stale cached assets during local development.
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => registration.unregister());
    });
  });
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  </StrictMode>,
);
