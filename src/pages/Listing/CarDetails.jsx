import React, { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { api } from "../../services/api";


function CarDetails() {
  const { id } = useParams();
  const { state } = useLocation();
  const [post, setPost] = useState(state?.post || null);
  const [loading, setLoading] = useState(!state?.post);


  useEffect(() => {
    // Nếu không có dữ liệu từ state, fetch từ API
    if (!post && id) {
      const fetchPost = async () => {
        try {
          const res = await api.get(`/posts/${id}`);
          if (res.status === 200) {
            setPost(res.data);
          }
        } catch (error) {
          console.error("Error fetching post:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchPost();
    }
  }, [id, post]);

  const formatPrice = (price) => {
    if (!price) return "Liên hệ";
    return Number(price).toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link to="/" className="text-sm text-gray-600 hover:underline">
              ← Về trang chủ
            </Link>
          </div>

          {post ? (
            <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
              {/* Hình ảnh */}
              <div className="relative">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-100">
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
                    <img
                      src="https://cdn.thepennyhoarder.com/wp-content/uploads/2022/05/21141022/hybrid-vs-electric-final.jpg"
                      alt={post.title}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  )}
                </div>
                {post.isVip && (
                  <div className="absolute top-8 left-8 bg-yellow-400 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                    VIP - {post.vipTier}
                  </div>
                )}
              </div>

              {/* Thông tin chi tiết */}
              <div className="p-8">
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

                {/* Mô tả */}
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-3 text-gray-900">
                    Mô tả
                  </h2>
                  <p className="text-gray-700 whitespace-pre-line">
                    {post.content}
                  </p>
                </div>

                {/* Thông tin xe điện */}
                {(post.brand ||
                  post.model ||
                  post.year ||
                  post.mileage ||
                  post.color ||
                  post.condition) && (
                    <div className="mb-6">
                      <h2 className="text-xl font-semibold mb-4 text-gray-900">
                        Thông tin xe
                      </h2>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        {post.brand && (
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Hãng xe</p>
                            <p className="font-semibold text-gray-900">
                              {post.brand}
                            </p>
                          </div>
                        )}
                        {post.model && (
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Model</p>
                            <p className="font-semibold text-gray-900">
                              {post.model}
                            </p>
                          </div>
                        )}
                        {post.year && (
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">
                              Năm sản xuất
                            </p>
                            <p className="font-semibold text-gray-900">
                              {post.year}
                            </p>
                          </div>
                        )}
                        {post.mileage && (
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">
                              Số km đã đi
                            </p>
                            <p className="font-semibold text-gray-900">
                              {Number(post.mileage).toLocaleString()} km
                            </p>
                          </div>
                        )}
                        {post.color && (
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Màu sắc</p>
                            <p className="font-semibold text-gray-900">
                              {post.color}
                            </p>
                          </div>
                        )}
                        {post.condition && (
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">
                              Tình trạng
                            </p>
                            <p className="font-semibold text-gray-900">
                              {post.condition}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                {/* Thông tin pin */}
                {(post.battery_brand ||
                  post.battery_model ||
                  post.battery_capacity ||
                  post.battery_type ||
                  post.battery_range ||
                  post.battery_condition ||
                  post.charging_time) && (
                    <div className="mb-6">
                      <h2 className="text-xl font-semibold mb-4 text-gray-900">
                        Thông tin pin
                      </h2>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        {post.battery_brand && (
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Hãng pin</p>
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
                            <p className="text-sm text-gray-600 mb-1">Loại pin</p>
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
                    </div>
                  )}

                {/* Nút hành động */}
                <div className="flex gap-4 pt-6">
                  <button className="flex-1 bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium">
                    Gửi yêu cầu mua xe
                  </button>
                  <button className="flex-1 border-2 border-gray-300 text-gray-900 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                    Liên hệ người bán
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <h2 className="text-xl font-semibold mb-2">
                Chi tiết xe không tìm thấy
              </h2>
              <p className="text-gray-600 mb-4">
                Không có dữ liệu chi tiết cho xe id: {id}
              </p>
              <div>
                <Link
                  to="/"
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


    </div>
  );
}
export default CarDetails;