import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo */}
          <div className="flex items-center">
            <img src={logo} alt="EVPowerup" className="h-20 w-20 ml-3" />
            <span className="ml-1 text-xl font-bold text-gray-900">
              EVPowerup
            </span>
          </div>

          {/* Center - Navigation (Desktop only) */}
          <nav className="hidden lg:flex space-x-8">
            <a
              href="/"
              className="text-gray-900 hover:text-gray-600 px-3 py-2 text-sm font-medium transition-colors"
            >
              Trang chủ
            </a>
            <a
              href="/cars"
              className="text-gray-900 hover:text-gray-600 px-3 py-2 text-sm font-medium transition-colors"
            >
              Danh sách xe
            </a>
            <a
              href="/news"
              className="text-gray-900 hover:text-gray-600 px-3 py-2 text-sm font-medium transition-colors"
            >
              Tin tức
            </a>
            <a
              href="/about"
              className="text-gray-900 hover:text-gray-600 px-3 py-2 text-sm font-medium transition-colors"
            >
              Giới thiệu
            </a>
            <a
              href="/contact"
              className="text-gray-900 hover:text-gray-600 px-3 py-2 text-sm font-medium transition-colors"
            >
              Liên hệ
            </a>
          </nav>

          {/* Right side - User Actions and Mobile Menu */}
          <div className="flex items-center space-x-4">
            {/* Desktop User Actions */}
            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={() => navigate("/login")}
                className="text-gray-900 hover:text-gray-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                Đăng nhập
              </button>
              <button
                onClick={() => navigate("/register")}
                className="bg-gray-900 text-white hover:bg-gray-800 px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Đăng ký
              </button>
              <button
                onClick={() => navigate("/chooselisting")}
                className="bg-gray-900 text-white hover:bg-gray-800 px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Đăng bài
              </button>
            </div>

            {/* Mobile menu button */}
            <button className="lg:hidden text-gray-900 hover:text-gray-600 p-2">
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