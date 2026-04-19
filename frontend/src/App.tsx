import { useState, useEffect } from "react";
import { Routes, Route, Link, useLocation, Navigate, Outlet } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Register from "./pages/Register";
import DeviceDetail from "./pages/DeviceDetail";
import Search from "./pages/Search";
import Login from "./pages/Login";
import ChangePassword from "./pages/ChangePassword";
import Settings from "./pages/Settings";
import Spinner from "./components/Spinner";
import { isAuthenticated, mustChangePassword, validateToken, logout, getCurrentDisplayName } from "./api/client";

const navLinks = [
  { to: "/", label: "Dashboard" },
  { to: "/register", label: "Register Device" },
  { to: "/search", label: "Search" },
  { to: "/settings", label: "Settings" },
];

function RequireAuth() {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  if (mustChangePassword()) {
    return <Navigate to="/change-password" replace />;
  }
  return <Outlet />;
}

export default function App() {
  const location = useLocation();
  const [authChecked, setAuthChecked] = useState(false);
  const [validAuth, setValidAuth] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      setAuthChecked(true);
      setValidAuth(false);
      return;
    }
    validateToken().then((ok) => {
      setValidAuth(ok);
      setAuthChecked(true);
    });
  }, []);

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const isLoginPage = location.pathname === "/login";
  const isChangePasswordPage = location.pathname === "/change-password";

  if (!validAuth && !isLoginPage) {
    return (
      <Routes>
        <Route path="/login" element={<Login onLoginSuccess={() => { setValidAuth(true); setAuthChecked(true); }} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  if (isLoginPage) {
    return (
      <Routes>
        <Route path="/login" element={<Login onLoginSuccess={() => { setValidAuth(true); setAuthChecked(true); }} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  if (isChangePasswordPage) {
    if (!isAuthenticated()) {
      return <Navigate to="/login" replace />;
    }
    return (
      <Routes>
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="*" element={<Navigate to="/change-password" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route element={<RequireAuth />}>
        <Route
          path="/*"
          element={
            <div className="min-h-screen dashboard-page">
              <nav className="bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-6">
                      <Link to="/" className="text-xl font-bold text-indigo-600">
                        UPAI—EGO
                      </Link>
                      <div className="flex gap-1">
                        {navLinks.map((link) => (
                          <Link
                            key={link.to}
                            to={link.to}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              location.pathname === link.to
                                ? "bg-indigo-100 text-indigo-700"
                                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                            }`}
                          >
                            {link.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-500">
                        {getCurrentDisplayName() || "User"}
                      </span>
                      <button
                        onClick={() => { logout(); setValidAuth(false); }}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </nav>

              <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/devices/:id" element={<DeviceDetail />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
              </main>
            </div>
          }
        />
      </Route>
    </Routes>
  );
}
