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

const COOLDOWN_SEC = 60;

function Register() {
  const [form, setForm] = useState({ email: "", username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [hasActiveVerifyToken, setHasActiveVerifyToken] = useState(false);
  const [cooldownLeft, setCooldownLeft] = useState(0);
  const [errors, setErrors] = useState({ email: "", username: "", password: "" });

  useEffect(() => {
    if (cooldownLeft <= 0) return;
    const t = setInterval(() => setCooldownLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [cooldownLeft]);

  const showToast = (type, msg, duration = 3000) => {
    setToast({ type, msg });
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
      setTimeout(() => setToast(null), 400);
    }, duration);
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
    
    // Clear error when user types
    if (errors[id]) {
      setErrors((prev) => ({ ...prev, [id]: "" }));
    }
  };

  const handleRegisterOrResend = async () => {
    if (cooldownLeft > 0) {
      showToast("error", `Vui lòng đợi ${cooldownLeft}s`);
      return;
    }

    // Validate form only for first registration
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
        // Đăng ký lần đầu
        const resp = await api.post("/register", form);

        setHasActiveVerifyToken(true);
        showToast("success", "Vui lòng xác thực tài khoản qua email của bạn.");
        setCooldownLeft(COOLDOWN_SEC);
      } else {
        // Resend verification
        const resp = await api.post("/resend-verify", { email: form.email });

        showToast(
          "success",
          "Email xác thực đã được gửi lại. Vui lòng kiểm tra hộp thư."
        );
        setCooldownLeft(COOLDOWN_SEC);
      }
    } catch (error) {
      const status = error?.response?.status;
      const msg = error?.response?.data?.message;

      if (status === 400 && msg === "Email is already verified") {
        showToast(
          "success",
          "Tài khoản của bạn đã được xác thực. Vui lòng đăng nhập."
        );
      } else if (
        status === 400 &&
        msg?.startsWith?.("Missing required field")
      ) {
        showToast("error", msg);
      } else if (status === 409) {
        showToast("error", "Email đã tồn tại");
      } else if (status === 429) {
        showToast("error", msg || "Vui lòng đợi trước khi yêu cầu email khác.");
      } else if (error?.message?.includes?.("Network Error")) {
        showToast("error", "Lỗi mạng. Vui lòng kiểm tra kết nối.");
      } else {
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
