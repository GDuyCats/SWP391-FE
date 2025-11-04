// src/pages/Admin/TransactionDetail.jsx
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Send, CheckCircle, DollarSign, User } from "lucide-react";
import AdminHeader from "../../components/Admin/AdminHeader";
import AdminSidebar from "../../components/Admin/AdminSidebar";
import Toast from "../../components/Toast";
import { api } from "../../services/api";

/* ===== Utils ===== */
const onlyDigits = (s) => (s || "").replace(/[^\d]/g, "");
const toNumber = (s) => {
  const clean = onlyDigits(s);
  return clean === "" ? 0 : Number(clean);
};
const formatCurrency = (input) => {
  const n = typeof input === "string" ? toNumber(input) : Number(input || 0);
  return new Intl.NumberFormat("vi-VN").format(n);
};

/* ===== % input ===== */
const PercentInputField = ({ label, value, onChange, error }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label} <span className="text-red-500">*</span>
    </label>
    <div className="relative">
      <input
        type="text"
        inputMode="decimal"
        autoComplete="off"
        value={value ?? ""}
        onChange={(e) => {
          const val = e.target.value.replace(/[^\d.]/g, "");
          const parts = val.split(".");
          if (parts.length > 2) return;
          onChange(val);
        }}
        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? "border-red-500" : "border-gray-300"
        }`}
        placeholder="Nhập % (ví dụ: 5.5)"
      />
      <span className="absolute right-3 top-2.5 text-gray-500 font-medium">%</span>
    </div>
    {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
  </div>
);

export default function TransactionDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const recordData = location.state?.record;

  /* ===== state ===== */
  const [buyerFeePercent, setBuyerFeePercent] = useState("");
  const [sellerFeePercent, setSellerFeePercent] = useState("");
  const [carPriceInput, setCarPriceInput] = useState("");
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [finalCarPrice, setFinalCarPrice] = useState(null);
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
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});
  const [showFinalConfirm, setShowFinalConfirm] = useState(false);

  /* ===== endpoints ===== */
  const SEND_OTP_PATH = "/staff/contracts/send-otp";
  const SEND_FINAL_PATH = "/staff/contracts/send-final";
  const SEND_DRAFT = "/staff/contracts/send-draft";

  /* ===== FE deep-links ===== */
  const FE_ORIGIN = (import.meta.env.VITE_FE_ORIGIN || window.location.origin).replace(/\/$/, "");
  const linkForA = (id) => `${FE_ORIGIN}/contract-a?contractId=${id}`;
  const linkForB = (id) => `${FE_ORIGIN}/contract-b?contractId=${id}`;

  /* ===== helpers ===== */
  const getCarPrice = () => {
    if (finalCarPrice !== null) return finalCarPrice;
    if (!recordData?.price) return 0;
    return typeof recordData.price === "number" ? recordData.price : toNumber(String(recordData.price));
  };

  const handleConfirmPrice = () => {
    const price = toNumber(carPriceInput);
    if (price <= 0) {
      setToast({ type: "error", message: "Vui lòng nhập giá trị xe hợp lệ" });
      return;
    }
    setFinalCarPrice(price);
    setIsEditingPrice(false);
    setToast({ type: "success", message: "Đã chốt giá trị xe" });
  };

  const handleEditPrice = () => {
    const currentPrice = getCarPrice();
    setCarPriceInput(String(currentPrice));
    setIsEditingPrice(true);
  };

  const calculateFeeFromPercent = (percent) => {
    const carPrice = getCarPrice();
    const p = parseFloat(percent || 0);
    if (isNaN(p) || p < 0) return 0;
    return Math.round((carPrice * p) / 100);
  };

  const getBuyerFee = () => calculateFeeFromPercent(buyerFeePercent);
  const getSellerFee = () => calculateFeeFromPercent(sellerFeePercent);

  const validateFees = () => {
    const newErrors = {};
    const buyerP = parseFloat(buyerFeePercent || 0);
    if (isNaN(buyerP) || buyerP < 0 || buyerP > 100) newErrors.buyerFeePercent = "Vui lòng nhập % hợp lệ (0-100)";
    const sellerP = parseFloat(sellerFeePercent || 0);
    if (isNaN(sellerP) || sellerP < 0 || sellerP > 100) newErrors.sellerFeePercent = "Vui lòng nhập % hợp lệ (0-100)";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ===== Build Contract URL kèm số liệu ===== */
  const buildBuyerContractUrl = () => {
    const price = getCarPrice();
    const buyerPercent = Number(buyerFeePercent || 0);
    const buyerFee = Math.round((price * buyerPercent) / 100);
    const buyerTotal = price + buyerFee;
    const url = new URL(linkForA(recordData.id));
    url.searchParams.set("contractId", String(recordData.id));
    url.searchParams.set("price", String(price));
    url.searchParams.set("buyerPercent", String(buyerPercent));
    url.searchParams.set("buyerFee", String(buyerFee));
    url.searchParams.set("buyerTotal", String(buyerTotal));
    return url.toString();
  };

  const buildSellerContractUrl = () => {
    const price = getCarPrice();
    const sellerPercent = Number(sellerFeePercent || 0);
    const sellerFee = Math.round((price * sellerPercent) / 100);
    const sellerTotal = price - sellerFee;
    const url = new URL(linkForB(recordData.id));
    url.searchParams.set("contractId", String(recordData.id));
    url.searchParams.set("price", String(price));
    url.searchParams.set("sellerPercent", String(sellerPercent));
    url.searchParams.set("sellerFee", String(sellerFee));
    url.searchParams.set("sellerTotal", String(sellerTotal));
    return url.toString();
  };

  /* ===== Email HTML đơn giản ===== */
  const makeEmailHtml = ({ title, lines = [], ctaUrl, ctaLabel }) => {
    const li = lines.map((l) => `<li>${l}</li>`).join("");
    return `<div style="font-family:Arial,Helvetica,sans-serif;line-height:1.6;color:#111">
      <h2 style="margin:0 0 8px">${title}</h2>
      <ul style="padding-left:18px;margin:8px 0">${li}</ul>
      <p style="margin:16px 0">
        <a href="${ctaUrl}" target="_blank" rel="noopener"
           style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;
                  padding:12px 18px;border-radius:10px;font-weight:600">
          ${ctaLabel}
        </a>
      </p>
      <p style="color:#555;font-size:12px">Nếu nút không bấm được, mở liên kết: ${ctaUrl}</p>
    </div>`;
  };

  /* ===== DỮ LIỆU EMAIL CHO BUYER/SELLER – KHÔNG CẦN SỬA BE ===== */
  const buildEmailFor = (aud) => {
    const price = getCarPrice();
    const buyerPercent = Number(buyerFeePercent || 0);
    const sellerPercent = Number(sellerFeePercent || 0);
    const buyerFee = Math.round((price * buyerPercent) / 100);
    const sellerFee = Math.round((price * sellerPercent) / 100);
    const buyerTotal = price + buyerFee;
    const sellerTotal = price - sellerFee;

    if (aud === "buyer") {
      const ctaUrl = buildBuyerContractUrl();
      const subject = `[EV] Hợp đồng #${recordData.id} – Bên A xác nhận | ${buyerPercent}% | Phí ${formatCurrency(
        buyerFee
      )}đ | Tổng ${formatCurrency(buyerTotal)}đ`;
      const lines = [
        `Giá chốt: <b>${formatCurrency(price)} VNĐ</b>`,
        `% phí Buyer: <b>${buyerPercent}%</b>`,
        `Phí Buyer: <b>${formatCurrency(buyerFee)} VNĐ</b>`,
        `Tổng Buyer thanh toán: <b>${formatCurrency(buyerTotal)} VNĐ</b>`,
      ];
      return {
        toRole: "buyer",
        subject,
        text: [
          `Giá chốt: ${formatCurrency(price)} VNĐ`,
          `% phí Buyer: ${buyerPercent}%`,
          `Phí Buyer: ${formatCurrency(buyerFee)} VNĐ`,
          `Tổng Buyer thanh toán: ${formatCurrency(buyerTotal)} VNĐ`,
          `Mở Contract A: ${ctaUrl}`,
        ].join("\n"),
        html: makeEmailHtml({
          title: `Hồ sơ #${recordData.id} – Bên A`,
          lines,
          ctaUrl,
          ctaLabel: "Mở Contract A và nhập OTP",
        }),
        ctaUrl,
      };
    }

    const ctaUrl = buildSellerContractUrl();
    const subject = `[EV] Hợp đồng #${recordData.id} – Bên B xác nhận | ${sellerPercent}% | Phí ${formatCurrency(
      sellerFee
    )}đ | Nhận ${formatCurrency(sellerTotal)}đ`;
    const lines = [
      `Giá chốt: <b>${formatCurrency(price)} VNĐ</b>`,
      `% phí Seller: <b>${sellerPercent}%</b>`,
      `Phí Seller: <b>${formatCurrency(sellerFee)} VNĐ</b>`,
      `Tổng Seller nhận: <b>${formatCurrency(sellerTotal)} VNĐ</b>`,
    ];
    return {
      toRole: "seller",
      subject,
      text: [
        `Giá chốt: ${formatCurrency(price)} VNĐ`,
        `% phí Seller: ${sellerPercent}%`,
        `Phí Seller: ${formatCurrency(sellerFee)} VNĐ`,
        `Tổng Seller nhận: ${formatCurrency(sellerTotal)} VNĐ`,
        `Mở Contract B: ${ctaUrl}`,
      ].join("\n"),
      html: makeEmailHtml({
        title: `Hồ sơ #${recordData.id} – Bên B`,
        lines,
        ctaUrl,
        ctaLabel: "Mở Contract B và nhập OTP",
      }),
      ctaUrl,
    };
  };

  const buildDraftPayload = (aud) => {
    const price = getCarPrice();
    const email = buildEmailFor(aud);
    return {
      contractId: recordData.id,
      audience: aud, // "buyer" | "seller"
      finalPrice: price,
      buyerFeePercent: Number(buyerFeePercent || 0),
      sellerFeePercent: Number(sellerFeePercent || 0),
      // phẳng để BE forward email
      toRole: email.toRole,
      subject: email.subject,
      text: email.text,
      html: email.html,
      ctaUrl: email.ctaUrl,
      sendMode: "html+text",
      contentType: "text/html",
    };
  };

  /* ===== gửi dự thảo ===== */
  const sendDraftOne = async (aud) => {
    const payload = buildDraftPayload(aud);
    try {
      const res = await api.post(SEND_DRAFT, payload);
      return res;
    } catch (e) {
      console.error("sendDraftOne error", {
        status: e?.response?.status,
        url: api?.defaults?.baseURL ? api.defaults.baseURL + SEND_DRAFT : SEND_DRAFT,
        data: e?.response?.data,
      });
      throw e;
    }
  };

  const handleSendRecordToBoth = async () => {
    if (!recordData?.id) {
      setToast({ type: "error", message: "Thiếu contractId" });
      return;
    }
    if (finalCarPrice === null) {
      setToast({ type: "error", message: "Vui lòng chốt giá trị xe trước khi gửi" });
      return;
    }
    if (!validateFees()) {
      setToast({ type: "error", message: "Vui lòng điền % phí hợp lệ" });
      return;
    }
    setBuyerSending(true);
    setSellerSending(true);
    try {
      await Promise.all([sendDraftOne("buyer"), sendDraftOne("seller")]);
      setBuyerRecordSent(true);
      setSellerRecordSent(true);
      setToast({ type: "success", message: "Đã gửi hồ sơ cho người mua và người bán" });
    } catch (error) {
      const s = error?.response?.status;
      const m = error?.response?.data?.message;
      let msg = m || "Gửi hợp đồng dự thảo thất bại";
      if (s === 400) msg = m || "Trạng thái không phù hợp hoặc thiếu dữ liệu";
      else if (s === 401) msg = m || "Thiếu/sai token";
      else if (s === 403) msg = m || "Không phải staff phụ trách";
      else if (s === 404) msg = m || "Không tìm thấy endpoint hoặc hợp đồng";
      else if (s === 500) msg = m || "Lỗi máy chủ";
      setToast({ type: "error", message: msg });
    } finally {
      setBuyerSending(false);
      setSellerSending(false);
    }
  };

  /* ===== OTP và hoàn tất ===== */
  const handleSendOtpCode = async () => {
    if (!recordData?.id) {
      setToast({ type: "error", message: "Thiếu contractId. Không thể gửi OTP" });
      return;
    }
    setOtpSending(true);
    try {
      const res = await api.post(SEND_OTP_PATH, { contractId: recordData.id });
      if (res?.status >= 200 && res?.status < 300) {
        setOtpSent(true);
        setToast({ type: "success", message: res?.data?.message || "Đã gửi OTP" });
      }
    } catch (error) {
      const s = error?.response?.status;
      const m = error?.response?.data?.message;
      let msg = m || "Gửi OTP thất bại";
      if (s === 400) msg = m || "Thiếu hoặc contractId không hợp lệ";
      else if (s === 401) msg = m || "Unauthorized";
      else if (s === 403) msg = m || "Chỉ staff/admin được phép";
      else if (s === 404) msg = m || "Không tìm thấy hợp đồng hoặc email";
      else if (s === 500) msg = m || "Lỗi máy chủ";
      setToast({ type: "error", message: msg });
    } finally {
      setOtpSending(false);
    }
  };

  const handleFinalConfirmYes = async () => {
    if (!recordData?.id) {
      setToast({ type: "error", message: "Thiếu contractId" });
      return;
    }
    setFinalSending(true);
    try {
      const res = await api.post(SEND_FINAL_PATH, { contractId: recordData.id });
      setToast({ type: "success", message: res?.data?.message || "Đã gửi hợp đồng hoàn tất" });
      setShowFinalConfirm(false);
      setTimeout(() => {
        navigate("/transactionsuccess", {
          state: { record: { ...recordData, status: "completed" } },
        });
      }, 800);
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

  /* ===== mask đối tác sau khi gửi hồ sơ ===== */
  const maskText = "— ẩn sau khi gửi hồ sơ cho đối tác —";
  const hideBuyerDetails = sellerRecordSent;
  const hideSellerDetails = buyerRecordSent;

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
              <h1 className="text-3xl font-bold text-gray-900">
                Chi tiết hồ sơ - {recordData.id}
              </h1>
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
                  <p className="text-sm text-gray-500">Giá trị giao dịch ban đầu</p>
                  <p className="font-semibold text-gray-600 text-lg">
                    {typeof recordData.price === "number"
                      ? `${new Intl.NumberFormat("vi-VN").format(recordData.price)} VNĐ`
                      : recordData.price}
                  </p>
                </div>
              </div>
            </div>

            {/* Chốt giá trị xe */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg shadow-sm border-2 border-yellow-300 p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <DollarSign className="w-6 h-6 mr-2 text-yellow-600" />
                Chốt giá trị xe cuối cùng
              </h2>

              {!isEditingPrice ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">
                      {finalCarPrice !== null ? "Giá trị xe đã được chốt:" : "Chưa chốt giá trị xe cuối cùng"}
                    </p>
                    <p className="text-3xl font-bold text-yellow-700">
                      {formatCurrency(getCarPrice())} VNĐ
                    </p>
                    {finalCarPrice !== null && (
                      <p className="text-xs text-green-600 mt-1 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Đã chốt giá
                      </p>
                    )}
                  </div>
                  <button
                    onClick={handleEditPrice}
                    className="flex items-center gap-2 bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 transition-colors font-medium"
                  >
                    <DollarSign className="w-5 h-5" />
                    {finalCarPrice !== null ? "Chỉnh sửa giá" : "Chốt giá"}
                  </button>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nhập giá trị xe cuối cùng <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-3 items-start">
                    <div className="flex-1">
                      <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        value={carPriceInput}
                        onChange={(e) => setCarPriceInput(onlyDigits(e.target.value))}
                        className="w-full px-4 py-3 border-2 border-yellow-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-lg"
                        placeholder="Nhập giá trị xe (VNĐ)"
                      />
                      {carPriceInput && (
                        <p className="mt-2 text-sm text-gray-600">
                          Giá trị:{" "}
                          <span className="font-semibold text-yellow-700">
                            {formatCurrency(carPriceInput)} VNĐ
                          </span>
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleConfirmPrice}
                        className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                      >
                        <CheckCircle className="w-5 h-5" />
                        Xác nhận
                      </button>
                      <button
                        onClick={() => {
                          setCarPriceInput("");
                          setIsEditingPrice(false);
                        }}
                        className="px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                </div>
              )}
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
                  <PercentInputField
                    label="Phí phải chịu (% trên giá trị xe)"
                    value={buyerFeePercent}
                    onChange={(v) => {
                      setBuyerFeePercent(v);
                      if (errors.buyerFeePercent) setErrors((p) => ({ ...p, buyerFeePercent: null }));
                    }}
                    error={errors.buyerFeePercent}
                  />

                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-2">
                      Giá trị xe:{" "}
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(getCarPrice())} VNĐ
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-1">
                      Công thức:{" "}
                      <span className="font-medium">{(parseFloat(buyerFeePercent || 0) || 0)}%</span> ×{" "}
                      <span className="font-medium">{formatCurrency(getCarPrice())}</span> ={" "}
                      <span className="font-semibold text-blue-600">
                        {formatCurrency(getBuyerFee())} VNĐ
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Phí phải trả:{" "}
                      <span className="font-semibold text-blue-600 text-lg">
                        {hideBuyerDetails ? maskText : `${formatCurrency(getBuyerFee())} VNĐ`}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">Tổng buyer phải thanh toán:</span>
                      <span className="text-xl font-bold text-blue-600">
                        {hideBuyerDetails
                          ? maskText
                          : `${formatCurrency(getCarPrice() + getBuyerFee())} VNĐ`}
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
                  <PercentInputField
                    label="Phí phải chịu (% trên giá trị xe)"
                    value={sellerFeePercent}
                    onChange={(v) => {
                      setSellerFeePercent(v);
                      if (errors.sellerFeePercent) setErrors((p) => ({ ...p, sellerFeePercent: null }));
                    }}
                    error={errors.sellerFeePercent}
                  />

                  <div className="mt-4 p-4 bg-green-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-2">
                      Giá trị xe:{" "}
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(getCarPrice())} VNĐ
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-1">
                      Công thức:{" "}
                      <span className="font-medium">{(parseFloat(sellerFeePercent || 0) || 0)}%</span> ×{" "}
                      <span className="font-medium">{formatCurrency(getCarPrice())}</span> ={" "}
                      <span className="font-semibold text-green-600">
                        {formatCurrency(getSellerFee())} VNĐ
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Phí phải trả:{" "}
                      <span className="font-semibold text-green-600 text-lg">
                        {hideSellerDetails ? maskText : `${formatCurrency(getSellerFee())} VNĐ`}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">Tổng seller nhận được:</span>
                      <span className="text-xl font-bold text-green-600">
                        {hideSellerDetails
                          ? maskText
                          : `${formatCurrency(getCarPrice() - getSellerFee())} VNĐ`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* GỬI HỒ SƠ */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Gửi hồ sơ xác nhận</h3>

              {(buyerRecordSent || sellerRecordSent) && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div className="flex-1">
                      {buyerRecordSent && sellerRecordSent ? (
                        <span className="text-green-700 font-medium">Đã gửi hồ sơ cho cả người mua và người bán</span>
                      ) : buyerRecordSent ? (
                        <span className="text-green-700 font-medium">Đã gửi hồ sơ cho người mua</span>
                      ) : (
                        <span className="text-green-700 font-medium">Đã gửi hồ sơ cho người bán</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col md:flex-row gap-3">
                <button
                  onClick={handleSendRecordToBoth}
                  disabled={(buyerRecordSent && sellerRecordSent) || buyerSending || sellerSending}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-lg transition-colors font-medium text-lg ${
                    buyerRecordSent && sellerRecordSent
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : buyerSending || sellerSending
                      ? "bg-purple-300 text-white cursor-wait"
                      : "bg-gradient-to-r from-blue-600 to-green-600 text-white hover:from-blue-700 hover:to-green-700 shadow-lg"
                  }`}
                >
                  <Send className="w-6 h-6" />
                  {buyerRecordSent && sellerRecordSent
                    ? "Đã gửi hồ sơ"
                    : buyerSending || sellerSending
                    ? "Đang gửi hồ sơ..."
                    : "Gửi hồ sơ cho người mua & người bán"}
                </button>

                <button
                  onClick={() => setShowConfirmModal(true)}
                  className="px-6 py-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Mở trạng thái xác nhận
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
                      onClick={() => {
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
                      }}
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
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
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
                    <label htmlFor="buyerConfirm" className="text-sm text-gray-700">
                      Người mua đã xác nhận hồ sơ
                    </label>
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
                    <label htmlFor="sellerConfirm" className="text-sm text-gray-700">
                      Người bán đã xác nhận hồ sơ
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => {
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
                    setShowConfirmModal(false);
                  }}
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
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => e.stopPropagation()}
        >
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
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mã hồ sơ:</span>
                    <span className="font-semibold">{recordData.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Xe:</span>
                    <span className="font-semibold">{recordData.carModel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Người mua:</span>
                    <span className="font-semibold">{recordData.buyerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Người bán:</span>
                    <span className="font-semibold">{recordData.sellerName}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleFinalConfirmYes}
                  disabled={finalSending}
                  className={`flex-1 py-3 px-4 ${
                    finalSending ? "bg-blue-300 cursor-wait" : "bg-blue-600 hover:bg-blue-700"
                  } text-white rounded-lg transition-colors font-medium`}
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
