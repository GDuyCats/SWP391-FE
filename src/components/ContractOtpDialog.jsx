import React, { useEffect, useState, useRef } from "react";
import { X, Shield, Clock, CheckCircle } from "lucide-react";
import Toast from "../components/Toast";
import {api} from "../services/api.js";

export default function ContractOtpDialog({
                                              open,
                                              onClose,
                                              contractId,

                                          }) {
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [resendCountdown, setResendCountdown] = useState(0);
    const [toast, setToast] = useState(false);
    const [type, setType] = useState("");
    const [msg, setMsg] = useState("");

    const inputRefs = useRef([]);

    useEffect(() => {
        inputRefs.current = inputRefs.current.slice(0, 6);
    }, []);

    useEffect(() => {
        if (resendCountdown > 0) {
            const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCountdown]);

    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleConfirm = async () => {
        const otpCode = otp.join("");
        if (otpCode.length !== 6) {
            setType("error");
            setMsg("Vui lòng nhập đầy đủ 6 chữ số OTP");
            setToast(true);
            setTimeout(() => setToast(false), 3000);
            return;
        }

        try {
            const res = await api.post("/contracts/verify-otp");
            console.log(res);
            if (res.status === 200) {
                setOtp(res.data);
                setToast(true);
                setType("success");
                setMsg("Lấy danh sách bài đăng thành công");
            }
        } catch (error) {
            console.log(error);
            const status = error?.status;
            const msg = error?.response?.data;
            let errorMsg = "Không thể kí OTP";
            setToast(true);
            setType("error");
            if (status === 400) {
                errorMsg = msg ? msg : "Mã OTP sai hoặc hợp đồng không hợp lệ";
            } else if (status === 500) {
                errorMsg = msg ? msg : "Lỗi máy chủ";
                setTimeout(() => navigate("/login"), 2000);
            } else if (status === 401) {
                errorMsg = msg ? msg : "Thiếu hoặc token không hợp lệ"
            } else if (status === 403) {
                errorMsg = msg ? msg : "Người dùng không thuộc hợp đồng này"
            } else if (status === 404) {
                errorMsg = msg ? msg : "Không tìm thấy hợp đồng"
            } else if (status === 409) {
                errorMsg = msg ? msg : "Bên này đã kí trước đó"
            }
            setMsg(errorMsg);
        } finally {
            setTimeout(() => setToast(false), 3000);
        }




    };

    const handleResend = () => {
        if (resendCountdown > 0) return;

        setType("success");
        setMsg("OTP đã được gửi lại!");
        setToast(true);
        setResendCountdown(60);
        setOtp(["", "", "", "", "", ""]);
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
        setTimeout(() => setToast(false), 3000);
    };

    useEffect(() => {
        if (open) {
            setOtp(["", "", "", "", "", ""]);
            setResendCountdown(60);
            setTimeout(() => inputRefs.current[0]?.focus(), 150);
        }
    }, [open]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
                {/* Nút đóng */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Tiêu đề */}
                <h2 className="text-2xl font-semibold mb-6 flex items-center justify-center gap-2 text-gray-800">
                    <Shield className="w-7 h-7 text-blue-600" />
                    Xác nhận ký hợp đồng
                </h2>

                <p className="text-center text-sm text-gray-500 mb-4">
                    Mã hợp đồng: <span className="font-medium">#{contractId}</span>
                </p>

                {/* Thông báo OTP */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-center">
                    <p className="text-sm text-blue-800">
                        <strong>Nhập OTP đã được nhân viên gửi</strong><strong className="font-mono"></strong>
                    </p>
                </div>

                {/* Loading */}
                {loading ? (
                    <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                        <p className="mt-3 text-gray-500">Đang xử lý ký hợp đồng...</p>
                    </div>
                ) : (
                    <>
                        {/* Ô nhập OTP */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                                Nhập mã OTP (6 chữ số)
                            </label>
                            <div className="flex justify-center gap-2">
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={el => inputRefs.current[index] = el}
                                        type="text"
                                        maxLength={1}
                                        value={digit}
                                        onChange={e => handleOtpChange(index, e.target.value)}
                                        onKeyDown={e => handleKeyDown(index, e)}
                                        className="w-12 h-12 text-center text-xl font-semibold border-2 rounded-lg focus:border-blue-500 focus:outline-none transition-all"
                                        style={{
                                            borderColor: digit ? "#3B82F6" : "#D1D5DB",
                                            backgroundColor: digit ? "#EFF6FF" : "#FAFAFA",
                                        }}
                                        disabled={loading}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Nút hành động */}
                        <div className="space-y-3">
                            <button
                                onClick={handleConfirm}
                                disabled={loading || otp.join("").length !== 6}
                                className={`w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2
                  ${loading || otp.join("").length !== 6
                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-blue-600/25"
                                }`}
                            >
                                <CheckCircle className="w-5 h-5" />
                                Xác nhận ký hợp đồng
                            </button>

                            <button
                                onClick={handleResend}
                                disabled={resendCountdown > 0}
                                className={`w-full py-2 text-sm font-medium transition-all flex items-center justify-center gap-1
                  ${resendCountdown > 0
                                    ? "text-gray-400 cursor-not-allowed"
                                    : "text-blue-600 hover:text-blue-700"
                                }`}
                            >
                                <Clock className="w-4 h-4" />
                                Gửi lại OTP {resendCountdown > 0 ? `(${resendCountdown}s)` : ""}
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Toast */}
            {toast && msg && <Toast type={type} msg={msg} />}
        </div>
    );
}