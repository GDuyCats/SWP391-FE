import React from "react";

/**
 * Component Hero - Banner chính trên trang Home
 *
 * Chức năng:
 * - Hiển thị tiêu đề chính và mô tả ngắn về website
 * - Hiển thị 3 thống kê chính (số xe, khách hàng, chất lượng)
 * - Tạo ấn tượng đầu tiên cho người dùng
 *
 * Layout:
 * - Gradient background (gray-50 to gray-100)
 * - Centered content với max-width
 * - Responsive: 1 cột mobile, 3 cột desktop
 */
const Hero = () => {
  return (
    <section className="bg-gradient-to-r from-gray-50 to-gray-100 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* ===== TIÊU ĐỀ CHÍNH ===== */}
          {/* Responsive: text-4xl trên mobile, text-6xl trên desktop */}
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Tìm kiếm xe điện đã qua sử dụng
            {/* Xuống dòng và đổi màu cho phần tiêu đề thứ 2 */}
            <span className="block text-gray-600">chất lượng tốt nhất</span>
          </h1>

          {/* ===== MÔ TẢ ===== */}
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Khám phá hàng nghìn xe điện đã qua sử dụng từ các thương hiệu uy
            tín. Chúng tôi cam kết mang đến những chiếc xe chất lượng cao với
            giá cả hợp lý.
          </p>

          {/* ===== THỐNG KÊ (3 cột) ===== */}
          {/* Grid responsive: 1 cột trên mobile, 3 cột trên tablet/desktop */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {/* Stat 1: Số xe có sẵn */}
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">500+</div>
              <div className="text-gray-600">Xe điện có sẵn</div>
            </div>

            {/* Stat 2: Số khách hàng */}
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">1000+</div>
              <div className="text-gray-600">Khách hàng hài lòng</div>
            </div>

            {/* Stat 3: Chất lượng */}
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">99%</div>
              <div className="text-gray-600">Chất lượng đảm bảo</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
