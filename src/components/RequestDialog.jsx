import React, { useEffect, useState } from "react";
import { X, ClipboardList, Calendar, User } from "lucide-react";
import { api } from "../services/api";



export default function RequestDialog({ open, onClose, staffId }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  async function getAllRequest() {
  
    setLoading(true);
    try {
      const res = await api.get("/PurchaseRequests/admin"); 
      console.log(res);
      
      
      if (res.status === 200) {
        setRequests(res.data.requests || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (open) {
      getAllRequest();
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <ClipboardList className="text-blue-600" />
          Danh sách Request của nhân viên #{staffId}
        </h2>

        {loading ? (
          <div className="text-center py-6 text-gray-500">Đang tải dữ liệu...</div>
        ) : requests.length > 0 ? (
          <div className="overflow-x-auto max-h-[400px] overflow-y-auto border rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại yêu cầu</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tạo</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {requests.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm text-gray-900 font-medium">#{r.id}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{r.type}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          r.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : r.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-500">
                      {new Date(r.createdAt).toLocaleString("vi-VN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-6">Không có request nào</div>
        )}
      </div>
    </div>
  );
}
