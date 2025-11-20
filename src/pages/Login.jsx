import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { api } from "../services/api"; // <— dùng instance
import { User, Lock, CheckCircle, XCircle } from "lucide-react";
import {
  validateUsername,
  validatePassword,
  validateForm,
} from "../utils/validation";

function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [toast, setToast] = useState(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [errors, setErrors] = useState({ username: "", password: "" });
  const location = useLocation();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));

    // Clear error when user types
    if (errors[id]) {
      setErrors((prev) => ({ ...prev, [id]: "" }));
    }
  };

  const showToast = (type, msg, duration = 3000) => {
    setToast({ type, msg });
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
      setTimeout(() => setToast(null), 400);
    }, duration);
  };

  useEffect(() => {
    const has = (name) =>
      document.cookie.split("; ").some((c) => c.trim().startsWith(`${name}=1`));
    const clear = (name) => (document.cookie = `${name}=; Max-Age=0; path=/`);

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

  const handleLogin = async () => {
    // Validate form
    const validation = validateForm({
      username: validateUsername(form.username),
      password: validatePassword(form.password),
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      const resp = await api.post("/login", {
        // <— gọi đúng baseURL
        username: form.username,
        password: form.password,
      });

      console.log(resp);

      // Store user data and access token from response
      if (resp.data.user && resp.data.user.accessToken) {
        localStorage.setItem("user", JSON.stringify(resp.data.user));
        localStorage.setItem("accessToken", resp.data.user.accessToken);

        // Dispatch event to notify Header component
        window.dispatchEvent(new Event("userLogin"));
      }

      showToast("success", resp.data.message || "Login success");
      // Redirect based on role: admin -> /admin, others -> /
      const role = resp?.data?.user?.role;
      if (role === "admin" || role === "staff") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err) {
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
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Logo */}
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

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-800 text-center mb-2">
            Đăng nhập
          </h1>
          <p className="text-gray-500 text-center mb-8">
            Điền thông tin bên dưới để đăng nhập
          </p>

          {/* Form */}
          <div className="space-y-5">
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
