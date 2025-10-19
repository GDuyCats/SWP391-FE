import { FileText, Phone, Mail, Shield, ChevronRight, TrendingUp, Wallet } from 'lucide-react';

function ContractB() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 px-6 py-12">
      <div className="max-w-5xl mx-auto">
        {/* Header với icon */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg mb-4">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
            Hợp Đồng Điện Tử
          </h1>
          <p className="text-gray-600 text-lg">Người Bán - Bên B</p>
        </div>

        {/* 2 cột nội dung */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Cột Trái - Chi tiết thu nhập */}
          <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl p-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">
                Chi Tiết Thu Nhập
              </h2>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-xl hover:bg-green-50 transition-colors">
                <span className="text-gray-700">Giá trị xe</span>
                <span className="font-semibold text-gray-900">150.000.000đ</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl hover:bg-green-50 transition-colors">
                <span className="text-gray-700">Phí sang tên chủ sở hữu</span>
                <span className="font-semibold text-gray-900">300.000đ</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl hover:bg-green-50 transition-colors">
                <span className="text-gray-700">Phí công chứng hợp đồng</span>
                <span className="font-semibold text-gray-900">500.000đ</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl hover:bg-green-50 transition-colors">
                <span className="text-gray-700">Phí hồ sơ giấy tờ</span>
                <span className="font-semibold text-gray-900">200.000đ</span>
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent my-4"></div>

              <div className="bg-gray-50 rounded-2xl p-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">Tổng thu:</span>
                  <span className="text-xl font-bold text-gray-900">151.000.000đ</span>
                </div>
              </div>

              <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
                <div className="flex justify-between items-center">
                  <span className="text-red-700">Phí hoa hồng môi giới/sàn</span>
                  <span className="text-xl font-bold text-red-600">-2.000.000đ</span>
                </div>
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent my-4"></div>

              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-5 text-white">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium">Thực nhận:</span>
                  <span className="text-3xl font-bold">149.000.000đ</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cột Phải - Form xác thực */}
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl p-8 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Xác Thực Thông Tin
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      placeholder="Nhập số điện thoại..."
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl
                        focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100
                        transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">hoặc</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      placeholder="Nhập email..."
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl
                        focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100
                        transition-all duration-200"
                    />
                  </div>
                </div>

                <button
                  className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600
                    text-white text-lg font-semibold rounded-2xl
                    hover:from-green-600 hover:to-emerald-700
                    transform hover:scale-[1.02] active:scale-[0.98]
                    transition-all duration-200 shadow-lg hover:shadow-xl
                    flex items-center justify-center gap-2 group cursor-pointer"
                >
                  Xác nhận và gửi OTP
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Thông tin bổ sung */}
            <div className="bg-green-50 border border-green-100 rounded-2xl p-6">
              <div className="flex gap-3">
                <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-green-900 mb-1">
                    Bảo mật thông tin
                  </h3>
                  <p className="text-sm text-green-700">
                    Thông tin của bạn được mã hóa và bảo mật tuyệt đối. 
                    Mã OTP sẽ được gửi trong vòng 60 giây.
                  </p>
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