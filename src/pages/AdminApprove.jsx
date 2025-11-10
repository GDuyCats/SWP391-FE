import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import Toast from "../components/Toast";
import { Eye, X } from "lucide-react"; // Thêm Eye và X
import PostDetailDialog from "../components/PostDetailDialog";

const AdminApprove = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(false);
  const [type, setType] = useState("");
  const [msg, setMessage] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    startDate: '',
    endDate: '',
    type: '',
    postCode: '',
    author: ''
  });

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const resp = await api.get('/admin/all', { params: filters });
      if (resp.data && resp.data.data && Array.isArray(resp.data.data)) {
        setPosts(resp.data.data);
      } else if (Array.isArray(resp.data)) {
        setPosts(resp.data);
      } else {
        setPosts([]);
        setError('Cấu trúc dữ liệu không như mong đợi');
      }
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu:', error);
      if (error.response?.status === 401) {
        const errorMsg = error.response?.data?.message || '';
        if (errorMsg.toLowerCase().includes('token') || errorMsg.toLowerCase().includes('unauthorized')) {
          setError('Phiên đăng nhập hết hạn. Đang chuyển đến trang đăng nhập...');
          setTimeout(() => {
            localStorage.removeItem('token');
            localStorage.removeItem('accessToken');
            navigate('/login');
          }, 2000);
          return;
        }
      }
      if (error.response?.status === 403) {
        setError('Bạn không có quyền truy cập. Vui lòng đăng nhập với tài khoản Admin/Staff.');
        return;
      }
      if (error.response) {
        setError(`Lỗi ${error.response.status}: ${error.response.data?.message || error.response.statusText || 'Không thể tải dữ liệu'}`);
      } else if (error.request) {
        setError('Không thể kết nối đến server.');
      } else {
        setError('Lỗi: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    fetchPosts();
  };

  const handleVerify = async (postId) => {
    try {
      const resp = await api.patch(`/admin/${postId}/verify`, { verifyStatus: "verify" });
      if (resp.status === 200) {
        setToast(true);
        setType("success");
        setMessage(resp.data.message);
        fetchPosts();
      }
    } catch (error) {
      console.error('Lỗi khi verify bài:', error);
      const status = error?.response?.status;
      const msg = error?.response?.data?.message;
      let errorMsg = 'Không thể duyệt bài đăng';
      setToast(true);
      setType("error");
      if (status === 400) {
        errorMsg = msg ? msg : 'Lỗi 400: verifyStatus không hợp lệ';
      } else if (status === 403) {
        errorMsg = msg ? msg : 'Lỗi 403: Không có quyền (hoặc Staff duyệt bài chưa active)';
      } else if (status === 404) {
        errorMsg = msg ? msg : 'Lỗi 404: Không tìm thấy bài đăng';
      } else if (status === 500) {
        errorMsg = msg ? msg : 'Lỗi 500: Lỗi server nội bộ';
      }
      setMessage(errorMsg);
    } finally {
      setTimeout(() => setToast(false), 3000);
    }
  };

  const renderStatus = (post) => {
    const isVerified = post.verifyStatus === 'verify';
    if (isVerified) {
      return (
        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
          Đã duyệt
        </span>
      );
    } else {
      return (
        <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium">
          Chờ duyệt
        </span>
      );
    }
  };

  const isVerified = (post) => {
    return post.verifyStatus === 'verify';
  };

  const renderCategory = (category) => {
    if (category === 'vehicle') return 'Xe';
    if (category === 'battery') return 'Pin';
    return category;
  };


  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-blue-800 text-white px-6 py-4 text-2xl font-semibold rounded-b-2xl shadow-md">
        QUẢN LÝ PHÊ DUYỆT
      </header>

      {/* Bộ lọc */}
      <div className="bg-white shadow-lg rounded-2xl p-6 m-6">
        <div className="grid grid-cols-4 gap-4 mb-4">
          <input name="search" value={filters.search} onChange={handleFilterChange} className="border p-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="Tìm theo tiêu đề..." />
          <select name="status" value={filters.status} onChange={handleFilterChange} className="border p-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400">
            <option value="">Tất cả trạng thái</option>
            <option value="verify">Đã duyệt</option>
            <option value="nonverify">Chờ duyệt</option>
          </select>
          <input name="startDate" value={filters.startDate} onChange={handleFilterChange} className="border p-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer" placeholder="Ngày bắt đầu" type="date" />
          <input name="endDate" value={filters.endDate} onChange={handleFilterChange} className="border p-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer" placeholder="Ngày kết thúc" type="date" />
        </div>
        <div className="grid grid-cols-4 gap-4">
          <select name="type" value={filters.type} onChange={handleFilterChange} className="border p-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400">
            <option value="">Tất cả loại</option>
            <option value="vehicle">Xe</option>
            <option value="battery">Pin</option>
          </select>
          <input name="postCode" value={filters.postCode} onChange={handleFilterChange} className="border p-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="Mã tin (ID)" />
          <input name="author" value={filters.author} onChange={handleFilterChange} className="border p-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="Người đăng" />
          <button onClick={handleSearch} className="bg-blue-600 text-white py-2 rounded-full hover:bg-blue-700 shadow-md transition cursor-pointer">
            Tìm kiếm
          </button>
        </div>
      </div>

      {/* Bảng dữ liệu */}
      <div className="bg-white shadow-lg rounded-2xl m-6 flex-1 overflow-auto">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500 text-lg">Đang tải dữ liệu...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col justify-center items-center h-64 p-4">
            <p className="text-red-500 text-lg mb-4 text-center">{error}</p>
            <button onClick={fetchPosts} className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 cursor-pointer">
              Thử lại
            </button>
          </div>
        ) : posts.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500 text-lg">Không có bài đăng nào</p>
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200 text-left">
                <th className="p-3 border-b">ID</th>
                <th className="p-3 border-b">Tiêu đề</th>
                <th className="p-3 border-b">Người đăng</th>
                <th className="p-3 border-b">Loại</th>
                <th className="p-3 border-b">Giá</th>
                <th className="p-3 border-b">Ngày đăng</th>
                <th className="p-3 border-b">Trạng thái</th>
                <th className="p-3 border-b text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50 transition">
                  <td className="p-3 border-b">{post.id}</td>
                  <td className="p-3 border-b font-medium max-w-xs truncate" title={post.title}>{post.title}</td>
                  <td className="p-3 border-b">{post.User?.username || 'N/A'}</td>
                  <td className="p-3 border-b">{renderCategory(post.category)}</td>
                  <td className="p-3 border-b">{parseFloat(post.price).toLocaleString('vi-VN')}đ</td>
                  <td className="p-3 border-b">{new Date(post.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td className="p-3 border-b">{renderStatus(post)}</td>
                  <td className="p-3 border-b text-center">
                    <div className="flex justify-center gap-2 items-center">
                      {/* Nút Xem chi tiết - KHÔNG GỌI API */}
                      <button

                        onClick={() => {
                          setSelectedPost(post.id)
                          setOpenDialog(true)
                        }
                        }
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-full transition"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-5 h-5" />
                      </button>

                      {/* Nút Duyệt bài - giữ nguyên */}
                      {!isVerified(post) ? (
                        <button
                          onClick={() => handleVerify(post.id)}
                          className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 shadow-sm transition cursor-pointer text-sm"
                        >
                          Duyệt bài
                        </button>
                      ) : (
                        <button
                          disabled
                          className="bg-gray-300 text-white px-4 py-2 rounded-full cursor-not-allowed text-sm"
                        >
                          Đã duyệt
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>



      <PostDetailDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        postId={selectedPost}
      />

      {toast && <Toast type={type} msg={msg} />}
    </div>
  );
};

export default AdminApprove;