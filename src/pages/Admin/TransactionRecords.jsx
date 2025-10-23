import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Eye, Download } from 'lucide-react';
import AdminHeader from "../../components/Admin/AdminHeader";
import AdminSidebar from "../../components/Admin/AdminSidebar";

// Mock data - Dữ liệu giả cho frontend
const mockTransactionRecords = [
  {
    id: "HS001",
    buyerName: "Nguyễn Văn An",
    sellerName: "Trần Thị Bình",
    transactionDate: "2025-10-15",
    staffManager: "Lê Hoàng Minh",
    recordStatus: "Đã hoàn thành",
    carModel: "Honda City 2023",
    price: "550.000.000 VNĐ",
    notes: "Hồ sơ đầy đủ, thanh toán 1 lần"
  },
  {
    id: "HS002",
    buyerName: "Phạm Minh Tuấn",
    sellerName: "Hoàng Thị Mai",
    transactionDate: "2025-10-18",
    staffManager: "Ngô Thanh Tùng",
    recordStatus: "Đang xử lý",
    carModel: "Toyota Vios 2022",
    price: "480.000.000 VNĐ",
    notes: "Chờ kiểm tra hồ sơ pháp lý"
  },
  {
    id: "HS003",
    buyerName: "Lê Thị Hương",
    sellerName: "Đặng Văn Hải",
    transactionDate: "2025-10-20",
    staffManager: "Võ Thị Lan",
    recordStatus: "Đã hoàn thành",
    carModel: "Mazda CX-5 2023",
    price: "890.000.000 VNĐ",
    notes: "Xe đã bàn giao"
  },
  {
    id: "HS004",
    buyerName: "Trịnh Quốc Cường",
    sellerName: "Bùi Thị Ngọc",
    transactionDate: "2025-10-21",
    staffManager: "Lê Hoàng Minh",
    recordStatus: "Chờ thanh toán",
    carModel: "Hyundai Accent 2024",
    price: "520.000.000 VNĐ",
    notes: "Đã ký hợp đồng, chờ chuyển khoản"
  },
  {
    id: "HS005",
    buyerName: "Đỗ Văn Tài",
    sellerName: "Phan Thị Thu",
    transactionDate: "2025-10-22",
    staffManager: "Ngô Thanh Tùng",
    recordStatus: "Đang xử lý",
    carModel: "Kia Seltos 2023",
    price: "680.000.000 VNĐ",
    notes: "Đang thẩm định giá xe"
  },
  {
    id: "HS006",
    buyerName: "Vũ Thị Lan Anh",
    sellerName: "Đinh Văn Nam",
    transactionDate: "2025-10-10",
    staffManager: "Võ Thị Lan",
    recordStatus: "Đã hoàn thành",
    carModel: "VinFast VF8 2024",
    price: "1.200.000.000 VNĐ",
    notes: "Giao dịch thành công"
  },
  {
    id: "HS007",
    buyerName: "Cao Minh Đức",
    sellerName: "Lý Thị Hồng",
    transactionDate: "2025-10-23",
    staffManager: "Lê Hoàng Minh",
    recordStatus: "Đang xử lý",
    carModel: "Ford Ranger 2023",
    price: "750.000.000 VNĐ",
    notes: "Đang kiểm tra kỹ thuật"
  },
  {
    id: "HS008",
    buyerName: "Ngô Thị Phương",
    sellerName: "Mai Văn Long",
    transactionDate: "2025-10-12",
    staffManager: "Ngô Thanh Tùng",
    recordStatus: "Đã hoàn thành",
    carModel: "Mercedes C200 2022",
    price: "1.450.000.000 VNĐ",
    notes: "Hoàn tất thủ tục sang tên"
  },
  {
    id: "HS009",
    buyerName: "Tống Văn Bình",
    sellerName: "Hà Thị Linh",
    transactionDate: "2025-10-19",
    staffManager: "Võ Thị Lan",
    recordStatus: "Chờ thanh toán",
    carModel: "BMW 320i 2023",
    price: "1.680.000.000 VNĐ",
    notes: "Đã kiểm tra xe, chờ thanh toán"
  },
  {
    id: "HS010",
    buyerName: "Dương Thị Mai",
    sellerName: "Lâm Văn Thành",
    transactionDate: "2025-10-08",
    staffManager: "Lê Hoàng Minh",
    recordStatus: "Đã hoàn thành",
    carModel: "Mitsubishi Xpander 2023",
    price: "620.000.000 VNĐ",
    notes: "Giao dịch hoàn tất"
  }
];

export default function TransactionRecords() {
  const navigate = useNavigate();
  const [records] = useState(mockTransactionRecords);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case "Đã hoàn thành":
        return "bg-green-100 text-green-800";
      case "Đang xử lý":
        return "bg-yellow-100 text-yellow-800";
      case "Chờ thanh toán":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleViewDetail = (record) => {
    // Nếu hồ sơ chưa hoàn thành, chuyển đến trang chi tiết để điền phí
    if (record.recordStatus !== "Đã hoàn thành") {
      navigate(`/transactiondetail/${record.id}`, { state: { record } });
    } else {
      // Nếu đã hoàn thành, hiển thị modal thông tin
      setSelectedRecord(record);
      setShowDetailModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 py-8 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Quản lý hồ sơ mua bán xe</h1>
              <p className="text-gray-600 mt-2">Danh sách các hồ sơ giao dịch mua bán xe giữa người mua và người bán</p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Tổng hồ sơ</p>
                    <p className="text-2xl font-bold text-gray-900">{records.length}</p>
                  </div>
                  <FileText className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Đã hoàn thành</p>
                    <p className="text-2xl font-bold text-green-600">
                      {records.filter(r => r.recordStatus === "Đã hoàn thành").length}
                    </p>
                  </div>
                  <FileText className="w-8 h-8 text-green-500" />
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Đang xử lý</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {records.filter(r => r.recordStatus === "Đang xử lý").length}
                    </p>
                  </div>
                  <FileText className="w-8 h-8 text-yellow-500" />
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Chờ thanh toán</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {records.filter(r => r.recordStatus === "Chờ thanh toán").length}
                    </p>
                  </div>
                  <FileText className="w-8 h-8 text-blue-500" />
                </div>
              </div>
            </div>

            {/* Transaction Records Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mã hồ sơ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Người mua
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Người bán
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ngày giao dịch
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Staff quản lý
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {records.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FileText className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-sm font-medium text-gray-900">{record.id}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{record.buyerName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{record.sellerName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {new Date(record.transactionDate).toLocaleDateString('vi-VN')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{record.staffManager}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(record.recordStatus)}`}>
                            {record.recordStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleViewDetail(record)}
                            className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                          >
                            <Eye className="w-4 h-4" />
                            <span>Chi tiết</span>
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

      {/* Detail Modal */}
      {showDetailModal && selectedRecord && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDetailModal(false)}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Chi tiết hồ sơ</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Mã hồ sơ</label>
                    <p className="mt-1 text-gray-900 font-semibold">{selectedRecord.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Trạng thái</label>
                    <p className="mt-1">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedRecord.recordStatus)}`}>
                        {selectedRecord.recordStatus}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Thông tin người mua</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-900 font-medium">{selectedRecord.buyerName}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Thông tin người bán</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-900 font-medium">{selectedRecord.sellerName}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t pt-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Ngày giao dịch</label>
                    <p className="mt-1 text-gray-900">
                      {new Date(selectedRecord.transactionDate).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Staff quản lý</label>
                    <p className="mt-1 text-gray-900 font-medium">{selectedRecord.staffManager}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Thông tin xe</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Mẫu xe</label>
                      <p className="text-gray-900 font-medium">{selectedRecord.carModel}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Giá trị giao dịch</label>
                      <p className="text-gray-900 font-bold text-lg text-blue-600">{selectedRecord.price}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <label className="text-sm font-medium text-gray-500">Ghi chú</label>
                  <p className="mt-1 text-gray-900">{selectedRecord.notes}</p>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button 
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  onClick={() => alert('Chức năng tải xuống hồ sơ sẽ được phát triển')}
                >
                  <Download className="w-4 h-4" />
                  <span>Tải xuống hồ sơ</span>
                </button>
                <button 
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={() => setShowDetailModal(false)}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
