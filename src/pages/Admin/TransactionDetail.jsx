import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Send,
  CheckCircle,
  DollarSign,
  User,
} from "lucide-react";
import AdminHeader from "../../components/Admin/AdminHeader";
import AdminSidebar from "../../components/Admin/AdminSidebar";
import Toast from "../../components/Toast";

/* ========================= Utils an toàn cho tiền tệ ========================= */
const onlyDigits = (s) => (s || "").replace(/[^\d]/g, ""); // giữ 0-9

const toNumber = (s) => {
  const clean = onlyDigits(s);
  return clean === "" ? 0 : Number(clean);
};

const formatCurrency = (input) => {
  const n =
    typeof input === "string" ? toNumber(input) : Number(input || 0);
  return new Intl.NumberFormat("vi-VN").format(n);
};

/* =========================================================================== */
/* Component Input tiền tệ                                                     */
/* Không format trong <input> để không làm nhảy caret                          */
/* =========================================================================== */
const FeeInputField = ({
  label,
  value,
  onChange,
  error,
  required = true,
}) => (
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
        onChange={(e) => {
          const raw = e.target.value;
          onChange(onlyDigits(raw)); // chỉ giữ số
        }}
        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? "border-red-500" : "border-gray-300"
        }`}
        placeholder="Nhập số tiền (VNĐ)"
      />
      <DollarSign className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
    </div>

    {/* Hiển thị format bên dưới */}
    {value && value !== "" && (
      <p className="mt-1 text-sm text-gray-500">
        {formatCurrency(value)} VNĐ
      </p>
    )}

    {error && (
      <p className="mt-1 text-sm text-red-500">{error}</p>
    )}
  </div>
);

/* =========================================================================== */
/* Main page Component                                                         */
/* =========================================================================== */
export default function TransactionDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const recordData = location.state?.record;

  // phí người mua (Người A) -> LƯU CHUỖI SỐ THÔ
  const [buyerFees, setBuyerFees] = useState({
    notarizationFee: "",
    commissionFee: "",
    registrationFee: "",
    licensePlateFee: "",
    inspectionFee: "",
  });

  // phí người bán (Người B) -> LƯU CHUỖI SỐ THÔ
  const [sellerFees, setSellerFees] = useState({
    notarizationFee: "",
    commissionFee: "",
    registrationFee: "",
    licensePlateFee: "",
    inspectionFee: "",
  });

  // trạng thái xác nhận hồ sơ
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [buyerConfirmed, setBuyerConfirmed] = useState(false);
  const [sellerConfirmed, setSellerConfirmed] = useState(false);
  const [recordSent, setRecordSent] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  // toast
  const [toast, setToast] = useState(null);

  // validation
  const [errors, setErrors] = useState({});

  const handleBuyerFeeChange = (field, value) => {
    setBuyerFees((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[`buyer_${field}`]) {
      setErrors((prev) => ({
        ...prev,
        [`buyer_${field}`]: null,
      }));
    }
  };

  const handleSellerFeeChange = (field, value) => {
    setSellerFees((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[`seller_${field}`]) {
      setErrors((prev) => ({
        ...prev,
        [`seller_${field}`]: null,
      }));
    }
  };

  const calculateTotal = (feesObj) =>
    Object.values(feesObj).reduce(
      (sum, v) => sum + toNumber(v),
      0
    );

  const validateFees = () => {
    const newErrors = {};

    // buyer
    Object.keys(buyerFees).forEach((key) => {
      const v = toNumber(buyerFees[key]);
      if (Number.isNaN(v) || v < 0) {
        newErrors[`buyer_${key}`] =
          "Vui lòng nhập số tiền hợp lệ";
      }
    });

    // seller
    Object.keys(sellerFees).forEach((key) => {
      const v = toNumber(sellerFees[key]);
      if (Number.isNaN(v) || v < 0) {
        newErrors[`seller_${key}`] =
          "Vui lòng nhập số tiền hợp lệ";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Gửi hồ sơ để xác nhận
  const handleSendOtp = () => {
    if (!validateFees()) {
      setToast({
        type: "error",
        message:
          "Vui lòng điền đầy đủ thông tin các khoản phí cho cả người mua và người bán",
      });
      return;
    }

    setRecordSent(true);
    setShowConfirmModal(true);

    setToast({
      type: "success",
      message:
        "Hồ sơ đã được gửi đến người mua và người bán để xác nhận",
    });
  };

  // Gửi mã OTP cho buyer/seller
  const handleSendOtpCode = () => {
    setOtpSent(true);
    setToast({
      type: "success",
      message:
        "Đã gửi mã OTP đến người mua và người bán",
    });
  };

  // Xác nhận giao dịch sau khi cả 2 tick
  const handleVerifyOtp = () => {
    if (!buyerConfirmed) {
      setToast({
        type: "error",
        message:
          "Vui lòng chờ người mua xác nhận hồ sơ",
      });
      return;
    }

    if (!sellerConfirmed) {
      setToast({
        type: "error",
        message:
          "Vui lòng chờ người bán xác nhận hồ sơ",
      });
      return;
    }

    setToast({
      type: "success",
      message:
        "Xác nhận thành công! Đang chuyển đến trang giao dịch thành công...",
    });

    setTimeout(() => {
      navigate("/transactionsuccess", {
        state: { record: recordData },
      });
    }, 1500);
  };

  // Nếu không có recordData
  if (!recordData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminHeader />
        <div className="flex">
          <AdminSidebar />
          <main className="flex-1 py-8 px-6">
            <div className="max-w-7xl mx-auto text-center">
              <p className="text-gray-600 mb-4">
                Không tìm thấy thông tin hồ sơ
              </p>
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

  /* ========================= JSX chính ========================= */
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
              <p className="text-gray-600 mt-2">
                Điền thông tin các khoản phí cho giao dịch
                mua bán xe
              </p>
            </div>

            {/* Transaction Info Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">
                Thông tin giao dịch
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">
                    Mã hồ sơ
                  </p>
                  <p className="font-semibold text-gray-900">
                    {recordData.id}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Xe giao dịch
                  </p>
                  <p className="font-semibold text-gray-900">
                    {recordData.carModel}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Giá trị giao dịch
                  </p>
                  <p className="font-semibold text-blue-600 text-lg">
                    {typeof recordData.price === "number"
                      ? `${new Intl.NumberFormat(
                          "vi-VN"
                        ).format(recordData.price)} VNĐ`
                      : recordData.price}
                  </p>
                </div>
              </div>
            </div>

            {/* Fees Form */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Người mua (Người A) */}
              <div className="bg-white rounded-lg shadow-sm border border-blue-200 overflow-hidden">
                <div className="bg-blue-50 px-6 py-4 border-b border-blue-200">
                  <div className="flex items-center">
                    <User className="w-6 h-6 text-blue-600 mr-3" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Người Mua (Người A)
                      </h3>
                      <p className="text-sm text-gray-600">
                        {recordData.buyerName}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <FeeInputField
                    label="Phí công chứng"
                    value={buyerFees.notarizationFee}
                    onChange={(v) =>
                      handleBuyerFeeChange(
                        "notarizationFee",
                        v
                      )
                    }
                    error={errors.buyer_notarizationFee}
                  />

                  <FeeInputField
                    label="Phí hoa hồng"
                    value={buyerFees.commissionFee}
                    onChange={(v) =>
                      handleBuyerFeeChange(
                        "commissionFee",
                        v
                      )
                    }
                    error={errors.buyer_commissionFee}
                  />

                  <FeeInputField
                    label="Phí trước bạ"
                    value={buyerFees.registrationFee}
                    onChange={(v) =>
                      handleBuyerFeeChange(
                        "registrationFee",
                        v
                      )
                    }
                    error={errors.buyer_registrationFee}
                  />

                  <FeeInputField
                    label="Phí đăng ký"
                    value={buyerFees.licensePlateFee}
                    onChange={(v) =>
                      handleBuyerFeeChange(
                        "licensePlateFee",
                        v
                      )
                    }
                    error={errors.buyer_licensePlateFee}
                  />

                  <FeeInputField
                    label="Phí cấp biển/sang tên"
                    value={buyerFees.inspectionFee}
                    onChange={(v) =>
                      handleBuyerFeeChange(
                        "inspectionFee",
                        v
                      )
                    }
                    error={errors.buyer_inspectionFee}
                  />

                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">
                        Tổng phí:
                      </span>
                      <span className="text-xl font-bold text-blue-600">
                        {formatCurrency(
                          calculateTotal(buyerFees)
                        )}{" "}
                        VNĐ
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Người bán (Người B) */}
              <div className="bg-white rounded-lg shadow-sm border border-green-200 overflow-hidden">
                <div className="bg-green-50 px-6 py-4 border-b border-green-200">
                  <div className="flex items-center">
                    <User className="w-6 h-6 text-green-600 mr-3" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Người Bán (Người B)
                      </h3>
                      <p className="text-sm text-gray-600">
                        {recordData.sellerName}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <FeeInputField
                    label="Phí công chứng"
                    value={sellerFees.notarizationFee}
                    onChange={(v) =>
                      handleSellerFeeChange(
                        "notarizationFee",
                        v
                      )
                    }
                    error={errors.seller_notarizationFee}
                  />

                  <FeeInputField
                    label="Phí hoa hồng"
                    value={sellerFees.commissionFee}
                    onChange={(v) =>
                      handleSellerFeeChange(
                        "commissionFee",
                        v
                      )
                    }
                    error={errors.seller_commissionFee}
                  />

                  <FeeInputField
                    label="Phí trước bạ"
                    value={sellerFees.registrationFee}
                    onChange={(v) =>
                      handleSellerFeeChange(
                        "registrationFee",
                        v
                      )
                    }
                    error={errors.seller_registrationFee}
                  />

                  <FeeInputField
                    label="Phí đăng ký"
                    value={sellerFees.licensePlateFee}
                    onChange={(v) =>
                      handleSellerFeeChange(
                        "licensePlateFee",
                        v
                      )
                    }
                    error={errors.seller_licensePlateFee}
                  />

                  <FeeInputField
                    label="Lệ phí đăng kiểm/đường bộ"
                    value={sellerFees.inspectionFee}
                    onChange={(v) =>
                      handleSellerFeeChange(
                        "inspectionFee",
                        v
                      )
                    }
                    error={errors.seller_inspectionFee}
                  />

                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">
                        Tổng phí:
                      </span>
                      <span className="text-xl font-bold text-green-600">
                        {formatCurrency(
                          calculateTotal(sellerFees)
                        )}{" "}
                        VNĐ
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Gửi hồ sơ xác nhận
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Gửi hồ sơ đến người mua và người bán để xác
                    nhận các khoản phí
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSendOtp}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    <Send className="w-5 h-5" />
                    Gửi hồ sơ
                  </button>

                  <button
                    onClick={handleSendOtpCode}
                    disabled={otpSent}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg border transition-colors font-medium ${
                      otpSent
                        ? "border-gray-300 text-gray-400 cursor-not-allowed"
                        : "border-blue-600 text-blue-600 hover:bg-blue-50"
                    }`}
                  >
                    <Send className="w-5 h-5" />
                    {otpSent ? "Đã gửi OTP" : "Gửi mã OTP"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowConfirmModal(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {/* Header modal */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Xác nhận hồ sơ
                </h2>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Banner đã gửi hồ sơ */}
              {recordSent && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-900">
                      Hồ sơ đã được gửi
                    </p>
                    <p className="text-sm text-green-700 mt-1">
                      Đang chờ người mua và người bán xác nhận
                      hồ sơ
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                {/* Buyer Confirmation */}
                <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Người mua
                        </p>
                        <p className="text-xs text-gray-600">
                          {recordData.buyerName}
                        </p>
                      </div>
                    </div>

                    {buyerConfirmed && (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="buyerConfirm"
                      checked={buyerConfirmed}
                      onChange={(e) =>
                        setBuyerConfirmed(e.target.checked)
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label
                      htmlFor="buyerConfirm"
                      className="text-sm text-gray-700"
                    >
                      Người mua đã xác nhận hồ sơ
                    </label>
                  </div>
                </div>

                {/* Seller Confirmation */}
                <div className="border rounded-lg p-4 bg-green-50 border-green-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Người bán
                        </p>
                        <p className="text-xs text-gray-600">
                          {recordData.sellerName}
                        </p>
                      </div>
                    </div>

                    {sellerConfirmed && (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="sellerConfirm"
                      checked={sellerConfirmed}
                      onChange={(e) =>
                        setSellerConfirmed(e.target.checked)
                      }
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <label
                      htmlFor="sellerConfirm"
                      className="text-sm text-gray-700"
                    >
                      Người bán đã xác nhận hồ sơ
                    </label>
                  </div>
                </div>
              </div>

              {/* Nút hành động trong modal */}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleVerifyOtp}
                  disabled={!buyerConfirmed || !sellerConfirmed}
                  className={`flex-1 py-3 px-4 rounded-lg transition-colors font-medium ${
                    buyerConfirmed && sellerConfirmed
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
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
                  onClick={handleSendOtp}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Gửi lại hồ sơ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
