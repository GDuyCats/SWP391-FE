import React, { useEffect, useState } from "react";
import { api } from "../../services/api";
import { Check } from "lucide-react";

const PlansList = ({ onSelect, selectedPlanId }) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlans = async () => {
      setLoading(true);
      try {
        const res = await api.get("/plans");
        console.log("[DEBUG] Plans API response:", res.data);
        setPlans(res.data.plans || res.data.data || res.data || []);
      } catch (err) {
        console.error("[PLANS ERROR]", err);
        setError("Không tải được danh sách gói đăng tin");
      }
      setLoading(false);
    };
    fetchPlans();
  }, []);

  if (loading) return <div className="text-center py-4">Đang tải gói…</div>;
  if (error)
    return <div className="text-red-600 text-center py-4">{error}</div>;
  if (!plans || plans.length === 0)
    return (
      <div className="text-gray-500 text-center py-4">
        Không có gói đăng tin nào
      </div>
    );

  return (
    <div className="space-y-4">
      {plans.map((plan) => (
        <div
          key={plan.id}
          onClick={() => onSelect(plan)}
          className={`cursor-pointer border-2 rounded-lg p-4 transition-all ${
            selectedPlanId === plan.id
              ? "border-gray-800 bg-gray-100"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div
                className={`w-4 h-4 rounded-full border-2 ${
                  selectedPlanId === plan.id
                    ? "border-gray-800 bg-gray-800"
                    : "border-gray-300"
                }`}
              >
                {selectedPlanId === plan.id && (
                  <Check className="w-3 h-3 text-white" />
                )}
              </div>
              <h3 className="font-semibold">{plan.name}</h3>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold">
                {plan.amount?.toLocaleString()} VND
              </p>
              <p className="text-xs text-gray-500">{plan.durationDays} ngày</p>
            </div>
          </div>

          {Array.isArray(plan.features) && plan.features.length > 0 ? (
            <ul className="text-sm space-y-1 ml-7">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-gray-600" />
                  {feature}
                </li>
              ))}
            </ul>
          ) : plan.description ? (
            <div className="text-sm text-gray-600 ml-7">{plan.description}</div>
          ) : null}
        </div>
      ))}
    </div>
  );
};

export default PlansList;
