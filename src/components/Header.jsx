import React, { useState, useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import logo from "../assets/logo.png";
import UserDropdown from "./UserMenu/UserDropdown";

/**
 * Component Header - Header/Navbar chính cho toàn bộ website
 * 
 * Chức năng:
 * - Hiển thị logo và tên website
 * - Navigation menu với dropdown cho "Danh sách"
 * - Hiển thị buttons khác nhau tùy trạng thái login:
 *   + Chưa login: "Đăng nhập", "Đăng ký", "Đăng bài" (disabled)
 *   + Đã login: UserDropdown, "Đăng bài", "Đăng xuất"
 * - Sticky header (luôn ở top khi scroll)
 * - Responsive với mobile menu button
 * 
 * State:
 * - user: Thông tin user từ localStorage
 * - showListingDropdown: Hiển thị/ẩn dropdown "Danh sách"
 * 
 * Events:
 * - Lắng nghe "userLogin" và "userLogout" events từ window
 * - Tự động cập nhật UI khi user login/logout
 */
const Header = () => {
  const navigate = useNavigate();
  
  // ============ STATE MANAGEMENT ============
  const [user, setUser] = useState(null); // Thông tin user đã login
  const [showListingDropdown, setShowListingDropdown] = useState(false); // Show/hide dropdown

  // ============ EFFECTS ============
  
  /**
   * useEffect: Khởi tạo user từ localStorage và lắng nghe login/logout events
   * - Chạy 1 lần khi component mount
   * - Setup event listeners cho userLogin và userLogout
   * - Cleanup listeners khi component unmount
   */
  useEffect(() => {
    // Kiểm tra xem user đã login chưa (từ localStorage)
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Handler để cập nhật user state khi có login/logout event
    const handleLogin = () => {
      const userData = localStorage.getItem("user");
      if (userData) {
        setUser(JSON.parse(userData));
      }
    };

    // Đăng ký event listeners
    window.addEventListener("userLogin", handleLogin);
    window.addEventListener("userLogout", handleLogin);

    // Cleanup: Remove listeners khi component unmount
    return () => {
      window.removeEventListener("userLogin", handleLogin);
      window.removeEventListener("userLogout", handleLogin);
    };
  }, []);

  // ============ HANDLERS ============
  
  /**
   * Hàm xử lý đăng xuất
   * - Xóa user data và token từ localStorage
   * - Reset user state về null
   * - Dispatch userLogout event để các components khác biết
   * - Navigate về trang chủ
   */
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    setUser(null);
    window.dispatchEvent(new Event("userLogout"));
    navigate("/");
  };

  // ============ RENDER UI ============
  return (
    // Sticky header với backdrop blur effect
    <header className="bg-white/90 backdrop-blur border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* ===== LEFT: Logo + Tên website ===== */}
          <div className="flex items-center gap-2">
            <img src={logo} alt="EVPowerup" className="h-10 w-10" />
            <span className="text-xl font-bold tracking-tight text-gray-900">
              EVPowerup
            </span>
          </div>

          {/* ===== CENTER: Navigation Menu (chỉ hiện trên desktop) ===== */}
          {/* hidden lg:flex = ẩn trên mobile, hiện từ lg breakpoint trở lên */}
          <nav className="hidden lg:flex items-center gap-6">
            
            {/* Nav Item: Trang chủ */}
            {/* NavLink tự động thêm/xóa class dựa trên isActive */}
            {/* prop "end" = chỉ active khi match exact path */}
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

            {/* ===== Dropdown: Danh sách (Xe/Pin) ===== */}
            {/* onMouseEnter/Leave để show/hide dropdown khi hover */}
            <div
              className="relative group"
              onMouseEnter={() => setShowListingDropdown(true)}
              onMouseLeave={() => setShowListingDropdown(false)}
            >
              {/* Button trigger dropdown với chevron icon */}
              <button className="px-1.5 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors flex items-center gap-1">
                Danh sách
                {/* Chevron icon - rotate 180deg khi dropdown open */}
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

              {/* Dropdown Menu - conditional rendering */}
              {showListingDropdown && (
                <div className="absolute top-full left-0 pt-2 z-50">
                  <div className="w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1">
                    
                    {/* Menu Item: Danh sách xe */}
                    <NavLink
                      to="/cars"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      onClick={() => setShowListingDropdown(false)}
                    >
                      Danh sách xe
                    </NavLink>
                    
                    {/* Menu Item: Danh sách pin */}
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

            {/* Nav Item: Tin tức (đã comment out - không dùng) */}
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
            
            {/* Nav Item: Giới thiệu */}
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
            
            {/* Nav Item: Liên hệ */}
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
            
            {/* Nav Item: Yêu cầu mua hàng (đã comment out - không dùng) */}
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

          {/* ===== RIGHT: User Actions (Login/Logout Buttons) ===== */}
          <div className="flex items-center gap-3">
            
            {/* Actions container - ẩn trên mobile, hiện từ md breakpoint */}
            <div className="hidden md:flex items-center gap-3">
              
              {/* ===== TRƯỜNG HỢP 1: User đã login ===== */}
              {user ? (
                <>
                  {/* UserDropdown - hiển thị avatar và dropdown menu */}
                  <UserDropdown username={user.username} />
                  
                  {/* Button: Đăng bài (enabled) */}
                  <button
                    onClick={() => navigate("/chooselisting")}
                    className="px-4 py-2 rounded-md text-sm font-medium bg-gray-900 text-white hover:bg-gray-800"
                  >
                    Đăng bài
                  </button>
                  
                  {/* Button: Đăng xuất */}
                  <button
                    onClick={handleLogout}
                    className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    Đăng xuất
                  </button>
                </>
              ) : (
                /* ===== TRƯỜNG HỢP 2: User chưa login ===== */
                <>
                  {/* Button: Đăng nhập */}
                  <button
                    onClick={() => navigate("/login")}
                    className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    Đăng nhập
                  </button>
                  
                  {/* Button: Đăng ký */}
                  <button
                    onClick={() => navigate("/register")}
                    className="px-4 py-2 rounded-md text-sm font-medium bg-gray-900 text-white hover:bg-gray-800"
                  >
                    Đăng ký
                  </button>
                  
                  {/* Button: Đăng bài (disabled khi chưa login) */}
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

            {/* ===== MOBILE MENU BUTTON (chưa implement chức năng) ===== */}
            {/* Chỉ hiện trên mobile (lg:hidden) */}
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
