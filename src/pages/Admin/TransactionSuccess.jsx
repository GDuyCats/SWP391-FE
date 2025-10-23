import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, FileText, User, Calendar, DollarSign, ArrowLeft, Download, Printer } from 'lucide-react';
import AdminHeader from "../../components/Admin/AdminHeader";
import AdminSidebar from "../../components/Admin/AdminSidebar";

export default function TransactionSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const recordData = location.state?.record;

  if (!recordData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminHeader />
        <div className="flex">
          <AdminSidebar />
          <main className="flex-1 py-8 px-6">
            <div className="max-w-7xl mx-auto text-center">
              <p className="text-gray-600 mb-4">Không tìm thấy thông tin giao dịch</p>
              <button
                onClick={() => navigate('/transactionrecords')}
                className="text-blue-600 hover:underline"
              >
                Quay lại danh sách hồ sơ
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 py-8 px-6">
          <div className="max-w-4xl mx-auto">
            {/* Success Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Giao dịch thành công!
                </h1>
                <p className="text-gray-600">
                  Hồ sơ mua bán xe đã được xác nhận và hoàn tất
                </p>
              </div>
            </div>

            {/* Transaction Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <FileText className="w-6 h-6" />
                  Thông tin giao dịch
                </h2>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Mã hồ sơ</p>
                      <p className="text-lg font-semibold text-gray-900">{recordData.id}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Ngày giao dịch</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {new Date(recordData.transactionDate).toLocaleDateString('vi-VN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Staff quản lý</p>
                      <p className="text-lg font-semibold text-gray-900">{recordData.staffManager}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <DollarSign className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Giá trị giao dịch</p>
                      <p className="text-lg font-semibold text-blue-600">{recordData.price}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">Thông tin xe</p>
                      <p className="text-lg font-semibold text-gray-900">{recordData.carModel}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Parties Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Buyer Info */}
              <div className="bg-white rounded-lg shadow-sm border border-blue-200 overflow-hidden">
                <div className="bg-blue-50 px-6 py-4 border-b border-blue-200">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">Người Mua</h3>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-lg font-semibold text-gray-900">{recordData.buyerName}</p>
                  <div className="mt-4 flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">Đã xác nhận hồ sơ</span>
                  </div>
                </div>
              </div>

              {/* Seller Info */}
              <div className="bg-white rounded-lg shadow-sm border border-green-200 overflow-hidden">
                <div className="bg-green-50 px-6 py-4 border-b border-green-200">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-green-600" />
                    <h3 className="font-semibold text-gray-900">Người Bán</h3>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-lg font-semibold text-gray-900">{recordData.sellerName}</p>
                  <div className="mt-4 flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">Đã xác nhận hồ sơ</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {recordData.notes && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Ghi chú</h3>
                <p className="text-gray-700">{recordData.notes}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => navigate('/transactionrecords')}
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Quay lại danh sách
                </button>
                <button
                  onClick={() => alert('Chức năng tải xuống hồ sơ sẽ được phát triển')}
                  className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  <Download className="w-5 h-5" />
                  Tải xuống hồ sơ
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                  <Printer className="w-5 h-5" />
                  In hồ sơ
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
