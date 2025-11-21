import React, { useEffect, useState } from "react";
import {
  X, FileText, User, Tag, DollarSign, Calendar, MessageSquare, Star
} from "lucide-react";
import { PhotoProvider, PhotoView } from "react-photo-view";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";
import Toast from "../components/Toast";

export default function PostDetailDialog({ open, onClose, postId }) {
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(false);
  const [type, setType] = useState("");
  const [msg, setMsg] = useState("");
  const [id, setId] = useState(0);

  // Hàm render cấp VIP
  const renderVipTier = (tier) => {
    const tiers = {
      silver: { label: "Bạc", color: "text-gray-500", bg: "bg-gray-100" },
      gold: { label: "Vàng", color: "text-yellow-600", bg: "bg-yellow-50" },
      platinum: { label: "Bạch kim", color: "text-cyan-600", bg: "bg-cyan-50" },
      diamond: { label: "Kim cương", color: "text-purple-600", bg: "bg-purple-50" }
    };
    const info = tiers[tier?.toLowerCase()] || tiers.silver;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${info.color} ${info.bg}`}>
        {info.label}
      </span>
    );
  };

  async function getPostDetail() {
    setLoading(true);
    try {
      const res = await api.get(`/admin/${postId}/detail`);
      console.log(res);
      if (res.status === 200) {
        setPost(res.data.data);
        setToast(true);
        setType("success");
        setMsg("Lấy chi tiết bài đăng thành công");
      }
    } catch (error) {
      console.log(error);
      const status = error?.response?.status;
      const msg = error?.response?.data?.message;
      let errorMsg = "Không thể xem chi tiết bài đăng";
      setToast(true);
      setType("error");

      if (status === 401) {
        errorMsg = msg || "Unauthorized";
      } else if (status === 500) {
        errorMsg = msg || "Lỗi máy chủ";
        setTimeout(() => navigate("/login"), 2000);
      } else if (status === 403) {
        errorMsg = msg || "Không có quyền (hoặc Staff xem bài chưa active)";
      } else if (status === 404) {
        errorMsg = msg || "Không tìm thấy bài đăng";
      }
      setMsg(errorMsg);
    } finally {
      setLoading(false);
      setTimeout(() => setToast(false), 3000);
    }
  }

  async function handleDelete(id) {
    try {
      const res = api.delete(`/admin/${id}/delete`);
      console.log(res);
      if (res.status === 200) {

        setToast(true);
        setType("success");
        setMsg("Xóa bài đăng thành công");
      }
    } catch (error) {
      const status = error?.response?.status;
      const msg = error?.response?.data;
      let errorMsg = "Không thể xóa bài đăng";
      setToast(true);
      setType("error");
      if (status === 401) errorMsg = msg || "Unauthorized";
      else if (status === 404) errorMsg = msg || "Bài đăng không tồn tại";
      else if (status === 500) errorMsg = msg || "Lỗi máy chủ";
      setMsg(errorMsg);
    } finally {
      setTimeout(() => setToast(false), 3000);
    }
  }

  useEffect(() => {
    if (open && postId) {
      getPostDetail();
    }
  }, [open, postId]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 relative">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Tiêu đề */}
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2 text-gray-800">
          <FileText className="w-7 h-7 text-blue-600" />
          Chi tiết bài đăng
        </h2>

        {/* Loading */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            <p className="mt-3 text-gray-500">Đang tải chi tiết...</p>
          </div>
        ) : !post ? (
          <div className="text-center py-12 text-gray-500">
            Không tìm thấy bài đăng.
          </div>
        ) : (
          <div className="space-y-6">
            {/* Thông tin chính */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Tag className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Mã bài đăng</p>
                    <p className="font-semibold text-lg">#{post.id}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Tiêu đề</p>
                    <p className="font-medium text-gray-900">{post.title}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-500">Giá</p>
                    <p className="font-semibold text-lg text-green-600">
                      {parseFloat(post.price).toLocaleString("vi-VN")}đ
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Người đăng</p>
                    <p className="font-medium">{post.User?.username || "N/A"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Tag className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Loại</p>
                    <p className="font-medium capitalize">
                      {post.category === "vehicle" ? "Xe" : post.category === "battery" ? "Pin" : post.category}
                    </p>
                  </div>
                </div>

                {/* === CHỈ HIỂN THỊ vipTier === */}
                {post.vipTier && (
                  <div className="flex items-center gap-3">
                    <Star className="w-5 h-5 text-yellow-600 fill-yellow-600" />
                    <div>
                      <p className="text-sm text-gray-500">Gói VIP</p>
                      <p className="font-medium">
                        {renderVipTier(post.vipTier)}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Ngày đăng</p>
                    <p className="font-medium">
                      {new Date(post.createdAt).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mô tả */}
            {post.content && (
              <div className="border-t pt-4">
                <div className="flex items-start gap-3">
                  <MessageSquare className="w-5 h-5 text-gray-500 mt-1" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-1">Mô tả</p>
                    <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                      {post.content}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <PhotoProvider>
              {post.image && post.image.length > 0 ? (
                post.image.map((img, index) => (
                  <PhotoView key={index} src={img}>
                    <div key={index} className="overflow-hidden rounded-lg shadow-lg">
                      <img
                        src={img}
                        alt={`${post.title} - ${index + 1}`}
                        className="w-full h-48 object-cover hover:scale-10</div>5 transition-transform duration-300 cursor-pointer"
                      />
                    </div>
                  </PhotoView>
                ))
              ) : (
                <div className="md:col-span-2 text-center py-12">
                  <Image className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg text-gray-600">
                    No additional images available
                  </p>
                  <p className="text-sm text-gray-500">
                    Only the main project image is available for viewing
                  </p>
                </div>
              )}
            </PhotoProvider>

              {/* Trạng thái */}
              <div className="border-t pt-4 flex items-center justify-between w-full">
                <div className="flex items-center">
                <div className="w-5 h-5">
                  {post.verifyStatus === "verify" ? (
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  ) : (
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Trạng thái</p>
                  <p className="font-medium">
                    {post.verifyStatus === "verify" ? "Đã duyệt" : "Chờ duyệt"}
                  </p>
                </div>
</div>
                <div>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 shadow-sm transition cursor-pointer text-sm"
                  >
                    Xóa bài
                  </button>
                </div>




            </div>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && msg && <Toast type={type} msg={msg} />}
    </div>
  );
}