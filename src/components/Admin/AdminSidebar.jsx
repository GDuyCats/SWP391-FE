import React from "react";
import { NavLink } from "react-router-dom";

const linkBase =
  "flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors";

const AdminSidebar = () => {
  const getRole = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user?.role) return user.role;
    } catch {
      // ignore parse error
    }
    return localStorage.getItem("role");
  };
  const role = getRole();
  const navItem = ({ to, icon, label }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `${linkBase} ${isActive ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-100"}`
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );

  return (
    <aside className="w-64 border-r border-gray-200 min-h-[calc(100vh-4rem)] p-4 sticky top-16">
      <nav className="space-y-2">
        {navItem({
          to: "/admin",
          label: "Tổng quan",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6" />
            </svg>
          ),
        })}
        {navItem({
          to: "/users",
          label: "Quản lý người dùng",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M9 20H4v-2a3 3 0 015.356-1.857M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          ),
        })}
        {navItem({
          to: "/adminapprove",
          label: "Duyệt bài đăng",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
        })}
        {navItem({
          to: "/transactionrecords",
          label: "Hồ sơ mua bán",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          ),
        })}
        {role === "admin" && navItem({
          to: "/admin/assignments",
          label: "Phân công nhân viên",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M9 20H4v-2a3 3 0 015.356-1.857M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          ),
        })}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
