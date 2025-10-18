import React from "react";

function About() {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header sẽ được import ở ngoài layout, không viết lại ở đây */}

      {/* Container chính */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Tiêu đề */}
        <h1 className="text-4xl font-bold text-gray-800 text-center mb-12">
          VỀ CHÚNG TÔI
        </h1>

        {/* EV PowerUp là gì */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">
            EVPowerUp là gì?
          </h2>
          <p className="text-gray-700 leading-relaxed">
            EVPowerUp là nền tảng hỗ trợ <span className="font-semibold">mua bán xe điện và pin đã qua sử dụng</span>, 
            giúp kết nối người bán – người mua – đại lý một cách nhanh chóng và hiệu quả.
          </p>
        </section>

        {/* Sứ mệnh */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">
            Sứ mệnh
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Chúng tôi mong muốn <span className="font-semibold">giúp người dùng tiếp cận xe điện dễ dàng hơn </span> 
            thông qua quy trình minh bạch, hiện đại và tiện lợi trong từng bước giao dịch.
          </p>
        </section>

        {/* Tầm nhìn */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">
            Tầm nhìn
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Trở thành <span className="font-semibold">nền tảng xe điện đáng tin cậy hàng đầu tại Việt Nam</span>,
            nơi người dùng yên tâm giao dịch và đối tác sẵn sàng hợp tác lâu dài.
          </p>
        </section>

        {/* Điểm khác biệt */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-5">
            Điểm khác biệt của chúng tôi
          </h2>
          <ul className="space-y-3 text-gray-700">
            <li>Tích hợp <span className="font-semibold">hợp đồng điện tử</span> an toàn, hợp pháp</li>
            <li><span className="font-semibold">Quy trình duyệt nhanh chóng</span></li>
            <li>Giao diện <span className="font-semibold">tối giản, dễ sử dụng</span></li>
            <li>Cam kết <span className="font-semibold">Uy tín – Nhanh chóng – Bảo mật</span></li>
          </ul>
        </section>
      </div>

      {/* Footer sẽ được import ở ngoài layout, không viết lại ở đây */}
    </div>
  );
}

export default About;
