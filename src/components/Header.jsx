import React, { useState, useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import logo from "../assets/logo.png";
import UserDropdown from "./UserMenu/UserDropdown";

const Header = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showListingDropdown, setShowListingDropdown] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Listen for login events
    const handleLogin = () => {
      const userData = localStorage.getItem("user");
      if (userData) {
        setUser(JSON.parse(userData));
      }
    };

    window.addEventListener("userLogin", handleLogin);
    window.addEventListener("userLogout", handleLogin);

    return () => {
      window.removeEventListener("userLogin", handleLogin);
      window.removeEventListener("userLogout", handleLogin);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    setUser(null);
    window.dispatchEvent(new Event("userLogout"));
    navigate("/");
  };

  return (
    <header className="bg-white/90 backdrop-blur border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo */}
          <div className="flex items-center gap-2">
            <img src={logo} alt="EVPowerup" className="h-10 w-10" />
            <span className="text-xl font-bold tracking-tight text-gray-900">
              EVPowerup
            </span>
          </div>

          {/* Center: Nav (desktop) */}
          <nav className="hidden lg:flex items-center gap-6">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `px-1.5 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "text-gray-900"
                    : "text-gray-700 hover:text-gray-900"
                }`
              }
              end
            >
              Trang chủ
            </NavLink>

            {/* Dropdown Danh sách */}
            <div
              className="relative group"
              onMouseEnter={() => setShowListingDropdown(true)}
              onMouseLeave={() => setShowListingDropdown(false)}
            >
              <button className="px-1.5 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors flex items-center gap-1">
                Danh sách
                <svg
                  className={`w-4 h-4 transition-transform ${
                    showListingDropdown ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {showListingDropdown && (
                <div className="absolute top-full left-0 pt-2 z-50">
                  <div className="w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1">
                    <NavLink
                      to="/cars"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      onClick={() => setShowListingDropdown(false)}
                    >
                      Danh sách xe
                    </NavLink>
                    <NavLink
                      to="/batteries"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      onClick={() => setShowListingDropdown(false)}
                    >
                      Danh sách pin
                    </NavLink>
                  </div>
                </div>
              )}
            </div>

            {/* <NavLink
              to="/news"
              className={({ isActive }) =>
                `px-1.5 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "text-gray-900"
                    : "text-gray-700 hover:text-gray-900"
                }`
              }
            >
              Tin tức
            </NavLink> */}
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `px-1.5 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "text-gray-900"
                    : "text-gray-700 hover:text-gray-900"
                }`
              }
            >
              Giới thiệu
            </NavLink>
            <NavLink
              to="/contact"
              className={({ isActive }) =>
                `px-1.5 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "text-gray-900"
                    : "text-gray-700 hover:text-gray-900"
                }`
              }
            >
              Liên hệ
            </NavLink>
            {/* {user && (
              <NavLink
                to="/buy-requests"
                className={({ isActive }) =>
                  `px-2 py-2 rounded-md text-sm font-semibold transition-colors ${isActive ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-100"}`
                }
              >
                Yêu cầu mua hàng
              </NavLink>
            )} */}
          </nav>

          {/* Right: User actions */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <>
                  <UserDropdown username={user.username} />
                  <button
                    onClick={() => navigate("/chooselisting")}
                    className="px-4 py-2 rounded-md text-sm font-medium bg-gray-900 text-white hover:bg-gray-800"
                  >
                    Đăng bài
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    Đăng xuất
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => navigate("/login")}
                    className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    Đăng nhập
                  </button>
                  <button
                    onClick={() => navigate("/register")}
                    className="px-4 py-2 rounded-md text-sm font-medium bg-gray-900 text-white hover:bg-gray-800"
                  >
                    Đăng ký
                  </button>
                  <button
                    disabled
                    title="Vui lòng đăng nhập để đăng bài"
                    className="px-4 py-2 rounded-md text-sm font-medium bg-gray-300 text-white opacity-60 cursor-not-allowed"
                  >
                    Đăng bài
                  </button>
                </>
              )}
            </div>

            {/* Mobile menu button (non-functional placeholder) */}
            <button className="lg:hidden text-gray-700 hover:text-gray-900 p-2">
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
