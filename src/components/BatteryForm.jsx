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

/**
 * Component BatteryForm - Form đăng bài bán Pin
 *
 * Chức năng:
 * - Cho phép người dùng nhập thông tin pin để đăng bán
 * - Upload hình ảnh pin
 * - Validate dữ liệu đầu vào
 * - Gọi API tạo bài đăng
 * - Navigate đến trang chọn gói VIP sau khi tạo bài thành công
 *
 * Flow:
 * 1. User nhập thông tin pin + upload ảnh
 * 2. User click "Tiếp tục"
 * 3. Validate dữ liệu
 * 4. Gọi API POST /create với category="battery"
 * 5. Chuyển đến trang /listing/package (chọn gói VIP)
 */
export default function BatteryForm() {
  const navigate = useNavigate();

  // ============ STATE MANAGEMENT ============

  // State cho upload ảnh
  const [imageFiles, setImageFiles] = useState([]); // Array các file ảnh gốc
  const [thumbnailFile, setThumbnailFile] = useState(null); // File thumbnail (ảnh đầu tiên)
  const [imagesPreview, setImagesPreview] = useState([]); // Array URL preview ảnh

  // State cho Toast notification
  const [toast, setToast] = useState(null); // {msg: string, type: 'success'|'error'}

  // State cho loading và validation
  const [loading, setLoading] = useState(false); // Trạng thái đang submit form
  const [errors, setErrors] = useState({}); // Object chứa lỗi validation cho từng field

  // State cho form data - chứa tất cả thông tin pin
  const [formData, setFormData] = useState({
    // Thông tin cơ bản
    title: "", // Tiêu đề bài đăng
    phone: "", // SĐT liên hệ (optional)

    // Thông tin kỹ thuật pin
    battery_brand: "", // Hãng pin (VD: LG, Samsung)
    battery_model: "", // Model pin
    battery_capacity: "", // Dung lượng (kWh)
    battery_type: "", // Loại pin (LFP, NMC,...)
    battery_range: "", // Quãng đường di chuyển (km)
    battery_condition: "", // Tình trạng (VD: Còn 90%)
    charging_time: "", // Thời gian sạc (giờ)
    compatible_models: "", // Xe tương thích

    // Giá và mô tả
    price: "", // Giá bán
    content: "", // Mô tả chi tiết
  });

  // ============ EVENT HANDLERS ============

  /**
   * Hàm xử lý khi người dùng upload ảnh
   * - Thêm files vào imageFiles array
   * - Tạo preview URL cho từng ảnh
   * - Set ảnh đầu tiên làm thumbnail nếu chưa có
   *
   * @param {Event} e - Event object từ input file
   */
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Thêm files mới vào array imageFiles
    setImageFiles((prev) => [...prev, ...files]);

    // Tạo URL preview cho từng ảnh (để hiển thị trước khi upload)
    const imageUrls = files.map((file) => URL.createObjectURL(file));
    setImagesPreview((prev) => [...prev, ...imageUrls]);

    // Set ảnh đầu tiên làm thumbnail nếu chưa có thumbnail
    if (!thumbnailFile && files[0]) {
      setThumbnailFile(files[0]);
    }
  };

  /**
   * Hàm xử lý khi người dùng thay đổi giá trị input
   * - Cập nhật formData
   * - Xóa error message nếu có
   * - Tự động xóa khoảng trống cho số điện thoại
   * - Giới hạn giá bán tối đa 12 số
   *
   * @param {Event} e - Event object từ input
   */
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Tự động loại bỏ khoảng trống cho số điện thoại
    let processedValue = value;
    if (name === "phone") {
      processedValue = value.replace(/\s/g, ""); // Xóa tất cả khoảng trắng
    }

    // Giới hạn giá bán tối đa 12 số
    if (name === "price") {
      // Chỉ cho phép nhập số và giới hạn 12 ký tự
      processedValue = value.replace(/\D/g, "").slice(0, 12);
    }

    // Cập nhật formData với giá trị mới
    setFormData((prev) => ({ ...prev, [name]: processedValue }));

    // Xóa error message khi user bắt đầu sửa
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  /**
   * Hàm xử lý khi user submit form (click "Tiếp tục")
   *
   * Flow:
   * 1. Kiểm tra có ảnh hay chưa
   * 2. Validate tất cả các fields
   * 3. Nếu có lỗi: hiển thị lỗi và scroll đến field lỗi đầu tiên
   * 4. Nếu hợp lệ: gọi API tạo bài đăng
   * 5. Nếu thành công: chuyển đến trang chọn gói VIP
   *
   * @param {Event} e - Submit event
   */
  const handleContinue = async (e) => {
    e.preventDefault();
    setLoading(true);

    // ===== BƯỚC 1: Kiểm tra ảnh =====
    const ensuredThumb = thumbnailFile || imageFiles[0] || null;
    if (!ensuredThumb) {
      setToast({
        msg: "Vui lòng chọn ít nhất 1 ảnh (thumbnail)",
        type: "error",
      });
      setLoading(false);
      return;
    }

    // ===== BƯỚC 2: Validate Form Data =====
    // Định nghĩa các rule validation cho từng field
    const validations = {
      title: validateTextLength(formData.title, "Tiêu đề bài đăng", {
        min: 5,
        max: 200,
      }),
      battery_brand: validateRequired(formData.battery_brand, "Hãng pin"),
      battery_model: validateRequired(formData.battery_model, "Model pin"),
      battery_capacity: validateNumber(
        formData.battery_capacity,
        "Dung lượng pin",
        { min: 1, max: 100 }
      ),
      battery_type: validateRequired(formData.battery_type, "Loại pin"),
      battery_range: validateNumber(
        formData.battery_range,
        "Quãng đường di chuyển",
        { min: 1 }
      ),
      battery_condition: validateRequired(
        formData.battery_condition,
        "Tình trạng pin"
      ),
      charging_time: validateNumber(formData.charging_time, "Thời gian sạc", {
        min: 0.1,
      }),
      price: validatePrice(formData.price),
      content: validateTextLength(formData.content, "Mô tả chi tiết", {
        min: 20,
        max: 5000,
      }),
    };

    // Phone là optional, chỉ validate nếu user có nhập
    if (formData.phone && formData.phone.trim() !== "") {
      validations.phone = validatePhone(formData.phone);
    }

    // Thực hiện validate toàn bộ form
    const validation = validateForm(validations);

    // ===== BƯỚC 3: Xử lý nếu có lỗi validation =====
    if (!validation.isValid) {
      setErrors(validation.errors);
      setToast({
        msg: "Vui lòng kiểm tra lại các trường thông tin",
        type: "error",
      });
      setLoading(false);

      // Scroll đến field lỗi đầu tiên và focus vào nó
      const firstErrorField = Object.keys(validation.errors)[0];
      const element = document.getElementsByName(firstErrorField)[0];
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.focus();
      }
      return;
    }

    // ===== BƯỚC 4: Chuẩn bị và gọi API =====
    try {
      // Tạo FormData để gửi cả text và files
      const data = new FormData();

      // Thêm thông tin cơ bản
      data.append("title", formData.title);
      data.append("content", formData.content);
      data.append("price", formData.price);
      data.append("category", "battery"); // Category là "battery"
      data.append("hasBattery", "true"); // Flag đánh dấu có thông tin pin
      if (formData.phone) data.append("phone", formData.phone); // Phone optional

      // Thêm thông tin kỹ thuật pin
      data.append("battery_brand", formData.battery_brand);
      data.append("battery_model", formData.battery_model);
      data.append("battery_capacity", formData.battery_capacity);
      data.append("battery_type", formData.battery_type);
      data.append("battery_range", formData.battery_range);
      data.append("battery_condition", formData.battery_condition);
      data.append("charging_time", formData.charging_time);
      if (formData.compatible_models)
        data.append("compatible_models", formData.compatible_models);

      // Thêm files ảnh
      data.append("thumbnailFile", ensuredThumb); // Ảnh thumbnail
      imageFiles.forEach((f) => data.append("imageFiles", f)); // Các ảnh còn lại

      console.log("[DEBUG] Gọi API /create với FormData (Battery)");

      // Gọi API tạo bài đăng
      const res = await api.post("/create", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("[DEBUG] Create battery post response:", res.data);

      // ===== BƯỚC 5: Xử lý response thành công =====
      // Extract postId từ response (API có thể trả về cấu trúc khác nhau)
      const post = res.data.data || res.data.post || res.data;
      const postId = post?.id || post?.postId;

      if (!postId) {
        console.error("[WARNING] postId not found in response:", res.data);
      }

      // Hiển thị thông báo thành công
      setToast({
        msg: res.data.message || "Tạo bài thành công!",
        type: "success",
      });

      // Chờ 1.2s rồi chuyển đến trang chọn gói VIP
      setTimeout(() => {
        setToast(null);
        navigate("/listing/package", {
          state: {
            postId: postId, // ID bài đăng vừa tạo
            type: "battery", // Loại bài đăng
            ...formData, // Spread toàn bộ form data
            images: imagesPreview, // Preview images
          },
        });
      }, 1200);
    } catch (err) {
      // ===== Xử lý lỗi API =====
      const apiMsg = err?.response?.data?.message;
      setToast({
        msg: apiMsg ? `Lỗi: ${apiMsg}` : "Tạo bài thất bại!",
        type: "error",
      });
      console.error("[POST BATTERY ERROR]", err?.response?.data || err);
    }
    setLoading(false);
  };

  // ============ RENDER UI ============
  return (
    <div className="bg-gray-50 min-h-screen text-gray-800 flex flex-col items-center py-10 px-6">
      <div className="w-full max-w-5xl bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
        {/* ===== TIÊU ĐỀ ===== */}
        <h1 className="text-2xl font-semibold mb-6 text-center">
          Thông tin pin
        </h1>

        <form onSubmit={handleContinue}>
          {/* ===== SECTION 1: Thông tin kỹ thuật pin ===== */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 border-b border-gray-300 pb-2">
              Thông tin kỹ thuật pin
            </h2>
            {/* Grid 3 cột responsive: 1 cột trên mobile, 2 trên tablet, 3 trên desktop */}
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

          {/* ===== SECTION 2: Hình ảnh pin ===== */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 border-b border-gray-300 pb-2">
              Hình ảnh pin
            </h2>

            {/* Button upload ảnh - input file ẩn, trigger bằng label */}
            <div className="flex items-center gap-4 mb-4">
              <label className="flex items-center gap-2 cursor-pointer bg-gray-800 hover:bg-gray-900 px-4 py-2 rounded-lg transition text-white">
                <Upload className="w-5 h-5" /> Tải hình ảnh
                <input
                  type="file"
                  multiple // Cho phép chọn nhiều ảnh
                  className="hidden" // Ẩn input, dùng label để trigger
                  onChange={handleImageUpload}
                  accept="image/*" // Chỉ chấp nhận file ảnh
                />
              </label>
            </div>

            {/* Grid hiển thị preview các ảnh đã upload */}
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

          {/* ===== SECTION 3: Giá bán ===== */}
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

          {/* ===== SECTION 4: Mô tả chi tiết ===== */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 border-b border-gray-300 pb-2">
              Mô tả chi tiết
            </h2>
            <div>
              {/* Textarea với dynamic styling dựa trên có error hay không */}
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
              {/* Hiển thị error message nếu có */}
              {errors.content && (
                <p className="text-red-500 text-sm mt-1">{errors.content}</p>
              )}
            </div>
          </section>

          {/* ===== ACTION BUTTONS ===== */}
          <div className="flex justify-between items-center">
            {/* Nút Quay lại - về trang chọn loại sản phẩm */}
            <button
              type="button"
              onClick={() => navigate("/chooselisting")}
              className="flex items-center gap-2 bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-md text-gray-800"
            >
              <ArrowLeft size={18} /> Quay lại
            </button>

            {/* Nút Submit - tiếp tục đến chọn gói VIP */}
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

        {/* ===== TOAST NOTIFICATION ===== */}
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
