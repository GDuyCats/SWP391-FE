import React, { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import PlansList from "./Plans/PlansList";

/**
 * Component PackageSelection - Trang chọn gói VIP cho bài đăng
 *
 * Chức năng:
 * - Hiển thị preview của bài đăng (xe điện hoặc pin) vừa tạo
 * - Cho phép user chọn 1 gói VIP từ danh sách
 * - Tính tổng chi phí dựa trên gói đã chọn
 * - Chuyển sang bước thanh toán khi user click "Tiếp tục"
 *
 * Flow:
 * 1. User vừa tạo bài đăng (từ EVForm hoặc BatteryForm)
 * 2. Navigate đến trang này với listingData trong location.state
 * 3. User xem preview bài đăng bên trái
 * 4. User chọn gói VIP bên phải
 * 5. Click "Tiếp tục" → chuyển sang trang PaymentStep với đầy đủ data
 *
 * Data flow:
 * EVForm/BatteryForm → PackageSelection (listingData) → PaymentStep (listingData + selectedPlan)
 *
 * Route:
 * - Path: /listing/package
 * - Nhận data qua: location.state (listingData từ form trước đó)
 * - Chuyển data đến: /listing/payment
 */
export default function PackageSelection() {
  // ============ HOOKS ============

  const navigate = useNavigate(); // Hook để điều hướng giữa các trang
  const location = useLocation(); // Hook để lấy location object (chứa state được truyền từ trang trước)
  const listingData = location.state; // Data bài đăng được truyền từ EVForm hoặc BatteryForm

  // ============ STATE MANAGEMENT ============

  const [selectedPlan, setSelectedPlan] = useState(null); // Gói VIP đang được chọn (object gồm id, name, amount, etc.)

  // ============ GUARD: Kiểm tra có data hay không ============

  /**
   * Nếu không có listingData (user truy cập trực tiếp URL này mà không đi qua form)
   * → Hiển thị thông báo lỗi và nút quay lại tạo tin mới
   */
  if (!listingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-slate-800 to-cyan-900 text-white p-6">
        <div className="max-w-xl w-full bg-white/5 p-8 rounded-xl shadow-lg text-center">
          <h2 className="text-2xl font-semibold mb-4">
            Không có dữ liệu tin đăng
          </h2>
          <p className="text-sm text-gray-200 mb-6">
            Vui lòng tạo một tin mới trước khi truy cập trang này.
          </p>
          <button
            onClick={() => navigate("/chooselisting")}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-md font-semibold"
          >
            Tạo tin mới
          </button>
        </div>
      </div>
    );
  }

  // ============ EVENT HANDLERS ============

  /**
   * Hàm xử lý khi user click nút "Tiếp tục"
   *
   * Chức năng:
   * - Kiểm tra đã chọn gói chưa
   * - Merge listingData với selectedPlan thành payload hoàn chỉnh
   * - Navigate sang trang PaymentStep với payload
   *
   * Payload bao gồm:
   * - ...listingData: Tất cả thông tin bài đăng (title, price, images, etc.)
   * - selectedPlan: Object gói VIP đầy đủ
   * - planId: ID của gói (để backend dễ xử lý)
   * - totalCost: Tổng tiền phải thanh toán (= amount của gói)
   */
  const handleContinue = () => {
    // Guard: Nếu chưa chọn gói thì không làm gì
    if (!selectedPlan) return;

    // Tạo payload hoàn chỉnh bằng cách merge data
    const payload = {
      ...listingData, // Spread tất cả thông tin bài đăng
      selectedPlan, // Thêm object gói VIP đã chọn
      planId: selectedPlan.id, // ID gói (cho backend)
      totalCost: selectedPlan.amount, // Tổng tiền = giá gói
    };

    console.log("[DEBUG] Navigating to payment with:", payload);

    // Chuyển sang trang thanh toán với payload
    navigate("/listing/payment", { state: payload });
  };

  // ============ RENDER MAIN UI ============

  /**
   * Layout chính: 2 cột
   * - Cột trái: Preview bài đăng (ảnh + thông tin tóm tắt)
   * - Cột phải: Danh sách gói VIP (component PlansList)
   * - Dưới cùng: Nút "Quay lại" và "Tiếp tục" + Tổng chi phí
   */
  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen p-10">
      <div className="max-w-6xl mx-auto">
        {/* Tiêu đề trang */}
        <h1 className="text-3xl font-bold text-center mb-8">
          Chọn gói đăng tin
        </h1>

        {/* Grid 2 cột: Preview (trái) + Plans (phải) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* ===== CỘT TRÁI: PREVIEW BÀI ĐĂNG ===== */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Xem trước tin đăng</h2>

            {/* Ảnh preview (ảnh đầu tiên trong mảng images) */}
            <div className="relative mb-4">
              <div className="w-full h-40 bg-gray-50 flex items-center justify-center rounded-lg text-gray-500 border border-dashed border-gray-300">
                {listingData.images && listingData.images.length > 0 ? (
                  <img
                    src={listingData.images[0]}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  "Ảnh đính kèm" // Fallback nếu không có ảnh
                )}
              </div>
            </div>

            {/* Thông tin chi tiết bài đăng */}
            <div className="space-y-2 text-sm">
              {/* Loại bài đăng: Xe điện hoặc Pin */}
              <p>
                <strong>Loại:</strong>{" "}
                {listingData.type === "ev" ? "Xe điện" : "Pin"}
              </p>

              {/* Tiêu đề bài đăng */}
              <p>
                <strong>Tiêu đề:</strong> {listingData.title || "Chưa nhập"}
              </p>

              {/* Giá bán (format với dấu phẩy) */}
              <p>
                <strong>Giá:</strong> {listingData.price?.toLocaleString()} VND
              </p>

              {/* Mô tả (có thể là content hoặc description tùy loại) */}
              <p>
                <strong>Mô tả:</strong>{" "}
                {listingData.content || listingData.description || "Chưa nhập"}
              </p>

              {/* === Hiển thị thêm thông tin nếu là XE ĐIỆN === */}
              {listingData.type === "ev" && (
                <div>
                  <strong>Thông tin xe:</strong>
                  <div className="text-xs mt-1 space-y-1">
                    {/* Chỉ hiển thị các field có giá trị */}
                    {listingData.brand && <p>• Hãng xe: {listingData.brand}</p>}
                    {listingData.model && <p>• Dòng xe: {listingData.model}</p>}
                    {listingData.year && (
                      <p>• Năm sản xuất: {listingData.year}</p>
                    )}
                    {listingData.condition && (
                      <p>• Tình trạng: {listingData.condition}</p>
                    )}
                    {/* Hiển thị badge nếu bài đăng kèm theo thông tin pin */}
                    {listingData.hasBattery && (
                      <p className="text-green-600 font-medium">
                        ✓ Kèm thông tin pin
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* === Hiển thị thêm thông tin nếu là PIN === */}
              {listingData.type === "battery" && (
                <div>
                  <strong>Thông tin pin:</strong>
                  <div className="text-xs mt-1 space-y-1">
                    {/* Chỉ hiển thị các field có giá trị */}
                    {listingData.battery_capacity && (
                      <p>• Dung lượng: {listingData.battery_capacity}</p>
                    )}
                    {listingData.battery_range && (
                      <p>• Quãng đường: {listingData.battery_range}</p>
                    )}
                    {listingData.soh && <p>• SOH: {listingData.soh}</p>}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ===== CỘT PHẢI: CHỌN GÓI VIP ===== */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Chọn gói đăng tin</h2>

            {/* 
              Component PlansList:
              - Hiển thị danh sách các gói VIP (fetch từ API)
              - onSelect: Callback khi user chọn 1 gói → set vào state selectedPlan
              - selectedPlanId: ID gói đang được chọn → để highlight card
            */}
            <PlansList
              onSelect={setSelectedPlan}
              selectedPlanId={selectedPlan?.id}
            />
          </div>
        </div>

        {/* ===== FOOTER: NÚT ĐIỀU HƯỚNG ===== */}
        <div className="flex justify-between items-center">
          {/* Nút "Quay lại" - quay về trang trước đó (form tạo bài) */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-md text-gray-800"
          >
            <ArrowLeft size={18} /> Quay lại
          </button>

          {/* Phần bên phải: Hiển thị tổng chi phí + nút "Tiếp tục" */}
          <div className="flex items-center gap-4">
            {/* Hiển thị tổng chi phí khi đã chọn gói */}
            {selectedPlan && (
              <div className="text-right">
                <p className="text-sm text-gray-500">Tổng chi phí:</p>
                <p className="text-xl font-bold text-gray-800">
                  {selectedPlan.amount?.toLocaleString()} VND
                </p>
              </div>
            )}

            {/* 
              Nút "Tiếp tục":
              - Disabled nếu chưa chọn gói
              - Click → gọi handleContinue() → navigate đến trang thanh toán
            */}
            <button
              onClick={handleContinue}
              disabled={!selectedPlan}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-900 disabled:bg-gray-400 disabled:cursor-not-allowed px-6 py-2 rounded-md font-semibold text-white"
            >
              Tiếp tục <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
