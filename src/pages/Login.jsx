import { useEffect, useState } from "react";
import { Badge, Button, Panel } from "../components/ui";
import { useTheme } from "../context/ThemeContext";
import { supabase } from "../lib/supabase";

function Login() {
  const { theme, toggleTheme } = useTheme();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loadingAction, setLoadingAction] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [signupCooldownUntil, setSignupCooldownUntil] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const isLoading = loadingAction !== "";
  const isSignupCooldown = currentTime < signupCooldownUntil;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentTime(Date.now());
    const timer = window.setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoadingAction("signin");
    setError("");
    setSuccess("");
    const email = form.email.trim();
    const password = form.password;
    const isValidEmail = validateEmail(email);

    if (!isValidEmail) {
      setError("Please enter a valid email address.");
      setLoadingAction("");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoadingAction("");
      return;
    }

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      const isInvalidCreds = /invalid login credentials/i.test(authError.message || "");
      setError(
        isInvalidCreds
          ? "Invalid credentials. Click Sign Up first, then Sign In."
          : authError.message,
      );
    }

    setLoadingAction("");
  };

  const onSignUp = async () => {
    if (isSignupCooldown) {
      const remaining = Math.ceil((signupCooldownUntil - currentTime) / 1000);
      setError(`Please wait ${remaining}s before trying Sign Up again.`);
      return;
    }

    setLoadingAction("signup");
    setError("");
    setSuccess("");
    const email = form.email.trim();
    const password = form.password;
    const isValidEmail = validateEmail(email);

    if (!isValidEmail) {
      setError("Please enter a valid email address.");
      setLoadingAction("");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoadingAction("");
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });

    if (signUpError) {
      const msg = signUpError.message || "Sign up failed.";
      if (/rate limit/i.test(msg)) {
        // Common case: user already exists; fallback to direct sign-in.
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (!signInError) {
          setSuccess("Account already exists. Logged in successfully.");
        } else {
          setSignupCooldownUntil(Date.now() + 30000);
          setError("Too many signup attempts. Please wait 30s, then use Sign In.");
        }
      } else {
        setError(msg);
      }
    } else {
      if (data?.session) {
        setSuccess("Sign up successful. You are logged in.");
      } else {
        setSuccess("Sign up successful. If email confirmation is enabled, verify your email before logging in.");
      }
    }

    setLoadingAction("");
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        className="absolute right-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full border border-[#d6d3d1] bg-white/95 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wide text-[#1c1917] shadow-sm dark:border-[#484847] dark:bg-[#1a1a1a]/95 dark:text-[#f8fafc]"
      >
        <span
          className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${
            theme === "dark" ? "bg-[#fb923c]/20 text-[#fb923c]" : "bg-[#f97316]/15 text-[#ea580c]"
          }`}
        >
          {theme === "dark" ? (
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden>
              <path d="M6.76 4.84 5.35 3.43 3.93 4.84l1.41 1.42 1.42-1.42Zm10.49 0 1.41-1.41 1.41 1.41-1.41 1.42-1.41-1.42ZM12 4V1h-1v3h1Zm0 19v-3h-1v3h1Zm8-11h3v-1h-3v1ZM4 12H1v-1h3v1Zm13.66 6.66 1.41 1.41 1.41-1.41-1.41-1.41-1.41 1.41ZM5.34 17.25l-1.41 1.41 1.41 1.41 1.41-1.41-1.41-1.41ZM12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12Z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden>
              <path d="M20.742 13.045a8.088 8.088 0 0 1-9.787-9.787A9 9 0 1 0 20.742 13.045Z" />
            </svg>
          )}
        </span>
        {theme === "dark" ? "Light" : "Dark"}
      </button>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(249,115,22,0.14),transparent_45%),radial-gradient(circle_at_bottom_left,_rgba(249,115,22,0.10),transparent_50%)]" />
      <Panel className="relative w-full max-w-md p-6 shadow-2xl">
        <div className="mb-5 flex items-center gap-3">
          <img src="/bc-logo.png" alt="Bismillah Chicken Centre logo" className="h-14 w-14 rounded-full object-cover ring-2 ring-[#f97316]/30" />
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[#57534e]">Bismillah Chicken Centre</p>
            <h1 className="text-2xl font-extrabold text-[#1c1917]">Operations Portal</h1>
          </div>
        </div>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <input
            type="email"
            required
            placeholder="Email"
            className="w-full rounded-full border border-[#d6d3d1] bg-white px-4 py-3 text-[#1c1917] placeholder:text-[#78716c] focus:border-[#f97316] focus:outline-none"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
          />
          <div className="space-y-2">
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              placeholder="Password"
              className="w-full rounded-full border border-[#d6d3d1] bg-white px-4 py-3 text-[#1c1917] placeholder:text-[#78716c] focus:border-[#f97316] focus:outline-none"
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="text-sm font-medium text-[#57534e] hover:text-[#f97316]"
            >
              {showPassword ? "Hide password" : "Show password"}
            </button>
          </div>

          {error ? <Badge variant="danger">{error}</Badge> : null}
          {success ? <Badge variant="success">{success}</Badge> : null}

          <Button type="submit" variant="primary" disabled={isLoading} className="w-full disabled:cursor-not-allowed disabled:opacity-70">
            {loadingAction === "signin" ? "Signing in..." : "Sign In"}
          </Button>

          <Button
            type="button"
            variant="muted"
            onClick={onSignUp}
            disabled={isLoading || isSignupCooldown}
            className="w-full disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loadingAction === "signup" ? "Creating account..." : "Sign Up"}
          </Button>
        </form>
      </Panel>
    </div>
  );
}

export default Login;
