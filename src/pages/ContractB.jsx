// src/pages/ContractB.jsx
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { FileText, Shield, TrendingUp, Wallet, Check } from "lucide-react";
import { verifyOtp } from "../services/api";

const formatCurrency = (n) => new Intl.NumberFormat("vi-VN").format(Number(n || 0));

function ContractB() {
  const [otp, setOTP] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const location = useLocation();

  const qs = new URLSearchParams(location.search);
  const contractId =
    Number(qs.get("contractId")) || Number(location.state?.contractId) || 0;

  // Tham số từ email-link
  const price = Number(qs.get("price") || 0);
  const sellerPercent = Number(qs.get("sellerPercent") || 0);
  const sellerFee = Number(qs.get("sellerFee") || Math.round(price * sellerPercent / 100));
  const sellerTotal = Number(qs.get("sellerTotal") || price - sellerFee);

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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 px-6 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg mb-4">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
            Hợp Đồng Điện Tử
          </h1>
          <p className="text-gray-600 text-lg">Người Bán - Bên B</p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl p-8 border border-gray-100">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Số tiền Bên B phải chịu</h2>
              </div>
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
                <div className="text-center">
                  <p className="text-sm font-medium mb-2 opacity-90">Giá chốt: {formatCurrency(price)}đ</p>
                  <p className="text-sm font-medium mb-2 opacity-90">% phí: {sellerPercent}% | Phí: {formatCurrency(sellerFee)}đ</p>
                  <p className="text-4xl font-bold">{formatCurrency(sellerTotal)}đ</p>
                </div>
              </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent my-8" />

            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">Xác Thực Thông Tin</h2>
              <div className="space-y-5">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-10 h-10 text-green-600" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-center">Nhập mã OTP (6 số)</label>
                  <input
                    type="text"
                    maxLength="6"
                    value={otp}
                    onChange={(e) => setOTP(e.target.value.replace(/\D/g, ""))}
                    placeholder="000000"
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl
                      text-center text-2xl font-bold tracking-widest
                      focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100
                      transition-all duration-200"
                  />
                </div>
                <button
                  onClick={handleVerifyOTP}
                  disabled={otp.length !== 6 || submitting}
                  className={`w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-lg font-semibold rounded-2xl
                    ${submitting || otp.length !== 6 ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <Check className="w-5 h-5 inline mr-2" />
                  {submitting ? "Đang xác nhận..." : "Xác nhận OTP"}
                </button>
              </div>

              <div className="bg-green-50 border border-green-100 rounded-2xl p-6 mt-6">
                <div className="flex gap-3">
                  <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-green-900 mb-1">Bảo mật thông tin</h3>
                    <p className="text-sm text-green-700">
                      Thông tin của bạn được mã hóa và bảo mật. Mã OTP chỉ hiệu lực trong thời gian ngắn.
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

export default ContractB;
