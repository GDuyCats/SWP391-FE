// ======================= IMPORT CÁC THƯ VIỆN CẦN THIẾT =======================
import React, { useState, useEffect } from "react"; // React + hook useState, useEffect
import { useNavigate } from "react-router-dom"; // dùng để chuyển trang (navigate)
import { FileText, Eye, Download } from "lucide-react"; // icon từ thư viện lucide-react
import AdminHeader from "../../components/Admin/AdminHeader"; // header khu vực admin
import AdminSidebar from "../../components/Admin/AdminSidebar"; // sidebar khu vực admin
import { api } from "../../services/api"; // instance axios đã cấu hình sẵn (baseURL, interceptors, ...)

// ======================= TOAST NỘI BỘ CHO FILE NÀY =======================
// Không dùng file Toast riêng, khai báo Toast luôn tại đây
// Props:
// - type: "success" | "error" | "info" (quyết định màu nền)
// - message: chuỗi text hiển thị
// - onClose: hàm được gọi khi cần đóng Toast
const Toast = ({ type = "success", message, onClose }) => {
  // useEffect: khi message thay đổi -> set timer 3s để tự đóng Toast
  useEffect(() => {
    if (!message) return; // nếu không có message thì không làm gì

    // tạo timer 3 giây, sau 3s gọi onClose để setToast(null)
    const timer = setTimeout(() => {
      onClose && onClose();
    }, 3000);

    // cleanup: nếu Toast bị unmount hoặc message thay đổi -> clear timer cũ
    return () => clearTimeout(timer);
  }, [message, onClose]);

  // Chọn màu nền theo type
  let bgClass = "bg-green-500"; // mặc định: success = xanh lá
  if (type === "error") {
    bgClass = "bg-red-500"; // error = đỏ
  } else if (type === "info") {
    bgClass = "bg-blue-500"; // info = xanh dương
  }

  return (
    // Toast cố định góc phải trên màn hình
    <div
      className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white flex items-center gap-3 ${bgClass}`}
    >
      {/* Nội dung text của Toast */}
      <span className="text-sm font-medium">{message}</span>

      {/* Nút X để đóng Toast bằng tay */}
      <button
        onClick={onClose}
        className="text-white/80 hover:text-white text-lg leading-none"
      >
        ×
      </button>
    </div>
  );
};

// ======================= COMPONENT CHÍNH: TRANSACTION RECORDS =======================
export default function TransactionRecords() {
  const navigate = useNavigate(); // hook điều hướng trang

  // records: mảng danh sách hồ sơ sau khi gọi API
  const [records, setRecords] = useState([]);

  // selectedRecord: hồ sơ đang được chọn để xem chi tiết (trong modal)
  const [selectedRecord, setSelectedRecord] = useState(null);

  // showDetailModal: true => hiển thị popup chi tiết hồ sơ
  const [showDetailModal, setShowDetailModal] = useState(false);

  // loading: trạng thái đang tải dữ liệu từ API
  const [loading, setLoading] = useState(false);

  // toast: object { type, message } | null
  // null => không hiển thị Toast
  const [toast, setToast] = useState(null);

  // =================== HÀM MAP STATUS BACKEND -> LABEL TIẾNG VIỆT ===================
  // Input: status từ backend (negotiating, meeting_scheduled, ...)
  // Output: Chuỗi tiếng Việt hiển thị ra UI
  function mapStatusToLabel(status) {
    if (!status) return "Không xác định";

    switch (status) {
      case "negotiating":
      case "meeting_scheduled":
        return "Đang xử lý"; // đang thương lượng, hẹn gặp
      case "awaiting_payment":
        return "Chờ thanh toán"; // đã chốt, chờ thanh toán
      case "completed":
      case "awaiting_sign":
      case "signed":
        return "Đã hoàn thành"; // đã ký hoặc hoàn tất
      default:
        // nếu có status lạ, trả lại nguyên string để dễ debug
        return status;
    }
  }

  // =================== HÀM CHỌN MÀU CHO CHIP TRẠNG THÁI ===================
  // Input: label tiếng Việt (Đã hoàn thành / Đang xử lý / Chờ thanh toán)
  // Output: chuỗi class tailwind cho màu nền + màu chữ
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

  // =================== useEffect: GỌI API LẤY DANH SÁCH HỒ SƠ ===================
  useEffect(() => {
    // Hàm async bên trong useEffect (không dùng trực tiếp useEffect async)
    async function fetchContracts() {
      setLoading(true); // bật trạng thái loading để UI hiển thị "Đang tải..."

      try {
        // GỌI API LẤY DANH SÁCH HỢP ĐỒNG
        // /staff/contracts/allContracts trả về dạng:
        // { contracts: [ { id, buyer, seller, status, ... }, ... ] }
        const res = await api.get("/staff/contracts/allContracts");

        // payload: đảm bảo nếu res.data undefined thì vẫn có object rỗng
        const payload = res?.data || {};

        // rawList: nếu payload.contracts là mảng thì dùng, không thì cho [] để tránh lỗi
        const rawList = Array.isArray(payload.contracts)
          ? payload.contracts
          : [];

        // normalized: map dữ liệu gốc từ backend -> dữ liệu đã format hiển thị lên UI
        const normalized = rawList.map((c) => {
          // chuyển status backend -> label tiếng Việt
          const statusLabel = mapStatusToLabel(c.status);

          return {
            // id hồ sơ (contractId)
            id: c.id,

            // tên người mua: ưu tiên c.buyer.username, fallback sang "Người mua #id"
            buyerName: c.buyer?.username || `Người mua #${c.buyerId}`,

            // tên người bán
            sellerName: c.seller?.username || `Người bán #${c.sellerId}`,

            // ngày cập nhật giao dịch (dùng updatedAt)
            transactionDate: c.updatedAt,

            // tên staff xử lý hồ sơ
            staffManager: c.staffName || `Staff #${c.staffId}`,

            // trạng thái đã chuyển qua tiếng Việt
            recordStatus: statusLabel,

            // model xe (nếu backend có)
            carModel: c.carModel || "(chưa cập nhật)",

            // giá: nếu có giá -> format VND, nếu không -> text placeholder
            price: c.price
              ? `${Number(c.price).toLocaleString("vi-VN")} VNĐ`
              : "(chưa cập nhật)",

            // ghi chú thêm (nếu có)
            notes: c.notes || "",
          };
        });

        // Cập nhật state records để render ra bảng
        setRecords(normalized);

        // Bắn Toast thành công (màu xanh)
        setToast({
          type: "success",
          message: "Tải danh sách hồ sơ thành công",
        });
      } catch (err) {
        // Nếu API bị lỗi thì bắt trong catch
        const status = err?.response?.status; // HTTP status code
        let msg = "Không thể tải danh sách hồ sơ. Vui lòng thử lại.";

        // Tùy theo status code mà hiển thị message khác nhau
        if (status === 401) msg = "Phiên đăng nhập hết hạn.";
        else if (status === 403) msg = "Bạn không có quyền truy cập.";
        else if (status === 500) msg = "Lỗi máy chủ.";

        // Clear records để bảng rỗng
        setRecords([]);

        // Bắn Toast lỗi (màu đỏ)
        setToast({ type: "error", message: msg });
      } finally {
        // finally luôn chạy dù success hay error
        setLoading(false); // tắt trạng thái loading
        // Không cần setTimeout clear Toast ở đây nữa
        // vì Toast component tự đóng sau 3 giây
      }
    }

    // Gọi hàm fetchContracts khi component mount
    fetchContracts();
  }, []); // dependency [] => chỉ chạy 1 lần khi mở trang

  // =================== XỬ LÝ CLICK "CHI TIẾT" TRONG BẢNG ===================
  function handleViewDetail(record) {
    // Nếu hồ sơ CHƯA hoàn thành => điều hướng sang trang TransactionDetail
    // để staff nhập phí, chốt giá, gửi OTP, finalize...
    if (record.recordStatus !== "Đã hoàn thành") {
      navigate(`/transactiondetail/${record.id}`, {
        state: { record }, // truyền nguyên object record sang trang chi tiết
      });
      return;
    }

    // Nếu hồ sơ ĐÃ hoàn thành => chỉ mở modal xem tóm tắt, không chỉnh sửa
    setSelectedRecord(record);
    setShowDetailModal(true);
  }

  // =================== JSX RETURN: UI TRANG DANH SÁCH HỒ SƠ ===================
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header admin cố định đầu trang */}
      <AdminHeader />

      <div className="flex">
        {/* Sidebar trái */}
        <AdminSidebar />

        {/* Phần nội dung chính */}
        <main className="flex-1 py-8 px-6">
          <div className="max-w-7xl mx-auto">
            {/* TIÊU ĐỀ TRANG */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">
                Quản lý hồ sơ mua bán xe
              </h1>
              <p className="text-gray-600 mt-2">
                Danh sách các hồ sơ giao dịch mua bán xe giữa người mua và người
                bán
              </p>
            </div>

            {/* 4 CARD THỐNG KÊ NHANH */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <StatCard
                label="Tổng hồ sơ"
                value={records.length} // tổng số hồ sơ
                colorClass="text-blue-500"
              />
              <StatCard
                label="Đã hoàn thành"
                value={
                  records.filter((r) => r.recordStatus === "Đã hoàn thành")
                    .length
                } // đếm số hồ sơ đã hoàn thành
                colorClass="text-green-500"
              />
              <StatCard
                label="Đang xử lý"
                value={
                  records.filter((r) => r.recordStatus === "Đang xử lý").length
                } // đếm đang xử lý
                colorClass="text-yellow-500"
              />
              <StatCard
                label="Chờ thanh toán"
                value={
                  records.filter((r) => r.recordStatus === "Chờ thanh toán")
                    .length
                } // đếm chờ thanh toán
                colorClass="text-blue-500"
              />
            </div>

            {/* BẢNG DANH SÁCH HỒ SƠ */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  {/* HEADER BẢNG */}
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

                  {/* BODY BẢNG */}
                  <tbody className="bg-white divide-y divide-gray-200">
                    {/* Trạng thái đang tải */}
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
                      // Có dữ liệu => map records ra từng dòng
                      records.map((record) => (
                        <tr
                          key={record.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          {/* Cột MÃ HỒ SƠ */}
                          <Td>
                            <div className="flex items-center">
                              <FileText className="w-4 h-4 text-gray-400 mr-2" />
                              <span className="text-sm font-medium text-gray-900">
                                {record.id}
                              </span>
                            </div>
                          </Td>

                          {/* Cột NGƯỜI MUA */}
                          <Td>
                            <div className="text-sm font-medium text-gray-900">
                              {record.buyerName}
                            </div>
                          </Td>

                          {/* Cột NGƯỜI BÁN */}
                          <Td>
                            <div className="text-sm text-gray-900">
                              {record.sellerName}
                            </div>
                          </Td>

                          {/* Cột NGÀY CẬP NHẬT */}
                          <Td>
                            <div className="text-sm text-gray-500">
                              {record.transactionDate
                                ? new Date(
                                    record.transactionDate
                                  ).toLocaleDateString("vi-VN")
                                : "-"}
                            </div>
                          </Td>

                          {/* Cột STAFF QUẢN LÝ */}
                          <Td>
                            <div className="text-sm text-gray-900">
                              {record.staffManager}
                            </div>
                          </Td>

                          {/* Cột TRẠNG THÁI (chip màu) */}
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

                          {/* Cột THAO TÁC */}
                          <Td>
                            <button
                              onClick={() => handleViewDetail(record)} // click => xem chi tiết
                              className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                            >
                              <Eye className="w-4 h-4" />
                              <span>Chi tiết</span>
                            </button>
                          </Td>
                        </tr>
                      ))
                    ) : (
                      // Không có hồ sơ nào
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

      {/* MODAL CHI TIẾT HỒ SƠ (chỉ hiện khi showDetailModal = true) */}
      {showDetailModal && selectedRecord && (
        <DetailModal
          record={selectedRecord}
          getStatusColor={getStatusColor}
          onClose={() => setShowDetailModal(false)}
        />
      )}

      {/* TOAST THÔNG BÁO (thành công / thất bại) */}
      {toast && (
        <Toast
          message={toast.message} // text hiển thị
          type={toast.type} // success / error
          onClose={() => setToast(null)} // hàm đóng Toast
        />
      )}
    </div>
  );
}

// ======================= CÁC COMPONENT PHỤ DÙNG CHUNG =======================

// Card thống kê nhỏ phía trên
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

// Header ô th (table head)
function Th({ text }) {
  return (
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      {text}
    </th>
  );
}

// Ô td trong bảng
function Td({ children }) {
  return (
    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
      {children}
    </td>
  );
}

// Modal hiển thị chi tiết hồ sơ đã hoàn thành
function DetailModal({ record, getStatusColor, onClose }) {
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose} // click nền đen ngoài modal => đóng
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()} // chặn click bên trong modal, tránh đóng
      >
        <div className="p-6">
          {/* Header modal */}
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

          {/* Nội dung chi tiết */}
          <div className="space-y-4">
            {/* Mã hồ sơ + trạng thái */}
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

            {/* Thông tin người mua / người bán */}
            <Section title="Thông tin người mua" value={record.buyerName} />
            <Section title="Thông tin người bán" value={record.sellerName} />

            {/* Ngày giao dịch + staff quản lý */}
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
              <Field label="Staff quản lý" value={record.staffManager} />
            </div>

            {/* Thông tin xe */}
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-3">
                Thông tin xe
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <Field label="Mẫu xe" value={record.carModel} />
                <Field
                  label="Giá trị giao dịch"
                  value={record.price}
                  strong // in đậm hơn
                />
              </div>
            </div>

            {/* Ghi chú */}
            <div className="border-t pt-4">
              <Field
                label="Ghi chú"
                value={record.notes || "(Không có ghi chú)"}
              />
            </div>
          </div>

          {/* Nút hành động ở footer modal */}
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

// Section: box hiển thị 1 khối thông tin (người mua / người bán)
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

// Field: label + value, dùng trong modal
function Field({ label, value, strong }) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-500">{label}</label>
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
