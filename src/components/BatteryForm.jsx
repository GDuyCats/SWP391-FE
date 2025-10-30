import React, { useState } from "react";
import { ArrowLeft, Upload, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import Toast from "./Toast";

export default function BatteryForm() {
  const navigate = useNavigate();
  const [imageFiles, setImageFiles] = useState([]);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [imagesPreview, setImagesPreview] = useState([]);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    battery_capacity: "",
    battery_range: "",
    soh: "",
    motorPower: "",
    motorType: "",
    chargingTimeAC: "",
    chargingTimeDC: "",
    chargingPort: "",
    price: "",
    content: "",
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
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      data.append("content", formData.content);
      data.append("price", formData.price);
      data.append("category", "battery");
      data.append("hasBattery", "true");

      // Thông tin pin
      data.append("battery_capacity", formData.battery_capacity);
      data.append("battery_range", formData.battery_range);
      if (formData.soh) data.append("soh", formData.soh);
      if (formData.motorPower) data.append("motorPower", formData.motorPower);
      if (formData.motorType) data.append("motorType", formData.motorType);
      if (formData.chargingTimeAC)
        data.append("chargingTimeAC", formData.chargingTimeAC);
      if (formData.chargingTimeDC)
        data.append("chargingTimeDC", formData.chargingTimeDC);
      if (formData.chargingPort)
        data.append("chargingPort", formData.chargingPort);

      // Files
      data.append("thumbnailFile", ensuredThumb);
      imageFiles.forEach((f) => data.append("imageFiles", f));

      console.log("[DEBUG] Gọi API /create với FormData (Battery)");

      const res = await api.post("/create", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("[DEBUG] Create battery post response:", res.data);

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
            type: "battery",
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
      console.error("[POST BATTERY ERROR]", err?.response?.data || err);
    }
    setLoading(false);
  };

  return (
    <div className="bg-gray-50 min-h-screen text-gray-800 flex flex-col items-center py-10 px-6">
      <div className="w-full max-w-5xl bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
        <h1 className="text-2xl font-semibold mb-6 text-center">
          Thông tin pin
        </h1>

        <form onSubmit={handleContinue}>
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 border-b border-gray-300 pb-2">
              Thông tin kỹ thuật pin
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
                name="battery_capacity"
                value={formData.battery_capacity}
                onChange={handleChange}
                type="text"
                placeholder="Dung lượng pin (kWh) *"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                required
              />
              <input
                name="battery_range"
                value={formData.battery_range}
                onChange={handleChange}
                type="text"
                placeholder="Quãng đường di chuyển (km) *"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                required
              />
              <input
                name="soh"
                value={formData.soh}
                onChange={handleChange}
                type="text"
                placeholder="Tình trạng pin - SOH (%)"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              />
              <input
                name="motorPower"
                value={formData.motorPower}
                onChange={handleChange}
                type="text"
                placeholder="Công suất động cơ (kW/HP)"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              />
              <input
                name="motorType"
                value={formData.motorType}
                onChange={handleChange}
                type="text"
                placeholder="Loại động cơ"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              />
              <input
                name="chargingTimeAC"
                value={formData.chargingTimeAC}
                onChange={handleChange}
                type="text"
                placeholder="Thời gian sạc thường (AC)"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              />
              <input
                name="chargingTimeDC"
                value={formData.chargingTimeDC}
                onChange={handleChange}
                type="text"
                placeholder="Thời gian sạc nhanh (DC)"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              />
              <input
                name="chargingPort"
                value={formData.chargingPort}
                onChange={handleChange}
                type="text"
                placeholder="Loại cổng sạc"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              />
            </div>
          </section>

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

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 border-b border-gray-300 pb-2">
              Mô tả chi tiết
            </h2>
            <textarea
              name="content"
              placeholder="Mô tả chi tiết về pin, tình trạng, bảo hành, lịch sử sử dụng..."
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
