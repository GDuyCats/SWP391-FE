import React, { useState } from "react";
import { ArrowLeft, Upload, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function BatteryForm() {
  const navigate = useNavigate();
  const [images, setImages] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    batteryCapacity: "",
    range: "",
    soh: "",
    motorPower: "",
    motorType: "",
    chargingTimeAC: "",
    chargingTimeDC: "",
    chargingPort: "",
    price: "",
    description: "",
  });

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const imageUrls = files.map((file) => URL.createObjectURL(file));
    setImages((prev) => [...prev, ...imageUrls]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleContinue = () => {
    const payload = {
      type: "battery",
      ...formData,
      price: Number(formData.price) || 0,
      images,
    };

    navigate("/listing/package", { state: payload });
  };

  return (
    <div className="bg-gray-50 min-h-screen text-gray-800 flex flex-col items-center py-10 px-6">
      <div className="w-full max-w-5xl bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
        {/* Header */}
        <h1 className="text-2xl font-semibold mb-6 text-center">
          Thông tin pin
        </h1>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleContinue();
          }}
        >
          {/* Battery Technical Information */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 border-b border-gray-300 pb-2">
              Thông tin kỹ thuật pin
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <input
                name="batteryCapacity"
                value={formData.batteryCapacity}
                onChange={handleChange}
                type="text"
                placeholder="Dung lượng pin (kWh) - Ví dụ: 82 kWh"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                required
              />
              <input
                name="range"
                value={formData.range}
                onChange={handleChange}
                type="text"
                placeholder="Quãng đường di chuyển (km) - Ví dụ: 420 km theo chuẩn WLTP"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                required
              />
              <input
                name="soh"
                value={formData.soh}
                onChange={handleChange}
                type="text"
                placeholder="Tình trạng pin - SOH (%) - Ví dụ: SOH 95%"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                required
              />
              <input
                name="motorPower"
                value={formData.motorPower}
                onChange={handleChange}
                type="text"
                placeholder="Công suất động cơ (kW/HP) - Ví dụ: 150 kW hoặc 201 HP"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              />
              <input
                name="motorType"
                value={formData.motorType}
                onChange={handleChange}
                type="text"
                placeholder="Loại động cơ - 1 Motor hoặc 2 Motor (AWD)"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              />
              <input
                name="chargingTimeAC"
                value={formData.chargingTimeAC}
                onChange={handleChange}
                type="text"
                placeholder="Thời gian sạc thường (AC) - Ví dụ: ~8-10 giờ với sạc 7.4 kW"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              />
              <input
                name="chargingTimeDC"
                value={formData.chargingTimeDC}
                onChange={handleChange}
                type="text"
                placeholder="Thời gian sạc nhanh (DC) - Ví dụ: ~30 phút từ 10% lên 80%"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              />
              <input
                name="chargingPort"
                value={formData.chargingPort}
                onChange={handleChange}
                type="text"
                placeholder="Loại cổng sạc - Ví dụ: CCS2, Type 2"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              />
            </div>
          </section>

          {/* Image Upload Section */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 border-b border-gray-300 pb-2">
              Hình ảnh pin
            </h2>
            <div className="flex items-center gap-4 mb-4">
              <label className="flex items-center gap-2 cursor-pointer bg-gray-800 hover:bg-gray-900 px-4 py-2 rounded-lg transition text-white">
                <Upload className="w-5 h-5" /> Tải hình ảnh
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {images.map((src, index) => (
                <img
                  key={index}
                  src={src}
                  alt={`uploaded ${index}`}
                  className="w-full h-32 object-cover rounded-lg border border-gray-300"
                />
              ))}
            </div>
          </section>

          {/* Price */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 border-b border-gray-300 pb-2">
              Giá bán
            </h2>
            <div className="flex items-center gap-3">
              <input
                name="price"
                type="number"
                placeholder="Nhập giá..."
                className="px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                value={formData.price}
                onChange={handleChange}
                required
              />
              <span className="font-semibold">VNĐ</span>
            </div>
          </section>

          {/* Description */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 border-b border-gray-300 pb-2">
              Mô tả chi tiết
            </h2>
            <textarea
              name="description"
              placeholder="Mô tả chi tiết về pin, tình trạng, bảo hành, lịch sử sử dụng..."
              className="w-full h-40 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:border-transparent resize-none"
              value={formData.description}
              onChange={handleChange}
            />
          </section>

          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() => navigate("/chooselisting")}
              className="flex items-center gap-2 bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-md text-gray-800"
            >
              <ArrowLeft size={18} /> Quay lại
            </button>
            <button
              type="submit"
              className="bg-gray-800 hover:bg-gray-900 px-6 py-2 rounded-md font-semibold text-white"
            >
              Tiếp tục <ArrowRight size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
