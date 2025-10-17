import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, DollarSign, ArrowLeft } from "lucide-react";

function ListingBattery() {
  const navigate = useNavigate();

  // Placeholder mock API base — replace with your mock server URL
  const MOCK_API_URL = "https://mockapi.example.com";

  const [formData, setFormData] = useState({
    title: "",
    type: "",
    capacity: "",
    voltage: "",
    soh: "",
    cycleCount: "",
    year: "",
    status: "",
    price: "",
    tier: "",
    durationDays: 7,
    cells: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const tierRates = {
    "VIP Kim Cương": 200000,
    "VIP Vàng": 100000,
    "VIP Bạc": 50000,
    "Tin Thường": 5000,
  };

  const totalCost = useMemo(() => {
    const rate = tierRates[formData.tier] || 0;
    return rate * (Number(formData.durationDays) || 0);
  }, [formData.tier, formData.durationDays]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMsg("");

    const payload = {
      ...formData,
      price: Number(formData.price) || 0,
      listingPlan: {
        tier: formData.tier,
        dailyRate: tierRates[formData.tier] || 0,
        durationDays: Number(formData.durationDays) || 0,
      },
      totalCost,
    };

    try {
      // Send JSON to mock API (placeholder). If you don't want to POST, you can comment this out.
      const res = await fetch(`${MOCK_API_URL}/listings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // Attempt to parse response; if mock server isn't available this may throw
      let serverData = null;
      if (res.ok) {
        serverData = await res.json();
        setSuccessMsg("Đã tạo tin đăng (từ mock API)");
      } else {
        // Non-2xx response — still proceed to step2 with local payload
        setSuccessMsg("Không thể lưu lên mock API — chuyển tiếp với dữ liệu cục bộ");
      }

      // Navigate to step2, include server response when available
      navigate('/listing/step2', { state: { ...payload, serverData } });
    } catch (err) {
      // Network or parsing error — navigate with payload anyway
      console.error('Failed to POST listing to mock API', err);
      setSuccessMsg("Lỗi kết nối tới mock API — chuyển tiếp với dữ liệu cục bộ");
      navigate('/listing/step2', { state: payload });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-white-800 to-white-900 text-black min-h-screen p-10">
      <div className="max-w-6xl mx-auto bg-gray-100/10 p-8 rounded-2xl shadow-lg backdrop-blur">
        {/* Step Header */}
        <h2 className="text-2xl font-semibold mb-6">Tạo Tin Đăng - Bước 1</h2>

        {/* Wrap fields in a form so submit is triggered */}
        <form onSubmit={handleSubmit}>
          {/* Basic Info */}
          <section className="mb-6">
            <h3 className="font-semibold mb-2">Thông tin cơ bản</h3>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Tiêu đề"
              className="w-full p-2 rounded-md bg-white/20 border border-white/30 placeholder:text-gray-300"
            />
          </section>

          {/* Technical Specs */}
          <section className="mb-6 grid grid-cols-2 md:grid-cols-3 gap-4">
            <h3 className="font-semibold mb-2">Thông số kỹ thuật</h3>
            {[
              { key: 'type', label: 'Loại Pin' },
              { key: 'capacity', label: 'Dung lượng (kWh)' },
              { key: 'voltage', label: 'Điện áp (V)' },
              { key: 'cycleCount', label: 'Cycle Count' },
              { key: 'soh', label: 'SOH (%)' },
              { key: 'year', label: 'Năm sản xuất' },
              { key: 'status', label: 'Trạng thái' },
              { key: 'cells', label: 'Số cell/module' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="block mb-1 text-sm">{label}</label>
                <input
                  type="text"
                  name={key}
                  value={formData[key]}
                  onChange={handleChange}
                  placeholder={label}
                  className="w-full p-2 rounded-md bg-white/20 border border-white/30 placeholder:text-gray-300"
                />
              </div>
            ))}
          </section>

          {/* Image Upload (visual only) */}
          <section className="mb-6">
            <h3 className="font-semibold mb-2">Hình ảnh</h3>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((box) => (
                <div
                  key={box}
                  className="flex items-center justify-center border-2 border-dashed border-gray-400 rounded-md h-32 cursor-pointer hover:bg-white/10 transition"
                >
                  <Upload className="w-6 h-6" />
                </div>
              ))}
            </div>
          </section>

          {/* Price & Options */}
          <section className="grid md:grid-cols-2 gap-8">
            {/* Left: Price */}
            <div>
              <label className="block mb-2 font-semibold">Giá tiền (VND)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="Nhập giá tiền"
                  className="flex-1 p-2 rounded-md bg-white/20 border border-white/30"
                />
                <DollarSign />
              </div>
            </div>

            {/* Right: Package Options */}
            <div>
              <label className="block mb-2 font-semibold">Chọn loại tin</label>
              <div className="space-y-2">
                {[
                  { name: "VIP Kim Cương", price: "200.000 vnd/ngày", color: "bg-cyan-700" },
                  { name: "VIP Vàng", price: "100.000 vnd/ngày", color: "bg-lime-600" },
                  { name: "VIP Bạc", price: "50.000 vnd/ngày", color: "bg-gray-500" },
                  { name: "Tin Thường", price: "5.000 vnd/ngày", color: "bg-slate-400" },
                ].map((opt) => (
                  <label
                    key={opt.name}
                    className={`flex justify-between items-center p-2 rounded-md cursor-pointer hover:bg-opacity-90 ${opt.color} text-white`}
                  >
                    <input type="radio"
                      name="tier"
                      value={opt.name}
                      checked={formData.tier === opt.name}
                      onChange={handleChange}
                      className="mr-2" /> {opt.name}
                    <span className="text-sm">{opt.price}</span>
                  </label>
                ))}
              </div>
            </div>
          </section>

          {/* Post Duration */}
          <section className="mt-6">
            <label className="block mb-2 font-semibold">Thời gian đăng bài</label>
            <div className="flex gap-4">
              {[7, 10, 15].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, durationDays: num }))}
                  className={`px-4 py-2 rounded-md ${formData.durationDays === num ? 'bg-cyan-600' : 'bg-white/20 hover:bg-white/30'} transition`}
                >
                  {num} Ngày
                </button>
              ))}
            </div>
          </section>

          {/* Total Cost + Submit */}
          <div className="mt-6 p-3 rounded-lg bg-gray-100 flex justify-between items-center">
            <span className="text-gray-300 text-sm">Tổng chi phí đăng bài:</span>
            <span className="text-lg font-semibold text-blue-400">
              {totalCost.toLocaleString()} VND
            </span>

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-semibold"
            >
              {isSubmitting ? "Đang gửi..." : "Tiếp tục"}
            </button>
          </div>
        </form>

        {/* Actions */}
        <div className="flex justify-start mt-8">
          <button
            onClick={() => navigate("/chooselisting")}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-md"
            type="button"
          >
            <ArrowLeft size={16} /> Quay lại
          </button>
        </div>

        {successMsg && <div className="mt-4 text-sm text-green-300">{successMsg}</div>}

      </div>
    </div>
  );
}

export default ListingBattery;