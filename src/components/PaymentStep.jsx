import React, { useState, useEffect } from "react";
import { ArrowLeft, CreditCard } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import Toast from "./Toast";

export default function PaymentStep() {
  const navigate = useNavigate();
  const location = useLocation();
  const listingData = location.state;

  const [isProcessing, setIsProcessing] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [checkoutUrl, setCheckoutUrl] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    // Gọi API checkout khi component mount
    if (listingData && listingData.planId && listingData.postId) {
      createCheckoutSession();
    } else {
      console.error("[ERROR] Missing required data:", {
        hasPlanId: !!listingData?.planId,
        hasPostId: !!listingData?.postId,
      });
      setToast({
        msg: "Thiếu thông tin cần thiết. Vui lòng tạo lại bài đăng.",
        type: "error",
      });
    }
  }, []);

  const createCheckoutSession = async () => {
    setIsProcessing(true);
    try {
      // Kiểm tra xem có token không
      const token = localStorage.getItem("accessToken");
      console.log("[DEBUG] Token exists:", !!token);

      if (!token) {
        setToast({
          msg: "Vui lòng đăng nhập để tiếp tục thanh toán!",
          type: "error",
        });
        setTimeout(() => {
          navigate("/login");
        }, 2000);
        setIsProcessing(false);
        return;
      }

      console.log("[DEBUG] Calling /plans/checkout with:", {
        planId: listingData.planId,
        postId: listingData.postId,
      });

      const res = await api.post("/plans/checkout", {
        planId: listingData.planId,
        postId: listingData.postId,
      });

      console.log("[DEBUG] Checkout response:", res.data);

      // API response có thể trả về sessionUrl hoặc qrCode
      const { sessionUrl, qrCode, checkoutUrl, url } = res.data;

      if (qrCode) setQrCodeUrl(qrCode);
      if (sessionUrl) setCheckoutUrl(sessionUrl);
      if (checkoutUrl) setCheckoutUrl(checkoutUrl);
      if (url) setCheckoutUrl(url);

      setToast({
        msg: "Đã tạo phiên thanh toán thành công!",
        type: "success",
      });
    } catch (err) {
      const apiMsg = err?.response?.data?.message;
      const status = err?.response?.status;

      console.error("[CHECKOUT ERROR]", {
        status,
        data: err?.response?.data,
        message: apiMsg,
      });

      if (status === 401) {
        setToast({
          msg: "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!",
          type: "error",
        });
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setToast({
          msg: apiMsg || "Không thể tạo phiên thanh toán!",
          type: "error",
        });
      }
    }
    setIsProcessing(false);
  };

  if (!listingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-slate-800 to-cyan-900 text-white p-6">
        <div className="max-w-xl w-full bg-white/5 p-8 rounded-xl shadow-lg text-center">
          <h2 className="text-2xl font-semibold mb-4">
            Không có dữ liệu thanh toán
          </h2>
          <p className="text-sm text-gray-200 mb-6">
            Vui lòng chọn gói đăng tin trước khi thanh toán.
          </p>
          <button
            onClick={() => navigate("/chooselisting")}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-md font-semibold"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  const handleOpenCheckout = () => {
    if (checkoutUrl) {
      window.open(checkoutUrl, "_blank");
    }
  };

  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen p-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Thanh toán</h1>

        <div className="bg-white rounded-2xl p-8 mb-8 shadow-lg border border-gray-200 max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold mb-6 text-center">
            Thông tin thanh toán
          </h2>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg mb-4 pb-2 border-b border-gray-200">
              Chi tiết đơn hàng
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Loại sản phẩm:</span>
                <span className="font-semibold">
                  {listingData.type === "ev" ? "Xe điện" : "Pin"}
                </span>
              </div>

              <div className="flex justify-between py-2">
                <span className="text-gray-600">Tiêu đề:</span>
                <span className="font-semibold text-right max-w-xs">
                  {listingData.title}
                </span>
              </div>

              <div className="flex justify-between py-2">
                <span className="text-gray-600">Giá sản phẩm:</span>
                <span className="font-semibold">
                  {listingData.price?.toLocaleString()} VND
                </span>
              </div>

              <div className="flex justify-between py-2">
                <span className="text-gray-600">Gói đăng tin:</span>
                <span className="font-semibold">
                  {listingData.selectedPlan?.name}
                </span>
              </div>

              <div className="flex justify-between py-2">
                <span className="text-gray-600">Thời gian hiển thị:</span>
                <span className="font-semibold">
                  {listingData.selectedPlan?.durationDays} ngày
                </span>
              </div>

              <div className="border-t border-gray-300 mt-4 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">Tổng cộng:</span>
                  <span className="text-2xl font-bold text-gray-800">
                    {listingData.totalCost?.toLocaleString()} VND
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center items-center gap-4 max-w-2xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 bg-gray-300 hover:bg-gray-400 px-6 py-3 rounded-lg text-gray-800 font-medium transition"
          >
            <ArrowLeft size={18} /> Quay lại
          </button>

          {checkoutUrl && (
            <button
              onClick={handleOpenCheckout}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-8 py-3 rounded-lg font-semibold text-white shadow-md transition"
            >
              <CreditCard size={18} />
              Thanh toán ngay
            </button>
          )}
        </div>

        {toast && (
          <Toast
            msg={toast.msg}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  );
}
