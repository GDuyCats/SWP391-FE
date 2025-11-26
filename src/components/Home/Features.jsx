import React from "react";

/**
 * Component Features - Hiển thị các tính năng/ưu điểm của EVPowerup
 * 
 * Chức năng:
 * - Hiển thị 6 tính năng chính của website
 * - Mỗi feature có icon, tiêu đề và mô tả
 * - Layout grid 3 cột responsive
 * 
 * Features:
 * 1. Kiểm định chất lượng
 * 2. Giá cả hợp lý
 * 3. Bảo hành uy tín
 * 4. Hỗ trợ 24/7
 * 5. Giao hàng nhanh
 * 6. Bảo mật thông tin
 */
const Features = () => {
  // ============ DATA ============
  // Mảng chứa tất cả features - mỗi object có icon, title, description
  const features = [
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      title: "Kiểm định chất lượng",
      description:
        "Tất cả xe điện đều được kiểm định kỹ lưỡng bởi đội ngũ chuyên gia",
    },
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
          />
        </svg>
      ),
      title: "Giá cả hợp lý",
      description:
        "Cam kết mang đến mức giá tốt nhất thị trường cho khách hàng",
    },
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z"
          />
        </svg>
      ),
      title: "Bảo hành uy tín",
      description: "Chế độ bảo hành toàn diện và dịch vụ hậu mãi chu đáo",
    },
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
          />
        </svg>
      ),
      title: "Hỗ trợ 24/7",
      description: "Đội ngũ tư vấn chuyên nghiệp sẵn sàng hỗ trợ mọi lúc",
    },
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
      title: "Giao hàng nhanh",
      description: "Dịch vụ giao xe tận nơi nhanh chóng và an toàn",
    },
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      ),
      title: "Bảo mật thông tin",
      description:
        "Cam kết bảo vệ thông tin cá nhân và giao dịch của khách hàng",
    },
  ];

  // ============ RENDER UI ============
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ===== HEADER - Tiêu đề section ===== */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Tại sao chọn EVPowerup?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Chúng tôi tự hào là địa chỉ tin cậy hàng đầu trong lĩnh vực mua bán
            xe điện đã qua sử dụng
          </p>
        </div>

        {/* ===== FEATURES GRID ===== */}
        {/* Grid responsive: 1 cột mobile, 2 cột tablet, 3 cột desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Map qua mảng features để render từng feature card */}
          {features.map((feature, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow"
            >
              {/* Icon container - circle với background xám */}
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full text-gray-900 mb-4">
                {feature.icon}
              </div>
              
              {/* Tiêu đề feature */}
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              
              {/* Mô tả feature */}
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
