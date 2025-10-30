import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Send, CheckCircle, DollarSign, User } from "lucide-react";
import AdminHeader from "../../components/Admin/AdminHeader";
import AdminSidebar from "../../components/Admin/AdminSidebar";
import Toast from "../../components/Toast";
import { api } from "../../services/api";

/* ===== Utils tiền tệ ===== */
const onlyDigits = (s) => (s || "").replace(/[^\d]/g, "");
const toNumber = (s) => {
  const clean = onlyDigits(s);
  return clean === "" ? 0 : Number(clean);
};
const formatCurrency = (input) => {
  const n = typeof input === "string" ? toNumber(input) : Number(input || 0);
  return new Intl.NumberFormat("vi-VN").format(n);
};

/* ===== Input tiền tệ ===== */
const FeeInputField = ({ label, value, onChange, error, required = true }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <input
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={value ?? ""}
        onChange={(e) => onChange(onlyDigits(e.target.value))}
        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? "border-red-500" : "border-gray-300"
        }`}
        placeholder="Nhập số tiền (VNĐ)"
      />
      <DollarSign className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
    </div>
    {value && value !== "" && (
      <p className="mt-1 text-sm text-gray-500">{formatCurrency(value)} VNĐ</p>
    )}
    {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
  </div>
);

export default function TransactionDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const recordData = location.state?.record;

  /* ===== Fees ===== */
  const [buyerFees, setBuyerFees] = useState({
    notarizationFee: "",
    commissionFee: "",
    registrationFee: "",
    licensePlateFee: "",
    inspectionFee: "",
  });
  const [sellerFees, setSellerFees] = useState({
    notarizationFee: "",
    commissionFee: "",
    registrationFee: "",
    licensePlateFee: "",
    inspectionFee: "",
  });

  /* ===== Flow/UI ===== */
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [buyerConfirmed, setBuyerConfirmed] = useState(false);
  const [sellerConfirmed, setSellerConfirmed] = useState(false);
  const [buyerRecordSent, setBuyerRecordSent] = useState(false);
  const [sellerRecordSent, setSellerRecordSent] = useState(false);

  const [buyerSending, setBuyerSending] = useState(false);
  const [sellerSending, setSellerSending] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [finalSending, setFinalSending] = useState(false);
  const [showFinalConfirm, setShowFinalConfirm] = useState(false);
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});

  /* ===== BE paths ===== */
  const SEND_RECORD_PATH_ENV = (import.meta.env.VITE_SEND_RECORD_PATH || "").trim();
  const SEND_OTP_PATH = "/staff/contracts/send-otp";
  const SEND_FINAL_PATH = "/staff/contracts/send-final";

  /* ===== Helpers ===== */
  const handleBuyerFeeChange = (field, value) => {
    setBuyerFees((prev) => ({ ...prev, [field]: value }));
    if (errors[`buyer_${field}`]) setErrors((p) => ({ ...p, [`buyer_${field}`]: null }));
  };
  const handleSellerFeeChange = (field, value) => {
    setSellerFees((prev) => ({ ...prev, [field]: value }));
    if (errors[`seller_${field}`]) setErrors((p) => ({ ...p, [`seller_${field}`]: null }));
  };
  const calculateTotal = (feesObj) =>
    Object.values(feesObj).reduce((sum, v) => sum + toNumber(v), 0);

  const validateFees = () => {
    const newErrors = {};
    Object.keys(buyerFees).forEach((k) => {
      const v = toNumber(buyerFees[k]);
      if (Number.isNaN(v) || v < 0) newErrors[`buyer_${k}`] = "Vui lòng nhập số tiền hợp lệ";
    });
    Object.keys(sellerFees).forEach((k) => {
      const v = toNumber(sellerFees[k]);
      if (Number.isNaN(v) || v < 0) newErrors[`seller_${k}`] = "Vui lòng nhập số tiền hợp lệ";
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const numericFees = (f) => ({
    notarizationFee: toNumber(f.notarizationFee),
    commissionFee: toNumber(f.commissionFee),
    registrationFee: toNumber(f.registrationFee),
    licensePlateFee: toNumber(f.licensePlateFee),
    inspectionFee: toNumber(f.inspectionFee),
  });

  /* ===== Gửi hồ sơ: thử nhiều URL, 404 thì bỏ qua ===== */
  const trySendRecord = async (party, feesObj) => {
    const base = SEND_RECORD_PATH_ENV || "";
    const candidates = [
      base && base, // nguyên vẹn nếu đã cấu hình
      `/staff/contracts/send-record/${party}`,
      `/staff/contracts/send-record`,
      `/contracts/send-record/${party}`,
      `/contracts/send-record`,
    ].filter(Boolean);

    const payloadFor = (url) =>
      url.endsWith("/send-record") ? { contractId: recordData.id, party, fees: feesObj }
        : { contractId: recordData.id, fees: feesObj };

    for (const url of candidates) {
      try {
        const res = await api.post(url, payloadFor(url));
        if (res?.status >= 200 && res?.status < 300) {
          return { ok: true, msg: res?.data?.message };
        }
      } catch (e) {
        const code = e?.response?.status;
        if (code === 404) continue;
        const m = e?.response?.data?.message;
        return { ok: false, code, msg: m || `Gửi hồ sơ (${party}) thất bại` };
      }
    }
    return { ok: true, local: true, msg: `BE chưa có endpoint gửi hồ sơ (${party}). Đã đánh dấu client-side.` };
  };

  /* ===== Send record Buyer ===== */
  const handleSendRecordToBuyer = async () => {
    if (!recordData?.id) {
      setToast({ type: "error", message: "Thiếu contractId" });
      return;
    }
    if (!validateFees()) {
      setToast({ type: "error", message: "Vui lòng điền đủ phí của Buyer/Seller" });
      return;
    }
    setBuyerSending(true);
    try {
      const r = await trySendRecord("buyer", numericFees(buyerFees));
      if (!r.ok) {
        let msg = r.msg;
        if (r.code === 401) msg = "Unauthorized";
        if (r.code === 403) msg = "Không có quyền";
        setToast({ type: "error", message: msg });
        return;
      }
      setBuyerRecordSent(true);
      setToast({ type: "success", message: r.msg || "Đã gửi hồ sơ cho người mua" });
    } finally {
      setBuyerSending(false);
    }
  };

  /* ===== Send record Seller ===== */
  const handleSendRecordToSeller = async () => {
    if (!recordData?.id) {
      setToast({ type: "error", message: "Thiếu contractId" });
      return;
    }
    if (!validateFees()) {
      setToast({ type: "error", message: "Vui lòng điền đủ phí của Buyer/Seller" });
      return;
    }
    setSellerSending(true);
    try {
      const r = await trySendRecord("seller", numericFees(sellerFees));
      if (!r.ok) {
        let msg = r.msg;
        if (r.code === 401) msg = "Unauthorized";
        if (r.code === 403) msg = "Không có quyền";
        setToast({ type: "error", message: msg });
        return;
      }
      setSellerRecordSent(true);
      setToast({ type: "success", message: r.msg || "Đã gửi hồ sơ cho người bán" });
    } finally {
      setSellerSending(false);
    }
  };

  /* ===== Gửi OTP: KHÔNG ràng buộc đã gửi hồ sơ ===== */
  const handleSendOtpCode = async () => {
    if (!recordData?.id) {
      setToast({ type: "error", message: "Thiếu contractId. Không thể gửi OTP" });
      return;
    }

    // Cảnh báo nếu chưa gửi đủ hồ sơ, nhưng vẫn cho phép gửi.
    if (!buyerRecordSent || !sellerRecordSent) {
      const ok = window.confirm(
        "Bạn chưa gửi đủ hồ sơ cho Buyer/Seller. Vẫn gửi OTP?"
      );
      if (!ok) return;
    }

    setOtpSending(true);
    try {
      const res = await api.post(SEND_OTP_PATH, { contractId: recordData.id });
      if (res?.status >= 200 && res?.status < 300) {
        setOtpSent(true);
        setToast({
          type: "success",
          message: res?.data?.message || "Đã gửi OTP đến Buyer và Seller",
        });
      }
    } catch (error) {
      const s = error?.response?.status;
      const m = error?.response?.data?.message;
      let msg = m || "Gửi OTP thất bại";
      if (s === 400) msg = m || "Thiếu hoặc contractId không hợp lệ";
      else if (s === 401) msg = m || "Unauthorized. Đăng nhập staff/admin";
      else if (s === 403) msg = m || "Chỉ staff hoặc admin được phép gửi OTP";
      else if (s === 404) msg = m || "Không tìm thấy hợp đồng hoặc email";
      else if (s === 500) msg = m || "Lỗi máy chủ hoặc email";
      setToast({ type: "error", message: msg });
    } finally {
      setOtpSending(false);
    }
  };

  /* ===== Gửi hợp đồng hoàn tất ===== */
  const handleFinalConfirmYes = async () => {
    if (!recordData?.id) {
      setToast({ type: "error", message: "Thiếu contractId" });
      return;
    }
    setFinalSending(true);
    try {
      const res = await api.post(SEND_FINAL_PATH, { contractId: recordData.id });
      setToast({
        type: "success",
        message: res?.data?.message || "Đã gửi hợp đồng hoàn tất. Trạng thái chuyển completed",
      });
      setShowFinalConfirm(false);
      setTimeout(() => {
        navigate("/transactionsuccess", {
          state: { record: { ...recordData, status: "completed" } },
        });
      }, 1200);
    } catch (error) {
      const s = error?.response?.status;
      const m = error?.response?.data?.message;
      let msg = m || "Gửi hợp đồng cuối thất bại";
      if (s === 400) msg = m || "Cần hai bên đã ký OTP, trạng thái 'signed'";
      else if (s === 401) msg = m || "Sai hoặc thiếu token";
      else if (s === 403) msg = m || "Không phải staff được assign";
      else if (s === 404) msg = m || "Không tìm thấy hợp đồng";
      else if (s === 500) msg = m || "Lỗi máy chủ";
      setToast({ type: "error", message: msg });
      setShowFinalConfirm(false);
    } finally {
      setFinalSending(false);
    }
  };

  /* ===== Cho mở modal xác nhận cuối khi đã có OTP và 2 bên đã tick xác nhận ===== */
  const handleVerifyOtp = () => {
    if (!otpSent) {
      setToast({ type: "error", message: "Chưa gửi OTP" });
      return;
    }
    if (!buyerConfirmed) {
      setToast({ type: "error", message: "Chờ người mua xác nhận hồ sơ" });
      return;
    }
    if (!sellerConfirmed) {
      setToast({ type: "error", message: "Chờ người bán xác nhận hồ sơ" });
      return;
    }
    setShowFinalConfirm(true);
  };

  /* ===== Fallback thiếu record ===== */
  if (!recordData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminHeader />
        <div className="flex">
          <AdminSidebar />
          <main className="flex-1 py-8 px-6">
            <div className="max-w-7xl mx-auto text-center">
              <p className="text-gray-600 mb-4">Không tìm thấy thông tin hồ sơ</p>
              <button
                onClick={() => navigate("/transactionrecords")}
                className="text-blue-600 hover:underline"
              >
                Quay lại danh sách hồ sơ
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  /* ===== UI ===== */
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 py-8 px-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <button
                onClick={() => navigate("/transactionrecords")}
                className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Quay lại danh sách hồ sơ
              </button>
              <h1 className="text-3xl font-bold text-gray-900">Chi tiết hồ sơ - {recordData.id}</h1>
              <p className="text-gray-600 mt-2">Điền thông tin các khoản phí cho giao dịch</p>
            </div>

            {/* Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Thông tin giao dịch</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Mã hồ sơ</p>
                  <p className="font-semibold text-gray-900">{recordData.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Xe giao dịch</p>
                  <p className="font-semibold text-gray-900">{recordData.carModel}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Giá trị giao dịch</p>
                  <p className="font-semibold text-blue-600 text-lg">
                    {typeof recordData.price === "number"
                      ? `${new Intl.NumberFormat("vi-VN").format(recordData.price)} VNĐ`
                      : recordData.price}
                  </p>
                </div>
              </div>
            </div>

            {/* Fees */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Buyer */}
              <div className="bg-white rounded-lg shadow-sm border border-blue-200 overflow-hidden">
                <div className="bg-blue-50 px-6 py-4 border-b border-blue-200">
                  <div className="flex items-center">
                    <User className="w-6 h-6 text-blue-600 mr-3" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Người Mua (User A)</h3>
                      <p className="text-sm text-gray-600">{recordData.buyerName}</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <FeeInputField label="Phí công chứng" value={buyerFees.notarizationFee}
                    onChange={(v) => handleBuyerFeeChange("notarizationFee", v)}
                    error={errors.buyer_notarizationFee}/>
                  <FeeInputField label="Phí hoa hồng" value={buyerFees.commissionFee}
                    onChange={(v) => handleBuyerFeeChange("commissionFee", v)}
                    error={errors.buyer_commissionFee}/>
                  <FeeInputField label="Phí trước bạ" value={buyerFees.registrationFee}
                    onChange={(v) => handleBuyerFeeChange("registrationFee", v)}
                    error={errors.buyer_registrationFee}/>
                  <FeeInputField label="Phí đăng ký" value={buyerFees.licensePlateFee}
                    onChange={(v) => handleBuyerFeeChange("licensePlateFee", v)}
                    error={errors.buyer_licensePlateFee}/>
                  <FeeInputField label="Phí cấp biển/sang tên" value={buyerFees.inspectionFee}
                    onChange={(v) => handleBuyerFeeChange("inspectionFee", v)}
                    error={errors.buyer_inspectionFee}/>
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">Tổng phí:</span>
                      <span className="text-xl font-bold text-blue-600">
                        {formatCurrency(calculateTotal(buyerFees))} VNĐ
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Seller */}
              <div className="bg-white rounded-lg shadow-sm border border-green-200 overflow-hidden">
                <div className="bg-green-50 px-6 py-4 border-b border-green-200">
                  <div className="flex items-center">
                    <User className="w-6 h-6 text-green-600 mr-3" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Người Bán (User B)</h3>
                      <p className="text-sm text-gray-600">{recordData.sellerName}</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <FeeInputField label="Phí công chứng" value={sellerFees.notarizationFee}
                    onChange={(v) => handleSellerFeeChange("notarizationFee", v)}
                    error={errors.seller_notarizationFee}/>
                  <FeeInputField label="Phí hoa hồng" value={sellerFees.commissionFee}
                    onChange={(v) => handleSellerFeeChange("commissionFee", v)}
                    error={errors.seller_commissionFee}/>
                  <FeeInputField label="Phí trước bạ" value={sellerFees.registrationFee}
                    onChange={(v) => handleSellerFeeChange("registrationFee", v)}
                    error={errors.seller_registrationFee}/>
                  <FeeInputField label="Phí đăng ký" value={sellerFees.licensePlateFee}
                    onChange={(v) => handleSellerFeeChange("licensePlateFee", v)}
                    error={errors.seller_licensePlateFee}/>
                  <FeeInputField label="Lệ phí đăng kiểm/đường bộ" value={sellerFees.inspectionFee}
                    onChange={(v) => handleSellerFeeChange("inspectionFee", v)}
                    error={errors.seller_inspectionFee}/>
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">Tổng phí:</span>
                      <span className="text-xl font-bold text-green-600">
                        {formatCurrency(calculateTotal(sellerFees))} VNĐ
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action: gửi hồ sơ */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Gửi hồ sơ xác nhận</h3>
              <p className="text-sm text-gray-600 mb-4">Gửi hồ sơ đến người mua và người bán để xác nhận phí</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={handleSendRecordToBuyer}
                  disabled={buyerRecordSent || buyerSending}
                  className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-colors font-medium ${
                    buyerRecordSent
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : buyerSending
                      ? "bg-blue-300 text-white cursor-wait"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  <User className="w-5 h-5" />
                  {buyerRecordSent ? "Đã gửi - User A" : buyerSending ? "Đang gửi..." : "Gửi hồ sơ - User A"}
                </button>
                <button
                  onClick={handleSendRecordToSeller}
                  disabled={sellerRecordSent || sellerSending}
                  className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-colors font-medium ${
                    sellerRecordSent
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : sellerSending
                      ? "bg-green-300 text-white cursor-wait"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                >
                  <User className="w-5 h-5" />
                  {sellerRecordSent ? "Đã gửi - User B" : sellerSending ? "Đang gửi..." : "Gửi hồ sơ - User B"}
                </button>
              </div>
            </div>

            {/* Next steps */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Các bước tiếp theo</h3>
                  <p className="text-sm text-gray-600 mt-1">Có thể gửi OTP bất cứ lúc nào.</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSendOtpCode}
                    disabled={otpSent || otpSending}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg border transition-colors font-medium ${
                      otpSent
                        ? "border-gray-300 text-gray-400 cursor-not-allowed"
                        : otpSending
                        ? "border-blue-300 text-blue-300 cursor-wait"
                        : "border-blue-600 text-blue-600 hover:bg-blue-50"
                    }`}
                  >
                    <Send className="w-5 h-5" />
                    {otpSent ? "Đã gửi OTP" : otpSending ? "Đang gửi..." : "Gửi mã OTP"}
                  </button>

                  {otpSent && (
                    <button
                      onClick={handleVerifyOtp}
                      className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-green-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-green-700 transition-all font-medium shadow-lg"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Xác nhận giao dịch
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modal xác nhận trạng thái */}
      {showConfirmModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowConfirmModal(false)}
        >
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Trạng thái xác nhận</h2>
                <button onClick={() => setShowConfirmModal(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Người mua</p>
                        <p className="text-xs text-gray-600">{recordData.buyerName}</p>
                      </div>
                    </div>
                    {buyerConfirmed && <CheckCircle className="w-6 h-6 text-green-600" />}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="buyerConfirm"
                      checked={buyerConfirmed}
                      onChange={(e) => setBuyerConfirmed(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="buyerConfirm" className="text-sm text-gray-700">Người mua đã xác nhận hồ sơ</label>
                  </div>
                </div>

                <div className="border rounded-lg p-4 bg-green-50 border-green-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Người bán</p>
                        <p className="text-xs text-gray-600">{recordData.sellerName}</p>
                      </div>
                    </div>
                    {sellerConfirmed && <CheckCircle className="w-6 h-6 text-green-600" />}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="sellerConfirm"
                      checked={sellerConfirmed}
                      onChange={(e) => setSellerConfirmed(e.target.checked)}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <label htmlFor="sellerConfirm" className="text-sm text-gray-700">Người bán đã xác nhận hồ sơ</label>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleVerifyOtp}
                  disabled={!otpSent}
                  className={`flex-1 py-3 px-4 rounded-lg transition-colors font-medium ${
                    otpSent ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Xác nhận giao dịch
                </button>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Đóng
                </button>
              </div>

              <div className="mt-4 text-center">
                <button
                  onClick={() => {
                    setBuyerRecordSent(false);
                    setSellerRecordSent(false);
                    setBuyerConfirmed(false);
                    setSellerConfirmed(false);
                    setOtpSent(false);
                  }}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Reset trạng thái
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal xác nhận cuối */}
      {showFinalConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={(e) => e.stopPropagation()}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-yellow-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Xác nhận giao dịch</h2>
                <p className="text-gray-600">Bạn có chắc chắn muốn hoàn tất giao dịch này không?</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-600">Mã hồ sơ:</span><span className="font-semibold">{recordData.id}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Xe:</span><span className="font-semibold">{recordData.carModel}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Người mua:</span><span className="font-semibold">{recordData.buyerName}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Người bán:</span><span className="font-semibold">{recordData.sellerName}</span></div>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleFinalConfirmYes}
                  disabled={finalSending}
                  className={`flex-1 py-3 px-4 ${finalSending ? "bg-blue-300 cursor-wait" : "bg-blue-600 hover:bg-blue-700"} text-white rounded-lg transition-colors font-medium`}
                >
                  {finalSending ? "Đang gửi..." : "Có, hoàn tất"}
                </button>
                <button
                  onClick={() => setShowFinalConfirm(false)}
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Không
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
