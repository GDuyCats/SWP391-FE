import React, { useState, useMemo } from "react";
import { ArrowLeft, Upload, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function EVListingForm() {
  const navigate = useNavigate();
  const [images, setImages] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    year: "",
    condition: "",
    km: "",
    origin: "",
    bodyType: "",
    gearbox: "",
    motor: "",
    exteriorColor: "",
    interiorColor: "",
    seats: "",
    doors: "",
    drive: "",
    price: "",
    tier: "",
    durationDays: 7,
    descriptionExtra: "",
  });

  const tiers = [
    { name: "VIP Kim Cương", price: "200.000 vnd/ngày", color: "bg-cyan-700" },
    { name: "VIP Vàng", price: "100.000 vnd/ngày", color: "bg-lime-600" },
    { name: "VIP Bạc", price: "50.000 vnd/ngày", color: "bg-gray-500" },
    { name: "Tin Thường", price: "5.000 vnd/ngày", color: "bg-slate-400" },
  ];

  const tierRates = {
    "VIP Kim Cương": 200000,
    "VIP Vàng": 100000,
    "VIP Bạc": 50000,
    "Tin Thường": 5000,
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const imageUrls = files.map((file) => URL.createObjectURL(file));
    setImages((prev) => [...prev, ...imageUrls]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const totalCost = useMemo(() => {
    const rate = tierRates[formData.tier] || 0;
    return rate * (Number(formData.durationDays) || 0);
  }, [formData.tier, formData.durationDays]);

  const description = useMemo(() => {
    const parts = [];
    if (formData.year) parts.push(`Năm sản xuất: ${formData.year}`);
    if (formData.condition) parts.push(`Tình trạng: ${formData.condition}`);
    if (formData.km) parts.push(`Số Km: ${formData.km}`);
    if (formData.origin) parts.push(`Xuất xứ: ${formData.origin}`);
    if (formData.bodyType) parts.push(`Kiểu dáng: ${formData.bodyType}`);
    if (formData.gearbox) parts.push(`Hộp số: ${formData.gearbox}`);
    if (formData.motor) parts.push(`Động cơ: ${formData.motor}`);
    if (formData.exteriorColor) parts.push(`Màu ngoại thất: ${formData.exteriorColor}`);
    if (formData.interiorColor) parts.push(`Màu nội thất: ${formData.interiorColor}`);
    if (formData.seats) parts.push(`Số chỗ: ${formData.seats}`);
    if (formData.doors) parts.push(`Số cửa: ${formData.doors}`);
    if (formData.drive) parts.push(`Dẫn động: ${formData.drive}`);
    if (formData.descriptionExtra) parts.push(`Ghi chú: ${formData.descriptionExtra}`);
    return parts.join('; ');
  }, [formData]);

  const handleContinue = () => {
    const payload = {
      title: formData.title,
      price: Number(formData.price) || 0,
      tier: formData.tier,
      durationDays: Number(formData.durationDays) || 0,
      specs: {
        year: formData.year,
        condition: formData.condition,
        km: formData.km,
        origin: formData.origin,
        bodyType: formData.bodyType,
        gearbox: formData.gearbox,
        motor: formData.motor,
        exteriorColor: formData.exteriorColor,
        interiorColor: formData.interiorColor,
        seats: formData.seats,
        doors: formData.doors,
        drive: formData.drive,
      },
      listingPlan: {
        tier: formData.tier,
        dailyRate: tierRates[formData.tier] || 0,
        durationDays: Number(formData.durationDays) || 0,
      },
      totalCost,
      description,
      images,
    };

    navigate('/listing/step2', { state: payload });
  };

  return (
    <div className="bg-gradient-to-b from-white-800 to-gray-300 min-h-screen text-black flex flex-col items-center py-10 px-6">
      <div className="w-full max-w-5xl bg-white/10 p-8 rounded-2xl shadow-lg border border-slate-700">
        {/* Header */}
        <h1 className="text-2xl font-semibold mb-6 text-center">Tạo Tin Đăng Xe Điện</h1>

        <form onSubmit={(e) => { e.preventDefault(); handleContinue(); }}>
          {/* Technical Information */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 border-b border-slate-600 pb-2">Thông số kỹ thuật</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <input name="year" value={formData.year} onChange={handleChange} type="text" placeholder="Năm sản xuất" className="input-field" />
              <input name="condition" value={formData.condition} onChange={handleChange} type="text" placeholder="Tình trạng (Xe mới/Xe đã dùng)" className="input-field" />
              <input name="km" value={formData.km} onChange={handleChange} type="text" placeholder="Số Km đã đi" className="input-field" />
              <input name="origin" value={formData.origin} onChange={handleChange} type="text" placeholder="Xuất xứ (Lắp ráp/nhập khẩu)" className="input-field" />
              <input name="bodyType" value={formData.bodyType} onChange={handleChange} type="text" placeholder="Kiểu dáng (Sedan, SUV...)" className="input-field" />
              <input name="gearbox" value={formData.gearbox} onChange={handleChange} type="text" placeholder="Hộp số (Số tự động...)" className="input-field" />
              <input name="motor" value={formData.motor} onChange={handleChange} type="text" placeholder="Động cơ (Điện...)" className="input-field" />
              <input name="exteriorColor" value={formData.exteriorColor} onChange={handleChange} type="text" placeholder="Màu ngoại thất" className="input-field" />
              <input name="interiorColor" value={formData.interiorColor} onChange={handleChange} type="text" placeholder="Màu nội thất" className="input-field" />
              <input name="seats" value={formData.seats} onChange={handleChange} type="text" placeholder="Số chỗ ngồi" className="input-field" />
              <input name="doors" value={formData.doors} onChange={handleChange} type="text" placeholder="Số cửa" className="input-field" />
              <input name="drive" value={formData.drive} onChange={handleChange} type="text" placeholder="Dẫn động (AWD, FWD...)" className="input-field" />
            </div>
          </section>

          {/* Image Upload Section */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 border-b border-slate-600 pb-2">Hình ảnh xe</h2>
            <div className="flex items-center gap-4 mb-4">
              <label className="flex items-center gap-2 cursor-pointer bg-cyan-600 hover:bg-cyan-700 px-4 py-2 rounded-lg transition">
                <Upload className="w-5 h-5" /> Tải hình ảnh
                <input type="file" multiple className="hidden" onChange={handleImageUpload} />
              </label>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {images.map((src, index) => (
                <img key={index} src={src} alt={`uploaded ${index}`} className="w-full h-32 object-cover rounded-lg border border-slate-700" />
              ))}
            </div>
          </section>

          {/* Price and Buttons */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <label className="text-lg font-medium">Giá bán:</label>
              <input name="price" type="text" placeholder="Nhập giá..." className="px-4 py-2 rounded-md bg-white/10 border border-slate-700 focus:ring-2 focus:ring-cyan-500" value={formData.price} onChange={handleChange} />
              <span className="font-semibold">VNĐ</span>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="mr-4">
                <label className="block mb-1 font-semibold">Chọn loại tin</label>
                <div className="space-y-2">
                  {tiers.map((opt) => (
                    <label key={opt.name} className={`flex items-center gap-2 ${opt.color} text-white p-2 rounded-md`}>
                      <input name="tier" type="radio" value={opt.name} checked={formData.tier === opt.name} onChange={handleChange} />
                      <span className="ml-2">{opt.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block mb-1 font-semibold">Thời gian đăng</label>
                <div className="flex gap-2">
                  {[7,10,15].map((n) => (
                    <button key={n} type="button" onClick={() => setFormData((p) => ({ ...p, durationDays: n }))} className={`px-3 py-2 rounded ${formData.durationDays === n ? 'bg-cyan-600' : 'bg-white/20'}`}>
                      {n} Ngày
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <section className="mb-8 mt-4">
            <h2 className="text-xl font-semibold mb-4 border-b border-slate-600 pb-2">Thông tin mô tả</h2>
            <textarea name="descriptionExtra" placeholder="Mô tả chi tiết về xe, tình trạng, bảo hành, lịch sử sử dụng..." className="w-full h-40 p-3 rounded-lg bg-white/10 border border-slate-700 focus:ring-2 focus:ring-cyan-500 resize-none" value={formData.descriptionExtra} onChange={handleChange} />
          </section>

          <div className="flex justify-between items-center">
            <button type="button" onClick={() => navigate('/chooselisting')} className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-md">
              <ArrowLeft size={18} /> Quay lại
            </button>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-gray-300">Tổng chi phí:</div>
                <div className="text-lg font-semibold text-blue-400">{totalCost.toLocaleString()} VND</div>
              </div>
              <button type="submit" className="bg-cyan-600 hover:bg-cyan-700 px-6 py-2 rounded-md font-semibold">Tiếp tục <ArrowRight size={18} /></button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}