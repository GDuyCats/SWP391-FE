import React from "react";
import { Link } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

function AdminHome() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-white rounded shadow">
              <h2 className="text-xl font-semibold mb-2">Quản lý người dùng</h2>
              <p className="text-gray-600 mb-4">Xem, duyệt và quản lý người dùng.</p>
              <Link to="/users" className="text-blue-600 hover:underline">Đi tới quản lý người dùng</Link>
            </div>

            <div className="p-6 bg-white rounded shadow">
              <h2 className="text-xl font-semibold mb-2">Duyệt bài đăng</h2>
              <p className="text-gray-600 mb-4">Duyệt các bài đăng cần phê duyệt.</p>
              <Link to="/adminapprove" className="text-blue-600 hover:underline">Đi tới Admin Approve</Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default AdminHome;
