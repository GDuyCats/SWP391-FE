import { useState } from "react";
import { FileText, Shield, Check, ALargeSmall } from "lucide-react";

function ContractA() {
  const [otp, setOTP] = useState("");

  const handleVerifyOTP = () => {
    if (!otp || otp.length !== 6) {
      alert("Vui lòng nhập đầy đủ 6 số OTP");
      return;
    }

    alert("Xác thực thành công!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-6 py-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg mb-4">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Hợp Đồng Điện Tử
          </h1>
          <p className="text-gray-600 text-lg">Người Mua - Bên A</p>
        </div>

        {/* 2 cột nội dung */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Cột trái: Chi tiết thanh toán */}
          <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl p-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">
                Chi Tiết Thanh Toán
              </h2>
            </div>

            <div className="space-y-4">
              <Row label="Phí đăng ký xe" value="500.000đ" />
              <Row label="Phí trước bạ" value="1.000.000đ" />
              <Row label="Phí cấp biển số" value="200.000đ" />
              <Row label="Phí bảo hiểm xe" value="800.000đ" />
              <Row label="Phí thuê hoặc mua pin" value="1.500.000đ" />
              <Row label="Phí hoa hồng môi giới/sàn" value="2.000.000đ" />

              <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent my-4" />

              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-5 text-white">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium">Tổng cộng:</span>
                  <span className="text-3xl font-bold">6.000.000đ</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cột phải: Nhập OTP và xác nhận */}
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl p-8 border border-gray-100 min-h-[580px] flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-6">
                  Xác Thực Thông Tin
                </h2>

                {/* Form nhập OTP luôn hiển thị */}
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
                      onChange={(e) =>
                        setOTP(e.target.value.replace(/\D/g, ""))
                      }
                      placeholder="000000"
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl
                        text-center text-2xl font-bold tracking-widest
                        focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100
                        transition-all duration-200"
                    />
                  </div>

                  <button
                    onClick={handleVerifyOTP}
                    className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600
                      text-white text-lg font-semibold rounded-2xl
                      hover:from-blue-600 hover:to-indigo-700
                      transform hover:scale-[1.02] active:scale-[0.98]
                      transition-all duration-200 shadow-lg hover:shadow-xl
                      flex items-center justify-center gap-2 group cursor-pointer"
                  >
                    <Check className="w-5 h-5" />
                    Xác nhận OTP
                  </button>
                </div>
              </div>

              {/* Thông tin bảo mật */}
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mt-6">
                <div className="flex gap-3">
                  <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-1">
                      Bảo mật thông tin
                    </h3>
                    <p className="text-sm text-blue-700">
                      Thông tin của bạn được mã hóa và bảo mật tuyệt đối.
                      Mã OTP chỉ có hiệu lực trong thời gian ngắn.
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

// Row nhỏ cho danh sách phí
function Row({ label, value }) {
  return (
    <div className="flex justify-between items-center p-3 rounded-xl hover:bg-blue-50 transition-colors">
      <span className="text-gray-700">{label}</span>
      <span className="font-semibold text-gray-900">{value}</span>
    </div>
  );
}

export default ContractA;
