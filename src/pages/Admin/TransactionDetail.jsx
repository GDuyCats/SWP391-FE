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

export default function TransactionDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const recordData = location.state?.record;

  /* ===== State ===== */
  const [carPriceInput, setCarPriceInput] = useState("");
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [finalCarPrice, setFinalCarPrice] = useState(null);
  const [buyerRecordSent, setBuyerRecordSent] = useState(false);
  const [sellerRecordSent, setSellerRecordSent] = useState(false);
  const [buyerSending, setBuyerSending] = useState(false);
  const [sellerSending, setSellerSending] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [finalSending, setFinalSending] = useState(false);
  const [toast, setToast] = useState(null);

  // 5 loại phí
  const feeTypes = [
    "titleTransferFee",
    "legalAndConditionCheckFee",
    "adminProcessingFee",
    "reinspectionOrRegistrationSupportFee",
    "brokerageFee",
  ];

  const feeLabels = {
    titleTransferFee: "Phí chuyển nhượng quyền sở hữu",
    legalAndConditionCheckFee: "Phí kiểm tra pháp lý & tình trạng xe",
    adminProcessingFee: "Phí xử lý hành chính",
    reinspectionOrRegistrationSupportFee: "Phí hỗ trợ đăng kiểm lại",
    brokerageFee: "Phí môi giới",
  };

  // State phí
  const [fees, setFees] = useState({
    titleTransferFee: { buyer: "", seller: "" },
    legalAndConditionCheckFee: { buyer: "", seller: "" },
    adminProcessingFee: { buyer: "", seller: "" },
    reinspectionOrRegistrationSupportFee: { buyer: "", seller: "" },
    brokerageFee: { buyer: "", seller: "" },
  });

  // State: ai chịu phí
  const [feePayer, setFeePayer] = useState({
    titleTransferFee: null,
    legalAndConditionCheckFee: null,
    adminProcessingFee: null,
    reinspectionOrRegistrationSupportFee: null,
    brokerageFee: null,
  });

  /* ===== Endpoints ===== */
  const SEND_OTP_PATH = "/staff/contracts/send-otp";
  const SEND_DRAFT = "/staff/contracts/send-draft";
  const FINALIZE = "/staff/contracts/finalize";

  /* ===== FE deep-links ===== */
  const FE_ORIGIN = (import.meta.env.VITE_FE_ORIGIN || window.location.origin).replace(/\/$/, "");
  const linkForA = (id) => `${FE_ORIGIN}/contract-a?contractId=${id}`;
  const linkForB = (id) => `${FE_ORIGIN}/contract-b?contractId=${id}`;

  /* ===== Helpers ===== */
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

  // Tính tổng phí
  const getBuyerFee = () => {
    let total = 0;
    feeTypes.forEach((key) => {
      if (feePayer[key] === "buyer") total += toNumber(fees[key].buyer);
    });
    return total;
  };

  const getSellerFee = () => {
    let total = 0;
    feeTypes.forEach((key) => {
      if (feePayer[key] === "seller") total += toNumber(fees[key].seller);
    });
    return total;
  };

  const validateFees = () => {
    let valid = true;
    feeTypes.forEach((key) => {
      const payer = feePayer[key];
      if (payer && toNumber(fees[key][payer]) <= 0) valid = false;
    });
    if (!valid) {
      setToast({ type: "error", message: "Vui lòng nhập đầy đủ phí cho bên chịu trách nhiệm" });
    }
    return valid;
  };

  // Xử lý chọn bên chịu phí
  const handlePayerChange = (feeKey, payer) => {
    if (feePayer[feeKey] === payer) {
      setFeePayer((prev) => ({ ...prev, [feeKey]: null }));
      setFees((prev) => ({ ...prev, [feeKey]: { buyer: "", seller: "" } }));
    } else {
      setFeePayer((prev) => ({ ...prev, [feeKey]: payer }));
      const other = payer === "buyer" ? "seller" : "buyer";
      setFees((prev) => ({
        ...prev,
        [feeKey]: {
          [payer]: prev[feeKey][payer],
          [other]: "",
        },
      }));
    }
  };

  const handleFeeChange = (feeKey, role, value) => {
    if (feePayer[feeKey] !== role) return;
    setFees((prev) => ({
      ...prev,
      [feeKey]: { ...prev[feeKey], [role]: onlyDigits(value) },
    }));
  };

  /* ===== Build Contract URL & Email (client side) ===== */
  const buildBuyerContractUrl = () => {
    const price = getCarPrice();
    const buyerFee = getBuyerFee();
    const buyerTotal = price + buyerFee;
    const url = new URL(linkForA(recordData.id));
    url.searchParams.set("contractId", String(recordData.id));
    url.searchParams.set("price", String(price));
    url.searchParams.set("buyerFee", String(buyerFee));
    url.searchParams.set("buyerTotal", String(buyerTotal));
    return url.toString();
  };

  const buildSellerContractUrl = () => {
    const price = getCarPrice();
    const sellerFee = getSellerFee();
    const sellerTotal = price - sellerFee;
    const url = new URL(linkForB(recordData.id));
    url.searchParams.set("contractId", String(recordData.id));
    url.searchParams.set("price", String(price));
    url.searchParams.set("sellerFee", String(sellerFee));
    url.searchParams.set("sellerTotal", String(sellerTotal));
    return url.toString();
  };

  const makeEmailHtml = ({ title, lines = [], ctaUrl, ctaLabel }) => {
    const li = lines.map((l) => `<li style="margin:4px 0">${l}</li>`).join("");
    return `
      <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.6;color:#111;max-width:600px;margin:auto">
        <h2 style="margin:0 0 12px;color:#1a1a1a">${title}</h2>
        <ul style="padding-left:20px;margin:8px 0">${li}</ul>
        <p style="margin:20px 0">
          <a href="${ctaUrl}" target="_blank" rel="noopener"
             style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;
                    padding:14px 24px;border-radius:12px;font-weight:600;font-size:16px">
            ${ctaLabel}
          </a>
        </p>
        <p style="color:#666;font-size:13px">Nếu nút không hoạt động, mở: <br><a href="${ctaUrl}" style="color:#2563eb">${ctaUrl}</a></p>
      </div>`;
  };

  const buildEmailFor = (aud) => {
    const price = getCarPrice();
    const buyerFee = getBuyerFee();
    const sellerFee = getSellerFee();
    const buyerTotal = price + buyerFee;
    const sellerTotal = price - sellerFee;

    const feeLines = feeTypes
      .map((key) => {
        const payer = feePayer[key];
        const amount =
          payer === "buyer"
            ? toNumber(fees[key].buyer)
            : payer === "seller"
            ? toNumber(fees[key].seller)
            : 0;
        if (amount <= 0) return null;
        return `<b>${feeLabels[key]}:</b> ${formatCurrency(
          amount
        )} VNĐ <span style="color:#666">(${payer === "buyer" ? "Buyer" : "Seller"} chịu)</span>`;
      })
      .filter(Boolean);

    if (aud === "buyer") {
      const ctaUrl = buildBuyerContractUrl();
      const subject = `[EV] Hợp đồng #${recordData.id} – Bên A | Phí ${formatCurrency(
        buyerFee
      )}đ | Tổng ${formatCurrency(buyerTotal)}đ`;
      const lines = [
        `Giá chốt: <b>${formatCurrency(price)} VNĐ</b>`,
        ...feeLines.filter((line) => line.includes("Buyer")),
        `<b>Tổng phí Buyer:</b> ${formatCurrency(buyerFee)} VNĐ`,
        `<b>Tổng thanh toán:</b> ${formatCurrency(buyerTotal)} VNĐ`,
      ];
      return {
        toRole: "buyer",
        subject,
        text:
          lines.map((l) => l.replace(/<[^>]*>/g, "")).join("\n") +
          `\nMở: ${ctaUrl}`,
        html: makeEmailHtml({
          title: `Hồ sơ #${recordData.id} – Bên A`,
          lines,
          ctaUrl,
          ctaLabel: "Mở Contract A & Nhập OTP",
        }),
        ctaUrl,
      };
    }

    const ctaUrl = buildSellerContractUrl();
    const subject = `[EV] Hợp đồng #${recordData.id} – Bên B | Phí ${formatCurrency(
      sellerFee
    )}đ | Nhận ${formatCurrency(sellerTotal)}đ`;
    const lines = [
      `Giá chốt: <b>${formatCurrency(price)} VNĐ</b>`,
      ...feeLines.filter((line) => line.includes("Seller")),
      `<b>Tổng phí Seller:</b> ${formatCurrency(sellerFee)} VNĐ`,
      `<b>Tổng nhận được:</b> ${formatCurrency(sellerTotal)} VNĐ`,
    ];
    return {
      toRole: "seller",
      subject,
      text:
        lines.map((l) => l.replace(/<[^>]*>/g, "")).join("\n") +
        `\nMở: ${ctaUrl}`,
      html: makeEmailHtml({
        title: `Hồ sơ #${recordData.id} – Bên B`,
        lines,
        ctaUrl,
        ctaLabel: "Mở Contract B & Nhập OTP",
      }),
      ctaUrl,
    };
  };

  // Client build (server /send-draft chỉ dùng contractId để render từ DB nếu muốn)
  const buildDraftPayload = (aud) => {
    const price = getCarPrice();
    const buyerFee = getBuyerFee();
    const sellerFee = getSellerFee();
    const email = buildEmailFor(aud);

    const feeDetails = feeTypes.reduce((acc, key) => {
      const payer = feePayer[key];
      if (!payer) return acc;
      const amount = toNumber(fees[key][payer] || 0);
      acc[key] = { amount, payer };
      return acc;
    }, {});

    return {
      contractId: recordData.id,
      audience: aud,
      finalPrice: price,
      buyerFee: aud === "buyer" ? buyerFee : undefined,
      sellerFee: aud === "seller" ? sellerFee : undefined,
      feeDetails,
      toRole: email.toRole,
      subject: email.subject,
      text: email.text,
      html: email.html,
      ctaUrl: email.ctaUrl,
      sendMode: "html+text",
      contentType: "text/html",
    };
  };

  /* ===== FINALIZE payload theo Swagger ===== */
  const buildFinalizePayload = () => {
    const price = getCarPrice();

    const getAmount = (key) => {
      const payer = feePayer[key];
      if (!payer) return 0;
      return toNumber(fees[key][payer] || 0);
    };

    const feeResponsibility = {};
    feeTypes.forEach((key) => {
      if (feePayer[key] === "buyer" || feePayer[key] === "seller") {
        feeResponsibility[key] = feePayer[key];
      }
    });

    return {
      contractId: recordData.id,
      agreedPrice: price,
      brokerageFee: getAmount("brokerageFee"),
      titleTransferFee: getAmount("titleTransferFee"),
      legalAndConditionCheckFee: getAmount("legalAndConditionCheckFee"),
      adminProcessingFee: getAmount("adminProcessingFee"),
      reinspectionOrRegistrationSupportFee: getAmount("reinspectionOrRegistrationSupportFee"),
      feeResponsibility,
      note: "",
    };
  };

  /* ===== API calls ===== */

  // GỬI DRAFT: gửi FULL payload để email có đủ phí (không chỉ { contractId })
  const sendDraftOne = async (aud) => {
    const price = getCarPrice();
    const buyerFeeTotal = getBuyerFee();
    const sellerFeeTotal = getSellerFee();

    const getAmount = (key) => {
      const payer = feePayer[key];
      if (!payer) return 0;
      return toNumber(fees[key][payer] || 0);
    };

    const feeResponsibility = {};
    feeTypes.forEach((key) => {
      if (feePayer[key] === "buyer" || feePayer[key] === "seller") {
        feeResponsibility[key] = feePayer[key];
      }
    });

    const email = buildEmailFor(aud);

    const payload = {
      contractId: recordData.id,
      audience: aud,

      agreedPrice: price,
      buyerFeeTotal,
      sellerFeeTotal,
      feeResponsibility,

      brokerageFee: getAmount("brokerageFee"),
      titleTransferFee: getAmount("titleTransferFee"),
      legalAndConditionCheckFee: getAmount("legalAndConditionCheckFee"),
      adminProcessingFee: getAmount("adminProcessingFee"),
      reinspectionOrRegistrationSupportFee: getAmount("reinspectionOrRegistrationSupportFee"),

      toRole: email.toRole,
      subject: email.subject,
      text: email.text,
      html: email.html,
      ctaUrl: email.ctaUrl,
      sendMode: "html+text",
      contentType: "text/html",
    };

    const res = await api.post(SEND_DRAFT, payload);
    return res;
  };

  /* ===== OTP & Finalize ===== */
  const handleSendOtpCode = async () => {
    if (!recordData?.id) return;
    setOtpSending(true);
    try {
      const res = await api.post(SEND_OTP_PATH, { contractId: recordData.id });
      setOtpSent(true);
      setToast({ type: "success", message: res?.data?.message || "Đã gửi OTP" });
    } catch (error) {
      setToast({
        type: "error",
        message: error?.response?.data?.message || "Gửi OTP thất bại",
      });
    } finally {
      setOtpSending(false);
    }
  };

  // Cách A: FINALIZE trước, rồi SEND-DRAFT hai bên
  const handleSendRecordToBoth = async () => {
    if (!recordData?.id) {
      setToast({ type: "error", message: "Thiếu contractId" });
      return;
    }
    const price = getCarPrice();
    if (price <= 0) {
      setToast({ type: "error", message: "Giá trị xe không hợp lệ" });
      return;
    }
    if (!validateFees()) return;

    try {
      setBuyerSending(true);
      setSellerSending(true);
      setFinalSending(true);

      // 1) FINALIZE vào DB
      const finalizePayload = buildFinalizePayload();
      await api.post(FINALIZE, finalizePayload);

      // 2) SEND-DRAFT hai bên (email có đủ phí nhờ payload +/hoặc DB)
      await Promise.all([sendDraftOne("buyer"), sendDraftOne("seller")]);

      setBuyerRecordSent(true);
      setSellerRecordSent(true);
      setToast({ type: "success", message: "Đã finalize & gửi hồ sơ cho cả hai bên" });
    } catch (error) {
      setToast({
        type: "error",
        message: error?.response?.data?.message || "Gửi hồ sơ thất bại",
      });
    } finally {
      setBuyerSending(false);
      setSellerSending(false);
      setFinalSending(false);
    }
  };

  const handleFinalize = async () => {
    const price2 = getCarPrice();
    if (!recordData?.id) return;
    if (price2 <= 0) {
      setToast({ type: "error", message: "Giá trị xe không hợp lệ" });
      return;
    }
    if (!validateFees()) return;

    setFinalSending(true);
    try {
      const payload = buildFinalizePayload();
      const res = await api.post(FINALIZE, payload);
      setToast({ type: "success", message: res?.data?.message || "Hoàn tất giao dịch!" });
    } catch (error) {
      setToast({ type: "error", message: error?.response?.data?.message || "Lỗi hoàn tất" });
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
          <main className="flex-1 py-8 px-6 text-center">
            <p className="text-gray-600 mb-4">Không tìm thấy hồ sơ</p>
            <button
              onClick={() => navigate("/transactionrecords")}
              className="text-blue-600 hover:underline"
            >
              Quay lại danh sách
            </button>
          </main>
        </div>
      </div>
    );
  }

  const maskText = "— ẩn sau khi gửi —";
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
                Quay lại
              </button>
              <h1 className="text-3xl font-bold">Chi tiết hồ sơ - {recordData.id}</h1>
              <p className="text-gray-600 mt-2">Chọn bên chịu phí và nhập giá trị</p>
            </div>

            {/* Chốt giá */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg shadow-sm border-2 border-yellow-300 p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <DollarSign className="w-6 h-6 mr-2 text-yellow-600" />
                Chốt giá trị xe
              </h2>

              {!isEditingPrice ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">
                      {finalCarPrice !== null ? "Đã chốt:" : "Chưa chốt"}
                    </p>
                    <p className="text-3xl font-bold text-yellow-700">
                      {formatCurrency(getCarPrice())} VNĐ
                    </p>
                    {finalCarPrice !== null && (
                      <p className="text-xs text-green-600 mt-1 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Đã chốt
                      </p>
                    )}
                  </div>

                  {/* Nút chỉ mở form nhập, KHÔNG tự set giá */}
                  <button
                    onClick={() => {
                      const priceNow = getCarPrice();
                      setCarPriceInput(priceNow > 0 ? String(priceNow) : "");
                      setIsEditingPrice(true);
                    }}
                    className="bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 font-medium flex items-center gap-2"
                  >
                    <DollarSign className="w-5 h-5" />
                    {finalCarPrice !== null ? "Sửa giá" : "Chốt giá"}
                  </button>
                </div>
              ) : (
                <div className="flex gap-3 items-start">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={carPriceInput}
                    onChange={(e) => setCarPriceInput(onlyDigits(e.target.value))}
                    className="flex-1 px-4 py-3 border-2 border-yellow-400 rounded-lg text-lg"
                    placeholder="Nhập giá (VNĐ)"
                  />
                  <button
                    onClick={handleConfirmPrice}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Xác nhận
                  </button>
                  <button
                    onClick={() => {
                      setCarPriceInput("");
                      setIsEditingPrice(false);
                    }}
                    className="px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                </div>
              )}
            </div>

            {/* Phí - 2 bảng */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Buyer */}
              <div className="bg-white rounded-lg shadow-sm border border-blue-200 overflow-hidden">
                <div className="bg-blue-50 px-6 py-4 border-b border-blue-200">
                  <div className="flex items-center">
                    <User className="w-6 h-6 text-blue-600 mr-3" />
                    <div>
                      <h3 className="text-lg font-semibold">Người Mua (User A)</h3>
                      <p className="text-sm text-gray-600">{recordData.buyerName}</p>
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  {feeTypes.map((key) => (
                    <div key={key} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={feePayer[key] === "buyer"}
                        onChange={() => handlePayerChange(key, "buyer")}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <label className="flex-1 text-sm font-medium text-gray-700">
                        {feeLabels[key]}
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={fees[key].buyer}
                        onChange={(e) => handleFeeChange(key, "buyer", e.target.value)}
                        disabled={feePayer[key] !== "buyer"}
                        placeholder={feePayer[key] === "buyer" ? "0" : "—"}
                        className={`w-32 px-3 py-2 text-right border rounded-lg font-medium transition-colors ${
                          feePayer[key] === "buyer"
                            ? "border-blue-300 focus:border-blue-500 focus:ring-blue-500"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-300"
                        }`}
                      />
                    </div>
                  ))}
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">
                      Giá trị xe:{" "}
                      <span className="font-semibold">
                        {formatCurrency(getCarPrice())} VNĐ
                      </span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Tổng phí Buyer:{" "}
                      <span className="font-semibold text-blue-600 text-lg">
                        {hideBuyerDetails ? maskText : `${formatCurrency(getBuyerFee())} VNĐ`}
                      </span>
                    </p>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Tổng thanh toán:</span>
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
                      <h3 className="text-lg font-semibold">Người Bán (User B)</h3>
                      <p className="text-sm text-gray-600">{recordData.sellerName}</p>
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  {feeTypes.map((key) => (
                    <div key={key} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={feePayer[key] === "seller"}
                        onChange={() => handlePayerChange(key, "seller")}
                        className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                      />
                      <label className="flex-1 text-sm font-medium text-gray-700">
                        {feeLabels[key]}
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={fees[key].seller}
                        onChange={(e) => handleFeeChange(key, "seller", e.target.value)}
                        disabled={feePayer[key] !== "seller"}
                        placeholder={feePayer[key] === "seller" ? "0" : "—"}
                        className={`w-32 px-3 py-2 text-right border rounded-lg font-medium transition-colors ${
                          feePayer[key] === "seller"
                            ? "border-green-300 focus:border-green-500 focus:ring-green-500"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-300"
                        }`}
                      />
                    </div>
                  ))}
                  <div className="mt-6 p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">
                      Giá trị xe:{" "}
                      <span className="font-semibold">
                        {formatCurrency(getCarPrice())} VNĐ
                      </span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Tổng phí Seller:{" "}
                      <span className="font-semibold text-green-600 text-lg">
                        {hideSellerDetails ? maskText : `${formatCurrency(getSellerFee())} VNĐ`}
                      </span>
                    </p>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Tổng nhận được:</span>
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

            {/* Gửi hồ sơ */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Gửi hồ sơ xác nhận</h3>
              {(buyerRecordSent || sellerRecordSent) && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 font-medium flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  {buyerRecordSent && sellerRecordSent
                    ? "Đã gửi cả hai bên"
                    : buyerRecordSent
                    ? "Đã gửi cho Buyer"
                    : "Đã gửi cho Seller"}
                </div>
              )}
              <button
                onClick={handleSendRecordToBoth}
                disabled={(buyerRecordSent && sellerRecordSent) || buyerSending || sellerSending}
                className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-lg font-medium text-lg transition-all ${
                  buyerRecordSent && sellerRecordSent
                    ? "bg-gray-300 text-gray-500"
                    : buyerSending || sellerSending
                    ? "bg-purple-300 text-white cursor-wait"
                    : "bg-gradient-to-r from-blue-600 to-green-600 text-white hover:from-blue-700 hover:to-green-700 shadow-lg"
                }`}
              >
                <Send className="w-6 h-6" />
                {buyerRecordSent && sellerRecordSent
                  ? "Đã gửi"
                  : buyerSending || sellerSending
                  ? "Đang gửi..."
                  : "Finalize & Gửi cho cả hai bên"}
              </button>
            </div>

            {/* Bước tiếp theo */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Bước tiếp theo</h3>
                  <p className="text-sm text-gray-600 mt-1">Gửi OTP bất kỳ lúc nào</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleSendOtpCode}
                    disabled={otpSent || otpSending}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg border font-medium transition-colors ${
                      otpSent
                        ? "border-gray-300 text-gray-400"
                        : otpSending
                        ? "border-blue-300 text-blue-300 cursor-wait"
                        : "border-blue-600 text-blue-600 hover:bg-blue-50"
                    }`}
                  >
                    <Send className="w-5 h-5" />
                    {otpSent ? "Đã gửi OTP" : otpSending ? "Đang gửi..." : "Gửi OTP"}
                  </button>
                  <button
                    onClick={handleFinalize}
                    disabled={finalSending}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all shadow-lg ${
                      finalSending
                        ? "bg-gray-400 text-white cursor-wait"
                        : "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
                    }`}
                  >
                    <CheckCircle className="w-5 h-5" />
                    {finalSending ? "Đang hoàn tất..." : "Hoàn tất hợp đồng"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
