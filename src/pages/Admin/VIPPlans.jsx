import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Power, X } from "lucide-react";
import { api } from "../../services/api";

export default function VIPPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [form, setForm] = useState({
    name: "",
    amount: "",
    durationDays: "",
    priorityLevel: "",
    description: "",
  });
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  // Fetch all VIP plans
  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/vip-plans");
      if (res.status === 200) {
        const plansData = res.data?.plans || res.data || [];
        setPlans(plansData);
      }
    } catch (error) {
      console.error("Error fetching VIP plans:", error);
      showToast("error", "Không thể tải danh sách VIP plans");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  // Handle form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Open modal for create/edit
  const openModalFor = (plan = null) => {
    if (plan) {
      setEditingPlan(plan);
      setForm({
        name: plan.name || "",
        amount: plan.amount || "",
        durationDays: plan.durationDays || "",
        priority: plan.priority || "",
        description: plan.description || "",
      });
    } else {
      setEditingPlan(null);
      setForm({
        name: "",
        amount: "",
        durationDays: "",
        priority: "",
        description: "",
      });
    }
    setOpenModal(true);
  };

  // Create or Update plan
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: form.name,
        amount: Number(form.amount),
        durationDays: Number(form.durationDays),
        priority: Number(form.priority),
        description: form.description,
      };

      if (editingPlan) {
        // Update
        const res = await api.patch(
          `/admin/vip-plans/${editingPlan.id}`,
          payload
        );
        if (res.status === 200) {
          showToast("success", "Cập nhật VIP plan thành công");
          fetchPlans();
          setOpenModal(false);
        }
      } else {
        // Create
        const res = await api.post("/admin/vip-plans", payload);
        if (res.status === 200 || res.status === 201) {
          showToast("success", "Tạo VIP plan thành công");
          fetchPlans();
          setOpenModal(false);
        }
      }
    } catch (error) {
      console.error("Error saving VIP plan:", error);
      const errorMsg = error.response?.data?.message || "Có lỗi xảy ra";
      showToast("error", errorMsg);
    }
  };

  // Delete (soft delete) plan
  const handleDelete = async (id) => {
    if (!confirm("Bạn có chắc muốn xóa VIP plan này?")) return;
    try {
      const res = await api.delete(`/admin/vip-plans/${id}`);
      if (res.status === 200) {
        showToast("success", "Xóa VIP plan thành công");
        fetchPlans();
      }
    } catch (error) {
      console.error("Error deleting VIP plan:", error);
      showToast("error", "Không thể xóa VIP plan");
    }
  };

  // Toggle active status
  const handleToggleActive = async (id) => {
    try {
      const res = await api.patch(`/admin/vip-plans/${id}/toggle`);
      if (res.status === 200) {
        showToast("success", "Cập nhật trạng thái thành công");
        fetchPlans();
      }
    } catch (error) {
      console.error("Error toggling plan status:", error);
      showToast("error", "Không thể cập nhật trạng thái");
    }
  };

  if (loading) return <p className="text-center py-10">Đang tải...</p>;

  return (
    <div className="w-full min-h-screen bg-gray-50 p-6 md:p-10 relative">
      {/* Toast notification */}
      {toast && (
        <div
          className={`fixed top-6 right-6 px-5 py-3 rounded-xl shadow-lg text-white z-50 ${
            toast.type === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Create button */}
      <button
        onClick={() => openModalFor()}
        className="absolute cursor-pointer top-6 right-6 md:top-10 md:right-10 flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg hover:scale-105 transition-all duration-200"
      >
        <Plus className="w-5 h-5" />
        <span className="hidden sm:inline">Tạo VIP Plan mới</span>
        <span className="sm:hidden">Tạo mới</span>
      </button>

      {/* Table */}
      <div className="mt-20 md:mt-24 bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-7 bg-blue-100 text-gray-700 font-semibold p-4 border-b text-sm md:text-base">
          <div>ID</div>
          <div>Tên gói</div>
          <div>Giá (VND)</div>
          <div>Thời hạn (ngày)</div>
          <div>Độ ưu tiên</div>
          <div>Trạng thái</div>
          <div className="text-center">Hành động</div>
        </div>

        {/* Data */}
        <div className="divide-y">
          {plans.length > 0 ? (
            plans.map((plan) => (
              <div
                key={plan.id}
                className="grid grid-cols-7 p-4 text-gray-800 hover:bg-blue-50 transition-all duration-200 items-center text-sm md:text-base"
              >
                <div className="font-medium">{plan.id}</div>
                <div className="font-medium">{plan.name}</div>
                <div className="text-gray-600">
                  {plan.amount !== null && plan.amount !== undefined
                    ? plan.amount.toLocaleString("vi-VN")
                    : "—"}
                </div>
                <div className="text-gray-600">{plan.durationDays || "—"}</div>
                <div className="text-gray-600">{plan.priority || "—"}</div>
                <div>
                  {plan.isActive ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Hoạt động
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Tắt
                    </span>
                  )}
                </div>
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => openModalFor(plan)}
                    className="text-blue-600 hover:text-blue-800 hover:scale-110 transition-all duration-200"
                    title="Chỉnh sửa"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleToggleActive(plan.id)}
                    className="text-yellow-600 hover:text-yellow-800 hover:scale-110 transition-all duration-200"
                    title="Bật/Tắt"
                  >
                    <Power className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(plan.id)}
                    className="text-red-600 hover:text-red-800 hover:scale-110 transition-all duration-200"
                    title="Xóa"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-gray-500">
              Chưa có VIP plan nào.
            </div>
          )}
        </div>
      </div>

      {/* Modal for Create/Edit */}
      {openModal && (
        <div
          className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4"
          onClick={() => setOpenModal(false)}
        >
          <div
            className="bg-white w-full max-w-2xl rounded-2xl shadow-xl p-8 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">
                {editingPlan ? "Chỉnh sửa VIP Plan" : "Tạo VIP Plan mới"}
              </h2>
              <button
                onClick={() => setOpenModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên gói VIP <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="VD: VIP Gold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giá (VND) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={form.amount}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="500000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thời hạn (ngày) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="durationDays"
                    value={form.durationDays}
                    onChange={handleChange}
                    required
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Độ ưu tiên <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                  required
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Số càng cao, độ ưu tiên càng cao
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Mô tả các tính năng của gói VIP..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
                >
                  {editingPlan ? "Cập nhật" : "Tạo mới"}
                </button>
                <button
                  type="button"
                  onClick={() => setOpenModal(false)}
                  className="px-5 py-2.5 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
