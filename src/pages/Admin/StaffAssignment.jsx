import React, { useEffect, useState } from "react";
import AdminHeader from "../../components/Admin/AdminHeader";
import AdminSidebar from "../../components/Admin/AdminSidebar";
import { ClipboardList, FileText, Clock, UserCheck } from "lucide-react";
import Toast from "../../components/Toast";
import { api } from "../../services/api";
import RequestDialog from "../../components/RequestDialog";

export default function StaffAssignment() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [toast, setToast] = useState(false);
  const [type, setType] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState(null);

  // === LẤY HỢP ĐỒNG CHƯA CÓ STAFF ===
  async function getUnassignedContracts() {
    setLoading(true);
    try {
      const res = await api.get("/admin/contracts/allContract");
      if (res.status === 200) {
        const unassigned = (res.data.contracts || []).filter((c) => !c.staffId);
        setContracts(unassigned);
        setToast(true);
        setType("success");
        setMsg("Lấy danh sách hợp đồng thành công");
        console.log("API Response:", res.data);
      }
    } catch (error) {
      console.log(error);
      const status = error?.response?.status;
      let errorMsg = "Không thể lấy danh sách hợp đồng";
      setToast(true);
      setType("error");
      if (status === 401) errorMsg = "Phiên đăng nhập hết hạn";
      else if (status === 403) errorMsg = "Không đủ quyền (Admin Only)";
      else if (status === 500) errorMsg = "Lỗi máy chủ";
      setMsg(errorMsg);
    } finally {
      setLoading(false);
      setTimeout(() => setToast(false), 3000);
    }
  }

  useEffect(() => {
    getUnassignedContracts();
  }, []);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 py-8 px-6 md:px-10">
          <div className="max-w-7xl mx-auto w-full">
            {/* Tiêu đề */}
            <div className="mb-8 border-b border-gray-200 pb-4">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <ClipboardList className="w-8 h-8 text-blue-600" />
                Gán nhân viên phụ trách hợp đồng
              </h1>
              <p className="text-gray-600 mt-2">
                Danh sách hợp đồng chưa có nhân viên hỗ trợ
              </p>
            </div>

            {/* Thống kê */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Tổng hợp đồng</p>
                    <p className="text-2xl font-semibold text-gray-900">{contracts.length}</p>
                  </div>
                  <FileText className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Chưa gán</p>
                    <p className="text-2xl font-semibold text-orange-600">{contracts.length}</p>
                  </div>
                  <Clock className="w-8 h-8 text-orange-500" />
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Sẵn sàng gán</p>
                    <p className="text-2xl font-semibold text-green-600">{contracts.length}</p>
                  </div>
                  <UserCheck className="w-8 h-8 text-green-500" />
                </div>
              </div>
            </div>

            {/* BẢNG HỢP ĐỒNG - ĐÃ MAP ĐÚNG DỮ LIỆU */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              {loading ? (
                <div className="p-10 text-center">
                  <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                  <p className="mt-3 text-gray-500">Đang tải dữ liệu...</p>
                </div>
              ) : contracts.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Mã HD
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Người mua
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Người bán
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Bài đăng
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Ngày tạo
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[140px]">
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {contracts.map((c) => (
                        <tr key={c.id} className="hover:bg-gray-50 transition-colors duration-150">
                          {/* MÃ HD */}
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                            #{c.id}
                          </td>

                          {/* NGƯỜI MUA */}
                          <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                            {c.buyer?.username || "—"}
                          </td>

                          {/* NGƯỜI BÁN */}
                          <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                            {c.seller?.username || "—"}
                          </td>

                          {/* BÀI ĐĂNG */}
                          <td className="px-6 py-4 text-sm font-medium text-blue-600 whitespace-nowrap truncate max-w-[200px]" title={c.Post?.title}>
                            {c.Post?.title || "—"}
                          </td>

                          {/* NGÀY TẠO */}
                          <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                            {formatDate(c.createdAt)}
                          </td>

                          {/* THAO TÁC - CĂN GIỮA HOÀN HẢO */}
                          <td className="px-6 py-4 text-center min-w-[140px]">
                            <button
                              onClick={() => {
                                setSelectedContractId(c.id);
                                setOpenDialog(true);
                              }}
                              className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium px-5 py-2.5 rounded-full shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 text-sm whitespace-nowrap"
                            >
                              <UserCheck className="w-4 h-4" />
                              <span>Gán nhân viên</span>
                              <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-3 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10">
                                Mở form gán nhân viên
                              </span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-10 text-center text-gray-500">
                  Tất cả hợp đồng đã có nhân viên phụ trách.
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <RequestDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        contractId={selectedContractId}
      />

      {toast && msg && <Toast type={type} msg={msg} />}
    </div>
  );
}