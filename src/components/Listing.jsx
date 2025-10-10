import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { Upload, DollarSign, ArrowRight, ArrowLeft } from "lucide-react";

export default function ListingForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    price: "",
    tier: "",
    durationDays: "",
    specs: {
      type: "",
      capacity: "",
      voltage: "",
      cells: "",
      soh: "",
      cycles: "",
      year: "",
      condition: "",
    },
    descriptionExtra: "",
  });

  const specLabels = [
    { key: "type", label: "Loại Pin" },
    { key: "capacity", label: "Dung lượng (kWh)" },
    { key: "voltage", label: "Điện áp (V)" },
    { key: "cells", label: "Số cell/module" },
    { key: "soh", label: "SOH (%)" },
    { key: "cycles", label: "Cycle Count" },
    { key: "year", label: "Năm sản xuất" },
    { key: "condition", label: "Trạng thái" },
  ];

  const handleSpecChange = (key, value) => {
    setFormData((p) => ({ ...p, specs: { ...p.specs, [key]: value } }));
  };

  const handleChange = (field, value) => setFormData((p) => ({ ...p, [field]: value }));

  const description = useMemo(() => {
    const parts = specLabels.map((s) => {
      const v = formData.specs[s.key];
      return v ? `${s.label}: ${v}` : null;
    }).filter(Boolean);
    if (formData.descriptionExtra) parts.push(`Ghi chú: ${formData.descriptionExtra}`);
    return parts.join('; ');
  }, [formData.specs, formData.descriptionExtra]);

  const tiers = [
    { name: "VIP Kim Cương", price: "200.000 vnd/ngày", color: "bg-cyan-700" },
    { name: "VIP Vàng", price: "100.000 vnd/ngày", color: "bg-lime-600" },
    { name: "VIP Bạc", price: "50.000 vnd/ngày", color: "bg-gray-500" },
    { name: "Tin Thường", price: "5.000 vnd/ngày", color: "bg-slate-400" },
  ];

  const durations = [7, 10, 15];

  const handleContinue = () => {
    const payload = {
      ...formData,
      price: Number(formData.price) || 0,
      duration: Number(formData.durationDays) || 0,
      description,
    };
    navigate('/listing/step2', { state: payload });
  };

  return (
    <div className="bg-gradient-to-r from-slate-800 to-cyan-900 text-white min-h-screen p-10">
      <div className="max-w-6xl mx-auto bg-white/10 p-8 rounded-2xl shadow-lg backdrop-blur">
        {/* Step Header */}
        <h2 className="text-2xl font-semibold mb-6">Tạo Tin Đăng - Bước 1</h2>

        {/* Basic Info */}
        <section className="mb-6">
          <h3 className="font-semibold mb-2">Thông tin cơ bản</h3>
          <input
            type="text"
            placeholder="Tiêu đề"
            className="w-full p-2 rounded-md bg-white/20 border border-white/30 placeholder:text-gray-300"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
          />
        </section>

        {/* Technical Specs */}
        <section className="mb-6 grid grid-cols-2 md:grid-cols-3 gap-4">
          {specLabels.map((s) => (
            <div key={s.key}>
              <label className="block mb-1 text-sm">{s.label}</label>
              <input
                type="text"
                className="w-full p-2 rounded-md bg-white/20 border border-white/30 placeholder:text-gray-300"
                value={formData.specs[s.key]}
                onChange={(e) => handleSpecChange(s.key, e.target.value)}
              />
            </div>
          ))}
        </section>

        {/* Image Upload */}
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
                className="flex-1 p-2 rounded-md bg-white/20 border border-white/30"
                value={formData.price}
                onChange={(e) => handleChange('price', e.target.value)}
              />
              <DollarSign />
            </div>
          </div>

          {/* Right: Package Options */}
          <div>
            <label className="block mb-2 font-semibold">Chọn loại tin</label>
            <div className="space-y-2">
              {tiers.map((opt) => (
                <label
                  key={opt.name}
                  className={`flex justify-between items-center p-2 rounded-md cursor-pointer hover:bg-opacity-90 ${opt.color} text-white`}
                >
                  <input
                    type="radio"
                    name="vip"
                    className="mr-2"
                    checked={formData.tier === opt.name}
                    onChange={() => handleChange('tier', opt.name)}
                  /> {opt.name}
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
            {durations.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => handleChange('durationDays', String(d))}
                className={`px-4 py-2 rounded-md ${formData.durationDays === String(d) ? 'bg-cyan-600' : 'bg-white/20 hover:bg-white/30'} transition`}
              >
                {d} Ngày
              </button>
            ))}
          </div>
        </section>

        {/* Actions */}
        <div className="flex justify-between mt-8">
          <button
            onClick={() => navigate("/chooselisting")}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-md"
            type="button"
          >
            <ArrowLeft size={16} /> Quay lại
          </button>
          <button
            onClick={handleContinue}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-700 hover:bg-cyan-800 rounded-md"
            type="button"
          >
            Tiếp tục <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
