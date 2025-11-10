import React from "react";
import { CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PostSuccess() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center text-white">
      <div className="bg-teal-950 bg-opacity-70 p-12 rounded-2xl shadow-2xl w-4/5 max-w-md text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle className="w-16 h-16 text-green-400" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Đăng bài Thành Công!</h2>
        <p className="text-gray-200 mb-6">
          Cảm ơn quý khách đã sử dụng dịch vụ của chúng tôi.
        </p>

        <div className="flex justify-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="bg-green-600 hover:bg-green-500 px-6 py-2 rounded-md"
          >
            Về Trang Chủ
          </button>
          <button
            onClick={() => navigate("/listing/step1")}
            className="bg-purple-700 hover:bg-purple-600 px-6 py-2 rounded-md"
          >
            Quay Lại
          </button>
        </div>
      </div>
    </div>
  );
}
