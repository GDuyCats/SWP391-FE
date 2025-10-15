import React from "react";

const Hero = () => {
  return (
    <section className="bg-gradient-to-r from-gray-50 to-gray-100 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Tìm kiếm xe điện đã qua sử dụng
            <span className="block text-gray-600">chất lượng tốt nhất</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Khám phá hàng nghìn xe điện đã qua sử dụng từ các thương hiệu uy
            tín. Chúng tôi cam kết mang đến những chiếc xe chất lượng cao với
            giá cả hợp lý.
          </p>

          {/* Search Bar */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tìm kiếm
                  </label>
                  <input
                    type="text"
                    placeholder="Nhập tên xe, hãng xe..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giá từ
                  </label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent">
                    <option value="">Chọn mức giá</option>
                    <option value="0-100">Dưới 100 triệu</option>
                    <option value="100-300">100 - 300 triệu</option>
                    <option value="300-500">300 - 500 triệu</option>
                    <option value="500+">Trên 500 triệu</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hãng xe
                  </label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent">
                    <option value="">Tất cả hãng xe</option>
                    <option value="tesla">Tesla</option>
                    <option value="bmw">BMW</option>
                    <option value="audi">Audi</option>
                    <option value="mercedes">Mercedes</option>
                    <option value="hyundai">Hyundai</option>
                    <option value="kia">Kia</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button className="w-full bg-gray-900 text-white py-3 px-6 rounded-md hover:bg-gray-800 transition-colors font-medium">
                    Tìm kiếm
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">500+</div>
              <div className="text-gray-600">Xe điện có sẵn</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">1000+</div>
              <div className="text-gray-600">Khách hàng hài lòng</div>
            </div>
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
