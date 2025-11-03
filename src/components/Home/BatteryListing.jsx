import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../services/api";
import Toast from "../Toast";
import { useNavigate } from "react-router-dom";

const BatteryListing = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [msg, setMsg] = useState("");
  const [toast, setToast] = useState(false);
  const [type, setType] = useState("");

  async function handleRequest(id) {
    console.log(id);

    try {
      const res = await api.post("/PurchaseRequests", {
        postId: id,
        message: "Tôi muốn mua pin này",
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
      let errorMsg = "Không thể yêu cầu mua pin";

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

  async function getAllPosts() {
    try {
      const res = await api.get("/posts");
      console.log("Full API Response:", res);
      console.log("API Data:", res.data);

      if (res.status === 200 || res.status === 304) {
        const allPosts = res.data.data || res.data;
        console.log("All posts:", allPosts);

        // Chỉ lấy các bài có category = "battery" và verifyStatus = "verify"
        const batteryPosts = allPosts.filter(
          (post) =>
            post.category === "battery" && post.verifyStatus === "verify"
        );
        console.log("Battery posts:", batteryPosts);
        console.log("Battery posts count:", batteryPosts.length);

        setPosts(batteryPosts);
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

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Tiêu đề */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Pin xe điện
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Khám phá các loại pin xe điện chất lượng cao, đã qua kiểm định
          </p>
        </div>

        {/* Danh sách pin */}
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-2">
              Chưa có bài đăng pin nào được xác thực
            </p>
            <p className="text-gray-400 text-sm">Vui lòng quay lại sau</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <div
                key={post.id}
                className={`relative bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 ${
                  post.isVip ? "border-2 border-yellow-400" : ""
                }`}
              >
                {/* Ảnh */}
                <div className="relative">
                  <img
                    src={
                      post.image && post.image.length > 0
                        ? post.image[0]
                        : "https://afdc.energy.gov/files/u/publication/ev_battery_closeup.jpg"
                    }
                    alt={post.title}
                    className="w-full h-56 object-cover"
                  />

                  {/* Huy hiệu VIP */}
                  {post.isVip && (
                    <div className="absolute top-4 left-4 bg-yellow-400 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-md">
                      {post.vipTier}
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

                  {/* Thông tin pin */}
                  {post.battery_capacity && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <span className="font-medium">⚡ Dung lượng:</span>
                      <span>{post.battery_capacity} kWh</span>
                    </div>
                  )}
                  {post.battery_range && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <span className="font-medium">🚗 Quãng đường:</span>
                      <span>{post.battery_range} km</span>
                    </div>
                  )}
                  {post.battery_condition && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                      <span className="font-medium">✅ Tình trạng:</span>
                      <span>{post.battery_condition}</span>
                    </div>
                  )}

                  <p className="text-gray-600 mb-4 text-sm">
                    Người đăng:{" "}
                    <span className="font-semibold">{post.username}</span>
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
                      to={`/listing/battery/${post.id}`}
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
            ))}
          </div>
        )}

        {/* Nút xem thêm */}
        {posts.length > 0 && (
          <div className="text-center mt-12">
            <button className="bg-gray-900 text-white px-8 py-3 rounded-md hover:bg-gray-800 transition-colors font-medium">
              Xem tất cả pin
            </button>
          </div>
        )}
      </div>
      {toast && msg && <Toast type={type} msg={msg} />}
    </section>
  );
};

export default BatteryListing;
