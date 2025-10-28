import { useEffect, useState } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";
import Toast from "../components/Toast";

function PostManagement() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [msg, setMsg] = useState("");
  const [toast, setToast] = useState(false);
  const [type, setType] = useState("");

  async function getPostsByUser() {
    try {
      const res = await api.get("/me/post");
      console.log(res);

      if (res.status === 200) {
        setPosts(res.data.data);
        setToast(true);
        setType("success");
        setMsg("Lấy danh sách bài đăng thành công");
      }
    } catch (error) {
      console.log(error);
      const status = error?.status;
      const msg = error?.response?.data;
      let errorMsg = "Không thể xem danh sách bài đăng";
      setToast(true);
      setType("error");
      if (status === 401) {
        errorMsg = msg ? msg : "Unauthorized";
      } else if (status === 500) {
        errorMsg = msg ? msg : "Lỗi máy chủ";
        setTimeout(() => navigate("/login"), 2000);
      }
      setMsg(errorMsg);
    } finally {
      setTimeout(() => setToast(false), 3000);
    }
  }

  useEffect(() => {
    getPostsByUser();
  }, []);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {toast && msg && <Toast type={type} msg={msg} />}

      <div className="max-w-6xl mx-auto bg-white shadow-md rounded-2xl p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          📋 Danh sách bài đăng của bạn
        </h2>

        <div className="overflow-x-auto rounded-lg">
          <table className="min-w-full border border-gray-200 text-sm text-gray-700">
            <thead className="bg-gray-100 text-gray-800 text-sm font-semibold">
              <tr>
                <th className="border-b px-4 py-3 text-left w-16">ID</th>
                <th className="border-b px-4 py-3 text-left w-1/4">Tiêu đề</th>
                <th className="border-b px-4 py-3 text-left w-1/2">Nội dung</th>
                <th className="border-b px-4 py-3 text-center w-1/6">Hình ảnh</th>
              </tr>
            </thead>
            <tbody>
              {posts.length > 0 ? (
                posts.map((post, index) => (
                  <tr
                    key={post.id}
                    className={`hover:bg-blue-50 transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="border-b px-4 py-3">{post.id}</td>
                    <td className="border-b px-4 py-3 font-medium text-gray-900">
                      {post.title}
                    </td>
                    <td className="border-b px-4 py-3 text-gray-700">
                      {post.content}
                    </td>
                    <td className="border-b px-4 py-3 text-center">
                      {post.image && post.image.length > 0 ? (
                        <div className="flex justify-center gap-2">
                          {post.image.map((img, idx) => (
                            <img
                              key={idx}
                              src={img}
                              alt="post"
                              className="w-16 h-16 object-cover rounded-md shadow-sm border"
                            />
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">
                          Không có hình
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="text-center py-6 text-gray-500 italic"
                  >
                    Không có bài đăng nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default PostManagement;
