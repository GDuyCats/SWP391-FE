import { useEffect, useState } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";
import Toast from "../components/Toast";
import { Eye, Trash2 } from "lucide-react";
import AlertDialog from "../components/AlertDialog";

function PostManagement() {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [msg, setMsg] = useState("");
    const [toast, setToast] = useState(false);
    const [type, setType] = useState("");
    const [openDialog, setOpenDialog] = useState(false);
    const [id, setId] = useState(0);

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

    async function handleDelete(id) {
        try {
            const res = await api.delete(`/delete/${id}`);
            console.log(res);
            if (res.status === 200) {
                setToast(true);
                setType("success");
                setMsg("Xóa bài đăng thành công");
            }
        } catch (error) {
            console.log(error);
            const status = error?.status;
            const msg = error?.response?.data;
            let errorMsg = "Không thể xóa bài đăng";
            setToast(true);
            setType("error");

            if (status === 401) {
                errorMsg = msg ? msg : "Unauthorize";
            } else if (status === 404) {
                errorMsg = msg ? msg : "Posts not found";
            } else if (status === 500) {
                errorMsg = msg ? msg : "Internal server error";
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
                                <th className="border-b px-4 py-3 text-center w-1/6">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {posts.length > 0 ? (
                                posts.map((post, index) => (
                                    <tr
                                        key={post.id}
                                        className={`hover:bg-blue-50 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-gray-50"
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
                                            <div className="flex justify-center gap-3">
                                                <button

                                                    className="text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                                                    title="Xem chi tiết"
                                                >
                                                    <Eye size={20} />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setOpenDialog(true);
                                                        setId(post.id);
                                                    }}
                                                    className="text-red-600 hover:text-red-800 transition-colors cursor-pointer"
                                                    title="Xóa bài đăng"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
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
            <AlertDialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                handleDelete={() => handleDelete(id)}
            />
            {toast && msg && (
                <Toast type={type} msg={msg} />
            )}
        </div>
    );
}

export default PostManagement;
