import React, { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import PlansList from "./Plans/PlansList";

export default function PackageSelection() {
  const navigate = useNavigate();
  const location = useLocation();
  const listingData = location.state;

  const [selectedPlan, setSelectedPlan] = useState(null);

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

  const handleContinue = () => {
    if (!selectedPlan) return;
    const payload = {
      ...listingData,
      selectedPlan,
      planId: selectedPlan.id,
      totalCost: selectedPlan.amount,
    };

    console.log("[DEBUG] Navigating to payment with:", payload);
    navigate("/listing/payment", { state: payload });
  };

  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen p-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          Chọn gói đăng tin
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Listing Preview */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Xem trước tin đăng</h2>

            <div className="relative mb-4">
              <div className="w-full h-40 bg-gray-50 flex items-center justify-center rounded-lg text-gray-500 border border-dashed border-gray-300">
                {listingData.images && listingData.images.length > 0 ? (
                  <img
                    src={listingData.images[0]}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  "Ảnh đính kèm"
                )}
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <p>
                <strong>Loại:</strong>{" "}
                {listingData.type === "ev" ? "Xe điện" : "Pin"}
              </p>
              <p>
                <strong>Tiêu đề:</strong> {listingData.title || "Chưa nhập"}
              </p>
              <p>
                <strong>Giá:</strong> {listingData.price?.toLocaleString()} VND
              </p>
              <p>
                <strong>Mô tả:</strong>{" "}
                {listingData.content || listingData.description || "Chưa nhập"}
              </p>

              {listingData.type === "ev" && (
                <div>
                  <strong>Thông tin xe:</strong>
                  <div className="text-xs mt-1 space-y-1">
                    {listingData.brand && <p>• Hãng xe: {listingData.brand}</p>}
                    {listingData.model && <p>• Dòng xe: {listingData.model}</p>}
                    {listingData.year && (
                      <p>• Năm sản xuất: {listingData.year}</p>
                    )}
                    {listingData.condition && (
                      <p>• Tình trạng: {listingData.condition}</p>
                    )}
                    {listingData.hasBattery && (
                      <p className="text-green-600 font-medium">
                        ✓ Kèm thông tin pin
                      </p>
                    )}
                  </div>
                </div>
              )}

              {listingData.type === "battery" && (
                <div>
                  <strong>Thông tin pin:</strong>
                  <div className="text-xs mt-1 space-y-1">
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

          {/* Plans Selection */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Chọn gói đăng tin</h2>
            <PlansList
              onSelect={setSelectedPlan}
              selectedPlanId={selectedPlan?.id}
            />
          </div>
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-md text-gray-800"
          >
            <ArrowLeft size={18} /> Quay lại
          </button>

          <div className="flex items-center gap-4">
            {selectedPlan && (
              <div className="text-right">
                <p className="text-sm text-gray-500">Tổng chi phí:</p>
                <p className="text-xl font-bold text-gray-800">
                  {selectedPlan.amount?.toLocaleString()} VND
                </p>
              </div>
            )}
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
