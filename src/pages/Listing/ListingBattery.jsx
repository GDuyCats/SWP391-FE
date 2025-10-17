import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, DollarSign, ArrowLeft } from "lucide-react";

function ListingBattery() {
  const navigate = useNavigate();


  const [formData, setFormData] = useState({
    title: "",
    content: "",
    Images: "",
    thumbnail: "",
    price: "",
    phone: "",
    type: "",
    category: "",
  });

  const category = [
    { name: "battery", color: "bg-blue-600" },
    { name: "vehicle", color: "bg-green-600" },
  ];

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const totalCost = Number(formData.price) || 0;

  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => {
    // cleanup object URLs on unmount
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);




  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const urls = files.map((f) => URL.createObjectURL(f));
    setImageFiles((prev) => [...prev, ...files]);
    setImagePreviews((prev) => [...prev, ...urls]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMsg("");

    const payload = {
      ...formData,
      price: Number(formData.price) || 0,
      totalCost,
      images: imagePreviews,
      imageFiles, // File objects; step2 can use them if needed
    };

    // Just navigate to step2 and let step2 perform the POST
    navigate('/listing/step2', { state: payload });

    setIsSubmitting(false);
  };

  // Component render
  return (
    <div className="bg-gradient-to-r from-slate-800 to-cyan-900 text-white min-h-screen p-10">
      <div className="max-w-6xl mx-auto bg-white/10 p-8 rounded-2xl shadow-lg backdrop-blur">
        {/* Step Header */}
        <h2 className="text-2xl font-semibold mb-6">Tạo Tin Đăng - Bước 1</h2>

        {/* Wrap fields in a form so submit is triggered */}
        <form onSubmit={handleSubmit}>
          {/* Basic Info */}
          <section className="mb-6">
            <h3 className="font-semibold mb-2">Thông tin cơ bản</h3>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Tiêu đề"
              className="w-full p-2 rounded-md bg-white/20 border border-white/30 placeholder:text-gray-300"
            />
          </section>

          <section className="mb-6">
              <div className="mr-4">
                <label className="block mb-1 font-semibold">Chọn loại tin</label>
                <div className="space-y-2">
                  {category.map((opt) => (
                    <label key={opt.name} className={`flex items-center gap-2 ${opt.color} text-white p-2 rounded-md`}>
                      <input name="category" type="radio" value={opt.name} checked={formData.category === opt.name} onChange={handleChange} />
                      <span className="ml-2">{opt.name}</span>
                    </label>
                  ))}
                </div>
              </div>

            </section>

          <section className="mb-6">
            <div>
              <label className="block mb-1 text-sm">Thông tin kỹ thuật </label>
              <input
                type="text"
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="Thông tin kỹ thuật "
                className="w-full p-2 rounded-md bg-white/20 border border-white/30 placeholder:text-gray-300"
              />
            </div>

          </section>

          {/* Image Upload */}
          <section className="mb-6">
            <h3 className="font-semibold mb-2">Hình ảnh</h3>
            <div className="flex items-center gap-4 mb-3">
              <label className="flex items-center gap-2 cursor-pointer bg-cyan-600 hover:bg-cyan-700 px-4 py-2 rounded-lg transition">
                <Upload className="w-5 h-5" /> Chọn hình
                <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {imagePreviews.length > 0 ? (
                imagePreviews.map((src, index) => (
                  <img key={index} src={src} alt={`preview ${index}`} className="w-full h-32 object-cover rounded-lg border border-slate-700" />
                ))
              ) : (
                [1, 2, 3].map((box) => (
                  <div
                    key={box}
                    className="flex items-center justify-center border-2 border-dashed border-gray-400 rounded-md h-32 cursor-pointer hover:bg-white/10 transition"
                  >
                    <Upload className="w-6 h-6" />
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="mb-6 grid grid-cols-2 md:grid-cols-3 gap-4">

            <div>
              <label className="block mb-1 text-sm">Thông tin số điện thoại</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Thông tin số điện thoại"
                className="w-full p-2 rounded-md bg-white/20 border border-white/30 placeholder:text-gray-300"
              />
            </div>
          </section>

          {/* Price & Options */}
          <section className="grid md:grid-cols-2 gap-8">
            {/* Left: Price */}
            <div>
              <label className="block mb-2 font-semibold">Giá tiền (VND)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="Nhập giá tiền"
                  className="flex-1 p-2 rounded-md bg-white/20 border border-white/30"
                />
                <DollarSign />
              </div>
            </div>


          </section>


          <div className="mt-6 p-3 rounded-lg bg-[#173B63] flex justify-between items-center">

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-semibold"
            >
              {isSubmitting ? "Đang gửi..." : "Tiếp tục"}
            </button>
          </div>

        </form>

        {/* Actions */}
        <div className="flex justify-start mt-8">
          <button
            onClick={() => navigate('/chooselisting')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-md"
            type="button"
          >
            <ArrowLeft size={16} /> Quay lại
          </button>
        </div>

        {successMsg && <div className="mt-4 text-sm text-green-300">{successMsg}</div>}
      </div>
    </div>
  );
}

export default ListingBattery;