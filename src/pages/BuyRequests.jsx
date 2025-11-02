import React, { useEffect, useMemo, useState } from "react";
import Toast from "../components/Toast";
import { FileText, Trash2 } from "lucide-react";
import { api } from "../services/api";
import BuyerDialog from "../components/BuyerDialog";

export default function BuyRequests() {
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState("Tất cả");
  const [toast, setToast] = useState(null);
  const [id, setId] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);


  // ===== LẤY DANH SÁCH BÀI ĐĂNG =====
  async function getAllPosts() {
    try {
      const res = await api.get("/me/post");
      if (res.status === 200) {
        setPosts(res.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  }

  // ===== LỌC =====
  const filtered = useMemo(() => {
    if (filter === "Tất cả") return posts;
    return posts.filter((p) =>
      filter === "Xe"
        ? !p.title.toLowerCase().includes("pin")
        : p.title.toLowerCase().includes("pin")
    );
  }, [posts, filter]);

  const handleShowList = (id) => {
    setId(id);
    setOpenDialog(true);
    console.log("Xem chi tiết bài đăng:", id);
  };

  async function handleDelete(id){
    try {
      const res = await api.delete(`/delete/${id}`);
      console.log(res);
    } catch (error) {
      console.log(error);
    }
    
  };

  

  useEffect(() => {
    getAllPosts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bài đăng của bạn
          </h1>
          <p className="text-gray-600">
            Quản lý các bài đăng bán xe hoặc pin của bạn tại đây.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 font-medium">Lọc:</span>
            {["Tất cả", "Xe", "Pin"].map((opt) => (
              <button
                key={opt}
                onClick={() => setFilter(opt)}
                className={`px-4 py-1.5 rounded-full text-sm transition-all ${
                  filter === opt
                    ? "bg-gray-900 text-white shadow"
                    : "bg-white border border-gray-300 hover:bg-gray-100"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden bg-white border border-gray-200 rounded-2xl shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left text-gray-700">
              <thead className="bg-gray-100 text-gray-600 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-6 py-3">Tiêu đề</th>
                  <th className="px-6 py-3">Mô tả</th>
                  <th className="px-6 py-3 text-center">Loại</th>
                  <th className="px-6 py-3 text-center">Ngày đăng</th>
                  <th className="px-6 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((post) => (
                  <tr
                    key={post.id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    {/* Tiêu đề */}
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">
                        {post.title}
                      </span>
                    </td>

                    {/* Mô tả */}
                    <td className="px-6 py-4 max-w-md truncate text-gray-600">
                      {post.content}
                    </td>

                    {/* Loại */}
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`text-xs font-medium px-3 py-1 rounded-full ${
                          post.title.toLowerCase().includes("pin")
                            ? "bg-green-100 text-green-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {post.title.toLowerCase().includes("pin") ? "Pin" : "Xe"}
                      </span>
                    </td>

                    {/* Ngày */}
                    <td className="px-6 py-4 text-center text-gray-500">
                      {new Date(
                        post.createdAt || Date.now()
                      ).toLocaleDateString("vi-VN")}
                    </td>

                    {/* Thao tác */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => handleShowList(post.id)}
                          title="Xem chi tiết"
                          className="p-2.5 bg-gray-900 text-white rounded-full hover:bg-gray-700 transition cursor-pointer"
                        >
                          <FileText size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(post.id)}
                          title="Xóa bài đăng"
                          className="p-2.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      className="text-center text-gray-500 py-10 text-sm"
                    >
                      Không có bài đăng nào phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <BuyerDialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          postId={id}
        />

      {/* Toast */}
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
