import React from "react";
import {Link, NavLink} from "react-router-dom";
import AdminHeader from "../../components/Admin/AdminHeader";
import AdminSidebar from "../../components/Admin/AdminSidebar";

function AdminHome() {
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
    <div className="min-h-screen bg-white">
      <AdminHeader />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 py-8 px-6">
          <div className="max-w-6xl mx-auto">

              {role === "admin" ?(
                  <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
              ) : (
                  <h1 className="text-3xl font-bold mb-6">Staff Dashboard</h1>)}


            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {role === "admin" && (
                    <div className="p-6 bg-white rounded border border-gray-200">
                        <h2 className="text-xl font-semibold mb-2">Quản lý người dùng</h2>
                        <p className="text-gray-600 mb-4">Xem, duyệt và quản lý người dùng.</p>
                        <Link to="/users" className="text-blue-600 hover:underline">Đi tới quản lý người dùng</Link>
                    </div>

                )}
                {role === "admin" && (
                    <div className="p-6 bg-white rounded border border-gray-200">
                        <h2 className="text-xl font-semibold mb-2">Duyệt bài đăng</h2>
                        <p className="text-gray-600 mb-4">Duyệt các bài đăng cần phê duyệt.</p>
                        <Link to="/adminapprove" className="text-blue-600 hover:underline">Đi tới Admin Approve</Link>
                    </div>
                )}
                {role === "admin" && (
                    <div className="p-6 bg-white rounded border border-gray-200">
                        <h2 className="text-xl font-semibold mb-2">Phân công nhân viên</h2>
                        <p className="text-gray-600 mb-4">Điều phối nhân viên tiếp nhận hợp đồng.</p>
                        <Link to="/admin/assignments" className="text-blue-600 hover:underline">Đi tới trang phân công nhân viên</Link>
                    </div>
                )}

                {role === "admin" && (
                    <div className="p-6 bg-white rounded border border-gray-200">
                        <h2 className="text-xl font-semibold mb-2">Xác nhận yêu cầu</h2>
                        <p className="text-gray-600 mb-4">Xác nhận yêu cầu mua xe.</p>
                        <Link to="/request-management" className="text-blue-600 hover:underline">Đi tới Request Management</Link>
                    </div>
                )}

                {role === "staff" && (
                    <div className="p-6 bg-white rounded border border-gray-200">
                        <h2 className="text-xl font-semibold mb-2">Hồ sơ mua bán xe</h2>
                        <p className="text-gray-600 mb-4">Quản lý hồ sơ giao dịch mua bán xe giữa người mua và người bán.</p>
                        <Link to="/transactionrecords" className="text-blue-600 hover:underline">Đi tới quản lý hồ sơ</Link>
                    </div>
                )}

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminHome;
