import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import UserDropdown from "../UserMenu/UserDropdown";

// Admin-only header: logo + search bar + account info
const AdminHeader = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData));

    const updateUser = () => {
      const data = localStorage.getItem("user");
      setUser(data ? JSON.parse(data) : null);
    };
    window.addEventListener("userLogin", updateUser);
    window.addEventListener("userLogout", updateUser);
    return () => {
      window.removeEventListener("userLogin", updateUser);
      window.removeEventListener("userLogout", updateUser);
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
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => navigate("/admin")}
          className="flex items-center gap-2"
        >
          <img src={logo} alt="EVPowerup" className="h-10 w-10" />
          <span className="text-lg font-bold text-gray-900">EVPowerup Admin</span>
        </button>

        {/* Search */}
        <div className="flex-1 max-w-xl mx-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
            <svg
              className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 103.5 3.5a7.5 7.5 0 0013.15 13.15z"
              />
            </svg>
          </div>
        </div>

        {/* Account info */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <UserDropdown username={user.username} />
              <button
                onClick={handleLogout}
                className="text-gray-900 hover:text-gray-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="text-gray-900 hover:text-gray-600 px-3 py-2 text-sm font-medium transition-colors"
            >
              Đăng nhập
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
