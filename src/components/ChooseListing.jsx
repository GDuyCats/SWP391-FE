import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Battery, Car } from "lucide-react";

export default function ChooseListing() {
  const navigate = useNavigate();

  return (
    <div className="bg-white min-h-screen flex flex-col items-center justify-center p-8">
      {/* Header */}
      <div className="w-full max-w-3xl bg-gray-50 text-center py-4 rounded-lg border border-gray-200 shadow-sm mb-8">
        <h1 className="text-xl font-semibold text-gray-800">
          Chọn loại sản phẩm bạn muốn đăng
        </h1>
      </div>

      {/* Options */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-12">
        {/* EV Option */}
        <div
          onClick={() => navigate("/listing/ev")}
          className="cursor-pointer bg-gray-50 hover:bg-gray-100 rounded-lg w-60 h-40 flex flex-col items-center justify-center border border-gray-200 transition shadow-sm"
        >
          <Car className="w-10 h-10 mb-3 text-gray-600" />
          <span className="font-bold text-lg text-gray-800">Xe Điện</span>
        </div>

        {/* Battery Option */}
        <div
          onClick={() => navigate("/listing/battery")}
          className="cursor-pointer bg-gray-50 hover:bg-gray-100 rounded-lg w-60 h-40 flex flex-col items-center justify-center border border-gray-200 transition shadow-sm"
        >
          <Battery className="w-10 h-10 mb-3 text-gray-600" />
          <span className="font-bold text-lg text-gray-800">Pin</span>
        </div>
      </div>

      {/* Back Button */}
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 px-5 py-2 bg-gray-800 hover:bg-gray-900 rounded-md text-white shadow-md transition"
      >
        <ArrowLeft size={16} /> Quay Lại
      </button>
    </div>
  );
}
