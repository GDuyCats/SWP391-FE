import React from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

function CarDetails() {
  const { id } = useParams();
  const { state } = useLocation();
  const car = state?.car;

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link to="/" className="text-sm text-gray-600 hover:underline">← Về trang chủ</Link>
          </div>

          {car ? (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <img src={car.image} alt={car.name} className="w-full h-64 object-cover" />
              <div className="p-6">
                <h1 className="text-2xl font-bold mb-2">{car.name}</h1>
                <p className="text-xl text-gray-900 font-semibold mb-4">Giá: {car.price}</p>
                <div className="grid grid-cols-2 gap-4 text-gray-700 mb-6">
                  <div>
                    <p className="text-sm">Số km</p>
                    <p className="font-medium">{car.mileage}</p>
                  </div>
                  <div>
                    <p className="text-sm">Năm</p>
                    <p className="font-medium">{car.year}</p>
                  </div>
                  <div>
                    <p className="text-sm">Pin</p>
                    <p className="font-medium">{car.battery}</p>
                  </div>
                  <div>
                    <p className="text-sm">Vị trí</p>
                    <p className="font-medium">{car.location}</p>
                  </div>
                </div>

                <div className="space-x-3">
                  <button className="bg-gray-900 text-white px-4 py-2 rounded-md">Gửi yêu cầu mua xe</button>
                  <button className="border border-gray-300 px-4 py-2 rounded-md">Yêu cầu thêm thông tin</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <h2 className="text-xl font-semibold mb-2">Chi tiết xe không tìm thấy</h2>
              <p className="text-gray-600 mb-4">Không có dữ liệu chi tiết cho xe id: {id}</p>
              <div>
                <Link to="/" className="inline-block bg-gray-900 text-white px-4 py-2 rounded-md">Quay lại</Link>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default CarDetails;
