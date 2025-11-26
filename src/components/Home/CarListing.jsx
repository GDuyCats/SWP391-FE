import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../services/api";
import Toast from "../Toast";
import { useNavigate } from "react-router-dom";
import { Star } from "lucide-react";

/**
 * Component CarListing - Hiển thị danh sách xe điện
 *
 * Props:
 * - limit: Giới hạn số lượng bài đăng hiển thị (dùng cho trang home)
 * - showViewAll: Hiển thị nút "Xem tất cả" (dùng cho trang home)
 */
const CarListing = ({ limit, showViewAll = false }) => {
  const navigate = useNavigate();

  // ============ STATE MANAGEMENT ============
  // State lưu trữ danh sách bài đăng xe điện
  const [posts, setPosts] = useState([]);

  // State cho Toast notification
  const [msg, setMsg] = useState(""); // Nội dung thông báo
  const [toast, setToast] = useState(false); // Hiển thị/ẩn toast
  const [type, setType] = useState(""); // Loại toast (success/error)

  // State cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // Số sản phẩm mỗi trang (3x3 grid)

  // State cho tìm kiếm và lọc
  const [searchTerm, setSearchTerm] = useState(""); // Từ khóa tìm kiếm
  const [priceRange, setPriceRange] = useState(""); // Khoảng giá
  const [selectedBrand, setSelectedBrand] = useState(""); // Hãng xe

  // ============ HELPER FUNCTIONS ============

  /**
   * Hàm lấy thông tin hiển thị cho từng loại VIP tier
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

    // Trả về thông tin tier tương ứng, mặc định là silver nếu không tìm thấy
    return tiers[vipTier?.toLowerCase()] || tiers.silver;
  };

  /**
   * Hàm render huy hiệu VIP trên bài đăng
   * @param {object} post - Bài đăng cần hiển thị badge
   * @returns {JSX.Element|null} - Badge VIP hoặc null nếu không phải VIP
   */
  const renderVipBadge = (post) => {
    // Không hiển thị nếu bài đăng không phải VIP hoặc không có vipTier
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

  /**
   * Hàm xử lý khi người dùng gửi yêu cầu mua xe
   * @param {number} id - ID của bài đăng
   */
  async function handleRequest(id) {
    console.log(id);
    try {
      // Gọi API tạo yêu cầu mua xe
      const res = await api.post("/PurchaseRequests", {
        postId: id,
        message: "Tôi muốn mua xe này",
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
      let errorMsg = "Không thể yêu cầu mua xe";

      setToast(true);
      setType("error");

      // Xử lý các lỗi khác nhau dựa trên HTTP status code
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

  // ============ SORTING FUNCTIONS ============

  /**
   * Hàm xác định thứ tự ưu tiên của VIP tier
   * @param {string} vipTier - Loại VIP tier
   * @returns {number} - Số thứ tự (cao hơn = ưu tiên hơn)
   */
  const getVipTierOrder = (vipTier) => {
    const tierOrder = {
      diamond: 3, // Kim Cương - ưu tiên cao nhất
      gold: 2, // Vàng - ưu tiên trung bình
      silver: 1, // Bạc - ưu tiên thấp nhất trong VIP
    };
    return vipTier ? tierOrder[vipTier.toLowerCase()] || 0 : 0;
  };

  /**
   * Hàm sắp xếp danh sách bài đăng theo thứ tự ưu tiên:
   * 1. Bài VIP trước, bài thường sau
   * 2. Trong VIP: Kim Cương > Vàng > Bạc
   * 3. Cùng tier hoặc cùng là bài thường: bài mới hơn trước
   *
   * @param {Array} posts - Danh sách bài đăng cần sắp xếp
   * @returns {Array} - Danh sách đã được sắp xếp
   */
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

  // ============ API FUNCTIONS ============

  /**
   * Hàm lấy danh sách tất cả bài đăng xe điện từ API
   * - Lọc theo category = "vehicle" (xe điện)
   * - Lọc theo verifyStatus = "verify" (đã xác thực)
   * - Lọc theo saleStatus = "available" (còn hàng)
   * - Kiểm tra VIP expiry (ẩn bài VIP đã hết hạn)
   * - Sắp xếp theo thứ tự ưu tiên
   */
  async function getAllPosts() {
    try {
      // Gọi API lấy danh sách bài đăng với các filter params
      const res = await api.get(
        "/posts?category=vehicle&verifyStatus=verify&limit=1000"
      );
      console.log("Full API Response:", res);
      console.log("API Data:", res.data);

      if (res.status === 200 || res.status === 304) {
        // Lấy data từ response (có thể ở res.data.data hoặc res.data)
        const allPosts = res.data.data || res.data;
        console.log("All posts:", allPosts);
        console.log("Total posts:", allPosts.length);

        // Fallback: Lọc thêm ở frontend để đảm bảo đúng điều kiện
        let evPosts = Array.isArray(allPosts)
          ? allPosts.filter((post) => {
              // Kiểm tra điều kiện cơ bản: category, verifyStatus, saleStatus
              const isValidPost =
                post.category === "vehicle" &&
                post.verifyStatus === "verify" &&
                post.saleStatus === "available";

              // Kiểm tra VIP expiry - ẩn bài nếu VIP đã hết hạn
              const now = new Date();
              let isVipValid = true;

              // Kiểm tra cả vipExpireAt và vipExpiresAt (API có thể dùng tên khác nhau)
              if (post.isVip && (post.vipExpireAt || post.vipExpiresAt)) {
                const vipExpireDate = new Date(
                  post.vipExpireAt || post.vipExpiresAt
                );
                isVipValid = vipExpireDate > now; // Chỉ hiển thị nếu chưa hết hạn

                // Debug log để theo dõi bài VIP hết hạn
                if (!isVipValid) {
                  console.log(
                    `Bài VIP đã hết hạn - ID: ${post.id}, Expire: ${vipExpireDate}, Now: ${now}`
                  );
                }
              }

              // Chỉ lấy bài đăng hợp lệ và VIP còn hạn
              return isValidPost && isVipValid;
            })
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

        // Cập nhật state với danh sách posts đã lọc và sắp xếp
        setPosts(Array.isArray(evPosts) ? evPosts : []);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  }

  // ============ EFFECTS ============

  /**
   * useEffect: Gọi API lấy danh sách posts khi component mount
   */
  useEffect(() => {
    getAllPosts();
  }, []); // Empty dependency array = chỉ chạy 1 lần khi component mount

  // ============ FORMAT FUNCTIONS ============

  /**
   * Hàm format giá tiền sang định dạng tiền Việt Nam
   * @param {number} price - Giá tiền cần format
   * @returns {string} - Chuỗi giá tiền đã format (VD: "500.000.000 ₫")
   */
  const formatPrice = (price) => {
    if (!price) return "Liên hệ";
    return Number(price).toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  };

  /**
   * Hàm format ngày tháng sang định dạng Việt Nam
   * @param {string} dateString - Chuỗi ngày tháng ISO
   * @returns {string} - Chuỗi ngày đã format (VD: "25/11/2025")
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

  console.log(posts);

  // ============ FILTER LOGIC ============

  /**
   * Lọc danh sách posts dựa trên các tiêu chí tìm kiếm:
   * - Từ khóa (searchTerm): tìm trong title và content
   * - Khoảng giá (priceRange): lọc theo mức giá
   * - Hãng xe (selectedBrand): tìm trong title và content
   */
  const filteredPosts = posts.filter((post) => {
    // 1. Lọc theo từ khóa tìm kiếm
    const matchesSearch = searchTerm
      ? post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content?.toLowerCase().includes(searchTerm.toLowerCase())
      : true;

    // 2. Lọc theo khoảng giá
    let matchesPrice = true;
    if (priceRange) {
      const price = Number(post.price);
      switch (priceRange) {
        case "0-100":
          matchesPrice = price < 100000000; // Dưới 100 triệu
          break;
        case "100-300":
          matchesPrice = price >= 100000000 && price < 300000000; // 100-300 triệu
          break;
        case "300-500":
          matchesPrice = price >= 300000000 && price < 500000000; // 300-500 triệu
          break;
        case "500+":
          matchesPrice = price >= 500000000; // Trên 500 triệu
          break;
        default:
          matchesPrice = true;
      }
    }

    // 3. Lọc theo hãng xe
    const matchesBrand = selectedBrand
      ? post.title?.toLowerCase().includes(selectedBrand.toLowerCase()) ||
        post.content?.toLowerCase().includes(selectedBrand.toLowerCase())
      : true;

    // Chỉ giữ lại posts thỏa mãn TẤT CẢ các điều kiện lọc
    return matchesSearch && matchesPrice && matchesBrand;
  });

  /**
   * useEffect: Reset về trang 1 khi các bộ lọc thay đổi
   * - Tránh trường hợp user ở trang 5 nhưng sau khi lọc chỉ còn 2 trang
   */
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, priceRange, selectedBrand]);

  // ============ PAGINATION LOGIC ============

  /**
   * Tính tổng số trang cần có
   * - Nếu có limit (trang home): không phân trang, chỉ 1 trang
   * - Nếu không có limit (trang listing): tính theo itemsPerPage
   */
  const totalPages = limit ? 1 : Math.ceil(filteredPosts.length / itemsPerPage);

  /**
   * Tính toán danh sách posts cần hiển thị trên trang hiện tại
   * 2 trường hợp:
   * 1. Có limit (trang home): Hiển thị số lượng posts = limit
   * 2. Không limit (trang listing): Hiển thị theo phân trang (9 posts/trang)
   */
  let displayedPosts;
  if (limit) {
    // Trang home: chỉ lấy số lượng posts = limit
    displayedPosts = filteredPosts.slice(0, limit);
  } else {
    // Trang listing: áp dụng phân trang
    const startIndex = (currentPage - 1) * itemsPerPage; // VD: trang 2 = (2-1) * 9 = index 9
    const endIndex = startIndex + itemsPerPage; // VD: 9 + 9 = 18
    displayedPosts = filteredPosts.slice(startIndex, endIndex);
  }

  /**
   * Hàm xử lý chuyển trang
   * @param {number} pageNumber - Số trang cần chuyển đến
   */
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Cuộn lên đầu trang mượt mà khi chuyển trang
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ============ RENDER UI ============
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ===== SECTION: TIÊU ĐỀ ===== */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Xe điện nổi bật
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Khám phá những chiếc xe điện đã qua sử dụng chất lượng tốt nhất
          </p>
        </div>

        {/* ===== SECTION: SEARCH BAR (chỉ hiển thị ở trang listing đầy đủ) ===== */}
        {/* Conditional rendering: chỉ hiển thị khi không có limit (tức là trang danh sách đầy đủ) */}
        {!limit && (
          <div className="max-w-5xl mx-auto mb-12">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Input: Tìm kiếm theo từ khóa */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tìm kiếm
                  </label>
                  <input
                    type="text"
                    placeholder="Nhập tên xe, hãng xe..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>

                {/* Select: Lọc theo khoảng giá */}
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
                    <option value="0-100">Dưới 100 triệu</option>
                    <option value="100-300">100 - 300 triệu</option>
                    <option value="300-500">300 - 500 triệu</option>
                    <option value="500+">Trên 500 triệu</option>
                  </select>
                </div>

                {/* Select: Lọc theo hãng xe */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hãng xe
                  </label>
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  >
                    <option value="">Tất cả hãng xe</option>
                    <option value="tesla">Tesla</option>
                    <option value="bmw">BMW</option>
                    <option value="audi">Audi</option>
                    <option value="mercedes">Mercedes</option>
                    <option value="hyundai">Hyundai</option>
                    <option value="kia">Kia</option>
                    <option value="vinfast">VinFast</option>
                  </select>
                </div>

                {/* Button: Xóa tất cả bộ lọc */}
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setPriceRange("");
                      setSelectedBrand("");
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

        {/* ===== SECTION: DANH SÁCH XE ===== */}
        {/* Hiển thị theo 3 trường hợp:
            1. Không có posts nào từ API - hiển thị thông báo "Chưa có bài đăng"
            2. Có posts nhưng không có posts nào thỏa điều kiện lọc - hiển thị "Không tìm thấy"
            3. Có posts để hiển thị - Render grid 3 cột
        */}
        {posts.length === 0 ? (
          // Trường hợp 1: Không có posts nào
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-2">
              Chưa có bài đăng nào được xác thực
            </p>
            <p className="text-gray-400 text-sm">Vui lòng quay lại sau</p>
          </div>
        ) : displayedPosts.length === 0 ? (
          // Trường hợp 2: Có posts nhưng không có posts nào thỏa điều kiện lọc
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-2">
              Không tìm thấy xe điện nào phù hợp
            </p>
            <p className="text-gray-400 text-sm">
              Vui lòng thử lại với bộ lọc khác
            </p>
          </div>
        ) : (
          // Trường hợp 3: Có posts để hiển thị - Render grid 3 cột
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Map qua từng post và render thành card */}
            {displayedPosts.map((post) => {
              // Lấy thông tin VIP để style cho card
              const vipInfo = post.isVip ? getVipTierInfo(post.vipTier) : null;

              return (
                <div
                  key={post.id}
                  className={`relative bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 ${
                    post.isVip ? `border-2 ${vipInfo.border}` : "" // Thêm border màu theo VIP tier
                  }`}
                >
                  {/* --- Card Image Section --- */}
                  <div className="relative">
                    {/* Ảnh xe - ưu tiên ảnh đầu tiên trong mảng image, nếu không có thì dùng ảnh placeholder */}
                    <img
                      src={
                        post.image && post.image.length > 0
                          ? post.image[0]
                          : "https://cdn.thepennyhoarder.com/wp-content/uploads/2022/05/21141022/hybrid-vs-electric-final.jpg"
                      }
                      alt={post.title}
                      className="w-full h-56 object-cover"
                    />

                    {/* Huy hiệu VIP overlay trên ảnh (góc trên bên trái) */}
                    {post.isVip && vipInfo && (
                      <div
                        className={`absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-semibold shadow-md ${vipInfo.bg} ${vipInfo.color}`}
                      >
                        {vipInfo.label}
                      </div>
                    )}
                  </div>

                  {/* --- Card Content Section --- */}
                  <div className="p-6">
                    {/* Tiêu đề bài đăng */}
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {post.title}
                    </h3>

                    {/* Mô tả ngắn - chỉ hiển thị tối đa 2 dòng (line-clamp-2) */}
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {post.content}
                    </p>

                    {/* Tên người đăng */}
                    <p className="text-gray-600 mb-2 line-clamp-2">
                      {post.username}
                    </p>

                    {/* Ngày đăng (chỉ hiển thị nếu có createdAt) */}
                    {post.createdAt && (
                      <p className="text-gray-500 text-sm mb-4">
                        📅 Ngày đăng: {formatDate(post.createdAt)}
                      </p>
                    )}

                    {/* Hiển thị giá */}
                    <div className="flex justify-between items-center text-sm mb-4">
                      <span className="text-gray-600">Giá:</span>
                      <span className="font-semibold text-green-600 text-lg">
                        {formatPrice(post.price)}
                      </span>
                    </div>

                    {/* Action buttons - 2 nút cạnh nhau */}
                    <div className="flex space-x-3">
                      {/* Nút 1: Xem chi tiết (chuyển đến trang detail) */}
                      <Link
                        to={`/listing/ev/${post.id}`}
                        state={{ post }} // Truyền data post qua state để trang detail sử dụng
                        className="flex-1"
                      >
                        <button className="w-full bg-gray-900 text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors font-medium">
                          Xem chi tiết
                        </button>
                      </Link>

                      {/* Nút 2: Gửi yêu cầu mua xe */}
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

        {/* ===== SECTION: PAGINATION (chỉ hiển thị ở trang listing đầy đủ) ===== */}
        {/* Điều kiện hiển thị: không có limit + có posts + có nhiều hơn 1 trang */}
        {!limit && filteredPosts.length > 0 && totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-12">
            {/* Nút Previous (Trang trước) */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1} // Disable nếu đang ở trang đầu
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                currentPage === 1
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
              }`}
            >
              « Trước
            </button>

            {/* Các nút số trang */}
            {/* Logic hiển thị thông minh: 
                - Luôn hiển thị trang đầu và trang cuối
                - Hiển thị trang hiện tại và 1 trang ở mỗi bên (currentPage ± 1)
                - Hiển thị "..." nếu có khoảng cách giữa các trang
            */}
            {[...Array(totalPages)].map((_, index) => {
              const pageNumber = index + 1;

              // Hiển thị: trang đầu, trang cuối, trang hiện tại và 1 trang xung quanh
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
                        ? "bg-gray-900 text-white" // Active page
                        : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              }
              // Hiển thị "..." cho khoảng trống
              else if (
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

            {/* Nút Next (Trang sau) */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages} // Disable nếu đang ở trang cuối
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

        {/* ===== SECTION: NÚT XEM TẤT CẢ (chỉ hiển thị ở trang home) ===== */}
        {/* Điều kiện: có posts + prop showViewAll = true */}
        {posts.length > 0 && showViewAll && (
          <div className="text-center mt-12">
            <button
              onClick={() => navigate("/cars")} // Chuyển đến trang listing đầy đủ
              className="bg-gray-900 text-white px-8 py-3 rounded-md hover:bg-gray-800 transition-colors font-medium"
            >
              Xem tất cả xe điện
            </button>
          </div>
        )}
      </div>

      {/* ===== TOAST NOTIFICATION ===== */}
      {/* Hiển thị thông báo khi có action (thành công hoặc lỗi) */}
      {toast && msg && <Toast type={type} msg={msg} />}
    </section>
  );
};

export default CarListing;
