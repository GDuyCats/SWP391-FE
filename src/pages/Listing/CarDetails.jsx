import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { api } from "../../services/api";
import Toast from "../../components/Toast";
import { Star, Calendar, DollarSign, CheckCircle, AlertCircle, Battery, Zap, Clock, Tag, User } from "lucide-react";

function CarDetails() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(false);
  const [type, setType] = useState("");
  const [msg, setMsg] = useState("");

  async function getPostDetails() {
    setLoading(true);
    try {
      const res = await api.get(`/posts/${parseInt(id)}`);
      console.log("Full API Response:", res.data); // DEBUG

      let postData = null;

      // 1. Ưu tiên: res.data.data
      if (res.data?.data) {
        postData = res.data.data;
      }
      // 2. Hoặc: res.data.post
      else if (res.data?.post) {
        postData = res.data.post;
      }
      // 3. Hoặc: res.data chính là post
      else if (res.data?.id) {
        postData = res.data;
      }

      if (postData) {
        setPost(postData);
        showToast("success", "Lấy chi tiết bài đăng thành công");
      } else {
        showToast("error", "Dữ liệu bài đăng không hợp lệ");
      }
    } catch (error) {
      console.log("API Error:", error);
      const status = error?.response?.status;
      let errorMsg = "Không thể xem chi tiết bài đăng";

      if (status === 400) errorMsg = "ID bài đăng không hợp lệ";
      else if (status === 404) errorMsg = "Bài đăng không tồn tại hoặc đã bị ẩn";
      else if (status === 500) errorMsg = "Lỗi máy chủ";

      showToast("error", errorMsg);
    } finally {
      setLoading(false);
    }


  };

  const showToast = (t, m) => {
    setType(t);
    setMsg(m);
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  };

  useEffect(() => {
    if (id) getPostDetails();
  }, [id]);

  // === VIP BADGE ===
  const renderVipBadge = () => {
    if (!post?.isVip || !post?.vipTier) return null;
    const tiers = {
      silver: { label: "VIP Bạc", color: "text-gray-700", bg: "bg-gray-100" },
      gold: { label: "VIP Vàng", color: "text-yellow-700", bg: "bg-yellow-100" },
      platinum: { label: "VIP Bạch kim", color: "text-cyan-700", bg: "bg-cyan-100" },
      diamond: { label: "VIP Kim cương", color: "text-purple-700", bg: "bg-purple-100" }
    };
    const info = tiers[post.vipTier.toLowerCase()] || tiers.silver;
    return (
      <div className={`absolute top-4 left-4 flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold shadow-md ${info.bg} ${info.color}`}>
        <Star className="w-4 h-4 fill-current" />
        {info.label}
      </div>
    );
  };

  // === ĐỊNH DẠNG ===
  const formatPrice = (price) => (!price ? "Liên hệ" : Number(price).toLocaleString("vi-VN") + " ₫");
  const formatDate = (date) => new Date(date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Quay lại */}
          <div className="mb-6">
            <Link to="/" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
              ← Về trang chủ
            </Link>
          </div>

          {/* LOADING */}
          {loading ? (
            <div className="bg-white rounded-2xl shadow-md p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
              <p className="mt-3 text-gray-500">Đang tải chi tiết...</p>
            </div>
          ) : post ? (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Ảnh + VIP */}
              <div className="relative">
                <img
                  src={post.thumbnail || post.image?.[0] || "https://cdn.thepennyhoarder.com/wp-content/uploads/2022/05/21141022/hybrid-vs-electric-final.jpg"}
                  alt={post.title}
                  className="w-full h-64 md:h-80 object-cover"
                />
                {renderVipBadge()}
              </div>

              <div className="p-6 md:p-8">
                {/* Tiêu đề + Người đăng */}
                <div className="mb-6">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{post.title}</h1>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="w-4 h-4" />
                    <span className="font-medium">
                      {post?.User?.username || "Ẩn danh"}
                    </span>
                  </div>
                </div>

                {/* Giá + Trạng thái */}
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-6 h-6 text-green-600" />
                    <span className="text-2xl font-bold text-green-600">{formatPrice(post.price)}</span>
                  </div>
                  {post.verifyStatus === "verify" && (
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-green-600 font-medium">Đã duyệt</span>
                    </div>
                  )}
                </div>

                {/* Thông tin cơ bản */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-gray-700">
                  {post.brand && (
                    <div className="flex items-center gap-3">
                      <Tag className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Hãng xe</p>
                        <p className="font-medium">{post.brand}</p>
                      </div>
                    </div>
                  )}
                  {post.model && (
                    <div className="flex items-center gap-3">
                      <Tag className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Dòng xe</p>
                        <p className="font-medium">{post.model}</p>
                      </div>
                    </div>
                  )}
                  {post.category && (
                    <div className="flex items-center gap-3">
                      <Tag className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Danh mục</p>
                        <p className="font-medium capitalize">{post.category}</p>
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
                  {post.updatedAt && (
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Cập nhật</p>
                        <p className="font-medium">{formatDate(post.updatedAt)}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* MÔ TẢ */}
                {post.content && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Mô tả chi tiết</h3>
                    <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg leading-relaxed">{post.content}</p>
                  </div>
                )}

                {/* PIN KÈM THEO */}
                {post.hasBattery && (
                  <div className="mb-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
                    <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                      <Battery className="w-6 h-6" /> Thông tin pin kèm theo
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {post.battery_brand && (
                        <div>
                          <p className="text-gray-600">Thương hiệu pin</p>
                          <p className="font-medium">{post.battery_brand}</p>
                        </div>
                      )}
                      {post.battery_model && (
                        <div>
                          <p className="text-gray-600">Model pin</p>
                          <p className="font-medium">{post.battery_model}</p>
                        </div>
                      )}
                      {post.battery_capacity != null && (
                        <div>
                          <p className="text-gray-600">Dung lượng</p>
                          <p className="font-medium">{post.battery_capacity} kWh</p>
                        </div>
                      )}
                      {post.battery_type && (
                        <div>
                          <p className="text-gray-600">Loại pin</p>
                          <p className="font-medium">{post.battery_type}</p>
                        </div>
                      )}
                      {post.battery_range != null && (
                        <div>
                          <p className="text-gray-600">Tầm hoạt động</p>
                          <p className="font-medium">{post.battery_range} km</p>
                        </div>
                      )}
                      {post.battery_condition && (
                        <div>
                          <p className="text-gray-600">Tình trạng pin</p>
                          <p className="font-medium">{post.battery_condition}</p>
                        </div>
                      )}
                      {post.charging_time != null && (
                        <div>
                          <p className="text-gray-600">Thời gian sạc</p>
                          <p className="font-medium">{post.charging_time} giờ</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Nút hành động */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-full hover:bg-blue-700 transition font-medium text-lg shadow-md">
                    Gửi yêu cầu mua
                  </button>
                  <button className="flex-1 border border-gray-300 text-gray-900 py-3 px-6 rounded-full hover:bg-gray-50 transition font-medium text-lg">
                    Yêu cầu thêm thông tin
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-md p-12 text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Không tìm thấy bài đăng</h2>
              <p className="text-gray-600 mb-4">ID: {id}</p>
              <Link to="/" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700">
                Quay lại trang chủ
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />

      {toast && <Toast type={type} msg={msg} />}
    </div>
  );
}
export default CarDetails;