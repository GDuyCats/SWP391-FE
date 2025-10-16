import React, { useState, useMemo } from "react";
import { api } from "../../services/api";
import { CreditCard, Banknote, Wallet, Truck } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export default function ListingStep2({ listingData }) {

  const [message, setMessage] = useState("");
  const [isPosting, setIsPosting] = useState(false);




  // prefer serverData from navigation state when available
  const location = useLocation();
  const navState = location?.state ?? null;
  const listing = listingData ?? (navState?.serverData ?? navState) ?? {};

  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  // friendly empty-state guard
  const hasListing = listing && Object.keys(listing).length > 0;
  if (!hasListing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-slate-800 to-cyan-900 text-white p-6">
        <div className="max-w-xl w-full bg-white/5 p-8 rounded-xl shadow-lg text-center">
          <h2 className="text-2xl font-semibold mb-4">Không có dữ liệu tin đăng</h2>
          <p className="text-sm text-gray-200 mb-6">Vui lòng tạo một tin mới trước khi truy cập trang xác nhận.</p>
          <div className="flex justify-center gap-4">
            <button onClick={() => navigate('/listing/step1')} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-md font-semibold">Tạo tin mới</button>
            <button onClick={() => navigate('/')} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-md font-semibold">Về trang chủ</button>
          </div>
        </div>
      </div>
    );
  }

  const displayAmount = useMemo(() => {
    if (listing?.totalCost) return listing.totalCost;
    const price = Number(listing?.price) || 0;
    const duration = Number(listing?.durationDays ?? listing?.duration ?? 1) || 1;
    return price * duration;
  }, [listing]);
  async function handlePost() {
    setIsPosting(true);
    setMessage("");
    try {
      // If image files were passed, send multipart/form-data
      if (Array.isArray(listing.imageFiles) && listing.imageFiles.length > 0) {
        const fd = new FormData();
        fd.append('title', listing.title || '');
        fd.append('content', listing.content || '');
        fd.append('price', listing.price || 0);
        fd.append('category', listing.category || '');
        listing.imageFiles.forEach((file) => fd.append('images', file));

        await api.post('/create', fd, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data' },
        });
      } else {
        const payload = {
          title: listing.title,
          content: listing.content,
          price: Number(listing.price) || 0,
          category: listing.category,
        };
        await api.post('/create', payload, {
          headers: { Authorization: `Bearer ${token}`, }
        });
      }
      setMessage('✅ Đăng bài thành công!');
    } catch (err) {
      setMessage('❌ Lỗi khi đăng bài: ' + (err?.message || 'Unknown'));
    } finally {
      navigate('/success');
      setIsPosting(false);
    }
  }

  return (
   
    <div className="bg-gradient-to-r from-slate-800 to-cyan-900 text-white min-h-screen p-10">
     <section>
      {/* --- Left: Listing Preview --- */}
      <div className="flex-1 bg-[#173B63] rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-4">Xem trước</h2>

        <div className="relative mb-4">
          <div
            className={`absolute top-2 left-2 px-3 py-1 text-sm font-semibold rounded-md ${
              listing?.tier === "VIP Kim Cương"
                ? "bg-blue-600"
                : listing?.tier === "VIP Vàng"
                ? "bg-yellow-500 text-black"
                : listing?.tier === "VIP Bạc"
                ? "bg-gray-400 text-black"
                : "bg-green-700"
            }`}
          >
            {listing?.tier}
          </div>
          <div className="w-full h-40 bg-[#0E2A47] flex items-center justify-center rounded-lg text-gray-300 border border-dashed border-gray-500">
            Ảnh Đính Kèm
          </div>
        </div>

        <div className="space-y-2">
          <p>
            <strong>Tiêu đề:</strong> {listing.title || "Chưa nhập"}
          </p>
          <p>
            <strong>Giá:</strong> {listing.price?.toLocaleString()} VND
          </p>
          <p>
            <strong>Thông Tin Chung:</strong> {listing.content || "Chưa nhập"}
          </p>
          <p>
            <strong>Ảnh:</strong> {listing.images || "Chưa nhập"}
          </p>
          <p>
            <strong>Số Điện Thoại:</strong> {listing.phone || "Chưa nhập"} 
          </p>
          <p>
            <strong>Loại bài:</strong> {listing.category || "Chưa nhập"}
          </p>
        </div>
      </div>
</section>
<section>

      <div className="flex-1 bg-[#173B63] rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-4">Xác nhận đăng bài</h2>

          <button
            type="submit"
            onClick={handlePost}
            disabled={isPosting}
            className="w-full bg-green-600 hover:bg-green-700 py-2 rounded-lg font-semibold"
          >
            {isPosting ? "Đang đăng bài..." : "Đăng Bài Ngay"}
          </button>

        {message && <p className="mt-3 text-sm text-center">{message}</p>}
      </div>

      </section>
    </div>
  );
}
            