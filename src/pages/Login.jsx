import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { api } from "../services/api";
import { User, Lock, CheckCircle, XCircle } from "lucide-react";
import {
  validateUsername,
  validatePassword,
  validateForm,
} from "../utils/validation";

/**
 * Page Login - Trang đăng nhập
 *
 * Route: /login
 *
 * Chức năng:
 * - Form đăng nhập với username và password
 * - Validation form inputs
 * - Gọi API đăng nhập
 * - Lưu user data và token vào localStorage
 * - Dispatch "userLogin" event để Header cập nhật
 * - Redirect dựa trên role (admin/staff → /admin, user → /)
 * - Hiển thị toast từ cookies (verify success/expired/invalid)
 *
 * State:
 * - form: {username, password}
 * - toast: {type, msg}
 * - errors: {username, password}
 *
 * Flow:
 * 1. User nhập username + password
 * 2. Click "Đăng nhập"
 * 3. Validate inputs
 * 4. Gọi API POST /login
 * 5. Lưu user + token vào localStorage
 * 6. Dispatch userLogin event
 * 7. Redirect theo role
 */
function Login() {
  // ============ HOOKS ============
  const location = useLocation();
  const navigate = useNavigate();

  // ============ STATE MANAGEMENT ============
  const [form, setForm] = useState({ username: "", password: "" });
  const [toast, setToast] = useState(null); // {type: 'success'|'error', msg: string}
  const [toastVisible, setToastVisible] = useState(false); // Animation state
  const [errors, setErrors] = useState({ username: "", password: "" }); // Validation errors

  // ============ HANDLERS ============

  /**
   * Hàm xử lý khi user thay đổi input
   * - Cập nhật form state
   * - Xóa error message khi user bắt đầu sửa
   */
  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));

    // Clear error when user types
    if (errors[id]) {
      setErrors((prev) => ({ ...prev, [id]: "" }));
    }
  };

  /**
   * Hàm hiển thị toast notification với animation
   * @param {string} type - 'success' hoặc 'error'
   * @param {string} msg - Nội dung thông báo
   * @param {number} duration - Thời gian hiển thị (ms)
   */
  const showToast = (type, msg, duration = 3000) => {
    setToast({ type, msg });
    setToastVisible(true);
    // Fade out animation sau duration
    setTimeout(() => {
      setToastVisible(false);
      // Remove toast sau animation
      setTimeout(() => setToast(null), 400);
    }, duration);
  };

  // ============ EFFECTS ============

  /**
   * useEffect: Kiểm tra cookies để hiển thị toast từ email verification
   * - justVerified: Email verified thành công
   * - verifyExpired: Link verify đã hết hạn
   * - verifyInvalid: Link verify không hợp lệ
   * - alreadyVerified: Account đã được verify trước đó
   */
  useEffect(() => {
    // Helper: Kiểm tra cookie có tồn tại không
    const has = (name) =>
      document.cookie.split("; ").some((c) => c.trim().startsWith(`${name}=1`));
    // Helper: Xóa cookie
    const clear = (name) => (document.cookie = `${name}=; Max-Age=0; path=/`);

    // Kiểm tra từng cookie và hiển thị toast tương ứng
    if (has("justVerified")) {
      showToast("success", "Your account are verified");
      clear("justVerified");
    }
    if (has("verifyExpired")) {
      showToast(
        "error",
        "Verification link expired. Please resend a new link."
      );
      clear("verifyExpired");
    }
    if (has("verifyInvalid")) {
      showToast("error", "Invalid verification link.");
      clear("verifyInvalid");
    }
    if (has("alreadyVerified")) {
      showToast(
        "success",
        "Your account is already verified. Please login your account"
      );
      clear("alreadyVerified");
    }
  }, [location.pathname]);

  /**
   * Hàm xử lý đăng nhập
   *
   * Flow:
   * 1. Validate username và password
   * 2. Nếu có lỗi: hiển thị errors
   * 3. Gọi API POST /login
   * 4. Lưu user data và accessToken vào localStorage
   * 5. Dispatch "userLogin" event để Header biết
   * 6. Redirect theo role:
   *    - admin/staff → /admin
   *    - user → /
   *
   * Error Handling:
   * - 403: Account chưa verify email
   * - 404/405: Username/password sai
   * - 500: Server error
   * - Network Error: CORS hoặc API down
   */
  const handleLogin = async () => {
    // ===== BƯỚC 1: Validate form =====
    const validation = validateForm({
      username: validateUsername(form.username),
      password: validatePassword(form.password),
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      // ===== BƯỚC 2: Gọi API đăng nhập =====
      const resp = await api.post("/login", {
        username: form.username,
        password: form.password,
      });

      console.log(resp);

      // ===== BƯỚC 3: Lưu user data và token vào localStorage =====
      if (resp.data.user && resp.data.user.accessToken) {
        localStorage.setItem("user", JSON.stringify(resp.data.user));
        localStorage.setItem("accessToken", resp.data.user.accessToken);

        // Dispatch event để Header component biết user đã login
        window.dispatchEvent(new Event("userLogin"));
      }

      showToast("success", resp.data.message || "Login success");

      // ===== BƯỚC 4: Redirect theo role =====
      const role = resp?.data?.user?.role;
      if (role === "admin" || role === "staff") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err) {
      // ===== BƯỚC 5: Xử lý các lỗi =====
      const status = err?.response?.status;
      const msg = err?.response?.data?.message;

      if (status === 403) {
        showToast("error", "You must verify your account before login");
        return;
      }
      if (status === 404 || status === 405 || status === 500) {
        showToast("error", msg || `Login failed (${status})`);
        return;
      }
      if (err?.message?.includes("Network Error")) {
        showToast(
          "error",
          "Network/CORS error. Check API URL & CORS settings."
        );
        return;
      }
      showToast("error", msg || "Login failed");
    }
  };

  // ============ RENDER UI ============
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {/* ===== TOAST NOTIFICATION ===== */}
      {/* Positioned fixed ở góc trên phải, có animation slide từ phải */}
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
          {/* Icon success hoặc error */}
          {toast.type === "success" ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <XCircle className="w-5 h-5" />
          )}
          <span className="font-medium">{toast.msg}</span>
        </div>
      )}

      {/* ===== MAIN CONTAINER ===== */}
      <div className="w-full max-w-md">
        {/* ===== LOGIN CARD ===== */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Logo - clickable để về trang chủ */}
          <div className="flex justify-center mb-2">
            <Link
              to="/"
              className="w-30 h-30 hover:scale-110 transition-transform duration-300 ease-in-out block"
            >
              <img
                src="/logo.png"
                alt="LogoWeb"
                className="w-full h-full object-contain"
              />
            </Link>
          </div>

          {/* Tiêu đề */}
          <h1 className="text-2xl font-bold text-gray-800 text-center mb-2">
            Đăng nhập
          </h1>
          <p className="text-gray-500 text-center mb-8">
            Điền thông tin bên dưới để đăng nhập
          </p>

          {/* ===== FORM ===== */}
          <div className="space-y-5">
            {/* Input: Username */}
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
                    ${
                      errors.username
                        ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-100"
                    }`}
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
                  placeholder="Nhập mật khẩu"
                  className={`w-full pl-11 pr-4 py-3 border rounded-xl
                    focus:outline-none focus:ring-2 transition-all
                    ${
                      errors.password
                        ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-100"
                    }`}
                />
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {/* Login Button */}
            <button
              type="button"
              onClick={handleLogin}
              className="w-full py-3 rounded-xl font-semibold text-white
                bg-blue-500 hover:bg-blue-600 active:scale-95
                transition-all duration-200"
            >
              Đăng nhập
            </button>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Chưa có tài khoản?{" "}
              <Link
                to="/register"
                className="text-blue-500 font-semibold hover:underline"
              >
                Đăng ký
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
