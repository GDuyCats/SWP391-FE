import React, { useEffect, useState } from "react";
import { api } from "../../services/api";
import { Check } from "lucide-react";

/**
 * Component PlansList - Hiển thị danh sách các gói VIP/đăng tin
 *
 * Chức năng:
 * - Fetch danh sách gói VIP từ API
 * - Hiển thị thông tin chi tiết từng gói (tên, giá, thời hạn, tính năng)
 * - Cho phép người dùng chọn 1 gói
 * - Highlight gói đang được chọn
 *
 * Props:
 * @param {Function} onSelect - Callback khi user click chọn 1 gói, nhận tham số (plan object)
 * @param {Number} selectedPlanId - ID của gói đang được chọn (để highlight)
 *
 * Flow:
 * 1. Component mount → gọi API GET /plans
 * 2. Hiển thị loading hoặc error nếu có
 * 3. Render danh sách gói dưới dạng các card
 * 4. User click vào 1 gói → gọi onSelect(plan) → parent component xử lý
 *
 * Sử dụng trong:
 * - PackageSelection.jsx (trang chọn gói VIP khi đăng tin)
 */
const PlansList = ({ onSelect, selectedPlanId }) => {
  // ============ STATE MANAGEMENT ============

  const [plans, setPlans] = useState([]); // Array chứa danh sách các gói VIP
  const [loading, setLoading] = useState(true); // Trạng thái đang tải dữ liệu
  const [error, setError] = useState(null); // Lỗi nếu có khi gọi API

  // ============ FETCH DATA ============

  /**
   * useEffect: Gọi API lấy danh sách gói VIP khi component mount
   *
   * API endpoint: GET /plans
   * Response có thể có nhiều format:
   * - { plans: [...] }
   * - { data: [...] }
   * - [...]
   *
   * Dependency array: [] → chỉ chạy 1 lần khi component mount
   */
  useEffect(() => {
    const fetchPlans = async () => {
      setLoading(true);
      try {
        // Gọi API GET /plans
        const res = await api.get("/plans");
        console.log("[DEBUG] Plans API response:", res.data);

        // Xử lý nhiều format response khác nhau từ backend
        // Ưu tiên: res.data.plans > res.data.data > res.data
        setPlans(res.data.plans || res.data.data || res.data || []);
      } catch (err) {
        console.error("[PLANS ERROR]", err);
        setError("Không tải được danh sách gói đăng tin");
      }
      setLoading(false);
    };
    fetchPlans();
  }, []);

  // ============ RENDER CONDITIONS ============

  // Hiển thị loading khi đang fetch data
  if (loading) return <div className="text-center py-4">Đang tải gói…</div>;

  // Hiển thị error nếu API call thất bại
  if (error)
    return <div className="text-red-600 text-center py-4">{error}</div>;

  // Hiển thị thông báo nếu không có gói nào
  if (!plans || plans.length === 0)
    return (
      <div className="text-gray-500 text-center py-4">
        Không có gói đăng tin nào
      </div>
    );

  // ============ RENDER MAIN UI ============

  /**
   * Render danh sách các gói VIP dưới dạng các card có thể click
   *
   * Cấu trúc mỗi card:
   * - Radio button (visual only) + Tên gói | Giá + Thời hạn
   * - Danh sách tính năng (features) hoặc mô tả (description)
   *
   * Tương tác:
   * - Click vào card → gọi onSelect(plan)
   * - Card được chọn sẽ có border đậm + background xám
   */
  return (
    <div className="space-y-4">
      {/* Lặp qua từng gói VIP và render thành card */}
      {plans.map((plan) => (
        <div
          key={plan.id}
          onClick={() => onSelect(plan)} // Gọi callback khi user click
          className={`cursor-pointer border-2 rounded-lg p-4 transition-all ${
            selectedPlanId === plan.id
              ? "border-gray-800 bg-gray-100" // Style khi được chọn
              : "border-gray-200 hover:border-gray-300" // Style mặc định + hover
          }`}
        >
          {/* === HEADER: Radio button + Tên gói + Giá + Thời hạn === */}
          <div className="flex items-center justify-between mb-2">
            {/* Bên trái: Radio button (visual) + Tên gói */}
            <div className="flex items-center gap-3">
              {/* Radio button (chỉ để hiển thị, không phải input thật) */}
              <div
                className={`w-4 h-4 rounded-full border-2 ${
                  selectedPlanId === plan.id
                    ? "border-gray-800 bg-gray-800" // Đã chọn: màu đen
                    : "border-gray-300" // Chưa chọn: màu xám
                }`}
              >
                {/* Hiển thị icon check nếu gói này được chọn */}
                {selectedPlanId === plan.id && (
                  <Check className="w-3 h-3 text-white" />
                )}
              </div>
              {/* Tên gói VIP (VD: "Gói Basic", "Gói Premium") */}
              <h3 className="font-semibold">{plan.name}</h3>
            </div>

            {/* Bên phải: Giá + Thời hạn */}
            <div className="text-right">
              {/* Giá gói (format với dấu phẩy ngăn cách hàng nghìn) */}
              <p className="text-lg font-bold">
                {plan.amount?.toLocaleString()} VND
              </p>
              {/* Thời hạn gói (số ngày) */}
              <p className="text-xs text-gray-500">{plan.durationDays} ngày</p>
            </div>
          </div>

          {/* === BODY: Danh sách tính năng hoặc mô tả === */}
          {/* 
            Ưu tiên hiển thị:
            1. Nếu có mảng features → render danh sách với icon check
            2. Nếu không có features nhưng có description → render description
            3. Nếu không có gì → không render gì
          */}
          {
            Array.isArray(plan.features) && plan.features.length > 0 ? (
              // Trường hợp 1: Có features array
              <ul className="text-sm space-y-1 ml-7">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <Check className="w-3 h-3 text-gray-600" />
                    {feature}
                  </li>
                ))}
              </ul>
            ) : plan.description ? (
              // Trường hợp 2: Không có features nhưng có description
              <div className="text-sm text-gray-600 ml-7">
                {plan.description}
              </div>
            ) : null /* Trường hợp 3: Không có gì */
          }
        </div>
      ))}
    </div>
  );
};

export default PlansList;
