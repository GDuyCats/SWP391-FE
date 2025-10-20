import React, { useState } from "react";
import { ArrowLeft, Upload, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function EVForm() {
  const navigate = useNavigate();
  const [images, setImages] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    brand: "",
    model: "",
    trim: "",
    year: "",
    firstRegistrationYear: "",
    condition: "",
    odometer: "",
    origin: "",
    exteriorColor: "",
    interiorColor: "",
    seats: "",
    doors: "",
    drive: "",
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
      type: "ev",
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
          Thông tin xe điện
        </h1>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleContinue();
          }}
        >
          {/* Basic Information */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 border-b border-gray-300 pb-2">
              Thông tin cơ bản
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <input
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                type="text"
                placeholder="Hãng xe (VinFast, Tesla, Kia...)"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                required
              />
              <input
                name="model"
                value={formData.model}
                onChange={handleChange}
                type="text"
                placeholder="Dòng xe (VF 8, Model Y, EV6...)"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                required
              />
              <input
                name="trim"
                value={formData.trim}
                onChange={handleChange}
                type="text"
                placeholder="Phiên bản (VF 8 Eco, VF 8 Plus...)"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              />
              <input
                name="year"
                value={formData.year}
                onChange={handleChange}
                type="text"
                placeholder="Năm sản xuất"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                required
              />
              <input
                name="firstRegistrationYear"
                value={formData.firstRegistrationYear}
                onChange={handleChange}
                type="text"
                placeholder="Năm đăng ký lần đầu"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              />
              <input
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                type="text"
                placeholder="Tình trạng (Mới/Đã qua sử dụng)"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                required
              />
              <input
                name="odometer"
                value={formData.odometer}
                onChange={handleChange}
                type="text"
                placeholder="Số ODO (km đã đi)"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              />
              <input
                name="origin"
                value={formData.origin}
                onChange={handleChange}
                type="text"
                placeholder="Xuất xứ (Lắp ráp trong nước/Nhập khẩu)"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              />
              <input
                name="exteriorColor"
                value={formData.exteriorColor}
                onChange={handleChange}
                type="text"
                placeholder="Màu ngoại thất"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              />
              <input
                name="interiorColor"
                value={formData.interiorColor}
                onChange={handleChange}
                type="text"
                placeholder="Màu nội thất"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              />
              <input
                name="seats"
                value={formData.seats}
                onChange={handleChange}
                type="text"
                placeholder="Số chỗ ngồi"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              />
              <input
                name="doors"
                value={formData.doors}
                onChange={handleChange}
                type="text"
                placeholder="Số cửa"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              />
              <input
                name="drive"
                value={formData.drive}
                onChange={handleChange}
                type="text"
                placeholder="Dẫn động (AWD, FWD...)"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              />
            </div>
          </section>

          {/* Image Upload Section */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 border-b border-gray-300 pb-2">
              Hình ảnh xe
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
              placeholder="Mô tả chi tiết về xe, tình trạng, bảo hành, lịch sử sử dụng..."
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
