import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Battery, Car } from "lucide-react";

export default function ChooseListing() {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-b from-slate-800 to-slate-900 text-white min-h-screen flex flex-col items-center justify-center p-8">
      {/* Header */}
      <div className="w-full max-w-3xl bg-white/10 text-center py-4 rounded-lg border border-cyan-400 shadow-md mb-8">
        <h1 className="text-xl font-semibold">Chọn loại sản phẩm bạn muốn đăng</h1>
      </div>

      {/* Options */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-12">
        {/* EV Option */}
        <div
          onClick={() => navigate("/listing/ev")}
          className="cursor-pointer bg-white/10 hover:bg-white/20 rounded-lg w-60 h-40 flex flex-col items-center justify-center border border-white/30 transition"
        >
          <Car className="w-10 h-10 mb-3" />
          <span className="font-bold text-lg">Xe Điện</span>
        </div>

        {/* Battery Option */}
        <div
          onClick={() => navigate("/listing/pin")}
          className="cursor-pointer bg-white/10 hover:bg-white/20 rounded-lg w-60 h-40 flex flex-col items-center justify-center border border-white/30 transition"
        >
          <Battery className="w-10 h-10 mb-3" />
          <span className="font-bold text-lg">Pin</span>
        </div>
      </div>

      {/* Back Button */}
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 px-5 py-2 bg-gray-600 hover:bg-gray-700 rounded-md text-white shadow-md transition"
      >
        <ArrowLeft size={16} /> Quay Lại
      </button>
    </div>
  );
}