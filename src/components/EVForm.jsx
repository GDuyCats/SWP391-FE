import React, { useState } from "react";
import { ArrowLeft, Upload, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import Toast from "./Toast";

export default function EVForm() {
  const navigate = useNavigate();
  const [imageFiles, setImageFiles] = useState([]);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [imagesPreview, setImagesPreview] = useState([]);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    phone: "",
    brand: "",
    model: "",
    year: "",
    mileage: "",
    condition: "",
    price: "",
    content: "",
    // Checkbox đăng kèm pin
    hasBattery: false,
    // Các trường pin (chỉ gửi khi hasBattery=true)
    battery_brand: "",
    battery_model: "",
    battery_capacity: "",
    battery_type: "",
    battery_range: "",
    battery_condition: "",
    charging_time: "",
    compatible_models: "",
  });

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setImageFiles((prev) => [...prev, ...files]);
    const imageUrls = files.map((file) => URL.createObjectURL(file));
    setImagesPreview((prev) => [...prev, ...imageUrls]);
    if (!thumbnailFile && files[0]) {
      setThumbnailFile(files[0]);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleContinue = async (e) => {
    e.preventDefault();
    setLoading(true);

    const ensuredThumb = thumbnailFile || imageFiles[0] || null;
    if (!ensuredThumb) {
      setToast({
        msg: "Vui lòng chọn ít nhất 1 ảnh (thumbnail)",
        type: "error",
      });
      setLoading(false);
      return;
    }

    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("phone", formData.phone);
      data.append("content", formData.content);
      data.append("price", formData.price);
      data.append("category", "vehicle");
      data.append("hasBattery", String(formData.hasBattery));

      // Thông tin xe
      data.append("brand", formData.brand);
      data.append("model", formData.model);
      data.append("year", formData.year);
      data.append("mileage", formData.mileage);
      data.append("condition", formData.condition);

      // Nếu có pin => append các trường pin
      if (formData.hasBattery) {
        data.append("battery_brand", formData.battery_brand);
        data.append("battery_model", formData.battery_model);
        data.append("battery_capacity", formData.battery_capacity);
        if (formData.battery_type)
          data.append("battery_type", formData.battery_type);
        if (formData.battery_range)
          data.append("battery_range", formData.battery_range);
        if (formData.battery_condition)
          data.append("battery_condition", formData.battery_condition);
        if (formData.charging_time)
          data.append("charging_time", formData.charging_time);
        if (formData.compatible_models)
          data.append("compatible_models", formData.compatible_models);
      }

      // Files
      data.append("thumbnailFile", ensuredThumb);
      imageFiles.forEach((f) => data.append("imageFiles", f));

      console.log("[DEBUG] Gọi API /create với FormData");

      const res = await api.post("/create", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("[DEBUG] Create post response:", res.data);

      const post = res.data.data || res.data.post || res.data;
      const postId = post?.id || post?.postId;

      if (!postId) {
        console.error("[WARNING] postId not found in response:", res.data);
      }

      setToast({
        msg: res.data.message || "Tạo bài thành công!",
        type: "success",
      });

      setTimeout(() => {
        setToast(null);
        navigate("/listing/package", {
          state: {
            postId: postId,
            type: "ev",
            ...formData,
            images: imagesPreview,
          },
        });
      }, 1200);
    } catch (err) {
      const apiMsg = err?.response?.data?.message;
      setToast({
        msg: apiMsg ? `Lỗi: ${apiMsg}` : "Tạo bài thất bại!",
        type: "error",
      });
      console.error("[POST ERROR]", err?.response?.data || err);
    }
    setLoading(false);
  };

  return (
    <div className="bg-gray-50 min-h-screen text-gray-800 flex flex-col items-center py-10 px-6">
      <div className="w-full max-w-5xl bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
        <h1 className="text-2xl font-semibold mb-6 text-center">
          Thông tin xe điện
        </h1>

        <form onSubmit={handleContinue}>
          {/* Thông tin cơ bản */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 border-b border-gray-300 pb-2">
              Thông tin cơ bản
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                type="text"
                placeholder="Tiêu đề bài đăng *"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                required
              />
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                type="text"
                placeholder="Số điện thoại liên hệ *"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                required
              />
              <input
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                type="text"
                placeholder="Hãng xe *"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                required
              />
              <input
                name="model"
                value={formData.model}
                onChange={handleChange}
                type="text"
                placeholder="Dòng xe *"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                required
              />
              <input
                name="year"
                value={formData.year}
                onChange={handleChange}
                type="text"
                placeholder="Năm sản xuất *"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                required
              />
              <input
                name="mileage"
                value={formData.mileage}
                onChange={handleChange}
                type="text"
                placeholder="Số km đã đi"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              />
              <input
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                type="text"
                placeholder="Tình trạng (Mới/Đã qua sử dụng) *"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                required
              />
            </div>
          </section>

          {/* Checkbox đăng kèm pin */}
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <input
                id="hasBattery"
                name="hasBattery"
                type="checkbox"
                checked={formData.hasBattery}
                onChange={handleChange}
                className="w-4 h-4"
              />
              <label htmlFor="hasBattery" className="font-medium select-none">
                Bài đăng kèm pin
              </label>
            </div>

            {formData.hasBattery && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <input
                  name="battery_brand"
                  value={formData.battery_brand}
                  onChange={handleChange}
                  type="text"
                  placeholder="Thương hiệu pin *"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  required
                />
                <input
                  name="battery_model"
                  value={formData.battery_model}
                  onChange={handleChange}
                  type="text"
                  placeholder="Model pin *"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  required
                />
                <input
                  name="battery_capacity"
                  value={formData.battery_capacity}
                  onChange={handleChange}
                  type="text"
                  placeholder="Dung lượng pin *"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  required
                />
                <input
                  name="battery_type"
                  value={formData.battery_type}
                  onChange={handleChange}
                  type="text"
                  placeholder="Loại pin"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
                <input
                  name="battery_range"
                  value={formData.battery_range}
                  onChange={handleChange}
                  type="text"
                  placeholder="Tầm hoạt động"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
                <input
                  name="battery_condition"
                  value={formData.battery_condition}
                  onChange={handleChange}
                  type="text"
                  placeholder="Tình trạng pin"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
                <input
                  name="charging_time"
                  value={formData.charging_time}
                  onChange={handleChange}
                  type="text"
                  placeholder="Thời gian sạc"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
                <input
                  name="compatible_models"
                  value={formData.compatible_models}
                  onChange={handleChange}
                  type="text"
                  placeholder="Các dòng xe tương thích"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
              </div>
            )}
          </section>

          {/* Hình ảnh */}
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
                  accept="image/*"
                />
              </label>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {imagesPreview.map((src, index) => (
                <img
                  key={index}
                  src={src}
                  alt={`uploaded ${index}`}
                  className="w-full h-32 object-cover rounded-lg border border-gray-300"
                />
              ))}
            </div>
          </section>

          {/* Giá bán */}
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

          {/* Mô tả */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 border-b border-gray-300 pb-2">
              Mô tả chi tiết
            </h2>
            <textarea
              name="content"
              placeholder="Mô tả chi tiết về xe, tình trạng, bảo hành, lịch sử sử dụng..."
              className="w-full h-40 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:border-transparent resize-none"
              value={formData.content}
              onChange={handleChange}
              required
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
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-900 px-6 py-2 rounded-md font-semibold text-white disabled:opacity-70"
              disabled={loading}
            >
              {loading ? "Đang đăng bài..." : "Tiếp tục"}{" "}
              <ArrowRight size={18} />
            </button>
          </div>
        </form>

        {toast && (
          <Toast
            msg={toast.msg}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  );
}
