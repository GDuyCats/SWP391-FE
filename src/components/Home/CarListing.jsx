import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../services/api";
import Toast from "../Toast";
import { useNavigate } from "react-router-dom";
import { Star } from "lucide-react";

const CarListing = ({ limit, showViewAll = false }) => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [msg, setMsg] = useState("");
  const [toast, setToast] = useState(false);
  const [type, setType] = useState("");

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

  const renderVipBadge = (post) => {
    if (!post.isVip || !post.vipTier) return null;

    const info = getVipTierInfo(post.vipTier);

    return (
      <div
        className={`absolute top-4 left-4 flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold shadow-md ${info.bg} ${info.color}`}
      >
        <Star className="w-4 h-4 fill-current" />
        {info.label}
      </div>
    );
  };

  async function handleRequest(id) {
    console.log(id);
    try {
      const res = await api.post("/PurchaseRequests", {
        postId: id,
        message: "Tôi muốn mua xe này",
      });
      console.log(res);
      if (res.status === 201) {
        setToast(true);
        setType("success");
        setMsg(res.data.message);
      }
    } catch (error) {
      console.log(error);
      const status = error?.status;
      const msg = error?.response?.data?.message;
      let errorMsg = "Không thể yêu cầu mua xe";

      setToast(true);
      setType("error");
      if (status === 400) {
        errorMsg = msg ? msg : "Bài đăng chưa được xác thực";
      } else if (status === 403) {
        errorMsg = msg ? msg : "Không đủ quyền (Admin/Staff không được phép";
      } else if (status === 404) {
        errorMsg = msg ? msg : "Không tìm thấy bài đăng";
      } else if (status === 409) {
        errorMsg = msg
          ? msg
          : "Người mua đã có hợp đồng đang hiệu lực cho bài này";
      } else if (status === 500) {
        errorMsg = msg ? msg : "Lỗi máy chủ";
        setTimeout(() => navigate("/login"), 2000);
      }
      setMsg(errorMsg);
    } finally {
      setTimeout(() => setToast(false), 3000);
    }
  }

  // Hàm xác định thứ tự VIP tier (cao đến thấp)
  const getVipTierOrder = (vipTier) => {
    const tierOrder = {
      diamond: 3,
      gold: 2,
      silver: 1,
    };
    return vipTier ? tierOrder[vipTier.toLowerCase()] || 0 : 0;
  };

  // Hàm sắp xếp posts theo VIP tier và thời gian
  const sortPosts = (posts) => {
    return posts.sort((a, b) => {
      // 1. Sắp xếp theo VIP (VIP trước, không VIP sau)
      const aIsVip = a.isVip ? 1 : 0;
      const bIsVip = b.isVip ? 1 : 0;

      if (aIsVip !== bIsVip) {
        return bIsVip - aIsVip; // VIP posts trước
      }

      // 2. Nếu cả 2 đều VIP, sắp xếp theo tier (Kim Cương > Vàng > Bạc)
      if (aIsVip && bIsVip) {
        const aTierOrder = getVipTierOrder(a.vipTier);
        const bTierOrder = getVipTierOrder(b.vipTier);

        if (aTierOrder !== bTierOrder) {
          return bTierOrder - aTierOrder; // Tier cao hơn trước
        }
      }

      // 3. Nếu cùng VIP tier (hoặc cả 2 không VIP), sắp xếp theo thời gian đăng (mới nhất trước)
      const aDate = new Date(a.createdAt || a.created_at || 0);
      const bDate = new Date(b.createdAt || b.created_at || 0);
      return bDate - aDate; // Bài mới hơn trước
    });
  };

  async function getAllPosts() {
    try {
      // Thêm filter params để lấy xe điện đã verify
      const res = await api.get(
        "/posts?category=vehicle&verifyStatus=verify&limit=1000"
      );
      console.log("Full API Response:", res);
      console.log("API Data:", res.data);

      if (res.status === 200 || res.status === 304) {
        const allPosts = res.data.data || res.data;
        console.log("All posts:", allPosts);
        console.log("Total posts:", allPosts.length);

        // Fallback: Filter ở frontend nếu backend không support query params
        let evPosts = Array.isArray(allPosts)
          ? allPosts.filter(
              (post) =>
                post.category === "vehicle" && post.verifyStatus === "verify"
            )
          : allPosts;

        // Sắp xếp posts theo VIP tier và thời gian
        if (Array.isArray(evPosts)) {
          evPosts = sortPosts(evPosts);
        }

        console.log("EV posts (sorted):", evPosts);
        console.log(
          "EV posts count:",
          Array.isArray(evPosts) ? evPosts.length : 0
        );

        setPosts(Array.isArray(evPosts) ? evPosts : []);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  }

  useEffect(() => {
    getAllPosts();
  }, []);

  const formatPrice = (price) => {
    if (!price) return "Liên hệ";
    return Number(price).toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  };

  console.log(posts);

  // Giới hạn số lượng posts hiển thị nếu có limit
  const displayedPosts = limit ? posts.slice(0, limit) : posts;

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Tiêu đề */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Xe điện nổi bật
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Khám phá những chiếc xe điện đã qua sử dụng chất lượng tốt nhất
          </p>
        </div>

        {/* Danh sách xe */}
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-2">
              Chưa có bài đăng nào được xác thực
            </p>
            <p className="text-gray-400 text-sm">Vui lòng quay lại sau</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayedPosts.map((post) => {
              const vipInfo = post.isVip ? getVipTierInfo(post.vipTier) : null;

              return (
                <div
                  key={post.id}
                  className={`relative bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 ${
                    post.isVip ? `border-2 ${vipInfo.border}` : ""
                  }`}
                >
                  {/* Ảnh */}
                  <div className="relative">
                    <img
                      src={
                        post.image && post.image.length > 0
                          ? post.image[0]
                          : "https://cdn.thepennyhoarder.com/wp-content/uploads/2022/05/21141022/hybrid-vs-electric-final.jpg"
                      }
                      alt={post.title}
                      className="w-full h-56 object-cover"
                    />

                    {/* Huy hiệu VIP */}
                    {post.isVip && vipInfo && (
                      <div
                        className={`absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-semibold shadow-md ${vipInfo.bg} ${vipInfo.color}`}
                      >
                        {vipInfo.label}
                      </div>
                    )}
                  </div>

                  {/* Nội dung */}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {post.content}
                    </p>

                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {post.username}
                    </p>

                    {/* Giá tiền */}
                    <div className="flex justify-between items-center text-sm mb-4">
                      <span className="text-gray-600">Giá:</span>
                      <span className="font-semibold text-green-600 text-lg">
                        {formatPrice(post.price)}
                      </span>
                    </div>

                    {/* Nút */}
                    <div className="flex space-x-3">
                      <Link
                        to={`/listing/ev/${post.id}`}
                        state={{ post }}
                        className="flex-1"
                      >
                        <button className="w-full bg-gray-900 text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors font-medium">
                          Xem chi tiết
                        </button>
                      </Link>
                      <button
                        onClick={() => handleRequest(post.id)}
                        className="flex-1 border border-gray-300 text-gray-900 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors font-medium"
                      >
                        Gửi yêu cầu
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Nút xem thêm */}
        {posts.length > 0 && showViewAll && (
          <div className="text-center mt-12">
            <button
              onClick={() => navigate("/cars")}
              className="bg-gray-900 text-white px-8 py-3 rounded-md hover:bg-gray-800 transition-colors font-medium"
            >
              Xem tất cả xe điện
            </button>
          </div>
        )}
      </div>
      {toast && msg && <Toast type={type} msg={msg} />}
    </section>
  );
};

export default CarListing;
