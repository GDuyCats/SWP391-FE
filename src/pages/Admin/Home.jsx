import React from "react";
import { Link } from "react-router-dom";
import AdminHeader from "../../components/Admin/AdminHeader";
import AdminSidebar from "../../components/Admin/AdminSidebar";

function AdminHome() {
  return (
    <div className="min-h-screen bg-white">
      <AdminHeader />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 py-8 px-6">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-white rounded border border-gray-200">
                <h2 className="text-xl font-semibold mb-2">Quản lý người dùng</h2>
                <p className="text-gray-600 mb-4">Xem, duyệt và quản lý người dùng.</p>
                <Link to="/users" className="text-blue-600 hover:underline">Đi tới quản lý người dùng</Link>
              </div>

              <div className="p-6 bg-white rounded border border-gray-200">
                <h2 className="text-xl font-semibold mb-2">Duyệt bài đăng</h2>
                <p className="text-gray-600 mb-4">Duyệt các bài đăng cần phê duyệt.</p>
                <Link to="/adminapprove" className="text-blue-600 hover:underline">Đi tới Admin Approve</Link>
              </div>

              <div className="p-6 bg-white rounded border border-gray-200">
                <h2 className="text-xl font-semibold mb-2">Hồ sơ mua bán xe</h2>
                <p className="text-gray-600 mb-4">Quản lý hồ sơ giao dịch mua bán xe giữa người mua và người bán.</p>
                <Link to="/transactionrecords" className="text-blue-600 hover:underline">Đi tới quản lý hồ sơ</Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminHome;
