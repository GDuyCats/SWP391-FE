import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../services/api";
import Toast from "../Toast";
import { useNavigate } from "react-router-dom";
import { Star } from "lucide-react";

const CarListing = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [msg, setMsg] = useState("");
  const [toast, setToast] = useState(false);
  const [type, setType] = useState("");

  const renderVipBadge = (post) => {
    if (!post.isVip || !post.vipTier) return null;

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

  async function handleRequest(id) {
    console.log(id);
    try {
      const res = await api.post("/PurchaseRequests", {
        postId: id,
        message: "Tôi muốn mua xe này"
      });
      console.log(res);
      if (res.status === 201) {
        setToast(true);
        setType("success");
        setMsg(res.data.message);
      }
    } catch (error) {
      console.log(error);
      const status = error?.response?.status;
      const msg = error?.response?.data?.message;
      let errorMsg = 'Không thể yêu cầu mua xe';
      setToast(true);
      setType("error");
      if (status === 400) {
        errorMsg = msg ? msg : "Bài đăng chưa được xác thực";
      } else if (status === 403) {
        errorMsg = msg ? msg : "Không đủ quyền (Admin/Staff không được phép)";
      } else if (status === 404) {
        errorMsg = msg ? msg : "Không tìm thấy bài đăng";
      } else if (status === 409) {
        errorMsg = msg ? msg : "Người mua đã có hợp đồng đang hiệu lực cho bài này";
      } else if (status === 500) {
        errorMsg = msg ? msg : "Lỗi máy chủ";
        setTimeout(() => navigate('/login'), 2000);
      }
      setMsg(errorMsg);
    } finally {
      setTimeout(() => setToast(false), 3000);
    }
  }

  async function getAllPosts() {
    try {
      const res = await api.get("/posts");
      console.log(res);
      if (res.status === 200) {
        setPosts(res.data.data);
      }
    } catch (error) {
      console.log(error);
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <div
              key={post.id}
              className="relative bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300"
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

                {/* === GỘP VIP + TIER THÀNH 1 BADGE === */}
                {renderVipBadge(post)}
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
                  <Link to={`/listing/ev/${post.id}`} className="flex-1">
                    <button className="w-full bg-gray-900 text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors font-medium text-sm">
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
          ))}
        </div>
      </div>

      {toast && msg && (
        <Toast type={type} msg={msg} />
      )}
    </section>
  );
};

export default CarListing;