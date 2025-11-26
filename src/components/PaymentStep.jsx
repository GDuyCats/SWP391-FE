import React, { useState, useEffect } from "react";
import { ArrowLeft, CreditCard } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import Toast from "./Toast";

/**
 * Component PaymentStep - Trang thanh toán cho gói VIP
 * 
 * Chức năng:
 * - Hiển thị thông tin đơn hàng (loại sp, giá, gói VIP, thời gian)
 * - Gọi API tạo checkout session khi component mount
 * - Hiển thị nút "Thanh toán ngay" để mở cổng thanh toán
 * - Xử lý các trường hợp lỗi (thiếu data, không có token, API error)
 * 
 * Flow:
 * 1. User chọn gói VIP ở trang trước → navigate với state
 * 2. Component mount → gọi API /plans/checkout
 * 3. API trả về checkoutUrl/sessionUrl
 * 4. User click "Thanh toán ngay" → mở checkoutUrl trong tab mới
 * 5. Sau khi thanh toán xong → VNPay redirect về /payment-success hoặc /payment-fail
 * 
 * State cần có từ location.state:
 * - postId: ID bài đăng
 * - planId: ID gói VIP đã chọn
 * - type: "ev" hoặc "battery"
 * - title, price, selectedPlan, totalCost...
 */
export default function PaymentStep() {
  const navigate = useNavigate();
  const location = useLocation();
  const listingData = location.state; // Data từ trang trước (PackageSelection)

  // ============ STATE MANAGEMENT ============
  const [isProcessing, setIsProcessing] = useState(false); // Đang gọi API checkout
  const [qrCodeUrl, setQrCodeUrl] = useState(null); // QR code URL (nếu API trả về)
  const [checkoutUrl, setCheckoutUrl] = useState(null); // URL cổng thanh toán
  const [toast, setToast] = useState(null); // Toast notification

  // ============ EFFECTS ============
  
  /**
   * useEffect: Tự động gọi API checkout khi component mount
   * - Kiểm tra xem có đủ data cần thiết không (planId, postId)
   * - Nếu có: gọi createCheckoutSession()
   * - Nếu không: hiển thị error toast
   */
  useEffect(() => {
    // Kiểm tra data từ state
    if (listingData && listingData.planId && listingData.postId) {
      createCheckoutSession();
    } else {
      // Log lỗi để debug
      console.error("[ERROR] Missing required data:", {
        hasPlanId: !!listingData?.planId,
        hasPostId: !!listingData?.postId,
      });
      setToast({
        msg: "Thiếu thông tin cần thiết. Vui lòng tạo lại bài đăng.",
        type: "error",
      });
    }
  }, []); // Empty deps = chỉ chạy 1 lần khi mount

  // ============ API FUNCTIONS ============
  
  /**
   * Hàm tạo checkout session với VNPay
   * 
   * Flow:
   * 1. Kiểm tra token có tồn tại không
   * 2. Gọi API POST /plans/checkout với planId và postId
   * 3. API trả về sessionUrl/checkoutUrl
   * 4. Lưu checkoutUrl vào state
   * 5. User click nút "Thanh toán ngay" để mở URL
   * 
   * Error Handling:
   * - 401: Token hết hạn → redirect login
   * - Khác: Hiển thị error message
   */
  const createCheckoutSession = async () => {
    setIsProcessing(true);
    try {
      // ===== BƯỚC 1: Kiểm tra authentication =====
      const token = localStorage.getItem("accessToken");
      console.log("[DEBUG] Token exists:", !!token);

      if (!token) {
        setToast({
          msg: "Vui lòng đăng nhập để tiếp tục thanh toán!",
          type: "error",
        });
        // Redirect về login sau 2s
        setTimeout(() => {
          navigate("/login");
        }, 2000);
        setIsProcessing(false);
        return;
      }

      // ===== BƯỚC 2: Gọi API checkout =====
      console.log("[DEBUG] Calling /plans/checkout with:", {
        planId: listingData.planId,
        postId: listingData.postId,
      });

      const res = await api.post("/plans/checkout", {
        planId: listingData.planId,
        postId: listingData.postId,
      });

      console.log("[DEBUG] Checkout response:", res.data);

      // ===== BƯỚC 3: Lấy checkout URL từ response =====
      // API có thể trả về nhiều tên khác nhau: sessionUrl, checkoutUrl, url, qrCode
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
      // ===== BƯỚC 4: Xử lý lỗi =====
      const apiMsg = err?.response?.data?.message;
      const status = err?.response?.status;

      console.error("[CHECKOUT ERROR]", {
        status,
        data: err?.response?.data,
        message: apiMsg,
      });

      if (status === 401) {
        // Token hết hạn hoặc không hợp lệ
        setToast({
          msg: "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!",
          type: "error",
        });
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        // Các lỗi khác
        setToast({
          msg: apiMsg || "Không thể tạo phiên thanh toán!",
          type: "error",
        });
      }
    }
    setIsProcessing(false);
  };

  // ============ HELPERS ============
  
  /**
   * Hàm mở cổng thanh toán trong tab mới
   * - Sử dụng window.open() với "_blank"
   * - User thanh toán ở tab mới
   * - VNPay sẽ redirect về /payment-success hoặc /payment-fail
   */
  const handleOpenCheckout = () => {
    if (checkoutUrl) {
      window.open(checkoutUrl, "_blank");
    }
  };

  // ============ RENDER UI ============
  
  // ===== Trường hợp không có data: Hiển thị error screen =====
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

  // ===== Trường hợp có data: Hiển thị payment page =====

  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen p-10">
      <div className="max-w-4xl mx-auto">
        
        {/* ===== TIÊU ĐỀ ===== */}
        <h1 className="text-3xl font-bold text-center mb-8">Thanh toán</h1>

        {/* ===== CARD: Thông tin đơn hàng ===== */}
        <div className="bg-white rounded-2xl p-8 mb-8 shadow-lg border border-gray-200 max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold mb-6 text-center">
            Thông tin thanh toán
          </h2>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg mb-4 pb-2 border-b border-gray-200">
              Chi tiết đơn hàng
            </h3>

            {/* Chi tiết từng dòng */}
            <div className="space-y-3 text-sm">
              
              {/* Dòng 1: Loại sản phẩm */}
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Loại sản phẩm:</span>
                <span className="font-semibold">
                  {listingData.type === "ev" ? "Xe điện" : "Pin"}
                </span>
              </div>

              {/* Dòng 2: Tiêu đề bài đăng */}
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Tiêu đề:</span>
                <span className="font-semibold text-right max-w-xs">
                  {listingData.title}
                </span>
              </div>

              {/* Dòng 3: Giá sản phẩm */}
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Giá sản phẩm:</span>
                <span className="font-semibold">
                  {listingData.price?.toLocaleString()} VND
                </span>
              </div>

              {/* Dòng 4: Gói đăng tin đã chọn */}
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Gói đăng tin:</span>
                <span className="font-semibold">
                  {listingData.selectedPlan?.name}
                </span>
              </div>

              {/* Dòng 5: Thời gian hiển thị */}
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Thời gian hiển thị:</span>
                <span className="font-semibold">
                  {listingData.selectedPlan?.durationDays} ngày
                </span>
              </div>

              {/* Dòng cuối: Tổng cộng (highlight) */}
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

        {/* ===== ACTION BUTTONS ===== */}
        <div className="flex justify-center items-center gap-4 max-w-2xl mx-auto">
          
          {/* Button: Quay lại trang trước */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 bg-gray-300 hover:bg-gray-400 px-6 py-3 rounded-lg text-gray-800 font-medium transition"
          >
            <ArrowLeft size={18} /> Quay lại
          </button>

          {/* Button: Thanh toán (chỉ hiện khi có checkoutUrl) */}
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

        {/* ===== TOAST NOTIFICATION ===== */}
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
