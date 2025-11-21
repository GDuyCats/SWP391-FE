import { useState, useEffect } from "react";
import { Plus, Trash2, Edit, X } from "lucide-react";
import { api } from "../../services/api";
import Toast from "../../components/Toast";
import {
  validateEmail,
  validateUsername,
  validatePassword,
  validateForm,
} from "../../utils/validation";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [modalMode, setModalMode] = useState("create"); // "create" or "edit"
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "staff",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleGetAllUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/user");
      if (res.status === 200) {
        setUsers(res.data.users || []);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      showToast("error", "Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGetAllUsers();
  }, []);

  const handleOpenCreateModal = () => {
    setModalMode("create");
    setSelectedUser(null);
    setFormData({
      username: "",
      email: "",
      password: "",
      role: "staff",
    });
    setErrors({});
    setOpenModal(true);
  };

  const handleOpenEditModal = (user) => {
    setModalMode("edit");
    setSelectedUser(user);
    setFormData({
      username: user.username,
      email: user.email || "",
      password: "",
      role: user.role || "staff",
    });
    setErrors({});
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setFormData({
      username: "",
      email: "",
      password: "",
      role: "staff",
    });
    setErrors({});
    setSelectedUser(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    
    // Validate
    const validations = {
      username: validateUsername(formData.username),
      email: validateEmail(formData.email),
      password: validatePassword(formData.password),
    };

    const validation = validateForm(validations);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post("/admin/create_user", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      if (res.status === 201 || res.status === 200) {
        showToast("success", "Tạo người dùng thành công!");
        handleCloseModal();
        handleGetAllUsers(); // Refresh list
      }
    } catch (error) {
      console.error("Error creating user:", error);
      const errorMsg = error?.response?.data?.message || "Không thể tạo người dùng";
      showToast("error", errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    
    // Validate - password is optional for update
    const validations = {
      username: validateUsername(formData.username),
      email: validateEmail(formData.email),
    };

    // Only validate password if it's provided
    if (formData.password && formData.password.trim() !== "") {
      validations.password = validatePassword(formData.password);
    }

    const validation = validateForm(validations);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        username: formData.username,
        email: formData.email,
        role: formData.role,
      };

      // Only include password if provided
      if (formData.password && formData.password.trim() !== "") {
        payload.password = formData.password;
      }

      const res = await api.put(`/admin/user/${selectedUser.id}`, payload);

      if (res.status === 200) {
        showToast("success", "Cập nhật người dùng thành công!");
        handleCloseModal();
        handleGetAllUsers(); // Refresh list
      }
    } catch (error) {
      console.error("Error updating user:", error);
      const errorMsg = error?.response?.data?.message || "Không thể cập nhật người dùng";
      showToast("error", errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`Bạn có chắc muốn xóa người dùng "${username}"?`)) {
      return;
    }

    try {
      const res = await api.delete(`/admin/user/${userId}`);
      
      if (res.status === 200) {
        showToast("success", "Xóa người dùng thành công!");
        handleGetAllUsers(); // Refresh list
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      const errorMsg = error?.response?.data?.message || "Không thể xóa người dùng";
      showToast("error", errorMsg);
    }
  };

  if (loading) return <p className="text-center py-10">Đang tải...</p>;

  return (
    <div className="w-full min-h-screen bg-gray-50 p-6 md:p-10 relative">
      {/* Toast */}
      {toast && <Toast type={toast.type} msg={toast.message} />}

      {/* Nút "Tạo người dùng mới" */}
      <button
        onClick={handleOpenCreateModal}
        className="absolute cursor-pointer top-6 right-6 md:top-10 md:right-10 flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg hover:scale-105 transition-all duration-200"
      >
        <Plus className="w-5 h-5" />
        <span className="hidden sm:inline">Tạo người dùng mới</span>
        <span className="sm:hidden">Tạo mới</span>
      </button>

      {/* Bảng người dùng */}
      <div className="mt-20 md:mt-24 bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-6 bg-blue-100 text-gray-700 font-semibold p-4 border-b text-sm md:text-base">
          <div>ID</div>
          <div>Tên đăng nhập</div>
          <div className="truncate">Email</div>
          <div>Vai trò</div>
          <div>Trạng thái</div>
          <div className="text-center">Hành động</div>
        </div>

        {/* Dữ liệu */}
        <div className="divide-y">
          {users.length > 0 ? (
            users.map((user) => (
              <div
                key={user.id}
                className="grid grid-cols-6 p-4 text-gray-800 hover:bg-blue-50 transition-all duration-200 items-center text-sm md:text-base"
              >
                <div className="font-medium">{user.id}</div>
                <div className="truncate font-medium">{user.username}</div>
                <div className="truncate text-gray-600" title={user.email}>
                  {user.email || "—"}
                </div>
                <div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.role === "admin" 
                      ? "bg-purple-100 text-purple-700"
                      : user.role === "staff"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-700"
                  }`}>
                    {user.role === "admin" ? "Quản trị" : user.role === "staff" ? "Nhân viên" : "Khách hàng"}
                  </span>
                </div>
                <div>
                  {user.isVerified ? (
                    <span className="text-green-600 font-medium">Đã xác thực</span>
                  ) : (
                    <span className="text-orange-600 font-medium">Chưa xác thực</span>
                  )}
                </div>
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => handleOpenEditModal(user)}
                    className="text-blue-600 hover:text-blue-800 hover:scale-110 transition-all duration-200 cursor-pointer"
                    title="Chỉnh sửa người dùng"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id, user.username)}
                    className="text-red-600 hover:text-red-800 hover:scale-110 transition-all duration-200 cursor-pointer"
                    title="Xóa người dùng"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-gray-500">
              Không có người dùng nào.
            </div>
          )}
        </div>
      </div>

      {/* Modal Tạo/Sửa người dùng */}
      {openModal && (
        <div
          className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white w-full max-w-2xl rounded-2xl shadow-xl p-8 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                {modalMode === "create" ? "Tạo người dùng mới" : "Chỉnh sửa người dùng"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={modalMode === "create" ? handleCreateUser : handleUpdateUser} className="space-y-5">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên đăng nhập <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Nhập tên đăng nhập"
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                    errors.username
                      ? "border-red-500 focus:ring-red-200"
                      : "border-gray-300 focus:ring-blue-200"
                  }`}
                />
                {errors.username && (
                  <p className="text-red-500 text-sm mt-1">{errors.username}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="email@example.com"
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                    errors.email
                      ? "border-red-500 focus:ring-red-200"
                      : "border-gray-300 focus:ring-blue-200"
                  }`}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mật khẩu {modalMode === "create" && <span className="text-red-500">*</span>}
                  {modalMode === "edit" && <span className="text-gray-500 text-xs">(Để trống nếu không đổi)</span>}
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={modalMode === "create" ? "Nhập mật khẩu (tối thiểu 6 ký tự)" : "Nhập mật khẩu mới"}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                    errors.password
                      ? "border-red-500 focus:ring-red-200"
                      : "border-gray-300 focus:ring-blue-200"
                  }`}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>

               {/* Role */}
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   Vai trò
                 </label>
                 <select
                   name="role"
                   value={formData.role}
                   onChange={handleChange}
                   className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                 >
                   <option value="staff">Nhân viên</option>
                   <option value="admin">Quản trị viên</option>
                 </select>
               </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-5 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Đang xử lý..." : modalMode === "create" ? "Tạo người dùng" : "Cập nhật"}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-5 py-3 bg-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-300 transition"
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