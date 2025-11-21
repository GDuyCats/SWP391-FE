import React, { useState } from "react";
import { ArrowLeft, Upload, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import Toast from "./Toast";
import FormInput from "./FormInput";
import {
  validateRequired,
  validatePhone,
  validatePrice,
  validateNumber,
  validateTextLength,
  validateForm,
} from "../utils/validation";

export default function BatteryForm() {
  const navigate = useNavigate();
  const [imageFiles, setImageFiles] = useState([]);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [imagesPreview, setImagesPreview] = useState([]);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    title: "",
    phone: "",
    battery_brand: "",
    battery_model: "",
    battery_capacity: "",
    battery_type: "",
    battery_range: "",
    battery_condition: "",
    charging_time: "",
    compatible_models: "",
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
    
    // Tự động loại bỏ khoảng trống cho số điện thoại
    let processedValue = value;
    if (name === "phone") {
      processedValue = value.replace(/\s/g, "");
    }
    
    setFormData((prev) => ({ ...prev, [name]: processedValue }));

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
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

    // Validate form
    const validations = {
      title: validateTextLength(formData.title, "Tiêu đề bài đăng", { min: 5, max: 200 }),
      battery_brand: validateRequired(formData.battery_brand, "Hãng pin"),
      battery_model: validateRequired(formData.battery_model, "Model pin"),
      battery_capacity: validateNumber(formData.battery_capacity, "Dung lượng pin", { min: 1 }),
      battery_type: validateRequired(formData.battery_type, "Loại pin"),
      battery_range: validateNumber(formData.battery_range, "Quãng đường di chuyển", { min: 1 }),
      battery_condition: validateRequired(formData.battery_condition, "Tình trạng pin"),
      charging_time: validateNumber(formData.charging_time, "Thời gian sạc", { min: 0.1 }),
      price: validatePrice(formData.price),
      content: validateTextLength(formData.content, "Mô tả chi tiết", { min: 20, max: 5000 }),
    };

    // Phone is optional, but validate if provided
    if (formData.phone && formData.phone.trim() !== "") {
      validations.phone = validatePhone(formData.phone);
    }

    const validation = validateForm(validations);
    if (!validation.isValid) {
      setErrors(validation.errors);
      setToast({
        msg: "Vui lòng kiểm tra lại các trường thông tin",
        type: "error",
      });
      setLoading(false);
      
      // Scroll to first error
      const firstErrorField = Object.keys(validation.errors)[0];
      const element = document.getElementsByName(firstErrorField)[0];
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.focus();
      }
      return;
    }

    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("content", formData.content);
      data.append("price", formData.price);
      data.append("category", "battery");
      data.append("hasBattery", "true");
      if (formData.phone) data.append("phone", formData.phone);

      // Thông tin pin
      data.append("battery_brand", formData.battery_brand);
      data.append("battery_model", formData.battery_model);
      data.append("battery_capacity", formData.battery_capacity);
      data.append("battery_type", formData.battery_type);
      data.append("battery_range", formData.battery_range);
      data.append("battery_condition", formData.battery_condition);
      data.append("charging_time", formData.charging_time);
      if (formData.compatible_models)
        data.append("compatible_models", formData.compatible_models);

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
              <FormInput
                name="title"
                value={formData.title}
                onChange={handleChange}
                type="text"
                placeholder="Tiêu đề bài đăng *"
                error={errors.title}
                required
              />
              <FormInput
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                type="tel"
                placeholder="Số điện thoại liên hệ"
                error={errors.phone}
              />
              <FormInput
                name="battery_brand"
                value={formData.battery_brand}
                onChange={handleChange}
                type="text"
                placeholder="Hãng pin *"
                error={errors.battery_brand}
                required
              />
              <FormInput
                name="battery_model"
                value={formData.battery_model}
                onChange={handleChange}
                type="text"
                placeholder="Model pin *"
                error={errors.battery_model}
                required
              />
              <FormInput
                name="battery_capacity"
                value={formData.battery_capacity}
                onChange={handleChange}
                type="number"
                placeholder="Dung lượng pin (kWh) *"
                error={errors.battery_capacity}
                required
              />
              <FormInput
                name="battery_type"
                value={formData.battery_type}
                onChange={handleChange}
                type="text"
                placeholder="Loại pin (LFP, NMC,...) *"
                error={errors.battery_type}
                required
              />
              <FormInput
                name="battery_range"
                value={formData.battery_range}
                onChange={handleChange}
                type="number"
                placeholder="Quãng đường di chuyển (km) *"
                error={errors.battery_range}
                required
              />
              <FormInput
                name="battery_condition"
                value={formData.battery_condition}
                onChange={handleChange}
                type="text"
                placeholder="Tình trạng pin (Còn 90%,...) *"
                error={errors.battery_condition}
                required
              />
              <FormInput
                name="charging_time"
                value={formData.charging_time}
                onChange={handleChange}
                type="number"
                step="0.1"
                placeholder="Thời gian sạc (giờ) *"
                error={errors.charging_time}
                required
              />
              <FormInput
                name="compatible_models"
                value={formData.compatible_models}
                onChange={handleChange}
                type="text"
                placeholder='Xe tương thích (VD: ["VF e34","VF 5"])'
                className="col-span-1 md:col-span-2"
                error={errors.compatible_models}
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
            <div>
              <div className="flex items-center gap-3">
                <FormInput
                  name="price"
                  type="number"
                  placeholder="Nhập giá..."
                  className="px-4 py-2 rounded-md"
                  value={formData.price}
                  onChange={handleChange}
                  error={errors.price}
                  required
                />
                <span className="font-semibold">VNĐ</span>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 border-b border-gray-300 pb-2">
              Mô tả chi tiết
            </h2>
            <div>
              <textarea
                name="content"
                placeholder="Mô tả chi tiết về pin, tình trạng, bảo hành, lịch sử sử dụng... (tối thiểu 20 ký tự)"
                className={`w-full h-40 p-3 rounded-lg border focus:ring-2 focus:border-transparent resize-none transition-colors ${
                  errors.content
                    ? "border-red-500 focus:ring-red-200 focus:border-red-500"
                    : "border-gray-300 focus:ring-gray-500 focus:border-gray-500"
                }`}
                value={formData.content}
                onChange={handleChange}
                required
              />
              {errors.content && (
                <p className="text-red-500 text-sm mt-1">{errors.content}</p>
              )}
            </div>
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
