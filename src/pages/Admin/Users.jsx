import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { api } from "../../services/api";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGetAllUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/user");
      if (res.status === 200) {
        setUsers(res.data.users || []);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGetAllUsers();
  }, []);

  if (loading) return <p className="text-center py-10">Đang tải...</p>;

  return (
    <div className="w-full min-h-screen bg-gray-50 p-6 md:p-10 relative">
      {/* Nút "Tạo người dùng mới" */}
      <button
        onClick={() => setOpenModal(true)}
        className="absolute cursor-pointer top-6 right-6 md:top-10 md:right-10 flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg hover:scale-105 transition-all duration-200"
      >
        <Plus className="w-5 h-5" />
        <span className="hidden sm:inline">Tạo người dùng mới</span>
        <span className="sm:hidden">Tạo mới</span>
      </button>

      {/* Bảng người dùng */}
      <div className="mt-20 md:mt-24 bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-5 bg-blue-100 text-gray-700 font-semibold p-4 border-b text-sm md:text-base">
          <div>ID</div>
          <div>Tên đăng nhập</div>
          <div className="truncate">Email</div>
          <div>Trạng thái</div>
          <div className="text-center">Hành động</div>
        </div>

        {/* Dữ liệu */}
        <div className="divide-y">
          {users.length > 0 ? (
            users.map((user) => (
              <div
                key={user.id}
                className="grid grid-cols-5 p-4 text-gray-800 hover:bg-blue-50 transition-all duration-200 items-center text-sm md:text-base"
              >
                <div className="font-medium">{user.id}</div>
                <div className="truncate font-medium">{user.username}</div>
                <div className="truncate text-gray-600" title={user.email}>
                  {user.email || "—"}
                </div>
                <div>
                  {user.isVerified ? (
                    <span className="text-green-600 font-medium">Đã xác thực</span>
                  ) : (
                    <span className="text-orange-600 font-medium">Chưa xác thực</span>
                  )}
                </div>
                <div className="flex justify-center">
                  <button
                    onClick={() => {
                      if (confirm("Xóa người dùng này? (chỉ UI)")) {
                        setUsers(users.filter((u) => u.id !== user.id));
                      }
                    }}
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

      {/* Modal */}
      {openModal && (
        <div
          className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4"
          onClick={() => setOpenModal(false)}
        >
          <div
            className="bg-white w-full max-w-3xl rounded-2xl shadow-xl p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-semibold mb-4">Thêm người dùng mới</h2>
            <p className="text-gray-600 mb-6">Tính năng đang phát triển...</p>
            <button
              onClick={() => setOpenModal(false)}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}