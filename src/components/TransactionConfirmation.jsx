import React, { useState } from "react";
import { CheckSquare, Send, PackageCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function TransactionConfirmation() {
  const navigate = useNavigate();
  const [buyerConfirmed, setBuyerConfirmed] = useState(false);
  const [sellerConfirmed, setSellerConfirmed] = useState(false);

  const handleConfirm = () => {
    if (buyerConfirmed && sellerConfirmed) {
      navigate("/success");
    } else {
      alert("Cả người mua và người bán cần xác nhận giao dịch trước khi hoàn tất!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-800 to-blue-900 flex flex-col items-center justify-center text-white">
      <div className="bg-teal-950 bg-opacity-60 p-10 rounded-2xl shadow-2xl w-4/5 max-w-5xl">
        <h2 className="text-3xl font-semibold mb-6">Xác Nhận Giao Dịch</h2>

        {/* Product Info */}
        <div className="flex items-center gap-6 bg-teal-900 bg-opacity-40 p-5 rounded-lg mb-8">
          <div className="w-40 h-28 bg-gray-300 rounded-lg flex items-center justify-center text-black font-semibold">
            Ảnh Đính Kèm
          </div>
          <div className="text-gray-200 text-sm space-y-1">
            <p>Tên sản phẩm: <span className="font-semibold text-white">Pin Lithium 60V</span></p>
            <p>SOH: <span className="text-green-300">95%</span> &nbsp;|&nbsp; Cycle: 400</p>
            <p>Giá: <span className="font-semibold text-green-400">2.800.000 VND</span></p>
          </div>
        </div>

        {/* Buyer / Seller Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Buyer Section */}
          <div className="bg-teal-800 p-5 rounded-xl">
            <h3 className="font-semibold text-lg mb-3">Buyer - Người Mua</h3>
            <input
              type="text"
              placeholder="Tên người mua"
              className="w-full p-2 rounded-md text-black"
            />
            <label className="flex items-center gap-2 mt-3">
              <input
                type="checkbox"
                checked={buyerConfirmed}
                onChange={() => setBuyerConfirmed(!buyerConfirmed)}
              />
              <span>Đã Nhận Được Hàng</span>
            </label>
            <textarea
              placeholder="Ghi chú..."
              className="w-full p-2 rounded-md text-black mt-3"
              rows="2"
            />
          </div>

          {/* Seller Section */}
          <div className="bg-teal-800 p-5 rounded-xl">
            <h3 className="font-semibold text-lg mb-3">Seller - Người Bán</h3>
            <input
              type="text"
              placeholder="Tên người bán"
              className="w-full p-2 rounded-md text-black"
            />
            <label className="flex items-center gap-2 mt-3">
              <input
                type="checkbox"
                checked={sellerConfirmed}
                onChange={() => setSellerConfirmed(!sellerConfirmed)}
              />
              <span>Đã Gửi Hàng</span>
            </label>
            <textarea
              placeholder="Ghi chú..."
              className="w-full p-2 rounded-md text-black mt-3"
              rows="2"
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end mt-8">
          <button
            onClick={handleConfirm}
            className="bg-green-700 hover:bg-green-600 px-8 py-3 rounded-lg flex items-center gap-2"
          >
            <PackageCheck className="w-5 h-5" />
            Xác Nhận Giao Dịch Thành Công
          </button>
        </div>
      </div>
    </div>
  );
}