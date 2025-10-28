import React, { useEffect, useState } from "react";
import AdminHeader from "../../components/Admin/AdminHeader";
import AdminSidebar from "../../components/Admin/AdminSidebar";
import { UserCog, Filter, Save, Users, UserCheck, Search, Mail, Phone, Calendar, Shield, UserPen } from "lucide-react";
import Toast from "../../components/Toast";
import { api } from "../../services/api";
import RequestDialog from "../../components/RequestDialog";

export default function StaffAssignment() {
  const [msg, setMsg] = useState("");
  const [staffs, setStaffs] = useState([]);
  const [toast, setToast] = useState(false);
  const [type, setType] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);

  async function getAllStaff() {
    try {
      const res = await api.get("/admin/staff");
      console.log(res);
      if (res.status === 200) {
        setStaffs(res.data.staff);
        setToast(true);
        setType("success");
        setMsg("Lấy danh sách nhân viên thành công");
      }
    } catch (error) {
      console.log(error);
      const status = error?.status;
      const msg = error?.response?.data;
      let errorMsg = 'Không thể lấy danh sách nhân viên';
      setToast(true);
      setType("error");
      if (status === 401) {
        errorMsg = msg ? msg : "Missing or invalid token";
      } else if (status === 403) {
        errorMsg = msg ? msg : "Not authorized (Admin Only)";
      }
      setMsg(errorMsg);
    } finally {
      setTimeout(() => setToast(false), 3000);
    }
  }

  // async function handleAssign() {

  // }

  useEffect(() => {
    getAllStaff();
  }, []);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
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
                <UserCog className="w-8 h-8 text-blue-600" /> Quản lý nhân viên
              </h1>
              <p className="text-gray-600 mt-2">Danh sách tất cả nhân viên trong hệ thống</p>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Tổng nhân viên</p>
                    <p className="text-2xl font-bold text-gray-900">{staffs.length}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Đã xác thực</p>
                    <p className="text-2xl font-bold text-green-600">
                      {staffs.filter(s => s.isVerified).length}
                    </p>
                  </div>
                  <UserCheck className="w-8 h-8 text-green-500" />
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Chưa xác thực</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {staffs.filter(s => !s.isVerified).length}
                    </p>
                  </div>
                  <Shield className="w-8 h-8 text-orange-500" />
                </div>
              </div>
            </div>

            {/* Staff Table */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên đăng nhập</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số điện thoại</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vai trò</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tạo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cập nhật</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>

                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {staffs.length > 0 ? (
                      staffs.map((staff) => (
                        <tr key={staff.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">#{staff.id}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-blue-600 font-semibold text-sm">
                                  {staff.username?.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="text-sm font-medium text-gray-900">{staff.username}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-gray-400" />
                              <div className="text-sm text-gray-900">{staff.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <div className="text-sm text-gray-500">
                                {staff.phone || 'Chưa cập nhật'}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              <Shield className="w-3 h-3" />
                              {staff.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {staff.isVerified ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <UserCheck className="w-3 h-3" />
                                Đã xác thực
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                <Calendar className="w-3 h-3" />
                                Chưa xác thực
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {formatDate(staff.createdAt)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {formatDate(staff.updatedAt)}
                            </div>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">

                            <button
                              onClick={() => {
                                setSelectedStaff(staff.id);
                                setOpenDialog(true);
                              }}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <UserPen className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                          Không có nhân viên nào trong hệ thống
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

      <RequestDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        staffId={selectedStaff}
      />

      <div>
        {toast && msg && (
          <Toast type={type} msg={msg} />
        )}
      </div>

    </div>
  );
}