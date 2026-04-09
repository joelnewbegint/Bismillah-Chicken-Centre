import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import { ThemeProvider } from "./context/ThemeContext";
import { Panel } from "./components/ui";
import Buying from "./pages/Buying";
import Dashboard from "./pages/Dashboard";
import Expenses from "./pages/Expenses";
import Login from "./pages/Login";
import Sales from "./pages/Sales";
import Splash from "./pages/Splash";
import { isSupabaseUsingFallbackConfig, supabase } from "./lib/supabase";

function ProtectedLayout({ session }) {
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 pb-28 pt-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}

function AppRoot() {
  const [session, setSession] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [dismissFallbackBanner, setDismissFallbackBanner] = useState(false);
  const showConfigBanner = isSupabaseUsingFallbackConfig && !dismissFallbackBanner;

  useEffect(() => {
    let mounted = true;

    const getCurrentSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        await supabase.auth.signOut({ scope: "local" });
        if (mounted) {
          setSession(null);
          setIsAuthLoading(false);
        }
        return;
      }

      const existing = data.session;
      if (!existing) {
        if (mounted) {
          setSession(null);
          setIsAuthLoading(false);
        }
        return;
      }

      const nowSec = Math.floor(Date.now() / 1000);
      const exp = existing.expires_at;
      const needsRefresh = exp != null && exp <= nowSec + 120;

      if (needsRefresh) {
        const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError || !refreshed.session) {
          await supabase.auth.signOut({ scope: "local" });
          if (mounted) {
            setSession(null);
            setIsAuthLoading(false);
          }
          return;
        }
        if (mounted) {
          setSession(refreshed.session);
          setIsAuthLoading(false);
        }
        return;
      }

      if (mounted) {
        setSession(existing);
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
    if (!isAuthLoading) return;
    const timer = window.setTimeout(() => setIsAuthLoading(false), 8000);
    return () => window.clearTimeout(timer);
  }, [isAuthLoading]);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowSplash(false), 2200);
    return () => window.clearTimeout(timer);
  }, []);

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
      {showConfigBanner ? (
        <div
          role="alert"
          className="border-b border-amber-300/90 bg-amber-50 px-4 py-2.5 text-sm text-amber-950 dark:border-amber-700/50 dark:bg-amber-950/50 dark:text-amber-50"
        >
          <div className="mx-auto flex max-w-6xl items-start justify-between gap-4 sm:items-center">
            <p className="min-w-0 leading-snug">
              <span className="font-semibold">Supabase:</span> Using bundled fallback URL and anon key. For your own
              project, add{" "}
              <code className="rounded bg-amber-200/80 px-1 font-mono text-xs dark:bg-amber-900/80">
                VITE_SUPABASE_URL
              </code>{" "}
              and{" "}
              <code className="rounded bg-amber-200/80 px-1 font-mono text-xs dark:bg-amber-900/80">
                VITE_SUPABASE_ANON_KEY
              </code>{" "}
              to <code className="rounded bg-amber-200/80 px-1 font-mono text-xs dark:bg-amber-900/80">.env</code> (see{" "}
              <code className="rounded bg-amber-200/80 px-1 font-mono text-xs dark:bg-amber-900/80">.env.example</code>
              ).
            </p>
            <button
              type="button"
              onClick={() => setDismissFallbackBanner(true)}
              className="shrink-0 rounded-full border border-amber-400/80 bg-white px-3 py-1 text-xs font-semibold text-amber-900 hover:bg-amber-100 dark:border-amber-600 dark:bg-amber-900/60 dark:text-amber-100 dark:hover:bg-amber-800/80"
            >
              Dismiss
            </button>
          </div>
        </div>
      ) : null}
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

export default function App() {
  return (
    <ThemeProvider>
      <AppRoot />
    </ThemeProvider>
  );
}
