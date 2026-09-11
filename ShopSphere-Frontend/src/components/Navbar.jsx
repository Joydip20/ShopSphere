import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar({ cartItemCount = 0 }) {
  const { user, logout } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  /*
   * ============================
   * LOGOUT
   * ============================
   */

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    navigate("/login");
  };

  /*
   * ============================
   * SEARCH
   * ============================
   */

  const handleSearchSubmit = (e) => {
    e.preventDefault();

    const trimmedSearch = searchQuery.trim();

    if (!trimmedSearch) {
      return;
    }

    navigate(
      `/products?search=${encodeURIComponent(trimmedSearch)}#products-section`,
    );

    setSearchQuery("");
    setIsMobileMenuOpen(false);
  };

  /*
   * ============================
   * ACTIVE LINK
   * ============================
   */

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 shadow-sm backdrop-blur-md transition-all duration-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* =================================
              LOGO
          ================================= */}

          <Link to="/" className="group flex shrink-0 items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-xl font-extrabold text-white shadow-md shadow-blue-500/20 transition-transform duration-200 group-hover:scale-105">
              S
            </div>

            <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-blue-600 bg-clip-text text-xl font-bold text-transparent">
              ShopSphere
            </span>
          </Link>

          {/* =================================
              DESKTOP SEARCH
          ================================= */}

          <form
            onSubmit={handleSearchSubmit}
            className="mx-4 hidden max-w-md flex-1 md:flex"
          >
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search products, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm transition-all duration-200 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
              />

              {/* Search Icon */}

              <svg
                className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </form>

          {/* =================================
              DESKTOP NAVIGATION
          ================================= */}

          <div className="hidden items-center gap-6 md:flex">
            {/* Products */}

            <Link
              to="/products"
              className={`text-sm font-medium transition-colors duration-150 ${
                isActive("/products")
                  ? "font-semibold text-blue-600"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              Products
            </Link>

            {/* Logged In Navigation */}

            {user && (
              <>
                {/* Orders */}

                <Link
                  to="/orders"
                  className={`text-sm font-medium transition-colors duration-150 ${
                    isActive("/orders")
                      ? "font-semibold text-blue-600"
                      : "text-gray-600 hover:text-blue-600"
                  }`}
                >
                  Orders
                </Link>

                {/* Admin */}

                {user.role === "ADMIN" && (
                  <Link
                    to="/admin"
                    className="inline-flex items-center gap-1 rounded-md border border-purple-200 bg-purple-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-purple-700 transition hover:bg-purple-100"
                  >
                    <span>Admin Hub</span>
                  </Link>
                )}
              </>
            )}
          </div>

          {/* =================================
              DESKTOP ACTIONS
          ================================= */}

          <div className="hidden items-center gap-4 md:flex">
            {/* Cart */}

            {user && (
              <Link
                to="/cart"
                className="relative rounded-full p-2 text-gray-600 transition duration-150 hover:bg-gray-50 hover:text-blue-600"
                aria-label="View Cart"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>

                {cartItemCount > 0 && (
                  <span className="absolute right-0 top-0 inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white shadow-sm ring-2 ring-white">
                    {cartItemCount}
                  </span>
                )}
              </Link>
            )}

            {/* =================================
                AUTH BUTTONS
            ================================= */}

            {!user ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 transition hover:text-blue-600"
                >
                  Log in
                </Link>

                <Link
                  to="/register"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition duration-150 hover:bg-blue-700 hover:shadow active:bg-blue-800"
                >
                  Sign up
                </Link>
              </div>
            ) : (
              /* =================================
                 LOGGED IN PROFILE
              ================================= */

              <div className="flex items-center gap-3 border-l border-gray-200 pl-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-blue-200 bg-blue-100 text-sm font-bold text-blue-700">
                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>

                  <span className="max-w-[120px] truncate text-sm font-medium text-gray-800">
                    {user.name}
                  </span>
                </div>

                {/* Logout */}

                <button
                  onClick={handleLogout}
                  className="rounded-lg p-2 text-gray-400 transition duration-150 hover:bg-red-50 hover:text-red-600"
                  title="Logout"
                  aria-label="Logout"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* =================================
              MOBILE ACTIONS
          ================================= */}

          <div className="flex items-center gap-2 md:hidden">
            {/* Mobile Cart */}

            {user && (
              <Link
                to="/cart"
                className="relative p-2 text-gray-600"
                aria-label="View Cart"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>

                {cartItemCount > 0 && (
                  <span className="absolute right-0 top-0 inline-flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                    {cartItemCount}
                  </span>
                )}
              </Link>
            )}

            {/* Mobile Menu */}

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Toggle menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* =================================
          MOBILE DRAWER
      ================================= */}

      {isMobileMenuOpen && (
        <div className="space-y-4 border-t border-gray-100 bg-white px-4 pb-6 pt-3 shadow-lg md:hidden">
          {/* Mobile Search */}

          <form onSubmit={handleSearchSubmit} className="pt-1">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </form>

          {/* Navigation */}

          <div className="flex flex-col space-y-2">
            <Link
              to="/products"
              onClick={() => setIsMobileMenuOpen(false)}
              className="rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
            >
              Products
            </Link>

            {user && (
              <>
                <Link
                  to="/orders"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
                >
                  Orders
                </Link>

                {user.role === "ADMIN" && (
                  <Link
                    to="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="rounded-md bg-purple-50 px-3 py-2 text-base font-medium text-purple-700"
                  >
                    Admin Hub
                  </Link>
                )}
              </>
            )}
          </div>

          {/* User / Authentication */}

          <div className="border-t border-gray-100 pt-4">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 px-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>

                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      {user.name}
                    </div>

                    <div className="text-xs text-gray-500">{user.email}</div>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full rounded-md px-3 py-2 text-left text-base font-medium text-red-600 transition hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full rounded-lg bg-gray-100 py-2 text-center text-sm font-medium text-gray-700 transition hover:bg-gray-200"
                >
                  Log in
                </Link>

                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full rounded-lg bg-blue-600 py-2 text-center text-sm font-medium text-white transition hover:bg-blue-700"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
