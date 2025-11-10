// src/pages/ContractA.jsx
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { FileText, Shield, Check, ALargeSmall } from "lucide-react";
import { verifyOtp } from "../services/api";

const fmt = (n) => new Intl.NumberFormat("vi-VN").format(Number(n || 0));

function ContractA() {
  const [otp, setOTP] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const location = useLocation();

  const qs = new URLSearchParams(location.search);
  const contractId = Number(qs.get("contractId")) || Number(location.state?.contractId) || 0;

  // nhận số liệu đính kèm từ email link
  const price = Number(qs.get("price") || 0);
  const buyerPercent = Number(qs.get("buyerPercent") || 0);
  const buyerFee = Number(qs.get("buyerFee") || Math.round(price * buyerPercent / 100));
  const buyerTotal = Number(qs.get("buyerTotal") || price + buyerFee);

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) { alert("Vui lòng nhập đầy đủ 6 số OTP"); return; }
    if (!contractId) { alert("Thiếu contractId"); return; }
    setSubmitting(true);
    try {
      const result = await verifyOtp(contractId, otp);
      alert(result.message || (result.success ? "Xác thực thành công." : "Lỗi xác thực OTP"));
    } catch {
      alert("Lỗi xác thực OTP");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-6 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg mb-4">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Hợp Đồng Điện Tử
          </h1>
          <p className="text-gray-600 text-lg">Người Mua - Bên A</p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl p-8 border border-gray-100">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Chi tiết thanh toán của Bên A</h2>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-gray-500">Giá trị xe đã chốt</p>
                  <p className="font-semibold text-gray-900">{fmt(price)}đ</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-gray-500">% phí Buyer</p>
                  <p className="font-semibold text-gray-900">{buyerPercent}%</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-gray-500">Phí Buyer</p>
                  <p className="font-semibold text-blue-700">{fmt(buyerFee)}đ</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-gray-500">Tổng Buyer thanh toán</p>
                  <p className="font-bold text-blue-700">{fmt(buyerTotal)}đ</p>
                </div>
              </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent my-8" />

            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">Xác Thực Thông Tin</h2>
              <div className="space-y-5">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ALargeSmall className="w-10 h-10 text-green-600" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                    Nhập mã OTP (6 số)
                  </label>
                  <input
                    type="text"
                    maxLength="6"
                    value={otp}
                    onChange={(e) => setOTP(e.target.value.replace(/\D/g, ""))}
                    placeholder="000000"
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl
                      text-center text-2xl font-bold tracking-widest
                      focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100
                      transition-all duration-200"
                  />
                </div>
                <button
                  onClick={handleVerifyOTP}
                  disabled={otp.length !== 6 || submitting}
                  className={`w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-lg font-semibold rounded-2xl
                    ${submitting || otp.length !== 6 ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  <Check className="w-5 h-5 inline mr-2" />
                  {submitting ? "Đang xác nhận..." : "Xác nhận OTP"}
                </button>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mt-6">
                <div className="flex gap-3">
                  <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-1">Bảo mật thông tin</h3>
                    <p className="text-sm text-blue-700">
                      Thông tin của bạn được mã hóa và bảo mật. Mã OTP có hiệu lực trong thời gian ngắn.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> 
    </div>
  );
}

export default ContractA;
