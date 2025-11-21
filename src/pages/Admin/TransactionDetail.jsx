// src/pages/Admin/TransactionDetail.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Send, CheckCircle, DollarSign, User } from "lucide-react";
import AdminHeader from "../../components/Admin/AdminHeader";
import AdminSidebar from "../../components/Admin/AdminSidebar";
import { api } from "../../services/api";

/* =========================================================
 * COMPONENT TOAST NỘI BỘ CHO TRANG NÀY
 * - Dùng useEffect để auto ẩn sau 3s
 * - type: "success" | "error" => đổi màu nền xanh / đỏ
 * - message: nội dung text hiển thị
 * - onClose: callback để parent setToast(null)
 * =======================================================*/
const Toast = ({ type = "success", message, onClose }) => {
  useEffect(() => {
    if (!message) return; // không có message thì không set timer

    const timer = setTimeout(() => {
      // Sau 3s tự gọi onClose để ẩn Toast
      onClose && onClose();
    }, 3000);

    // clear timer nếu component unmount hoặc message/onClose đổi
    return () => clearTimeout(timer);
  }, [message, onClose]);

  // chọn màu nền theo type
  const bgClass = type === "error" ? "bg-red-500" : "bg-green-500";

  return (
    <div
      className={`fixed top-5 right-5 px-4 py-3 rounded shadow-lg text-white text-sm ${bgClass}`}
      style={{ zIndex: 9999 }} // đảm bảo nổi lên trên header
    >
      {message}
    </div>
  );
};

/* =========================================================
 * HÀM TIỆN ÍCH XỬ LÝ SỐ & FORMAT TIỀN
 * =======================================================*/

// Chỉ giữ lại ký tự số trong chuỗi, loại bỏ . , chữ, space,...
const onlyDigits = (s) => (s || "").replace(/[^\d]/g, "");

// Chuyển string -> number, nếu rỗng thì trả 0
const toNumber = (s) => {
  const clean = onlyDigits(s);
  return clean === "" ? 0 : Number(clean);
};

// Format số theo chuẩn tiền tệ Việt Nam
const formatCurrency = (input) => {
  const n = typeof input === "string" ? toNumber(input) : Number(input || 0);
  return new Intl.NumberFormat("vi-VN").format(n);
};

export default function TransactionDetail() {
  const navigate = useNavigate();
  const location = useLocation();

  // recordData được truyền từ trang TransactionRecords qua navigate state
  const recordData = location.state?.record;

  /* =========================================================
   * STATE CHÍNH CHO MÀN HÌNH
   * =======================================================*/

  // State giá xe
  const [carPriceInput, setCarPriceInput] = useState(""); // giá nhập trong input
  const [isEditingPrice, setIsEditingPrice] = useState(false); // đang mở mode chỉnh giá
  const [finalCarPrice, setFinalCarPrice] = useState(null); // giá đã chốt

  // Trạng thái đã gửi hồ sơ cho Buyer / Seller
  const [buyerRecordSent, setBuyerRecordSent] = useState(false);
  const [sellerRecordSent, setSellerRecordSent] = useState(false);
  const [buyerSending, setBuyerSending] = useState(false); // loading khi gửi cho Buyer
  const [sellerSending, setSellerSending] = useState(false); // loading khi gửi cho Seller

  // Trạng thái gửi OTP & finalize
  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [finalSending, setFinalSending] = useState(false);

  // Toast: { type: "success" | "error", message: string } | null
  const [toast, setToast] = useState(null);

  /* =========================================================
   * CẤU HÌNH CÁC LOẠI PHÍ (KEY DÙNG CHO STATE VÀ PAYLOAD API)
   * =======================================================*/
  const feeTypes = [
    "titleTransferFee", // Phí chuyển nhượng quyền sở hữu
    "legalAndConditionCheckFee", // Phí kiểm tra pháp lý & tình trạng xe
    "adminProcessingFee", // Phí xử lý hành chính
    "reinspectionOrRegistrationSupportFee", // Phí hỗ trợ đăng kiểm lại
    "brokerageFee", // Phí môi giới
  ];

  // Map key -> label tiếng Việt hiển thị trên UI
  const feeLabels = {
    titleTransferFee: "Phí chuyển nhượng quyền sở hữu",
    legalAndConditionCheckFee: "Phí kiểm tra pháp lý & tình trạng xe",
    adminProcessingFee: "Phí xử lý hành chính",
    reinspectionOrRegistrationSupportFee: "Phí hỗ trợ đăng kiểm lại",
    brokerageFee: "Phí môi giới",
  };

  // fees[key].buyer / fees[key].seller: số tiền mà từng bên chịu cho loại phí đó
  const [fees, setFees] = useState({
    titleTransferFee: { buyer: "", seller: "" },
    legalAndConditionCheckFee: { buyer: "", seller: "" },
    adminProcessingFee: { buyer: "", seller: "" },
    reinspectionOrRegistrationSupportFee: { buyer: "", seller: "" },
    brokerageFee: { buyer: "", seller: "" },
  });

  // feePayer[key] = "buyer" | "seller" | null
  // cho biết loại phí đó bên nào đang chịu
  const [feePayer, setFeePayer] = useState({
    titleTransferFee: null,
    legalAndConditionCheckFee: null,
    adminProcessingFee: null,
    reinspectionOrRegistrationSupportFee: null,
    brokerageFee: null,
  });

  /* =========================================================
   * KHAI BÁO CÁC ENDPOINT API SỬ DỤNG TRONG TRANG
   * =======================================================*/
  // Gửi OTP cho 2 bên (API backend cung cấp)
  const SEND_OTP_PATH = "/staff/contracts/send-otp";

  // Gửi email nháp hợp đồng (draft contract) cho buyer/seller
  const SEND_DRAFT = "/staff/contracts/send-draft";

  // Finalize hợp đồng: lưu agreedPrice + các loại phí + feeResponsibility vào DB
  const FINALIZE = "/staff/contracts/finalize";

  /* =========================================================
   * HÀM LẤY GIÁ XE ĐANG SỬ DỤNG
   * - Nếu đã chốt (finalCarPrice != null) thì dùng finalCarPrice
   * - Ngược lại lấy từ recordData.price
   * =======================================================*/
  const getCarPrice = () => {
    if (finalCarPrice !== null) return finalCarPrice;
    if (!recordData?.price) return 0;

    return typeof recordData.price === "number"
      ? recordData.price
      : toNumber(String(recordData.price));
  };

  /* =========================================================
   * XỬ LÝ NÚT "XÁC NHẬN" TRONG BOX CHỐT GIÁ
   * - Validate giá > 0
   * - Nếu hợp lệ: set finalCarPrice và tắt mode edit
   * =======================================================*/
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

  /* =========================================================
   * TÍNH TỔNG PHÍ BUYER / SELLER
   * - Chỉ cộng các loại phí mà feePayer[key] === "buyer" / "seller"
   * - Dùng toNumber để tránh NaN nếu input rỗng
   * =======================================================*/
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

  /* =========================================================
   * VALIDATE PHÍ TRƯỚC KHI GỌI API FINALIZE / GỬI HỒ SƠ
   * - Với mỗi loại phí:
   *   + Nếu đã chọn payer (buyer/seller) thì số tiền của payer phải > 0
   * =======================================================*/
  const validateFees = () => {
    let valid = true;

    feeTypes.forEach((key) => {
      const payer = feePayer[key];
      if (payer && toNumber(fees[key][payer]) <= 0) valid = false;
    });

    if (!valid) {
      setToast({
        type: "error",
        message: "Vui lòng nhập đầy đủ phí cho bên chịu trách nhiệm",
      });
    }
    return valid;
  };

  /* =========================================================
   * XỬ LÝ CHECKBOX CHỌN BÊN CHỊU PHÍ
   * - Nếu click lại đúng bên đang chọn => bỏ chọn (set null) và clear cả buyer/seller
   * - Nếu chọn bên mới => giữ số bên đó, clear số của bên còn lại
   * =======================================================*/
  const handlePayerChange = (feeKey, payer) => {
    // Trường hợp click lại cùng một bên => uncheck
    if (feePayer[feeKey] === payer) {
      setFeePayer((prev) => ({ ...prev, [feeKey]: null }));
      setFees((prev) => ({ ...prev, [feeKey]: { buyer: "", seller: "" } }));
    } else {
      // Chọn payer mới
      setFeePayer((prev) => ({ ...prev, [feeKey]: payer }));
      const other = payer === "buyer" ? "seller" : "buyer";

      // Giữ số bên đang chịu phí, clear số bên còn lại để tránh nhầm
      setFees((prev) => ({
        ...prev,
        [feeKey]: {
          [payer]: prev[feeKey][payer],
          [other]: "",
        },
      }));
    }
  };

  /* =========================================================
   * XỬ LÝ NHẬP SỐ TIỀN PHÍ CHO BUYER / SELLER
   * - Chỉ cho phép nhập nếu role đang là payer
   * - Dùng onlyDigits để loại bỏ ký tự ngoài số
   * =======================================================*/
  const handleFeeChange = (feeKey, role, value) => {
    if (feePayer[feeKey] !== role) return; // nếu không phải bên chịu phí thì bỏ qua

    setFees((prev) => ({
      ...prev,
      [feeKey]: { ...prev[feeKey], [role]: onlyDigits(value) },
    }));
  };

  /* =========================================================
   * BUILD PAYLOAD GỬI LÊN API FINALIZE
   * - contractId: id của hồ sơ / hợp đồng
   * - agreedPrice: giá xe đã chốt
   * - các field phí: lấy theo feePayer + fees
   * - feeResponsibility: map loại phí -> "buyer"/"seller"
   * =======================================================*/
  const buildFinalizePayload = () => {
    const price = getCarPrice();

    // Lấy số tiền cho từng loại phí theo payer
    const getAmount = (key) => {
      const payer = feePayer[key];
      if (!payer) return 0;
      return toNumber(fees[key][payer] || 0);
    };

    // feeResponsibility dùng để backend biết loại phí đó bên nào chịu
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
      reinspectionOrRegistrationSupportFee: getAmount(
        "reinspectionOrRegistrationSupportFee"
      ),
      feeResponsibility,
      note: "", // tạm thời chưa dùng
    };
  };

  /* =========================================================
   * API: GỬI DRAFT MAIL CHO 1 BÊN (BUYER / SELLER)
   * - Endpoint: POST /staff/contracts/send-draft
   * - Body: { contractId, audience: "buyer" | "seller" }
   * - Trả về: object có field message (ví dụ trong Swagger)
   * =======================================================*/
  const sendDraftOne = async (audience) => {
    const payload = {
      contractId: recordData.id,
      audience, // "buyer" hoặc "seller"
    };

    // Trả về full response để bên ngoài lấy res.data.message
    return api.post(SEND_DRAFT, payload);
  };

  /* =========================================================
   * API: GỬI OTP
   * - GẮN VỚI NÚT "Gửi OTP" TRONG BOX "Bước tiếp theo"
   * - Endpoint: POST /staff/contracts/send-otp
   * - Body: { contractId }
   * - Backend trả về message (hiện tại là tiếng Anh trong Swagger)
   * =======================================================*/
  const handleSendOtpCode = async () => {
    if (!recordData?.id) return;

    setOtpSending(true);
    try {
      // GỌI API OTP
      const res = await api.post(SEND_OTP_PATH, {
        contractId: recordData.id,
      });

      setOtpSent(true);

      // Ưu tiên lấy message từ backend, nếu không có thì fallback tiếng Việt
      setToast({
        type: "success",
        message: res?.data?.message || "Đã gửi OTP",
      });
    } catch (error) {
      // Lấy message lỗi backend, nếu không có thì dùng message mặc định
      setToast({
        type: "error",
        message: error?.response?.data?.message || "Gửi OTP thất bại",
      });
    } finally {
      setOtpSending(false);
    }
  };

  /* =========================================================
   * NÚT: "Finalize & Gửi cho cả hai bên"
   * FLOW NGHIỆP VỤ:
   *   B1: Validate contractId, giá xe, phí
   *   B2: Gọi API FINALIZE để lưu agreedPrice + phí vào DB
   *   B3: Gọi API SEND-DRAFT cho cả buyer & seller (Promise.all)
   *   B4: Đọc message từ response API (ưu tiên sellerRes.data.message)
   *   B5: Cập nhật state đã gửi & hiển thị Toast
   * =======================================================*/
  const handleSendRecordToBoth = async () => {
    // Bảo vệ: thiếu contractId thì không làm gì
    if (!recordData?.id) {
      setToast({ type: "error", message: "Thiếu contractId" });
      return;
    }

    const price = getCarPrice();
    if (price <= 0) {
      setToast({ type: "error", message: "Giá trị xe không hợp lệ" });
      return;
    }

    // Validate phí trước khi gửi
    if (!validateFees()) return;

    try {
      // Bật trạng thái loading cho 3 action
      setBuyerSending(true);
      setSellerSending(true);
      setFinalSending(true);

      // B1: Gọi API FINALIZE để lưu dữ liệu vào DB
      const finalizePayload = buildFinalizePayload();
      await api.post(FINALIZE, finalizePayload); // <-- GỌI API /finalize

      // B2: Gọi API SEND-DRAFT cho cả buyer & seller song song
      const [buyerRes, sellerRes] = await Promise.all([
        sendDraftOne("buyer"), // <-- POST /send-draft audience="buyer"
        sendDraftOne("seller"), // <-- POST /send-draft audience="seller"
      ]);

      // B3: Đánh dấu state đã gửi cho 2 bên
      setBuyerRecordSent(true);
      setSellerRecordSent(true);

      // B4: Lấy message từ backend:
      //     Ưu tiên sellerRes.data.message -> buyerRes.data.message -> fallback
      const apiMessage =
        sellerRes?.data?.message ||
        buyerRes?.data?.message ||
        "Draft hợp đồng đã được gửi cho buyer và seller.";

      // B5: Hiện Toast với message lấy từ API (giống Swagger)
      setToast({
        type: "success",
        message: apiMessage,
      });
    } catch (error) {
      // Xử lý lỗi chung cho finalize hoặc send-draft
      const errMsg =
        error?.response?.data?.message ||
        "Gửi hồ sơ thất bại. Vui lòng thử lại.";
      setToast({
        type: "error",
        message: errMsg,
      });
    } finally {
      // Tắt loading ở 3 nút
      setBuyerSending(false);
      setSellerSending(false);
      setFinalSending(false);
    }
  };

  /* =========================================================
   * NÚT: "Hoàn tất hợp đồng"
   * - Chỉ gọi FINALIZE để lưu agreedPrice + phí
   * - KHÔNG gửi email draft cho buyer/seller
   * - Dùng trong trường hợp staff muốn lưu trước, gửi mail sau
   * =======================================================*/
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
      // Build payload giống như handleSendRecordToBoth
      const payload = buildFinalizePayload();

      // GỌI API FINALIZE, chỉ lưu DB
      const res = await api.post(FINALIZE, payload);

      // Ưu tiên dùng message từ backend, nếu không có thì fallback
      setToast({
        type: "success",
        message: res?.data?.message || "Hoàn tất giao dịch!",
      });
    } catch (error) {
      setToast({
        type: "error",
        message: error?.response?.data?.message || "Lỗi hoàn tất",
      });
    } finally {
      setFinalSending(false);
    }
  };

  /* =========================================================
   * TRƯỜNG HỢP MỞ TRANG THẲNG MÀ KHÔNG CÓ recordData
   * =======================================================*/
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

  // Khi đã gửi hồ sơ cho 1 bên, ẩn chi tiết tiền của bên còn lại
  const maskText = "— ẩn sau khi gửi —";
  const hideBuyerDetails = sellerRecordSent;
  const hideSellerDetails = buyerRecordSent;

  /* =========================================================
   * UI CHÍNH
   * =======================================================*/
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 py-8 px-6">
          <div className="max-w-7xl mx-auto">
            {/* ================= HEADER ================ */}
            <div className="mb-6">
              <button
                onClick={() => navigate("/transactionrecords")}
                className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Quay lại
              </button>
              <h1 className="text-3xl font-bold">
                Chi tiết hồ sơ - {recordData.id}
              </h1>
              <p className="text-gray-600 mt-2">
                Chọn bên chịu phí và nhập giá trị
              </p>
            </div>

            {/* ============== BOX CHỐT GIÁ ============== */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg shadow-sm border-2 border-yellow-300 p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <DollarSign className="w-6 h-6 mr-2 text-yellow-600" />
                Chốt giá trị xe
              </h2>

              {/* Mode xem (không chỉnh sửa) */}
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

                  {/* Nút vàng: Chốt giá / Sửa giá */}
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
                // Mode chỉnh sửa giá
                <div className="flex gap-3 items-start">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={carPriceInput}
                    onChange={(e) =>
                      setCarPriceInput(onlyDigits(e.target.value))
                    }
                    className="flex-1 px-4 py-3 border-2 border-yellow-400 rounded-lg text-lg"
                    placeholder="Nhập giá (VNĐ)"
                  />
                  {/* Nút xanh lá: Xác nhận */}
                  <button
                    onClick={handleConfirmPrice}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Xác nhận
                  </button>
                  {/* Nút xám: Hủy */}
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

            {/* ========== 2 BẢNG BUYER / SELLER ========== */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* -------- BUYER -------- */}
              <div className="bg-white rounded-lg shadow-sm border border-blue-200 overflow-hidden">
                <div className="bg-blue-50 px-6 py-4 border-b border-blue-200">
                  <div className="flex items-center">
                    <User className="w-6 h-6 text-blue-600 mr-3" />
                    <div>
                      <h3 className="text-lg font-semibold">
                        Người Mua (User A)
                      </h3>
                      <p className="text-sm text-gray-600">
                        {recordData.buyerName}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  {feeTypes.map((key) => (
                    <div key={key} className="flex items-center gap-3">
                      {/* Checkbox chọn Buyer chịu phí */}
                      <input
                        type="checkbox"
                        checked={feePayer[key] === "buyer"}
                        onChange={() => handlePayerChange(key, "buyer")}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <label className="flex-1 text-sm font-medium text-gray-700">
                        {feeLabels[key]}
                      </label>
                      {/* Input số tiền Buyer chịu */}
                      <input
                        type="text"
                        inputMode="numeric"
                        value={fees[key].buyer}
                        onChange={(e) =>
                          handleFeeChange(key, "buyer", e.target.value)
                        }
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

                  {/* Box tổng kết Buyer */}
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
                        {hideBuyerDetails
                          ? maskText
                          : `${formatCurrency(getBuyerFee())} VNĐ`}
                      </span>
                    </p>
                  </div>

                  {/* Tổng thanh toán Buyer = giá xe + tổng phí Buyer */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">
                        Tổng thanh toán:
                      </span>
                      <span className="text-xl font-bold text-blue-600">
                        {hideBuyerDetails
                          ? maskText
                          : `${formatCurrency(
                              getCarPrice() + getBuyerFee()
                            )} VNĐ`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* -------- SELLER -------- */}
              <div className="bg-white rounded-lg shadow-sm border border-green-200 overflow-hidden">
                <div className="bg-green-50 px-6 py-4 border-b border-green-200">
                  <div className="flex items-center">
                    <User className="w-6 h-6 text-green-600 mr-3" />
                    <div>
                      <h3 className="text-lg font-semibold">
                        Người Bán (User B)
                      </h3>
                      <p className="text-sm text-gray-600">
                        {recordData.sellerName}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  {feeTypes.map((key) => (
                    <div key={key} className="flex items-center gap-3">
                      {/* Checkbox chọn Seller chịu phí */}
                      <input
                        type="checkbox"
                        checked={feePayer[key] === "seller"}
                        onChange={() => handlePayerChange(key, "seller")}
                        className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                      />
                      <label className="flex-1 text-sm font-medium text-gray-700">
                        {feeLabels[key]}
                      </label>
                      {/* Input số tiền Seller chịu */}
                      <input
                        type="text"
                        inputMode="numeric"
                        value={fees[key].seller}
                        onChange={(e) =>
                          handleFeeChange(key, "seller", e.target.value)
                        }
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

                  {/* Box tổng kết Seller */}
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
                        {hideSellerDetails
                          ? maskText
                          : `${formatCurrency(getSellerFee())} VNĐ`}
                      </span>
                    </p>
                  </div>

                  {/* Tổng nhận được Seller = giá xe - tổng phí Seller */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">
                        Tổng nhận được:
                      </span>
                      <span className="text-xl font-bold text-green-600">
                        {hideSellerDetails
                          ? maskText
                          : `${formatCurrency(
                              getCarPrice() - getSellerFee()
                            )} VNĐ`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ============== BOX GỬI HỒ SƠ ============== */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Gửi hồ sơ xác nhận</h3>

              {/* Thông báo nhỏ khi đã gửi hồ sơ cho 1 hoặc 2 bên */}
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

              {/* Nút lớn: Finalize & Gửi cho cả hai bên */}
              <button
                onClick={handleSendRecordToBoth}
                disabled={
                  (buyerRecordSent && sellerRecordSent) ||
                  buyerSending ||
                  sellerSending
                }
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

            {/* ============ BOX BƯỚC TIẾP THEO ============ */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Bước tiếp theo</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Gửi OTP bất kỳ lúc nào
                  </p>
                </div>

                <div className="flex gap-3">
                  {/* Nút Gửi OTP: gắn handleSendOtpCode */}
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
                    {otpSent
                      ? "Đã gửi OTP"
                      : otpSending
                      ? "Đang gửi..."
                      : "Gửi OTP"}
                  </button>

                  {/* Nút Hoàn tất hợp đồng: gắn handleFinalize */}
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

      {/* ============ TOAST HIỂN THỊ THÔNG BÁO ============ */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
