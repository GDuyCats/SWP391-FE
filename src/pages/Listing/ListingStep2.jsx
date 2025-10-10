import React, { useState, useMemo } from "react";
import axios from "axios";
import { CreditCard, Banknote, Wallet, Truck } from "lucide-react";
import { useLocation } from "react-router-dom";

export default function ListingStep2({ listingData, onPaymentSuccess }) {
  const [paymentData, setPaymentData] = useState({
    method: "",
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvv: "",
    transactionCode: "",
    paymentStatus: "Pending",
    paymentDate: new Date().toISOString().slice(0, 10),
  });

  const [isPaying, setIsPaying] = useState(false);
  const [message, setMessage] = useState("");

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setPaymentData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePaymentMethod = (method) => {
    setPaymentData((prev) => ({ ...prev, method }));
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    setIsPaying(true);
    setMessage("");

    try {
      const response = await axios.post(
        "https://<your-postman-mock-id>.mock.pstmn.io/submit-payment",
        {
          listing: listingData,
          payment: paymentData,
        }
      );
      setMessage("✅ Thanh toán thành công!");
      onPaymentSuccess?.(response.data);
    } catch (error) {
      setMessage("❌ Lỗi khi thanh toán: " + error.message);
    } finally {
      setIsPaying(false);
    }
  };
  // prefer serverData from navigation state when available
  const location = useLocation();
  const navState = location?.state ?? null;
  const listing = listingData ?? (navState?.serverData ?? navState) ?? {};

  const displayAmount = useMemo(() => {
    if (listing?.totalCost) return listing.totalCost;
    const price = Number(listing?.price) || 0;
    const duration = Number(listing?.durationDays ?? listing?.duration ?? 1) || 1;
    return price * duration;
  }, [listing]);

  return (
    <div className="flex flex-col md:flex-row bg-[#0E2A47] text-white p-8 rounded-2xl shadow-xl gap-8">
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
            <strong>Hãng:</strong> {listing.batteryType || listing.type || "Chưa nhập"}
          </p>
          <p>
            <strong>Dung lượng:</strong> {listing.capacity || "Chưa nhập"}{" "}
            kWh
          </p>
          <p>
            <strong>Điện áp:</strong> {listing.voltage || "Chưa nhập"} V
          </p>
          <p>
            <strong>Trạng thái:</strong> {listing.status || "Chưa nhập"}
          </p>
          <p>
            <strong>Thời gian đăng:</strong> {(listing.durationDays ?? listing.duration) || "Chưa nhập"} ngày
          </p>
        </div>
      </div>

      {/* --- Right: Payment Section --- */}
      <div className="flex-1 bg-[#173B63] rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-4">Thanh Toán</h2>
        <p className="mb-3">
          Số tiền cần thanh toán: {" "}
          <strong className="text-blue-400">{displayAmount.toLocaleString()} VND</strong>
        </p>

        {/* Payment Methods */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { label: "Credit/Debit Card", icon: CreditCard },
            { label: "Bank Transfer", icon: Banknote },
            { label: "Cash on Delivery", icon: Truck },
            { label: "E-Wallet", icon: Wallet },
          ].map(({ label, icon: Icon }) => (
            <button
              key={label}
              type="button"
              onClick={() => handlePaymentMethod(label)}
              className={`flex items-center justify-center gap-2 border rounded-lg py-2 transition ${
                paymentData.method === label
                  ? "bg-blue-600 border-blue-400"
                  : "bg-[#0E2A47] border-gray-600 hover:bg-[#1B456F]"
              }`}
            >
              <Icon size={16} /> {label}
            </button>
          ))}
        </div>

        {/* Payment Form */}
        <form onSubmit={handleSubmitPayment} className="space-y-3">
          <div className="grid grid-cols-1 gap-2">
            <input
              type="text"
              name="cardNumber"
              placeholder="Card Number"
              value={paymentData.cardNumber}
              onChange={handlePaymentChange}
              className="w-full bg-[#0E2A47] p-2 rounded-lg outline-none placeholder-gray-400"
            />
            <input
              type="text"
              name="cardName"
              placeholder="Name on Card"
              value={paymentData.cardName}
              onChange={handlePaymentChange}
              className="w-full bg-[#0E2A47] p-2 rounded-lg outline-none placeholder-gray-400"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                name="expiry"
                placeholder="Expiry Date"
                value={paymentData.expiry}
                onChange={handlePaymentChange}
                className="bg-[#0E2A47] p-2 rounded-lg outline-none placeholder-gray-400"
              />
              <input
                type="text"
                name="cvv"
                placeholder="CVV"
                value={paymentData.cvv}
                onChange={handlePaymentChange}
                className="bg-[#0E2A47] p-2 rounded-lg outline-none placeholder-gray-400"
              />
            </div>
            <input
              type="text"
              name="transactionCode"
              placeholder="Transaction Code"
              value={paymentData.transactionCode}
              onChange={handlePaymentChange}
              className="w-full bg-[#0E2A47] p-2 rounded-lg outline-none placeholder-gray-400"
            />
          </div>

          <button
            type="submit"
            disabled={isPaying}
            className="w-full bg-green-600 hover:bg-green-700 py-2 rounded-lg font-semibold"
          >
            {isPaying ? "Đang thanh toán..." : "Thanh Toán Ngay"}
          </button>
        </form>

        {message && <p className="mt-3 text-sm text-center">{message}</p>}
      </div>
    </div>
  );
}
            