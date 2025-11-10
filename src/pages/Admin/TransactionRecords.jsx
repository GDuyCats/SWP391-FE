import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Eye, Download } from "lucide-react";
import AdminHeader from "../../components/Admin/AdminHeader";
import AdminSidebar from "../../components/Admin/AdminSidebar";
import { api } from "../../services/api";
import Toast from "../../components/Toast";

export default function TransactionRecords() {
  const navigate = useNavigate();

  const [records, setRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // map trạng thái backend -> label tiếng Việt hiển thị
  function mapStatusToLabel(status) {
    if (!status) return "Không xác định";

    switch (status) {
      case "negotiating":
      case "meeting_scheduled":
        return "Đang xử lý";
      case "awaiting_payment":
        return "Chờ thanh toán";
      case "completed":
      case "awaiting_sign":
      case "signed":
        return "Đã hoàn thành";
      default:
        return status;
    }
  }

  // màu nền chip trạng thái
  function getStatusColor(label) {
    switch (label) {
      case "Đã hoàn thành":
        return "bg-green-100 text-green-800";
      case "Đang xử lý":
        return "bg-yellow-100 text-yellow-800";
      case "Chờ thanh toán":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }

    useEffect(() => {
        async function fetchContracts() {
            setLoading(true);

            try {
                const res = await api.get("/staff/contracts/allContracts");
                const payload = res?.data || {};
                const rawList = Array.isArray(payload.contracts) ? payload.contracts : [];

                const normalized = rawList.map((c) => {
                    const statusLabel = mapStatusToLabel(c.status);

                    return {
                        id: c.id,
                        buyerName: c.buyer?.username || `Người mua #${c.buyerId}`,
                        sellerName: c.seller?.username || `Người bán #${c.sellerId}`,
                        transactionDate: c.updatedAt,
                        staffManager: c.staffName || `Staff #${c.staffId}`,
                        recordStatus: statusLabel,
                        carModel: c.carModel || "(chưa cập nhật)",
                        price: c.price
                            ? `${Number(c.price).toLocaleString("vi-VN")} VNĐ`
                            : "(chưa cập nhật)",
                        notes: c.notes || "",
                    };
                });

                setRecords(normalized);
                setToast({ type: "success", message: "Tải danh sách hồ sơ thành công" });
            } catch (err) {
                const status = err?.response?.status;
                let msg = "Không thể tải danh sách hồ sơ. Vui lòng thử lại.";

                if (status === 401) msg = "Phiên đăng nhập hết hạn.";
                else if (status === 403) msg = "Bạn không có quyền truy cập.";
                else if (status === 500) msg = "Lỗi máy chủ.";

                setRecords([]);
                setToast({ type: "error", message: msg });
            } finally {
                setLoading(false);
                setTimeout(() => setToast(null), 3000);
            }
        }

        fetchContracts();
    }, []);

  // click "Chi tiết"
  function handleViewDetail(record) {
    // nếu chưa hoàn thành => đi TransactionDetail để điền phí và gửi OTP
    if (record.recordStatus !== "Đã hoàn thành") {
      navigate(`/transactiondetail/${record.id}`, {
        state: { record },
      });
      return;
    }

    // đã hoàn thành => chỉ xem tóm tắt
    setSelectedRecord(record);
    setShowDetailModal(true);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />

      <div className="flex">
        <AdminSidebar />

        <main className="flex-1 py-8 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">
                Quản lý hồ sơ mua bán xe
              </h1>
              <p className="text-gray-600 mt-2">
                Danh sách các hồ sơ giao dịch mua bán xe giữa người mua và người bán
              </p>
            </div>

            {/* Cards thống kê */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <StatCard
                label="Tổng hồ sơ"
                value={records.length}
                colorClass="text-blue-500"
              />
              <StatCard
                label="Đã hoàn thành"
                value={
                  records.filter(
                    (r) => r.recordStatus === "Đã hoàn thành"
                  ).length
                }
                colorClass="text-green-500"
              />
              <StatCard
                label="Đang xử lý"
                value={
                  records.filter(
                    (r) => r.recordStatus === "Đang xử lý"
                  ).length
                }
                colorClass="text-yellow-500"
              />
              <StatCard
                label="Chờ thanh toán"
                value={
                  records.filter(
                    (r) => r.recordStatus === "Chờ thanh toán"
                  ).length
                }
                colorClass="text-blue-500"
              />
            </div>

            {/* Bảng hồ sơ */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <Th text="Mã hồ sơ" />
                      <Th text="Người mua" />
                      <Th text="Người bán" />
                      <Th text="Ngày cập nhật" />
                      <Th text="Staff quản lý" />
                      <Th text="Trạng thái" />
                      <Th text="Thao tác" />
                    </tr>
                  </thead>

                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-6 py-10 text-center text-gray-500 italic"
                        >
                          Đang tải...
                        </td>
                      </tr>
                    ) : records.length > 0 ? (
                      records.map((record) => (
                        <tr
                          key={record.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <Td>
                            <div className="flex items-center">
                              <FileText className="w-4 h-4 text-gray-400 mr-2" />
                              <span className="text-sm font-medium text-gray-900">
                                {record.id}
                              </span>
                            </div>
                          </Td>

                          <Td>
                            <div className="text-sm font-medium text-gray-900">
                              {record.buyerName}
                            </div>
                          </Td>

                          <Td>
                            <div className="text-sm text-gray-900">
                              {record.sellerName}
                            </div>
                          </Td>

                          <Td>
                            <div className="text-sm text-gray-500">
                              {record.transactionDate
                                ? new Date(
                                    record.transactionDate
                                  ).toLocaleDateString("vi-VN")
                                : "-"}
                            </div>
                          </Td>

                          <Td>
                            <div className="text-sm text-gray-900">
                              {record.staffManager}
                            </div>
                          </Td>

                          <Td>
                            <span
                              className={
                                "px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full " +
                                getStatusColor(record.recordStatus)
                              }
                            >
                              {record.recordStatus}
                            </span>
                          </Td>

                          <Td>
                            <button
                              onClick={() => handleViewDetail(record)}
                              className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                            >
                              <Eye className="w-4 h-4" />
                              <span>Chi tiết</span>
                            </button>
                          </Td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-6 py-10 text-center text-gray-500 italic"
                        >
                          Không có hồ sơ nào
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>

      {showDetailModal && selectedRecord && (
        <DetailModal
          record={selectedRecord}
          getStatusColor={getStatusColor}
          onClose={() => setShowDetailModal(false)}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

/* Components phụ */

function StatCard({ label, value, colorClass }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <FileText className={`w-8 h-8 ${colorClass}`} />
      </div>
    </div>
  );
}

function Th({ text }) {
  return (
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      {text}
    </th>
  );
}

function Td({ children }) {
  return (
    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
      {children}
    </td>
  );
}

function DetailModal({ record, getStatusColor, onClose }) {
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Chi tiết hồ sơ
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Mã hồ sơ
                </label>
                <p className="mt-1 text-gray-900 font-semibold">
                  {record.id}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">
                  Trạng thái
                </label>
                <p className="mt-1">
                  <span
                    className={
                      "px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full " +
                      getStatusColor(record.recordStatus)
                    }
                  >
                    {record.recordStatus}
                  </span>
                </p>
              </div>
            </div>

            <Section title="Thông tin người mua" value={record.buyerName} />
            <Section title="Thông tin người bán" value={record.sellerName} />

            <div className="grid grid-cols-2 gap-4 border-t pt-4">
              <Field
                label="Ngày giao dịch"
                value={
                  record.transactionDate
                    ? new Date(record.transactionDate).toLocaleDateString(
                        "vi-VN",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )
                    : "-"
                }
              />
              <Field
                label="Staff quản lý"
                value={record.staffManager}
              />
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-3">
                Thông tin xe
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <Field label="Mẫu xe" value={record.carModel} />
                <Field
                  label="Giá trị giao dịch"
                  value={record.price}
                  strong
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <Field
                label="Ghi chú"
                value={record.notes || "(Không có ghi chú)"}
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              onClick={() =>
                alert("Tính năng tải xuống hồ sơ sẽ được phát triển")
              }
            >
              <Download className="w-4 h-4" />
              <span>Tải xuống hồ sơ</span>
            </button>

            <button
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              onClick={onClose}
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, value }) {
  return (
    <div className="border-t pt-4">
      <h3 className="font-semibold text-gray-900 mb-3">{title}</h3>
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-gray-900 font-medium">{value}</p>
      </div>
    </div>
  );
}

function Field({ label, value, strong }) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-500">
        {label}
      </label>
      <p
        className={
          "mt-1 text-gray-900 " +
          (strong ? "font-bold text-lg text-blue-600" : "font-medium")
        }
      >
        {value}
      </p>
    </div>
  );
}
