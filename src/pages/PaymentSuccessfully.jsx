import React, { useEffect, useState } from "react";
import { CircleCheck, Home } from "lucide-react";

function PaymentSuccessfully() {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    // Redirect sau 5 giây
    const redirect = setTimeout(() => {
      window.location.href = "/";
    }, 5000);

    // Cleanup
    return () => {
      clearInterval(timer);
      clearTimeout(redirect);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Card chính */}
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
          {/* Icon thành công */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
              <CircleCheck className="w-16 h-16 text-green-500" />
            </div>
          </div>

          {/* Tiêu đề */}
          <h1 className="text-3xl font-bold text-gray-800 mb-3">
            Thanh Toán Thành Công!
          </h1>
          <p className="text-gray-600 mb-8">
            Giao dịch của bạn đã được xử lý thành công
          </p>

          {/* Countdown */}
          <p className="text-gray-500 text-sm mb-6">
            Tự động chuyển về trang chủ sau {countdown} giây...
          </p>

          {/* Nút về trang chủ */}
          <a 
            href="/home"
            className="w-full py-3 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-5 h-5" />
            Về trang chủ ngay
          </a>
        </div>

        {/* Footer text */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi
        </p>
      </div>
    </div>
  );
}

export default PaymentSuccessfully;