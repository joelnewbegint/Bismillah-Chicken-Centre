import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

function Navbar() {
  const navigate = useNavigate();

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  };

  const linkClass = ({ isActive }) =>
    `rounded-full px-3 py-2 text-sm font-semibold transition ${
      isActive ? "bg-[#f97316]/15 text-[#f97316]" : "text-[#57534e] hover:bg-[#f5f5f4] hover:text-[#1c1917]"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-[#d6d3d1]/35 bg-white/80 backdrop-blur-xl dark:bg-[#121212]/80">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <img src="/bc-logo.png" alt="Bismillah Chicken Centre logo" className="h-12 w-12 rounded-full object-cover" />
          <div>
            <p className="text-xs uppercase tracking-wide text-[#57534e]">Chicken Shop Management</p>
            <h1 className="flex items-center gap-2 text-lg font-semibold text-[#1c1917]">
              Bismillah Chicken Centre
              <span className="rounded-full bg-[#f97316]/12 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#c2410c]">
                Pro
              </span>
            </h1>
          </div>
        </div>

        <nav className="flex items-center gap-2">
          <NavLink to="/" className={linkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/sales" className={linkClass}>
            Sales
          </NavLink>
          <NavLink to="/buying" className={linkClass}>
            Buying
          </NavLink>
          <NavLink to="/expenses" className={linkClass}>
            Expenses
          </NavLink>
          <button
            type="button"
            onClick={logout}
            className="btn btn-primary"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden="true">
              <path d="M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h5v-2H5V5h5V3Zm10.71 8.29-3-3-1.42 1.42L17.59 11H9v2h8.59l-1.3 1.29 1.42 1.42 3-3a1 1 0 0 0 0-1.42Z" />
            </svg>
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
