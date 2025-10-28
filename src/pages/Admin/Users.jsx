import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { api } from "../../services/api";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGetAllUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/user");
      console.log(res);
      
      if (res.status === 200) {
        setUsers(res.data.users);
      }
      
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };



  console.log(users);


  useEffect(() => {
    handleGetAllUsers();
  }, []);

  if (loading) return <p>Loading ...</p>;

  return (

    <div className="w-full min-h-screen bg-gray-50 p-10 relative">
      {/* Nút thêm */}
      <Plus
        className="w-[50px] h-[50px] text-blue-600 hover:cursor-pointer hover:scale-125 transition-transform duration-200 absolute top-0 right-10"
        onClick={() => setOpenModal(true)}
      />

      {/* Danh sách người dùng */}
      <div className="mt-4 bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-4 bg-blue-100 text-gray-700 font-semibold p-4 border-b">
          <div>ID</div>
          <div>Tên đăng nhập</div>
          <div>Email</div>
          <div>Trạng thái</div>
        </div>

        {/* Dữ liệu người dùng */}
        <div className="divide-y">
          {users.length > 0 ? (
            users.map((user) => (
              <div
                key={user.id}
                className="grid grid-cols-4 p-4 text-gray-800 hover:bg-blue-50 transition-all duration-200"
              >
                <div>{user.id}</div>
                <div>{user.username}</div>
                <div>{user.email || "—"}</div>
                <div>
                  {user.active ? (
                    <span className="text-green-600 font-medium">Đang hoạt động</span>
                  ) : (
                    <span className="text-red-500 font-medium">Vô hiệu</span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-gray-500">Không có người dùng nào.</div>
          )}
        </div>
      </div>

      {/* Modal */}
      {openModal && (
        <div
          className="fixed flex inset-0 bg-black/70 w-screen h-screen justify-center items-center"
          onClick={() => setOpenModal(false)}
        >
          <div
            className="bg-white w-[800px] h-[800px] rounded-2xl shadow-lg p-10"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-semibold mb-4">Thêm người dùng mới</h2>
            <p className="text-gray-600">Tính năng đang phát triển...</p>
          </div>
        </div>
      )}
    </div>
  );
}
