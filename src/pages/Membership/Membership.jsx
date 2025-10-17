import React from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

const Membership = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Gói Hội viên</h1>
        <p className="text-gray-600 mb-4">
          Trang đăng ký hội viên. Thêm nội dung và UI theo yêu cầu của bạn.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="font-semibold text-lg mb-2">Hội viên Cơ bản</h2>
            <p className="text-sm text-gray-500 mb-4">Phù hợp cho người mới.</p>
            <button className="w-full bg-gray-900 text-white rounded-md py-2">
              Mua ngay
            </button>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="font-semibold text-lg mb-2">Hội viên Tiêu chuẩn</h2>
            <p className="text-sm text-gray-500 mb-4">Bán chạy nhất.</p>
            <button className="w-full bg-gray-900 text-white rounded-md py-2">
              Mua ngay
            </button>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="font-semibold text-lg mb-2">Hội viên Cao cấp</h2>
            <p className="text-sm text-gray-500 mb-4">Tính năng nâng cao.</p>
            <button className="w-full bg-gray-900 text-white rounded-md py-2">
              Mua ngay
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Membership;
