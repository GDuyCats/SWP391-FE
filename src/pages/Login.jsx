import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { api } from "../services/api"; // <— dùng instance
import InputField from "../components/InputField";

function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [toast, setToast] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
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
    try {
      const resp = await api.post("/login", {
        // <— gọi đúng baseURL
        username: form.username,
        password: form.password,
      });

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
      if (role === "admin") {
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
    <div
      className="relative flex flex-col w-screen h-screen justify-center items-center bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/BackGroundimg.jpg')" }}
    >
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 px-4 py-2 rounded shadow text-white ${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {toast.msg}
        </div>
      )}

      <Link
        to="/"
        className="w-50 h-50 hover:scale-110 transition-transform duration-300 ease-in-out block mb-4"
      >
        <img
          src="/logo.png"
          alt="LogoWeb"
          className="w-full h-full object-contain"
        />
      </Link>

      <div className="flex flex-col w-[500px] h-[600px] shadow-2xl p-[20px] bg-white/5 rounded">
        <h1 className="text-2xl font-semibold mt-[10px] text-black text-center">
          Login
        </h1>

        <div className="flex flex-col w-[460px] h-[420px] shadow p-[20px] mt-6 mx-auto bg-transparent">
          <h1 className="text-2xl font-semibold text-white text-center">
            Login
          </h1>

          <div className="flex flex-col mt-[30px] space-y-[20px]">
            <InputField
              id="username"
              label="Username"
              type="text"
              value={form.username}
              onChange={handleChange}
            />

            <InputField
              id="password"
              label="Password"
              type="password"
              value={form.password}
              onChange={handleChange}
            />

            <button
              type="button"
              onClick={handleLogin}
              className="flex mx-auto text-xl cursor-pointer font-semibold w-[400px] h-[40px] mt-[20px] rounded-full bg-[#38d142] justify-center items-center hover:scale-110 transition-transform duration-300"
            >
              <p className="text-white">Login</p>
            </button>

            <p className="text-xs mx-auto cursor-pointer hover:scale-110 transition-transform duration-300 text-white">
              Don't have an account ?
            </p>

            <Link
              to="/register"
              className="mx-auto cursor-pointer hover:underline text-white"
            >
              Create a new account !
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
