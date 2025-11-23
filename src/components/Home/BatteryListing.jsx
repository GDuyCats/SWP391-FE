// Import các thư viện cần thiết
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom"; // Để tạo link navigate giữa các trang
import { api } from "../../services/api"; // Service để call API
import Toast from "../Toast"; // Component hiển thị thông báo
import { useNavigate } from "react-router-dom"; // Hook để điều hướng trang

/**
 * Component BatteryListing - Hiển thị danh sách pin xe điện
 * @param {number} limit - Giới hạn số lượng pin hiển thị (dùng cho trang home)
 * @param {boolean} showViewAll - Hiển thị nút "Xem tất cả" hay không
 */
const BatteryListing = ({ limit, showViewAll = false }) => {
  const navigate = useNavigate(); // Hook để chuyển hướng trang

  // States quản lý dữ liệu và trạng thái component
  const [posts, setPosts] = useState([]); // Danh sách bài đăng pin
  const [msg, setMsg] = useState(""); // Nội dung thông báo toast
  const [toast, setToast] = useState(false); // Trạng thái hiển thị toast
  const [type, setType] = useState(""); // Loại toast (success/error)
  const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại của pagination
  const itemsPerPage = 9; // Số sản phẩm mỗi trang (3x3 grid)

  // States cho chức năng tìm kiếm và lọc
  const [searchTerm, setSearchTerm] = useState(""); // Từ khóa tìm kiếm
  const [priceRange, setPriceRange] = useState(""); // Khoảng giá đã chọn
  const [capacityRange, setCapacityRange] = useState(""); // Khoảng dung lượng đã chọn

  /**
   * Hàm lấy thông tin hiển thị theo cấp VIP
   * @param {string} vipTier - Cấp VIP (silver/gold/diamond)
   * @returns {object} Object chứa thông tin label, màu sắc, background và border
   */
  const getVipTierInfo = (vipTier) => {
    // Định nghĩa thông tin hiển thị cho từng cấp VIP
    const tiers = {
      silver: {
        label: "Bạc",
        color: "text-gray-700", // Màu chữ
        bg: "bg-gray-100", // Màu nền
        border: "border-gray-400", // Màu viền
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

    // Trả về thông tin tier tương ứng, mặc định là silver nếu không tìm thấy
    return tiers[vipTier?.toLowerCase()] || tiers.silver;
  };

  /**
   * Hàm xử lý gửi yêu cầu mua pin
   * @param {number} id - ID của bài đăng pin
   */
  async function handleRequest(id) {
    console.log(id);

    try {
      // Gọi API để tạo yêu cầu mua pin
      const res = await api.post("/PurchaseRequests", {
        postId: id,
        message: "Tôi muốn mua pin này",
      });
      console.log(res);

      // Nếu tạo yêu cầu thành công (status 201)
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

      // Hiển thị toast lỗi
      setToast(true);
      setType("error");

      // Xử lý các trường hợp lỗi khác nhau dựa trên HTTP status code
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
        // Chuyển về trang login sau 2 giây nếu lỗi server
        setTimeout(() => navigate("/login"), 2000);
      }
      setMsg(errorMsg);
    } finally {
      // Tự động ẩn toast sau 3 giây
      setTimeout(() => setToast(false), 3000);
    }
  }

  /**
   * Hàm xác định thứ tự ưu tiên của VIP tier (cao đến thấp)
   * @param {string} vipTier - Cấp VIP
   * @returns {number} Số thứ tự ưu tiên (cao hơn = ưu tiên hơn)
   */
  const getVipTierOrder = (vipTier) => {
    // Định nghĩa thứ tự ưu tiên: Diamond > Gold > Silver
    const tierOrder = {
      diamond: 3, // Ưu tiên cao nhất
      gold: 2, // Ưu tiên trung bình
      silver: 1, // Ưu tiên thấp nhất
    };
    // Trả về thứ tự ưu tiên, mặc định là 0 nếu không có tier
    return vipTier ? tierOrder[vipTier.toLowerCase()] || 0 : 0;
  };

  /**
   * Hàm sắp xếp danh sách posts theo thứ tự ưu tiên
   * Thứ tự: VIP tier cao > VIP tier thấp > Không VIP, và trong cùng nhóm thì mới nhất trước
   * @param {Array} posts - Mảng các bài đăng
   * @returns {Array} Mảng đã được sắp xếp
   */
  const sortPosts = (posts) => {
    return posts.sort((a, b) => {
      // BƯỚC 1: So sánh theo trạng thái VIP (VIP trước, không VIP sau)
      const aIsVip = a.isVip ? 1 : 0;
      const bIsVip = b.isVip ? 1 : 0;

      if (aIsVip !== bIsVip) {
        return bIsVip - aIsVip; // VIP posts hiển thị trước
      }

      // BƯỚC 2: Nếu cả 2 đều VIP, sắp xếp theo tier (Kim Cương > Vàng > Bạc)
      if (aIsVip && bIsVip) {
        const aTierOrder = getVipTierOrder(a.vipTier);
        const bTierOrder = getVipTierOrder(b.vipTier);

        if (aTierOrder !== bTierOrder) {
          return bTierOrder - aTierOrder; // Tier cao hơn hiển thị trước
        }
      }

      // BƯỚC 3: Nếu cùng VIP tier (hoặc cả 2 không VIP), sắp xếp theo thời gian đăng (mới nhất trước)
      const aDate = new Date(a.createdAt || a.created_at || 0);
      const bDate = new Date(b.createdAt || b.created_at || 0);
      return bDate - aDate; // Bài mới hơn hiển thị trước
    });
  };

  /**
   * Hàm lấy tất cả bài đăng pin từ API
   * - Lấy các bài đăng category = "battery" và đã được verify
   * - Lọc bỏ các bài VIP đã hết hạn
   * - Sắp xếp theo VIP tier và thời gian
   */
  async function getAllPosts() {
    try {
      // Gọi API lấy danh sách posts với filter:
      // - category=battery: chỉ lấy bài đăng pin
      // - verifyStatus=verify: chỉ lấy bài đã được xác thực
      // - limit=1000: giới hạn số lượng trả về
      const res = await api.get(
        "/posts?category=battery&verifyStatus=verify&limit=1000"
      );
      console.log("Full API Response:", res);
      console.log("API Data:", res.data);

      // Kiểm tra response thành công (200: OK, 304: Not Modified)
      if (res.status === 200 || res.status === 304) {
        // Lấy data từ response (có thể ở res.data.data hoặc res.data)
        const allPosts = res.data.data || res.data;
        console.log("All posts:", allPosts);

        // Fallback: Lọc ở frontend nếu backend không support query params đầy đủ
        let batteryPosts = Array.isArray(allPosts)
          ? allPosts.filter((post) => {
              // BƯỚC 1: Kiểm tra category và verifyStatus
              const isValidPost =
                post.category === "battery" && post.verifyStatus === "verify";

              // BƯỚC 2: Kiểm tra VIP expiry - ẩn bài nếu VIP đã hết hạn
              const now = new Date(); // Thời điểm hiện tại
              let isVipValid = true; // Mặc định hợp lệ

              // Kiểm tra cả vipExpireAt và vipExpiresAt (API có thể dùng tên khác nhau)
              if (post.isVip && (post.vipExpireAt || post.vipExpiresAt)) {
                const vipExpireDate = new Date(
                  post.vipExpireAt || post.vipExpiresAt
                );
                isVipValid = vipExpireDate > now; // Chỉ hiển thị nếu chưa hết hạn

                // Debug log cho các bài VIP hết hạn
                if (!isVipValid) {
                  console.log(
                    `Bài VIP đã hết hạn - ID: ${post.id}, Expire: ${vipExpireDate}, Now: ${now}`
                  );
                }
              }

              // Chỉ giữ lại bài đăng hợp lệ và VIP còn hiệu lực
              return isValidPost && isVipValid;
            })
          : allPosts;

        // BƯỚC 3: Sắp xếp posts theo VIP tier và thời gian
        if (Array.isArray(batteryPosts)) {
          batteryPosts = sortPosts(batteryPosts);
        }

        // Debug logs
        console.log("Battery posts (sorted):", batteryPosts);
        console.log(
          "Battery posts count:",
          Array.isArray(batteryPosts) ? batteryPosts.length : 0
        );

        // Cập nhật state với danh sách posts đã lọc và sắp xếp
        setPosts(Array.isArray(batteryPosts) ? batteryPosts : []);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  }

  // useEffect: Gọi API lấy danh sách posts khi component mount lần đầu
  useEffect(() => {
    getAllPosts();
  }, []); // Dependency array rỗng = chỉ chạy 1 lần khi mount

  /**
   * Hàm format giá tiền theo định dạng VND
   * @param {number} price - Giá tiền
   * @returns {string} Giá đã format (VD: "50.000.000 ₫")
   */
  const formatPrice = (price) => {
    if (!price) return "Liên hệ"; // Trả về "Liên hệ" nếu không có giá
    return Number(price).toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  };

  /**
   * Hàm format ngày tháng theo định dạng Việt Nam
   * @param {string} dateString - Chuỗi ngày tháng từ API
   * @returns {string} Ngày đã format (VD: "23/11/2025")
   */
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  console.log(posts); // Debug: Log danh sách posts

  /**
   * Lọc danh sách posts dựa trên các tiêu chí tìm kiếm
   * - Từ khóa tìm kiếm (trong title và content)
   * - Khoảng giá
   * - Dung lượng pin
   */
  const filteredPosts = posts.filter((post) => {
    // FILTER 1: Lọc theo từ khóa tìm kiếm
    const matchesSearch = searchTerm
      ? post.title?.toLowerCase().includes(searchTerm.toLowerCase()) || // Tìm trong tiêu đề
        post.content?.toLowerCase().includes(searchTerm.toLowerCase()) // Tìm trong nội dung
      : true; // Nếu không có từ khóa, cho phép tất cả

    // FILTER 2: Lọc theo khoảng giá
    let matchesPrice = true;
    if (priceRange) {
      const price = Number(post.price);
      switch (priceRange) {
        case "0-50":
          matchesPrice = price < 50000000; // Dưới 50 triệu
          break;
        case "50-100":
          matchesPrice = price >= 50000000 && price < 100000000; // 50-100 triệu
          break;
        case "100-200":
          matchesPrice = price >= 100000000 && price < 200000000; // 100-200 triệu
          break;
        case "200+":
          matchesPrice = price >= 200000000; // Trên 200 triệu
          break;
        default:
          matchesPrice = true;
      }
    }

    // FILTER 3: Lọc theo dung lượng pin (kWh)
    let matchesCapacity = true;
    if (capacityRange && post.battery_capacity) {
      const capacity = Number(post.battery_capacity);
      switch (capacityRange) {
        case "0-50":
          matchesCapacity = capacity < 50; // Dưới 50 kWh
          break;
        case "50-75":
          matchesCapacity = capacity >= 50 && capacity < 75; // 50-75 kWh
          break;
        case "75-100":
          matchesCapacity = capacity >= 75 && capacity < 100; // 75-100 kWh
          break;
        case "100+":
          matchesCapacity = capacity >= 100; // Trên 100 kWh
          break;
        default:
          matchesCapacity = true;
      }
    }

    // Chỉ giữ lại posts thỏa mãn TẤT CẢ các điều kiện
    return matchesSearch && matchesPrice && matchesCapacity;
  });

  /**
   * useEffect: Reset về trang 1 mỗi khi thay đổi bộ lọc
   * Tránh trường hợp user đang ở trang 5, đổi filter thì kết quả chỉ có 2 trang
   */
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, priceRange, capacityRange]); // Theo dõi thay đổi của các filter

  /**
   * Tính toán số trang tổng cộng
   * - Nếu có limit (hiển thị ở trang home): chỉ có 1 trang
   * - Nếu không có limit (trang danh sách đầy đủ): tính theo số items trên mỗi trang
   */
  const totalPages = limit ? 1 : Math.ceil(filteredPosts.length / itemsPerPage);

  /**
   * Tính toán danh sách posts sẽ hiển thị trên trang hiện tại
   * - Có limit: hiển thị số lượng giới hạn (trang home)
   * - Không limit: áp dụng phân trang (trang danh sách đầy đủ)
   */
  let displayedPosts;
  if (limit) {
    // Nếu có limit (trang home), chỉ lấy số lượng limit
    displayedPosts = filteredPosts.slice(0, limit);
  } else {
    // Nếu không có limit (trang danh sách), áp dụng phân trang
    const startIndex = (currentPage - 1) * itemsPerPage; // VD: trang 2 = (2-1)*9 = bắt đầu từ index 9
    const endIndex = startIndex + itemsPerPage; // VD: từ index 9 đến 18
    displayedPosts = filteredPosts.slice(startIndex, endIndex);
  }

  /**
   * Hàm xử lý khi user chuyển trang
   * @param {number} pageNumber - Số trang muốn chuyển đến
   */
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber); // Cập nhật trang hiện tại
    window.scrollTo({ top: 0, behavior: "smooth" }); // Cuộn lên đầu trang mượt mà
  };

  // ===== RENDER UI =====
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ===== PHẦN 1: TIÊU ĐỀ ===== */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Pin xe điện
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Khám phá các loại pin xe điện chất lượng cao, đã qua kiểm định
          </p>
        </div>

        {/* ===== PHẦN 2: SEARCH BAR (BỘ LỌC) ===== */}
        {/* Chỉ hiển thị khi không có limit (trang danh sách đầy đủ), ẩn ở trang home */}
        {!limit && (
          <div className="max-w-5xl mx-auto mb-12">
            <div className="bg-white rounded-lg shadow-lg p-6">
              {/* Grid 4 cột: Tìm kiếm, Giá, Dung lượng, Nút xóa */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Filter 1: Tìm kiếm theo từ khóa */}
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

                {/* Filter 2: Lọc theo khoảng giá */}
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

                {/* Filter 3: Lọc theo dung lượng pin */}
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

                {/* Nút xóa tất cả bộ lọc */}
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSearchTerm(""); // Reset tìm kiếm
                      setPriceRange(""); // Reset filter giá
                      setCapacityRange(""); // Reset filter dung lượng
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

        {/* ===== PHẦN 3: DANH SÁCH PIN ===== */}
        {/* Kiểm tra 3 trường hợp: Không có posts, Có posts nhưng filter không khớp, Có posts hiển thị */}
        {posts.length === 0 ? (
          // TRƯỜNG HỢP 1: Không có bài đăng nào (API trả về rỗng)
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-2">
              Chưa có bài đăng pin nào được xác thực
            </p>
            <p className="text-gray-400 text-sm">Vui lòng quay lại sau</p>
          </div>
        ) : displayedPosts.length === 0 ? (
          // TRƯỜNG HỢP 2: Có posts nhưng không có posts nào phù hợp với filter
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-2">
              Không tìm thấy pin nào phù hợp
            </p>
            <p className="text-gray-400 text-sm">
              Vui lòng thử lại với bộ lọc khác
            </p>
          </div>
        ) : (
          // TRƯỜNG HỢP 3: Có posts để hiển thị
          // Grid layout responsive: 1 cột mobile, 2 cột tablet, 3 cột desktop
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Loop qua từng post để render card */}
            {displayedPosts.map((post) => {
              // Lấy thông tin VIP tier nếu post là VIP
              const vipInfo = post.isVip ? getVipTierInfo(post.vipTier) : null;

              return (
                // Card container - có border VIP nếu là bài VIP
                <div
                  key={post.id}
                  className={`relative bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 ${
                    post.isVip ? `border-2 ${vipInfo.border}` : ""
                  }`}
                >
                  {/* === Phần Ảnh & Badge VIP === */}
                  <div className="relative">
                    {/* Ảnh chính của pin */}
                    <img
                      src={
                        post.image && post.image.length > 0
                          ? post.image[0] // Lấy ảnh đầu tiên trong mảng
                          : "https://afdc.energy.gov/files/u/publication/ev_battery_closeup.jpg" // Ảnh mặc định
                      }
                      alt={post.title}
                      className="w-full h-56 object-cover"
                    />

                    {/* Huy hiệu VIP (hiển thị góc trên bên trái nếu là bài VIP) */}
                    {post.isVip && vipInfo && (
                      <div
                        className={`absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-semibold shadow-md ${vipInfo.bg} ${vipInfo.color}`}
                      >
                        {vipInfo.label}
                      </div>
                    )}
                  </div>

                  {/* === Phần Nội dung Card === */}
                  <div className="p-6">
                    {/* Tiêu đề bài đăng */}
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {post.title}
                    </h3>

                    {/* Mô tả ngắn (giới hạn 2 dòng với line-clamp-2) */}
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {post.content}
                    </p>

                    {/* === Thông số kỹ thuật pin === */}
                    {/* Dung lượng pin (kWh) - chỉ hiển thị nếu có */}
                    {post.battery_capacity && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <span className="font-medium">⚡ Dung lượng:</span>
                        <span>{post.battery_capacity} kWh</span>
                      </div>
                    )}

                    {/* Quãng đường hoạt động (km) - chỉ hiển thị nếu có */}
                    {post.battery_range && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <span className="font-medium">🚗 Quãng đường:</span>
                        <span>{post.battery_range} km</span>
                      </div>
                    )}

                    {/* Tình trạng pin - chỉ hiển thị nếu có */}
                    {post.battery_condition && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                        <span className="font-medium">✅ Tình trạng:</span>
                        <span>{post.battery_condition}</span>
                      </div>
                    )}

                    {/* Thông tin người đăng */}
                    <p className="text-gray-600 mb-2 text-sm">
                      Người đăng:{" "}
                      <span className="font-semibold">{post.username}</span>
                    </p>

                    {/* Ngày đăng bài - chỉ hiển thị nếu có */}
                    {post.createdAt && (
                      <p className="text-gray-500 text-sm mb-4">
                        📅 Ngày đăng: {formatDate(post.createdAt)}
                      </p>
                    )}

                    {/* Giá tiền (hiển thị nổi bật với màu xanh) */}
                    <div className="flex justify-between items-center text-sm mb-4">
                      <span className="text-gray-600">Giá:</span>
                      <span className="font-semibold text-green-600 text-lg">
                        {formatPrice(post.price)}
                      </span>
                    </div>

                    {/* === Các nút hành động === */}
                    <div className="flex space-x-3">
                      {/* Nút 1: Xem chi tiết - Navigate đến trang detail */}
                      <Link
                        to={`/listing/battery/${post.id}`}
                        state={{ post }} // Truyền data post qua state
                        className="flex-1"
                      >
                        <button className="w-full bg-gray-900 text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors font-medium">
                          Xem chi tiết
                        </button>
                      </Link>

                      {/* Nút 2: Gửi yêu cầu mua - Gọi API tạo purchase request */}
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

        {/* ===== PHẦN 4: PAGINATION (PHÂN TRANG) ===== */}
        {/* Chỉ hiển thị khi: không có limit, có posts, và có nhiều hơn 1 trang */}
        {!limit && filteredPosts.length > 0 && totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-12">
            {/* Nút Previous (Trang trước) - disable nếu đang ở trang 1 */}
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

            {/* Các số trang */}
            {/* Logic hiển thị thông minh: Hiển thị trang 1, trang cuối, trang hiện tại và các trang xung quanh */}
            {[...Array(totalPages)].map((_, index) => {
              const pageNumber = index + 1;

              // Hiển thị: trang đầu (1), trang cuối, trang hiện tại ±1
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
                        ? "bg-gray-900 text-white" // Trang hiện tại - nổi bật
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
                // Hiển thị dấu "..." giữa các khoảng cách xa
                return (
                  <span key={pageNumber} className="px-2 text-gray-400">
                    ...
                  </span>
                );
              }
              // Các trang còn lại không hiển thị
              return null;
            })}

            {/* Nút Next (Trang sau) - disable nếu đang ở trang cuối */}
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

        {/* ===== PHẦN 5: NÚT "XEM TẤT CẢ" ===== */}
        {/* Chỉ hiển thị ở trang home (khi có limit và showViewAll = true) */}
        {posts.length > 0 && showViewAll && (
          <div className="text-center mt-12">
            <button
              onClick={() => navigate("/batteries")} // Chuyển đến trang danh sách đầy đủ
              className="bg-gray-900 text-white px-8 py-3 rounded-md hover:bg-gray-800 transition-colors font-medium"
            >
              Xem tất cả pin
            </button>
          </div>
        )}
      </div>

      {/* ===== TOAST NOTIFICATION ===== */}
      {/* Hiển thị thông báo khi có toast (success/error) */}
      {toast && msg && <Toast type={type} msg={msg} />}
    </section>
  );
};

export default BatteryListing;
