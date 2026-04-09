import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { supabase } from "../lib/supabase";

function IconHome({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8h5Z" />
    </svg>
  );
}

function IconCart({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="9" cy="20" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="18" cy="20" r="1.5" fill="currentColor" stroke="none" />
      <path d="M3 4h2l1.5 10h11L21 7H7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconPackage({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 3 3 8l9 5 9-5-9-5Z" strokeLinejoin="round" />
      <path d="M3 8v8l9 5 9-5V8" strokeLinejoin="round" />
      <path d="M12 13V3" />
    </svg>
  );
}

function IconReceipt({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M7 3h10v18l-2-1-2 1-2-1-2 1-2-1-2 1V3Z" strokeLinejoin="round" />
      <path d="M9 8h6M9 12h6M9 16h4" strokeLinecap="round" />
    </svg>
  );
}

function IconLogout({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h5v-2H5V5h5V3Zm10.71 8.29-3-3-1.42 1.42L17.59 11H9v2h8.59l-1.3 1.29 1.42 1.42 3-3a1 1 0 0 0 0-1.42Z" />
    </svg>
  );
}

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const pathActive = (path) =>
    path === "/" ? location.pathname === "/" : location.pathname === path || location.pathname.startsWith(`${path}/`);

  const logout = async () => {
    await supabase.auth.signOut({ scope: "local" });
    navigate("/login", { replace: true });
  };

  const inactive = "text-[#231f20]/50";
  const activeSide = "text-[#231f20] font-extrabold";

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-stone-200/70 bg-[#fafaf9]/90 backdrop-blur-md dark:border-zinc-800/70 dark:bg-[#0f0f10]/90 px-4 pb-2 pt-3 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-2xl border-2 border-[#231f20] bg-gradient-to-b from-[#fcd577] to-[#fbb03b] shadow-[0_12px_32px_rgba(35,31,32,0.22)]">
          <div className="flex items-center gap-2 px-3 py-3 sm:gap-3 sm:px-4 sm:py-3.5">
            <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
              <img
                src="/bc-logo.png"
                alt=""
                className="h-9 w-9 shrink-0 rounded-full border-2 border-[#231f20] object-cover shadow-sm ring-2 ring-white/40 sm:h-10 sm:w-10"
              />
              <h1
                className="min-w-0 truncate text-base font-extrabold tracking-tight text-[#231f20] sm:text-lg md:text-xl"
                style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}
              >
                Bismillah Chicken Centre
              </h1>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border-2 border-[#231f20] bg-[#231f20] px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm"
            >
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#e6d58c] text-[#231f20]">
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
              <span className="leading-none text-white">{theme === "dark" ? "Light" : "Dark"}</span>
            </button>
          </div>
        </div>
      </header>

      <nav
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-stone-200/60 bg-[#fafaf9]/90 backdrop-blur-md dark:border-zinc-800/60 dark:bg-[#0f0f10]/90 pb-[env(safe-area-inset-bottom,0px)]"
        aria-label="Main navigation"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-t-[1.75rem] border-x-2 border-t-2 border-[#231f20] bg-gradient-to-b from-[#fcd577] to-[#fbb03b] shadow-[0_-12px_32px_rgba(35,31,32,0.22)]">
            <div className="grid grid-cols-5 items-end gap-0 px-1 pb-2 pt-3">
              <NavLink
                to="/"
                className={`flex flex-col items-center gap-1 py-1 ${pathActive("/") ? activeSide : inactive}`}
              >
                <IconHome className="h-6 w-6" />
                <span className="max-w-[4.25rem] text-center text-[8px] font-bold uppercase leading-tight tracking-wide sm:text-[9px]">
                  Dashboard
                </span>
              </NavLink>

              <NavLink
                to="/sales"
                className={`flex flex-col items-center gap-1 py-1 ${pathActive("/sales") ? activeSide : inactive}`}
              >
                <IconCart className="h-6 w-6" />
                <span className="text-center text-[9px] font-bold uppercase tracking-wide">Sales</span>
              </NavLink>

              <div className="flex justify-center pb-1">
                <NavLink
                  to="/buying"
                  className={`-mt-10 flex h-[4.25rem] w-[4.25rem] flex-col items-center justify-center gap-0.5 rounded-full border-2 border-[#231f20] bg-[#231f20] text-[#fbb03b] shadow-[0_10px_28px_rgba(35,31,32,0.4)] ring-4 ring-[#fbb03b]/50 ${
                    pathActive("/buying") ? "ring-[#231f20] ring-offset-2 ring-offset-[#fbb03b]" : ""
                  }`}
                >
                  <IconPackage className="h-7 w-7 text-[#fbb03b]" />
                  <span className="text-[9px] font-extrabold uppercase tracking-[0.1em] text-[#fbb03b]">Buying</span>
                </NavLink>
              </div>

              <NavLink
                to="/expenses"
                className={`flex flex-col items-center gap-1 py-1 ${pathActive("/expenses") ? activeSide : inactive}`}
              >
                <IconReceipt className="h-6 w-6" />
                <span className="max-w-[4.25rem] text-center text-[8px] font-bold uppercase leading-tight tracking-wide sm:text-[9px]">
                  Expenses
                </span>
              </NavLink>

              <button
                type="button"
                onClick={logout}
                className={`flex flex-col items-center gap-1 py-1 ${inactive} hover:text-[#231f20]/80`}
              >
                <IconLogout className="h-6 w-6" />
                <span className="text-center text-[9px] font-bold uppercase tracking-wide">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}

export default Navbar;
