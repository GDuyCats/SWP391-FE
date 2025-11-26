import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Mail,
  User,
  Lock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { api } from "../services/api";
import { validateEmail, validateUsername, validatePassword, validateForm } from "../utils/validation";

/**
 * Page Register - Trang đăng ký tài khoản mới
 * 
 * Route: /register
 * 
 * Chức năng:
 * - Form đăng ký với email, username, password
 * - Validation form inputs
 * - Gọi API đăng ký
 * - Gửi email xác thực đến user
 * - Cho phép gửi lại email xác thực (có cooldown 60s)
 * - Hiển thị toast notifications
 * 
 * State:
 * - form: {email, username, password}
 * - hasActiveVerifyToken: Đã gửi email verify chưa
 * - cooldownLeft: Thời gian chờ trước khi gửi lại (60s)
 * - errors: Validation errors
 * 
 * Flow:
 * 1. User nhập thông tin + click "Tiếp tục"
 * 2. Validate inputs
 * 3. Gọi API POST /register
 * 4. Server gửi email verify
 * 5. User check email + click link verify
 * 6. User có thể click "Gửi lại" nếu chưa nhận được email (cooldown 60s)
 */

// Hằng số thời gian cooldown (60 giây)
const COOLDOWN_SEC = 60;

function Register() {
  // ============ STATE MANAGEMENT ============
  const [form, setForm] = useState({ email: "", username: "", password: "" });
  const [loading, setLoading] = useState(false); // Đang gọi API
  const [toast, setToast] = useState(null); // {type, msg}
  const [toastVisible, setToastVisible] = useState(false); // Animation state
  const [hasActiveVerifyToken, setHasActiveVerifyToken] = useState(false); // Đã gửi email verify chưa
  const [cooldownLeft, setCooldownLeft] = useState(0); // Thời gian chờ còn lại (giây)
  const [errors, setErrors] = useState({ email: "", username: "", password: "" }); // Validation errors

  // ============ EFFECTS ============
  
  /**
   * useEffect: Countdown timer cho cooldown
   * - Giảm cooldownLeft mỗi giây
   * - Cleanup interval khi component unmount
   */
  useEffect(() => {
    if (cooldownLeft <= 0) return;
    const t = setInterval(() => setCooldownLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [cooldownLeft]);

  // ============ HANDLERS ============
  
  /**
   * Hàm hiển thị toast notification với animation
   * @param {string} type - 'success' hoặc 'error'
   * @param {string} msg - Nội dung thông báo
   * @param {number} duration - Thời gian hiển thị (ms), default 3000ms
   */
  const showToast = (type, msg, duration = 3000) => {
    setToast({ type, msg });
    setToastVisible(true);
    // Fade out sau duration
    setTimeout(() => {
      setToastVisible(false);
      // Remove toast hoàn toàn sau animation
      setTimeout(() => setToast(null), 400);
    }, duration);
  };

  /**
   * Hàm xử lý khi user thay đổi input
   * - Cập nhật form state
   * - Xóa error message khi user bắt đầu sửa
   */
  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
    
    // Clear error khi user types
    if (errors[id]) {
      setErrors((prev) => ({ ...prev, [id]: "" }));
    }
  };

  /**
   * Hàm xử lý đăng ký hoặc gửi lại email verify
   * 
   * Flow có 2 trường hợp:
   * 
   * TRƯỜNG HỢP 1: Đăng ký lần đầu (hasActiveVerifyToken = false)
   * 1. Validate form inputs
   * 2. Gọi API POST /register
   * 3. Server gửi email verify
   * 4. Set hasActiveVerifyToken = true
   * 5. Bắt đầu cooldown 60s
   * 
   * TRƯỜNG HỢP 2: Gửi lại email verify (hasActiveVerifyToken = true)
   * 1. Không cần validate (đã validate trước đó)
   * 2. Gọi API POST /resend-verify
   * 3. Server gửi lại email verify
   * 4. Reset cooldown 60s
   * 
   * Error Handling:
   * - 400: Email đã verify hoặc thiếu field
   * - 409: Email đã tồn tại
   * - 429: Gửi quá nhiều request (rate limit)
   * - Network Error: CORS hoặc API down
   */
  const handleRegisterOrResend = async () => {
    // Kiểm tra cooldown
    if (cooldownLeft > 0) {
      showToast("error", `Vui lòng đợi ${cooldownLeft}s`);
      return;
    }

    // ===== BƯỚC 1: Validate form (chỉ cho lần đầu đăng ký) =====
    if (!hasActiveVerifyToken) {
      const validation = validateForm({
        email: validateEmail(form.email),
        username: validateUsername(form.username),
        password: validatePassword(form.password),
      });

      if (!validation.isValid) {
        setErrors(validation.errors);
        return;
      }
    }

    try {
      setLoading(true);

      if (!hasActiveVerifyToken) {
        // ===== TRƯỜNG HỢP 1: Đăng ký lần đầu =====
        const resp = await api.post("/register", form);

        // Đánh dấu đã gửi email verify
        setHasActiveVerifyToken(true);
        showToast("success", "Vui lòng xác thực tài khoản qua email của bạn.");
        setCooldownLeft(COOLDOWN_SEC); // Bắt đầu cooldown 60s
      } else {
        // ===== TRƯỜNG HỢP 2: Gửi lại email verify =====
        const resp = await api.post("/resend-verify", { email: form.email });

        showToast(
          "success",
          "Email xác thực đã được gửi lại. Vui lòng kiểm tra hộp thư."
        );
        setCooldownLeft(COOLDOWN_SEC); // Reset cooldown 60s
      }
    } catch (error) {
      // ===== Xử lý các lỗi =====
      const status = error?.response?.status;
      const msg = error?.response?.data?.message;

      if (status === 400 && msg === "Email is already verified") {
        // Email đã được verify trước đó
        showToast(
          "success",
          "Tài khoản của bạn đã được xác thực. Vui lòng đăng nhập."
        );
      } else if (
        status === 400 &&
        msg?.startsWith?.("Missing required field")
      ) {
        // Thiếu field bắt buộc
        showToast("error", msg);
      } else if (status === 409) {
        // Email đã tồn tại trong database
        showToast("error", "Email đã tồn tại");
      } else if (status === 429) {
        // Rate limit: gửi quá nhiều request
        showToast("error", msg || "Vui lòng đợi trước khi yêu cầu email khác.");
      } else if (error?.message?.includes?.("Network Error")) {
        // CORS hoặc API down
        showToast("error", "Lỗi mạng. Vui lòng kiểm tra kết nối.");
      } else {
        // Các lỗi khác
        showToast(
          "error",
          msg ||
            (hasActiveVerifyToken ? "Gửi lại thất bại" : "Đăng ký thất bại")
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Button disabled khi đang loading hoặc trong cooldown
  const isDisabled = loading || cooldownLeft > 0;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 px-5 py-3 rounded-xl shadow-lg text-white flex items-center gap-3
            transition-all duration-300 transform z-50
            ${
              toastVisible
                ? "translate-x-0 opacity-100"
                : "translate-x-full opacity-0"
            }
            ${toast.type === "success" ? "bg-green-500" : "bg-red-500"}`}
        >
          {toast.type === "success" ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <XCircle className="w-5 h-5" />
          )}
          <span className="font-medium">{toast.msg}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="w-full max-w-md">
        {/* Back Button */}
        <a
          href="/login"
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Quay lại đăng nhập</span>
        </a>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Logo */}
          <div className="flex justify-center mb-2">
            <a
              href="/"
              className="w-30 h-30 hover:scale-110 transition-transform duration-300 ease-in-out block"
            >
              <img
                src="/logo.png"
                alt="LogoWeb"
                className="w-full h-full object-contain"
              />
            </a>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-800 text-center mb-2">
            Tạo tài khoản mới
          </h1>
          <p className="text-gray-500 text-center mb-8">
            Điền thông tin bên dưới để đăng ký
          </p>

          {/* Form */}
          <div className="space-y-5">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="email@example.com"
                  className={`w-full pl-11 pr-4 py-3 border rounded-xl
                    focus:outline-none focus:ring-2 transition-all
                    ${errors.email 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-100' 
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100'}`}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Username Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên người dùng
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="username"
                  type="text"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="Nhập tên người dùng"
                  className={`w-full pl-11 pr-4 py-3 border rounded-xl
                    focus:outline-none focus:ring-2 transition-all
                    ${errors.username 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-100' 
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100'}`}
                />
              </div>
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">{errors.username}</p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                  className={`w-full pl-11 pr-4 py-3 border rounded-xl
                    focus:outline-none focus:ring-2 transition-all
                    ${errors.password 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-100' 
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100'}`}
                />
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleRegisterOrResend}
              disabled={isDisabled}
              className={`w-full py-3 rounded-xl font-semibold text-white
                transition-all duration-200
                ${
                  isDisabled
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600 active:scale-95"
                }`}
            >
              {loading
                ? "Đang xử lý..."
                : cooldownLeft > 0
                ? `Gửi lại sau ${cooldownLeft}s`
                : hasActiveVerifyToken
                ? "Gửi lại email xác thực"
                : "Tiếp tục"}
            </button>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Đã có tài khoản?{" "}
              <a
                href="/login"
                className="text-blue-500 font-semibold hover:underline"
              >
                Đăng nhập
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
