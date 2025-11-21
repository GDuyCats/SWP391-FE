import React, { useEffect, useState } from "react";
import { X, FileText, User, Tag, DollarSign, Calendar, Star, MessageSquare } from "lucide-react";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";
import Toast from "../components/Toast";

export default function PostDetailSellerDialog({ open, onClose, postId }) {
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(false);
    const [type, setType] = useState("");
    const [msg, setMsg] = useState("");

    // Format tiền VND
    const formatPrice = (price) => {
        return parseFloat(price).toLocaleString("vi-VN") + "đ";
    };

    // Format ngày
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("vi-VN");
    };

    // Render cấp VIP
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
            const res = await api.get(`/post/${postId}/detail`);
            console.log(res);
            
            if (res.status === 200) {
                setPost(res.data.data);
                setToast(true);
                setType("success");
                setMsg("Lấy chi tiết bài đăng thành công");
            }
        } catch (error) {
            const status = error?.response?.status;
            const msg = error?.response?.data?.message;
            let errorMsg = "Không thể xem chi tiết bài đăng";
            setToast(true);
            setType("error");

            if (status === 401) errorMsg = msg || "Unauthorized";
            else if (status === 403) errorMsg = msg || "Không có quyền";
            else if (status === 404) errorMsg = msg || "Không tìm thấy bài đăng";
            else if (status === 500) errorMsg = msg || "Lỗi máy chủ";

            setMsg(errorMsg);
        } finally {
            setLoading(false);
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
                        <p className="mt-3 text-gray-500">Đang tải...</p>
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
                                            {formatPrice(post.price)}
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

                                {/* VIP Tier */}
                                {post.isVip && post.vipTier && (
                                    <div className="flex items-center gap-3">
                                        <Star className="w-5 h-5 text-yellow-600 fill-yellow-600" />
                                        <div>
                                            <p className="text-sm text-gray-500">Gói VIP</p>
                                            <p className="font-medium">{renderVipTier(post.vipTier)}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center gap-3">
                                    <Calendar className="w-5 h-5 text-gray-500" />
                                    <div>
                                        <p className="text-sm text-gray-500">Ngày đăng</p>
                                        <p className="font-medium">{formatDate(post.createdAt)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Nội dung (content) */}
                        {post.content && (
                            <div className="border-t pt-4">
                                <div className="flex items-start gap-3">
                                    <MessageSquare className="w-5 h-5 text-gray-500 mt-1" />
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-500 mb-1">Nội dung</p>
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
                    </div>
                )}
            </div>

            {/* Toast */}
            {toast && msg && <Toast type={type} msg={msg} />}
        </div>
    );
}