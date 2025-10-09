import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CircleArrowLeft } from 'lucide-react';
import InputField from '../components/InputField';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const COOLDOWN_SEC = 60;

function Register() {
  const [form, setForm] = useState({ email: '', username: '', password: '' });
  const [loading, setLoading] = useState(false);

  // Toast + animation nhỏ
  const [toast, setToast] = useState(null);
  const [toastVisible, setToastVisible] = useState(false);

  // Đã gửi mail verify => nút chuyển "Resend verification email"
  const [hasActiveVerifyToken, setHasActiveVerifyToken] = useState(false);

  // Cooldown
  const [cooldownLeft, setCooldownLeft] = useState(0);

  useEffect(() => {
    if (cooldownLeft <= 0) return;
    const t = setInterval(() => setCooldownLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [cooldownLeft]);

  const showToast = (type, msg, duration = 3000) => {
    setToast({ type, msg });
    setToastVisible(true);              // slide in
    setTimeout(() => {
      setToastVisible(false);           // slide out
      setTimeout(() => setToast(null), 400);
    }, duration);
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const handleRegisterOrResend = async () => {
    // chặn click khi đang cooldown
    if (cooldownLeft > 0) {
      showToast('error', `Please wait ${cooldownLeft}s`);
      return;
    }

    try {
      setLoading(true);

      if (!hasActiveVerifyToken) {
        // Đăng ký lần đầu
        await axios.post(`${API_BASE_URL}/register`, form, { withCredentials: true });
        setHasActiveVerifyToken(true);
        showToast('success', 'Please verify your account with your email.');
        setCooldownLeft(COOLDOWN_SEC);          // bắt đầu cooldown
      } else {
        // Resend verification (server kiểm tra token/rate-limit)
        const resp = await axios.post(
          `${API_BASE_URL}/resend-verify`,
          { email: form.email },
          { withCredentials: true }
        );
        showToast('success', resp?.data?.message || 'Verification email resent. Please check your inbox.');
        setCooldownLeft(COOLDOWN_SEC);          // bắt đầu cooldown cho resend
      }
    } catch (error) {
      const status = error?.response?.status;
      const msg = error?.response?.data?.message;

      if (status === 400 && msg === 'Email is already verified') {
        showToast('success', 'Your account is already verified. Please login your account.');
      } else if (status === 400 && msg?.startsWith?.('Missing required field')) {
        showToast('error', msg);
      } else if (status === 409) {
        showToast('error', 'Email is already existed');
      } else if (status === 429) {
        showToast('error', msg || 'Please wait a bit before requesting another email.');
      } else if (error?.message?.includes?.('Network Error')) {
        showToast('error', 'Network/CORS error. Check API URL & CORS.');
      } else {
        showToast('error', msg || (hasActiveVerifyToken ? 'Resend failed' : 'Register failed'));
      }
      // lỗi thì KHÔNG kích hoạt cooldown
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = loading || cooldownLeft > 0;

  return (
    <div className='relative flex flex-col w-screen h-screen justify-center items-center bg-cover bg-center'>
      {/* Toast + animation: in từ trái -> phải, out từ phải -> trái */}
      {toast && (
        <div
          className={`
      fixed top-4 right-4 px-4 py-2 rounded shadow text-white
      transition-all duration-500 transform
      ${toastVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}
    `}
        >
          {toast.msg}
        </div>
      )}

      <div>
        <Link
          to={'/login'}
          className="absolute top-[10px] right-[20px] font-semibold text-xl flex items-center gap-[10px] cursor-pointer hover:scale-110 transition-transform duration-300 text-black"
        >
          <CircleArrowLeft />
          Back to login
        </Link>
      </div>


      <div className='flex flex-col w-[500px] h-[700px] shadow-2xl px-[80px] py-[40px] bg-white/10 text-center'>
        <h1 className='text-2xl font-semibold mt-[50px] text-black'>Create a new account</h1>

        <div className='flex flex-col mt-[80px] space-y-[20px]'>

          <InputField
            id="email" label="Email" type="text"
            value={form.email} onChange={handleChange}
          />

          <InputField
            id="username" label="Username" type="text"
            value={form.username} onChange={handleChange}
          />

          <InputField
            id="password" label="Password" type="password"
            value={form.password} onChange={handleChange}
          />

          <button
            type="button"
            onClick={handleRegisterOrResend}
            disabled={isDisabled}
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex mx-auto text-2xl font-semibold w-[400px] h-[40px] mt-[110px]
                        rounded-full justify-center items-center transition-transform duration-300
                        ${isDisabled ? 'bg-gray-400 cursor-not-allowed opacity-60'
                : 'bg-black hover:scale-110 cursor-pointer'}`}
          >
            <p className="text-white text-center">
              {loading
                ? 'Processing...'
                : cooldownLeft > 0
                  ? `Resend in ${cooldownLeft}s`
                  : (hasActiveVerifyToken ? 'Resend verification email' : 'Continue')}
            </p>
          </button>

        </div>
      </div>
    </div>
  );
}

export default Register;
