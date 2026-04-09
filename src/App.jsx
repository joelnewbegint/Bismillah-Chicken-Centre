import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import { Button, Panel } from "./components/ui";
import Buying from "./pages/Buying";
import Dashboard from "./pages/Dashboard";
import Expenses from "./pages/Expenses";
import Login from "./pages/Login";
import Sales from "./pages/Sales";
import Splash from "./pages/Splash";
import { supabase } from "./lib/supabase";

function ProtectedLayout({ session }) {
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}

function App() {
  const [session, setSession] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

  useEffect(() => {
    let mounted = true;

    const getCurrentSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (mounted) {
        setSession(data.session ?? null);
        setIsAuthLoading(false);
      }
    };

    getCurrentSession();

    const { data } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession ?? null);
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowSplash(false), 2200);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  if (showSplash) {
    return <Splash />;
  }

  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Panel className="rounded-[2rem] p-6 text-[#1c1917] dark:border-[#484847]/35 dark:text-[#f8fafc]">
          Checking session...
        </Panel>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Button
        type="button"
        onClick={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
        aria-label="Toggle theme"
        title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        variant="secondary"
        className="fixed right-4 top-4 z-50 border border-[#d6d3d1]/70 bg-white/90 text-[#1c1917] shadow-sm backdrop-blur dark:border-[#484847]/70 dark:bg-[#131313]/90 dark:text-[#f8fafc] dark:hover:bg-[#1a1a1a]"
      >
        <span
          className={`inline-flex h-7 w-7 items-center justify-center rounded-full ${
            theme === "dark" ? "bg-[#fb923c]/20 text-[#fb923c]" : "bg-[#f97316]/15 text-[#ea580c]"
          }`}
        >
          {theme === "dark" ? (
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
              <path d="M6.76 4.84 5.35 3.43 3.93 4.84l1.41 1.42 1.42-1.42Zm10.49 0 1.41-1.41 1.41 1.41-1.41 1.42-1.41-1.42ZM12 4V1h-1v3h1Zm0 19v-3h-1v3h1Zm8-11h3v-1h-3v1ZM4 12H1v-1h3v1Zm13.66 6.66 1.41 1.41 1.41-1.41-1.41-1.41-1.41 1.41ZM5.34 17.25l-1.41 1.41 1.41 1.41 1.41-1.41-1.41-1.41ZM12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12Z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
              <path d="M20.742 13.045a8.088 8.088 0 0 1-9.787-9.787A9 9 0 1 0 20.742 13.045Z" />
            </svg>
          )}
        </span>
        <span>{theme === "dark" ? "Light" : "Dark"}</span>
      </Button>
      <Routes>
        <Route path="/login" element={session ? <Navigate to="/" replace /> : <Login />} />
        <Route element={<ProtectedLayout session={session} />}>
          <Route index element={<Dashboard />} />
          <Route path="buying" element={<Buying />} />
          <Route path="sales" element={<Sales />} />
          <Route path="expenses" element={<Expenses />} />
        </Route>
        <Route path="*" element={<Navigate to={session ? "/" : "/login"} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
