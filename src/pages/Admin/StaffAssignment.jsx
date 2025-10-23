import React, { useEffect, useMemo, useState } from "react";
import AdminHeader from "../../components/Admin/AdminHeader";
import AdminSidebar from "../../components/Admin/AdminSidebar";
import { UserCog, Filter, Save, Users, UserCheck, Search, Calendar, FileText } from "lucide-react";
import Toast from "../../components/Toast";

// Helpers to mimic persistence
const STORAGE_KEY = "staffAssignments";

const saveAssignments = (assignments) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(assignments));
};

const loadAssignments = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

// Mock staff list
const mockStaff = [
  { id: "S001", name: "Lê Hoàng Minh" },
  { id: "S002", name: "Ngô Thanh Tùng" },
  { id: "S003", name: "Võ Thị Lan" },
  { id: "S004", name: "Phạm Quốc Bảo" },
  { id: "S005", name: "Trần Thu Hà" },
];

// Mock requests list
const mockRequests = [
  {
    id: "REQ-1001",
    customerName: "Nguyễn Văn An",
    requestedAt: "2025-10-20",
    carModel: "Toyota Vios 2022",
    status: "Chưa phân công",
  },
  {
    id: "REQ-1002",
    customerName: "Trần Thị Bình",
    requestedAt: "2025-10-21",
    carModel: "Honda City 2023",
    status: "Đang xử lý",
  },
  {
    id: "REQ-1003",
    customerName: "Phạm Minh Tuấn",
    requestedAt: "2025-10-18",
    carModel: "Mazda CX-5 2023",
    status: "Chưa phân công",
  },
  {
    id: "REQ-1004",
    customerName: "Lê Thị Hương",
    requestedAt: "2025-10-19",
    carModel: "VinFast VF8 2024",
    status: "Đang xử lý",
  },
  {
    id: "REQ-1005",
    customerName: "Đặng Văn Hải",
    requestedAt: "2025-10-22",
    carModel: "Kia Seltos 2023",
    status: "Chưa phân công",
  },
];

export default function StaffAssignment() {
  const [assignments, setAssignments] = useState({});
  const [selected, setSelected] = useState({});
  const [statusFilter, setStatusFilter] = useState("Tất cả");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);

  useEffect(() => {
    setAssignments(loadAssignments());
  }, []);

  // Derived data
  const requests = useMemo(() => {
    const enriched = mockRequests.map((r) => ({
      ...r,
      assignedStaffId: assignments[r.id]?.staffId || null,
      assignedStaffName: assignments[r.id]?.staffName || null,
    }));

    return enriched
      .filter((r) =>
        statusFilter === "Tất cả"
          ? true
          : statusFilter === "Đã phân công"
          ? !!r.assignedStaffId
          : !r.assignedStaffId
      )
      .filter((r) =>
        [r.id, r.customerName, r.carModel, r.assignedStaffName]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase())
      );
  }, [assignments, statusFilter, search]);

  const handleSelect = (requestId, staffId) => {
    const staff = mockStaff.find((s) => s.id === staffId) || null;
    setSelected((prev) => ({ ...prev, [requestId]: staff }));
  };

  const handleSave = (requestId) => {
    const staff = selected[requestId];
    if (!staff) {
      setToast({ type: "error", message: "Vui lòng chọn nhân viên để phân công" });
      return;
    }
    const newAssignments = {
      ...assignments,
      [requestId]: { staffId: staff.id, staffName: staff.name, assignedAt: new Date().toISOString() },
    };
    setAssignments(newAssignments);
    saveAssignments(newAssignments);
    setToast({ type: "success", message: `Đã phân công ${staff.name} cho yêu cầu ${requestId}` });
  };

  const handleBulkAssign = (staffId) => {
    const staff = mockStaff.find((s) => s.id === staffId);
    if (!staff) return;
    const unassigned = requests.filter((r) => !r.assignedStaffId);
    if (unassigned.length === 0) {
      setToast({ type: "info", message: "Không có yêu cầu chưa phân công" });
      return;
    }
    const newAssignments = { ...assignments };
    unassigned.forEach((r) => {
      newAssignments[r.id] = { staffId: staff.id, staffName: staff.name, assignedAt: new Date().toISOString() };
    });
    setAssignments(newAssignments);
    saveAssignments(newAssignments);
    setToast({ type: "success", message: `Đã phân công ${staff.name} cho ${unassigned.length} yêu cầu` });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 py-8 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <UserCog className="w-8 h-8 text-blue-600" /> Phân công nhân viên quản lý yêu cầu mua xe
              </h1>
              <p className="text-gray-600 mt-2">Gán nhân viên phụ trách xử lý yêu cầu và làm hồ sơ cho khách hàng</p>
            </div>

            {/* Filters */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-gray-500" />
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="Tất cả">Tất cả</option>
                    <option value="Chưa phân công">Chưa phân công</option>
                    <option value="Đã phân công">Đã phân công</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 md:col-span-2">
                  <Search className="w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Tìm theo mã yêu cầu, tên khách hàng, mẫu xe hoặc nhân viên..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Bulk assign */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3 flex-wrap">
                <Users className="w-5 h-5 text-gray-600" />
                <span className="text-sm text-gray-600">Phân công nhanh tất cả yêu cầu chưa phân công cho:</span>
                {mockStaff.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleBulkAssign(s.id)}
                    className="px-3 py-1.5 text-sm rounded-full border border-gray-300 hover:bg-gray-50"
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Requests table */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã yêu cầu</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách hàng</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày yêu cầu</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mẫu xe</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nhân viên phụ trách</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {requests.map((req) => (
                      <tr key={req.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-900">{req.id}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{req.customerName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{new Date(req.requestedAt).toLocaleDateString('vi-VN')}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{req.carModel}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <select
                              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
                              value={selected[req.id]?.id || req.assignedStaffId || ""}
                              onChange={(e) => handleSelect(req.id, e.target.value)}
                            >
                              <option value="">-- Chọn nhân viên --</option>
                              {mockStaff.map((s) => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                              ))}
                            </select>
                            {req.assignedStaffName && (
                              <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                                <UserCheck className="w-4 h-4" /> {req.assignedStaffName}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleSave(req.id)}
                            className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 text-sm"
                          >
                            <Save className="w-4 h-4" /> Lưu
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
