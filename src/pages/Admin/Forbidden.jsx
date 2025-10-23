import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Forbidden() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-lg w-full bg-white border border-gray-200 rounded-xl p-8 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M4.93 4.93l14.14 14.14M12 2a10 10 0 100 20 10 10 0 000-20z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">403 - Không có quyền truy cập</h1>
        <p className="text-gray-600 mb-6">Chỉ có Admin mới được phép truy cập trang phân công nhân viên.</p>
        <div className="flex justify-center gap-3">
          <button
            onClick={() => navigate(from)}
            className="px-5 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Quay lại
          </button>
          <button
            onClick={() => navigate("/login")}
            className="px-5 py-2.5 rounded-lg border border-gray-300 hover:bg-gray-50"
          >
            Đăng nhập tài khoản Admin
          </button>
        </div>
      </div>
    </div>
  );
}
