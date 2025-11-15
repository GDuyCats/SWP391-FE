import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../services/api";
import Toast from "../Toast";
import { useNavigate } from "react-router-dom";

const BatteryListing = ({ limit, showViewAll = false }) => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [msg, setMsg] = useState("");
  const [toast, setToast] = useState(false);
  const [type, setType] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // Số sản phẩm mỗi trang (3x3 grid)
  
  // Search states
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [capacityRange, setCapacityRange] = useState("");

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
      // Thêm filter params để lấy pin đã verify
      const res = await api.get(
        "/posts?category=battery&verifyStatus=verify&limit=1000"
      );
      console.log("Full API Response:", res);
      console.log("API Data:", res.data);

      if (res.status === 200 || res.status === 304) {
        const allPosts = res.data.data || res.data;
        console.log("All posts:", allPosts);

        // Fallback: Filter ở frontend nếu backend không support query params
        let batteryPosts = Array.isArray(allPosts)
          ? allPosts.filter(
              (post) =>
                post.category === "battery" && post.verifyStatus === "verify"
            )
          : allPosts;

        // Sắp xếp posts theo VIP tier và thời gian
        if (Array.isArray(batteryPosts)) {
          batteryPosts = sortPosts(batteryPosts);
        }

        console.log("Battery posts (sorted):", batteryPosts);
        console.log(
          "Battery posts count:",
          Array.isArray(batteryPosts) ? batteryPosts.length : 0
        );

        setPosts(Array.isArray(batteryPosts) ? batteryPosts : []);
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

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  console.log(posts);

  // Filter posts based on search criteria
  const filteredPosts = posts.filter((post) => {
    // Search term filter
    const matchesSearch = searchTerm
      ? post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content?.toLowerCase().includes(searchTerm.toLowerCase())
      : true;

    // Price range filter
    let matchesPrice = true;
    if (priceRange) {
      const price = Number(post.price);
      switch (priceRange) {
        case "0-50":
          matchesPrice = price < 50000000;
          break;
        case "50-100":
          matchesPrice = price >= 50000000 && price < 100000000;
          break;
        case "100-200":
          matchesPrice = price >= 100000000 && price < 200000000;
          break;
        case "200+":
          matchesPrice = price >= 200000000;
          break;
        default:
          matchesPrice = true;
      }
    }

    // Capacity filter
    let matchesCapacity = true;
    if (capacityRange && post.battery_capacity) {
      const capacity = Number(post.battery_capacity);
      switch (capacityRange) {
        case "0-50":
          matchesCapacity = capacity < 50;
          break;
        case "50-75":
          matchesCapacity = capacity >= 50 && capacity < 75;
          break;
        case "75-100":
          matchesCapacity = capacity >= 75 && capacity < 100;
          break;
        case "100+":
          matchesCapacity = capacity >= 100;
          break;
        default:
          matchesCapacity = true;
      }
    }

    return matchesSearch && matchesPrice && matchesCapacity;
  });

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, priceRange, capacityRange]);

  // Logic phân trang
  const totalPages = limit ? 1 : Math.ceil(filteredPosts.length / itemsPerPage);

  // Tính toán posts hiển thị
  let displayedPosts;
  if (limit) {
    // Nếu có limit (trang home), chỉ lấy số lượng limit
    displayedPosts = filteredPosts.slice(0, limit);
  } else {
    // Nếu không có limit (trang danh sách), áp dụng phân trang
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    displayedPosts = filteredPosts.slice(startIndex, endIndex);
  }

  // Hàm chuyển trang
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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

        {/* Search Bar - chỉ hiển thị khi không có limit (trang danh sách đầy đủ) */}
        {!limit && (
          <div className="max-w-5xl mx-auto mb-12">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tìm kiếm
                  </label>
                  <input
                    type="text"
                    placeholder="Nhập tên pin, loại pin..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giá từ
                  </label>
                  <select
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  >
                    <option value="">Chọn mức giá</option>
                    <option value="0-50">Dưới 50 triệu</option>
                    <option value="50-100">50 - 100 triệu</option>
                    <option value="100-200">100 - 200 triệu</option>
                    <option value="200+">Trên 200 triệu</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dung lượng (kWh)
                  </label>
                  <select
                    value={capacityRange}
                    onChange={(e) => setCapacityRange(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  >
                    <option value="">Tất cả dung lượng</option>
                    <option value="0-50">Dưới 50 kWh</option>
                    <option value="50-75">50 - 75 kWh</option>
                    <option value="75-100">75 - 100 kWh</option>
                    <option value="100+">Trên 100 kWh</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setPriceRange("");
                      setCapacityRange("");
                    }}
                    className="w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-md hover:bg-gray-300 transition-colors font-medium"
                  >
                    Xóa bộ lọc
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Danh sách pin */}
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-2">
              Chưa có bài đăng pin nào được xác thực
            </p>
            <p className="text-gray-400 text-sm">Vui lòng quay lại sau</p>
          </div>
        ) : displayedPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-2">
              Không tìm thấy pin nào phù hợp
            </p>
            <p className="text-gray-400 text-sm">Vui lòng thử lại với bộ lọc khác</p>
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
                          : "https://afdc.energy.gov/files/u/publication/ev_battery_closeup.jpg"
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

                    <p className="text-gray-600 mb-2 text-sm">
                      Người đăng:{" "}
                      <span className="font-semibold">{post.username}</span>
                    </p>

                    {/* Ngày đăng */}
                    {post.createdAt && (
                      <p className="text-gray-500 text-sm mb-4">
                        📅 Ngày đăng: {formatDate(post.createdAt)}
                      </p>
                    )}

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
              );
            })}
          </div>
        )}

        {/* Pagination - chỉ hiển thị khi không có limit (trang danh sách đầy đủ) */}
        {!limit && filteredPosts.length > 0 && totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-12">
            {/* Nút Previous */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                currentPage === 1
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
              }`}
            >
              « Trước
            </button>

            {/* Số trang */}
            {[...Array(totalPages)].map((_, index) => {
              const pageNumber = index + 1;

              // Hiển thị: trang đầu, trang cuối, trang hiện tại và 2 trang xung quanh
              if (
                pageNumber === 1 ||
                pageNumber === totalPages ||
                (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
              ) {
                return (
                  <button
                    key={pageNumber}
                    onClick={() => handlePageChange(pageNumber)}
                    className={`px-4 py-2 rounded-md font-medium transition-colors ${
                      currentPage === pageNumber
                        ? "bg-gray-900 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              } else if (
                pageNumber === currentPage - 2 ||
                pageNumber === currentPage + 2
              ) {
                return (
                  <span key={pageNumber} className="px-2 text-gray-400">
                    ...
                  </span>
                );
              }
              return null;
            })}

            {/* Nút Next */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                currentPage === totalPages
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
              }`}
            >
              Sau »
            </button>
          </div>
        )}

        {/* Nút xem thêm - chỉ hiển thị ở trang home */}
        {posts.length > 0 && showViewAll && (
          <div className="text-center mt-12">
            <button
              onClick={() => navigate("/batteries")}
              className="bg-gray-900 text-white px-8 py-3 rounded-md hover:bg-gray-800 transition-colors font-medium"
            >
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
