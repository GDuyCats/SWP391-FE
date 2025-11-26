import React, { useEffect, useState } from "react";
import { useParams, useLocation, Link, useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { api } from "../../services/api";
import Toast from "../../components/Toast";

/**
 * Page BatteryDetails - Trang chi tiết bài đăng bán Pin
 *
 * Route: /listing/battery/:id
 *
 * Chức năng:
 * - Hiển thị chi tiết đầy đủ về pin (ảnh, giá, thông tin kỹ thuật, mô tả)
 * - Hiển thị VIP badge nếu là bài VIP
 * - Cho phép gửi yêu cầu mua pin
 * - Fetch data từ API nếu không có trong location.state
 *
 * Data Source:
 * 1. location.state.post (nếu navigate từ listing với state)
 * 2. API GET /posts/:id (nếu access trực tiếp URL)
 *
 * Flow:
 * 1. User click vào pin card ở listing → navigate với state
 * 2. Hiển thị chi tiết pin
 * 3. User click "Gửi yêu cầu mua pin"
 * 4. Gọi API POST /PurchaseRequests
 * 5. Hiển thị toast thành công/lỗi
 */
function BatteryDetails() {
  // ============ HOOKS ============
  const { id } = useParams(); // ID từ URL params
  const { state } = useLocation(); // State truyền từ navigate
  const navigate = useNavigate();

  // ============ STATE MANAGEMENT ============
  const [post, setPost] = useState(state?.post || null); // Post data
  const [loading, setLoading] = useState(!state?.post); // Loading nếu không có state
  const [msg, setMsg] = useState(""); // Toast message
  const [toast, setToast] = useState(false); // Show/hide toast
  const [type, setType] = useState(""); // Toast type (success/error)

  // ============ HELPER FUNCTIONS ============

  /**
   * Hàm lấy thông tin hiển thị cho từng VIP tier
   * @param {string} vipTier - Loại VIP (silver/gold/diamond)
   * @returns {object} - Object chứa label, màu sắc, background, border
   */
  const getVipTierInfo = (vipTier) => {
    const tiers = {
      silver: {
        label: "Bạc",
        color: "text-gray-700",
        bg: "bg-gray-100",
        border: "border-gray-400",
      },
      gold: {
        label: "Vàng",
        color: "text-yellow-700",
        bg: "bg-yellow-100",
        border: "border-yellow-400",
      },
      diamond: {
        label: "Kim Cương",
        color: "text-cyan-700",
        bg: "bg-cyan-100",
        border: "border-cyan-500",
      },
    };

    return tiers[vipTier?.toLowerCase()] || tiers.silver;
  };

  // ============ EFFECTS ============

  /**
   * useEffect: Fetch post data từ API nếu không có trong state
   * - Nếu có state.post: sử dụng luôn (navigate từ listing)
   * - Nếu không có: gọi API GET /posts/:id (access trực tiếp URL)
   */
  useEffect(() => {
    // Nếu không có dữ liệu từ state, fetch từ API
    if (!post && id) {
      const fetchPost = async () => {
        try {
          const res = await api.get(`/posts/${id}`);
          if (res.status === 200) {
            console.log("Battery post data:", res.data);
            setPost(res.data);
          }
        } catch (error) {
          console.error("Error fetching post:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchPost();
    } else if (post) {
      console.log("Battery post from state:", post);
    }
  }, [id, post]);

  /**
   * Hàm format giá tiền sang định dạng VND
   * @param {number} price - Giá cần format
   * @returns {string} - Chuỗi giá đã format (VD: "50.000.000 ₫")
   */
  const formatPrice = (price) => {
    if (!price) return "Liên hệ";
    return Number(price).toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  };

  /**
   * Hàm xử lý khi user gửi yêu cầu mua pin
   *
   * Flow:
   * 1. Gọi API POST /PurchaseRequests với postId và message
   * 2. Nếu thành công (201): hiển thị toast success
   * 3. Nếu lỗi: hiển thị toast error tương ứng
   *
   * Error Handling:
   * - 400: Bài đăng chưa được xác thực
   * - 403: Không đủ quyền (Admin/Staff không được phép mua)
   * - 404: Không tìm thấy bài đăng
   * - 409: User đã có purchase request active cho bài này
   * - 500: Lỗi server → redirect login sau 2s
   */
  async function handleRequest() {
    console.log(id);

    try {
      // Gọi API tạo purchase request
      const res = await api.post("/PurchaseRequests", {
        postId: id,
        message: "Tôi muốn mua pin này",
      });
      console.log(res);

      // Nếu thành công
      if (res.status === 201) {
        setToast(true);
        setType("success");
        setMsg(res.data.message);
      }
    } catch (error) {
      console.log(error);
      const status = error?.status;
      const msg = error?.response?.data?.message;
      let errorMsg = "Không thể yêu cầu mua pin";

      setToast(true);
      setType("error");

      // Xử lý các lỗi dựa trên HTTP status code
      if (status === 400) {
        errorMsg = msg ? msg : "Bài đăng chưa được xác thực";
      } else if (status === 403) {
        errorMsg = msg ? msg : "Không đủ quyền (Admin/Staff không được phép)";
      } else if (status === 404) {
        errorMsg = msg ? msg : "Không tìm thấy bài đăng";
      } else if (status === 409) {
        errorMsg = msg
          ? msg
          : "Người mua đã có hợp đồng đang hiệu lực cho bài này";
      } else if (status === 500) {
        errorMsg = msg ? msg : "Lỗi máy chủ";
        // Redirect về login sau 2s nếu lỗi server
        setTimeout(() => navigate("/login"), 2000);
      }
      setMsg(errorMsg);
    } finally {
      // Tự động ẩn toast sau 3s
      setTimeout(() => setToast(false), 3000);
    }
  }

  // ============ RENDER UI ============

  // ===== Loading State =====
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-gray-600">Đang tải...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ===== Main Content =====
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* ===== BACK BUTTON ===== */}
          <div className="mb-6">
            <Link
              to="/batteries"
              className="text-sm text-gray-600 text-weight-bold hover:underline"
            >
              ← Về danh sách pin
            </Link>
          </div>

          {/* ===== POST CONTENT ===== */}
          {post ? (
            (() => {
              // Lấy VIP info để style card
              const vipInfo =
                post.isVip && post.vipTier
                  ? getVipTierInfo(post.vipTier)
                  : null;

              return (
                <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
                  {/* ===== SECTION 1: Hình ảnh + VIP Badge ===== */}
                  <div className="relative">
                    {/* Grid hiển thị ảnh pin: 2 cột responsive */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-100">
                      {/* Nếu có ảnh: map và hiển thị từng ảnh */}
                      {post.image && post.image.length > 0 ? (
                        post.image.map((img, index) => (
                          <img
                            key={index}
                            src={img}
                            alt={`${post.title} - ${index + 1}`}
                            className="w-full h-64 object-cover rounded-lg"
                          />
                        ))
                      ) : (
                        // Nếu không có ảnh: hiển thị ảnh placeholder
                        <img
                          src="https://afdc.energy.gov/files/u/publication/ev_battery_closeup.jpg"
                          alt={post.title}
                          className="w-full h-64 object-cover rounded-lg"
                        />
                      )}
                    </div>

                    {/* VIP Badge overlay trên ảnh (góc trên trái) */}
                    {vipInfo && (
                      <div
                        className={`absolute top-8 left-8 px-4 py-2 rounded-full text-sm font-semibold shadow-lg ${vipInfo.bg} ${vipInfo.color}`}
                      >
                        {vipInfo.label}
                      </div>
                    )}
                  </div>

                  {/* ===== SECTION 2: Thông tin chi tiết ===== */}
                  <div className="p-8">
                    {/* Header: Tiêu đề, Giá, Người đăng */}
                    <div className="border-b pb-6 mb-6">
                      <h1 className="text-3xl font-bold mb-3 text-gray-900">
                        {post.title}
                      </h1>
                      <p className="text-3xl text-green-600 font-bold mb-4">
                        {formatPrice(post.price)}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <p>
                          Người đăng:{" "}
                          <span className="font-semibold">
                            {post.User?.username || post.username || "N/A"}
                          </span>
                        </p>
                        {post.phone && (
                          <p>
                            Số điện thoại:{" "}
                            <span className="font-semibold">{post.phone}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Mô tả chi tiết */}
                    <div className="mb-6">
                      <h2 className="text-xl font-semibold mb-3 text-gray-900">
                        Mô tả
                      </h2>
                      {/* whitespace-pre-line để giữ line breaks */}
                      <p className="text-gray-700 whitespace-pre-line">
                        {post.content}
                      </p>
                    </div>

                    {/* Thông tin kỹ thuật pin */}
                    <div className="mb-6">
                      <h2 className="text-xl font-semibold mb-4 text-gray-900">
                        Thông tin kỹ thuật pin
                      </h2>
                      {/* Kiểm tra có ít nhất 1 field thông tin pin */}
                      {post.battery_brand ||
                      post.battery_model ||
                      post.battery_capacity ||
                      post.battery_type ||
                      post.battery_range ||
                      post.battery_condition ||
                      post.charging_time ? (
                        /* Grid 3 cột hiển thị thông tin pin - chỉ render field có data */
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                          {post.battery_brand && (
                            <div className="bg-blue-50 p-4 rounded-lg">
                              <p className="text-sm text-gray-600 mb-1">
                                Hãng pin
                              </p>
                              <p className="font-semibold text-gray-900">
                                {post.battery_brand}
                              </p>
                            </div>
                          )}
                          {post.battery_model && (
                            <div className="bg-blue-50 p-4 rounded-lg">
                              <p className="text-sm text-gray-600 mb-1">
                                Model pin
                              </p>
                              <p className="font-semibold text-gray-900">
                                {post.battery_model}
                              </p>
                            </div>
                          )}
                          {post.battery_type && (
                            <div className="bg-blue-50 p-4 rounded-lg">
                              <p className="text-sm text-gray-600 mb-1">
                                Loại pin
                              </p>
                              <p className="font-semibold text-gray-900">
                                {post.battery_type}
                              </p>
                            </div>
                          )}
                          {post.battery_capacity && (
                            <div className="bg-blue-50 p-4 rounded-lg">
                              <p className="text-sm text-gray-600 mb-1">
                                Dung lượng pin
                              </p>
                              <p className="font-semibold text-gray-900">
                                {post.battery_capacity} kWh
                              </p>
                            </div>
                          )}
                          {post.battery_range && (
                            <div className="bg-blue-50 p-4 rounded-lg">
                              <p className="text-sm text-gray-600 mb-1">
                                Quãng đường di chuyển
                              </p>
                              <p className="font-semibold text-gray-900">
                                {post.battery_range} km
                              </p>
                            </div>
                          )}
                          {post.battery_condition && (
                            <div className="bg-blue-50 p-4 rounded-lg">
                              <p className="text-sm text-gray-600 mb-1">
                                Tình trạng pin
                              </p>
                              <p className="font-semibold text-gray-900">
                                {post.battery_condition}
                              </p>
                            </div>
                          )}
                          {post.charging_time && (
                            <div className="bg-blue-50 p-4 rounded-lg">
                              <p className="text-sm text-gray-600 mb-1">
                                Thời gian sạc
                              </p>
                              <p className="font-semibold text-gray-900">
                                {post.charging_time} giờ
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        /* Fallback: Không có thông tin kỹ thuật */
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <p className="text-gray-600">
                            Thông tin kỹ thuật pin chưa được cập nhật cho bài
                            đăng này.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Xe tương thích */}
                    <div className="mb-6">
                      <h2 className="text-xl font-semibold mb-4 text-gray-900">
                        Xe tương thích
                      </h2>
                      {post.compatible_models ? (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-gray-700">
                            {post.compatible_models}
                          </p>
                        </div>
                      ) : (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-gray-500 italic">
                            Chưa có thông tin xe tương thích
                          </p>
                        </div>
                      )}
                    </div>

                    {/* ===== SECTION 3: Nút hành động ===== */}
                    <div className="pt-6">
                      <button
                        onClick={handleRequest}
                        className="w-full bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium"
                      >
                        Gửi yêu cầu mua pin
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()
          ) : (
            /* ===== Fallback: Không tìm thấy post ===== */
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <h2 className="text-xl font-semibold mb-2">
                Chi tiết pin không tìm thấy
              </h2>
              <p className="text-gray-600 mb-4">
                Không có dữ liệu chi tiết cho pin id: {id}
              </p>
              <div>
                <Link
                  to="/batteries"
                  className="inline-block bg-gray-900 text-white px-4 py-2 rounded-md"
                >
                  Quay lại
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />

      {/* ===== TOAST NOTIFICATION ===== */}
      {toast && <Toast msg={msg} type={type} />}
    </div>
  );
}

export default BatteryDetails;
