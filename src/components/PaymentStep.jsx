import React, { useState } from "react";
import { ArrowLeft, CreditCard } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export default function PaymentStep() {
  const navigate = useNavigate();
  const location = useLocation();
  const listingData = location.state;
  const [isProcessing, setIsProcessing] = useState(false);

  if (!listingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-slate-800 to-cyan-900 text-white p-6">
        <div className="max-w-xl w-full bg-white/5 p-8 rounded-xl shadow-lg text-center">
          <h2 className="text-2xl font-semibold mb-4">
            Không có dữ liệu thanh toán
          </h2>
          <p className="text-sm text-gray-200 mb-6">
            Vui lòng chọn gói đăng tin trước khi thanh toán.
          </p>
          <button
            onClick={() => navigate("/chooselisting")}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-md font-semibold"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  const handlePayment = async () => {
    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      // Navigate to success page
      navigate("/success", {
        state: {
          message: "Đăng bài thành công!",
          listingData,
        },
      });
    }, 3000);
  };

  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen p-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Thanh toán</h1>

        <div className="bg-white rounded-2xl p-8 mb-8 shadow-lg border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Thông tin thanh toán</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Order Details */}
            <div>
              <h3 className="font-semibold mb-4">Chi tiết đơn hàng</h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Loại sản phẩm:</span>
                  <span className="font-semibold">
                    {listingData.type === "ev" ? "Xe điện" : "Pin"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Tiêu đề:</span>
                  <span className="font-semibold">{listingData.title}</span>
                </div>

                <div className="flex justify-between">
                  <span>Giá sản phẩm:</span>
                  <span className="font-semibold">
                    {listingData.price?.toLocaleString()} VND
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Gói đăng tin:</span>
                  <span className="font-semibold">
                    {listingData.package?.name}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Thời gian hiển thị:</span>
                  <span className="font-semibold">
                    {listingData.package?.duration} ngày
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Tổng cộng:</span>
                    <span className="text-gray-800">
                      {listingData.totalCost?.toLocaleString()} VND
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* QR Code */}
            <div>
              <h3 className="font-semibold mb-4">QR Code thanh toán</h3>

              <div className="bg-white p-6 rounded-lg w-full max-w-sm mx-auto">
                <div className="text-center text-gray-600">
                  <div className="w-48 h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center mx-auto">
                    <div className="text-center">
                      <CreditCard className="w-16 h-16 mx-auto mb-2 text-gray-400" />
                      <span className="text-sm font-semibold">QR Code</span>
                    </div>
                  </div>
                  <p className="text-sm font-semibold mb-2">
                    Quét mã để thanh toán
                  </p>
                  <p className="text-xs text-gray-500">
                    Sử dụng ứng dụng ngân hàng để quét mã QR và thanh toán
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Instructions */}
        <div className="bg-white rounded-2xl p-6 mb-8 shadow-lg border border-gray-200">
          <h3 className="font-semibold mb-4">Hướng dẫn thanh toán</h3>
          <div className="space-y-2 text-sm">
            <p>1. Mở ứng dụng ngân hàng trên điện thoại</p>
            <p>2. Chọn chức năng "Quét mã QR"</p>
            <p>3. Quét mã QR ở trên</p>
            <p>4. Kiểm tra thông tin thanh toán và xác nhận</p>
            <p>
              5. Sau khi thanh toán thành công, tin đăng sẽ được đăng tự động
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-md text-gray-800"
          >
            <ArrowLeft size={18} /> Quay lại
          </button>

          <button
            onClick={handlePayment}
            disabled={isProcessing}
            className="bg-gray-800 hover:bg-gray-900 disabled:bg-gray-400 disabled:cursor-not-allowed px-6 py-2 rounded-md font-semibold text-white"
          >
            {isProcessing ? "Đang xử lý..." : "Xác nhận thanh toán"}
          </button>
        </div>
      </div>
    </div>
  );
}
