import React, { useMemo, useState } from "react";
import Toast from "../components/Toast";

// Mock data: requests to buy the current user's listings
// type: 'xe' | 'pin'
const mockRequests = [
  { id: "BR-0001", requesterName: "Nguyễn Văn Nam", phone: "0901234567", type: "xe", itemTitle: "Toyota Vios 2022", createdAt: "2025-10-21", status: "Chờ xác nhận" },
  { id: "BR-0002", requesterName: "Trần Thị Thu", phone: "0912345678", type: "pin", itemTitle: "PIN EV 72Ah", createdAt: "2025-10-22", status: "Chờ xác nhận" },
  { id: "BR-0003", requesterName: "Phạm Quốc Huy", phone: "0923456789", type: "xe", itemTitle: "Honda City 2023", createdAt: "2025-10-20", status: "Chờ xác nhận" },
  { id: "BR-0004", requesterName: "Lê Thị Linh", phone: "0934567890", type: "pin", itemTitle: "PIN EV 90Ah", createdAt: "2025-10-19", status: "Chờ xác nhận" },
];

export default function BuyRequests() {
  const [requests, setRequests] = useState(mockRequests);
  const [filter, setFilter] = useState("Tất cả");
  const [toast, setToast] = useState(null);

  const filtered = useMemo(() => {
    if (filter === "Tất cả") return requests;
    if (filter === "Xe") return requests.filter(r => r.type === 'xe');
    if (filter === "Pin") return requests.filter(r => r.type === 'pin');
    return requests;
  }, [requests, filter]);

  const handleConfirm = (id) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: "Đã xác nhận" } : r));
    setToast({ type: 'success', message: `Đã xác nhận yêu cầu ${id}` });
  };

  const handleDelete = (id) => {
    setRequests(prev => prev.filter(r => r.id !== id));
    setToast({ type: 'info', message: `Đã xóa yêu cầu ${id}` });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Yêu cầu mua hàng</h1>
          <p className="text-gray-600 mt-2">Danh sách người mua liên hệ mua xe hoặc pin từ các bài đăng của bạn</p>
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 flex items-center gap-3">
          <span className="text-sm text-gray-600">Lọc:</span>
          <div className="flex gap-2">
            {['Tất cả', 'Xe', 'Pin'].map(opt => (
              <button
                key={opt}
                onClick={() => setFilter(opt)}
                className={`px-3 py-1.5 rounded-md text-sm border ${filter === opt ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-300 hover:bg-gray-50'}`}
              >
                {opt}
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Họ và tên</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số điện thoại</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bài đăng</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày yêu cầu</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.map(req => (
                  <tr key={req.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">{req.id}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{req.requesterName}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <a href={`tel:${req.phone}`} className="text-sm text-blue-600 hover:underline">{req.phone}</a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-xs px-2 py-1 rounded-full ${req.type === 'xe' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                        {req.type === 'xe' ? 'Xe' : 'Pin'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{req.itemTitle}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500">{new Date(req.createdAt).toLocaleDateString('vi-VN')}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${req.status === 'Đã xác nhận' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleConfirm(req.id)}
                          className="px-3 py-1.5 text-sm rounded bg-green-600 text-white hover:bg-green-700"
                        >
                          Xác nhận
                        </button>
                        <button
                          onClick={() => handleDelete(req.id)}
                          className="px-3 py-1.5 text-sm rounded bg-red-600 text-white hover:bg-red-700"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="8" className="px-6 py-10 text-center text-gray-500">
                      Không có yêu cầu nào phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
