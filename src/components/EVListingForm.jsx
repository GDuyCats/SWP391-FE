import React, { useState } from "react";
import { ArrowLeft, ArrowRight, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function EVListingForm() {
  const navigate = useNavigate();
  const [images, setImages] = useState([]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const imageUrls = files.map((file) => URL.createObjectURL(file));
    setImages([...images, ...imageUrls]);
  };

  return (
    <div className="bg-gradient-to-b from-slate-800 to-slate-900 min-h-screen text-white flex flex-col items-center py-10 px-6">
      <div className="w-full max-w-5xl bg-white/10 p-8 rounded-2xl shadow-lg border border-slate-700">
        {/* Header */}
        <h1 className="text-2xl font-semibold mb-6 text-center">
          Tạo Tin Đăng Xe Điện
        </h1>

        {/* Technical Information */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 border-b border-slate-600 pb-2">
            Thông số kỹ thuật
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <input type="text" placeholder="Năm sản xuất" className="input-field" />
            <input type="text" placeholder="Tình trạng (Xe mới/Xe đã dùng)" className="input-field" />
            <input type="text" placeholder="Số Km đã đi" className="input-field" />
            <input type="text" placeholder="Xuất xứ (Lắp ráp/nhập khẩu)" className="input-field" />
            <input type="text" placeholder="Kiểu dáng (Sedan, SUV...)" className="input-field" />
            <input type="text" placeholder="Hộp số (Số tự động...)" className="input-field" />
            <input type="text" placeholder="Động cơ (Điện...)" className="input-field" />
            <input type="text" placeholder="Màu ngoại thất" className="input-field" />
            <input type="text" placeholder="Màu nội thất" className="input-field" />
            <input type="text" placeholder="Số chỗ ngồi" className="input-field" />
            <input type="text" placeholder="Số cửa" className="input-field" />
            <input type="text" placeholder="Dẫn động (AWD, FWD...)" className="input-field" />
          </div>
        </section>

        {/* Image Upload Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 border-b border-slate-600 pb-2">
            Hình ảnh xe
          </h2>
          <div className="flex items-center gap-4 mb-4">
            <label className="flex items-center gap-2 cursor-pointer bg-cyan-600 hover:bg-cyan-700 px-4 py-2 rounded-lg transition">
              <Upload className="w-5 h-5" /> Tải hình ảnh
              <input type="file" multiple className="hidden" onChange={handleImageUpload} />
            </label>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((src, index) => (
              <img
                key={index}
                src={src}
                alt={`uploaded ${index}`}
                className="w-full h-32 object-cover rounded-lg border border-slate-700"
              />
            ))}
          </div>
        </section>

        {/* Description */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 border-b border-slate-600 pb-2">
            Thông tin mô tả
          </h2>
          <textarea
            placeholder="Mô tả chi tiết về xe, tình trạng, bảo hành, lịch sử sử dụng..."
            className="w-full h-40 p-3 rounded-lg bg-white/10 border border-slate-700 focus:ring-2 focus:ring-cyan-500 resize-none"
          ></textarea>
        </section>

        <section className="mb-8">

          <div>
            <label className="block mb-2 font-semibold">Chọn loại tin</label>
            <div className="space-y-2">
              {[
                { name: "VIP Kim Cương", price: "200.000 vnd/ngày", color: "bg-cyan-700" },
                { name: "VIP Vàng", price: "100.000 vnd/ngày", color: "bg-lime-600" },
                { name: "VIP Bạc", price: "50.000 vnd/ngày", color: "bg-gray-500" },
                { name: "Tin Thường", price: "5.000 vnd/ngày", color: "bg-slate-400" },
              ].map((opt) => (
                <label
                  key={opt.name}
                  className={`flex justify-between items-center p-2 rounded-md cursor-pointer hover:bg-opacity-90 ${opt.color} text-white`}
                >
                  <input type="radio" name="vip" className="mr-2" /> {opt.name}
                  <span className="text-sm">{opt.price}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block mb-2 font-semibold">Thời gian đăng bài</label>
            <div className="flex gap-4">
              {["7 Ngày", "10 Ngày", "15 Ngày"].map((d) => (
                <button
                  key={d}
                  className="px-4 py-2 rounded-md bg-white/20 hover:bg-white/30 transition"
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </ section>

        {/* Price and Buttons */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <label className="text-lg font-medium">Giá bán:</label>
            <input
              type="text"
              placeholder="Nhập giá..."
              className="px-4 py-2 rounded-md bg-white/10 border border-slate-700 focus:ring-2 focus:ring-cyan-500"
            />
            <span className="font-semibold">VNĐ</span>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => navigate("/chooselisting")}
              className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 px-5 py-2 rounded-md transition"
            >
              <ArrowLeft size={18} /> Quay lại
            </button>

            <button
              className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 px-6 py-2 rounded-md font-semibold transition"
            >
              Tiếp tục <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}