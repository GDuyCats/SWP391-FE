import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Battery, Car } from "lucide-react";

/**
 * Component ChooseListing - Trang chọn loại sản phẩm để đăng bán
 * 
 * Chức năng:
 * - Cho phép người dùng chọn đăng bài bán Xe Điện hoặc Pin
 * - Navigate đến form tương ứng khi người dùng chọn
 * 
 * Flow:
 * 1. User click vào card "Xe Điện" -> chuyển đến /listing/ev (EVForm)
 * 2. User click vào card "Pin" -> chuyển đến /listing/battery (BatteryForm)
 * 3. User click "Quay Lại" -> về trang chủ
 */
export default function ChooseListing() {
  const navigate = useNavigate();

  return (
    <div className="bg-white min-h-screen flex flex-col items-center justify-center p-8">
      
      {/* ===== HEADER - Tiêu đề trang ===== */}
      <div className="w-full max-w-3xl bg-gray-50 text-center py-4 rounded-lg border border-gray-200 shadow-sm mb-8">
        <h1 className="text-xl font-semibold text-gray-800">
          Chọn loại sản phẩm bạn muốn đăng
        </h1>
      </div>

      {/* ===== OPTIONS - 2 lựa chọn: Xe Điện hoặc Pin ===== */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-12">
        
        {/* Card 1: Xe Điện */}
        <div
          onClick={() => navigate("/listing/ev")} // Navigate đến form đăng xe điện
          className="cursor-pointer bg-gray-50 hover:bg-gray-100 rounded-lg w-60 h-40 flex flex-col items-center justify-center border border-gray-200 transition shadow-sm"
        >
          <Car className="w-10 h-10 mb-3 text-gray-600" />
          <span className="font-bold text-lg text-gray-800">Xe Điện</span>
        </div>

        {/* Card 2: Pin */}
        <div
          onClick={() => navigate("/listing/battery")} // Navigate đến form đăng pin
          className="cursor-pointer bg-gray-50 hover:bg-gray-100 rounded-lg w-60 h-40 flex flex-col items-center justify-center border border-gray-200 transition shadow-sm"
        >
          <Battery className="w-10 h-10 mb-3 text-gray-600" />
          <span className="font-bold text-lg text-gray-800">Pin</span>
        </div>
      </div>

      {/* ===== BACK BUTTON - Quay về trang chủ ===== */}
      <button
        onClick={() => navigate("/")} // Navigate về trang home
        className="flex items-center gap-2 px-5 py-2 bg-gray-800 hover:bg-gray-900 rounded-md text-white shadow-md transition"
      >
        <ArrowLeft size={16} /> Quay Lại
      </button>
    </div>
  );
}
