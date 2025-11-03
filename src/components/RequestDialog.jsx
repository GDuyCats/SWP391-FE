import React, { useEffect, useState } from "react";
import { X, UserCheck, Search } from "lucide-react";
import { api } from "../services/api";
import Toast from "../components/Toast";

export default function RequestDialog({ open, onClose, contractId }) {
    const [staffs, setStaffs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [toast, setToast] = useState(false);
    const [type, setType] = useState("");
    const [msg, setMsg] = useState("");

    // === LẤY TẤT CẢ NHÂN VIÊN ===
    async function getAllStaff() {
        setLoading(true);
        try {
            const res = await api.get("/admin/staff");
            if (res.status === 200) {
                setStaffs(res.data.staff || []);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    // === GÁN NHÂN VIÊN CHO HỢP ĐỒNG ===
    async function handleAssign(staffId) {
        try {
            const res = await api.post("/admin/contracts/assign-staff", {
                contractId: contractId,
                staffId: staffId,
            });
            if (res.status === 200) {
                setToast(true);
                setType("success");
                setMsg("Gán nhân viên thành công!");
                onClose(); // Đóng dialog
            }
        } catch (error) {
            console.log(error);
            const status = error?.response?.status;
            let errorMsg = "Không thể gán nhân viên";
            setType("error");

            if (status === 400) errorMsg = "Dữ liệu không hợp lệ";
            else if (status === 403) errorMsg = "Không đủ quyền";
            else if (status === 404) errorMsg = "Không tìm thấy hợp đồng/staff";
            else if (status === 500) errorMsg = "Lỗi máy chủ";

            setMsg(errorMsg);
            setToast(true);
        } finally {
            setTimeout(() => setToast(false), 3000);
        }
    }

    useEffect(() => {
        if (open) {
            getAllStaff();
        }
    }, [open]);

    // Lọc theo tìm kiếm
    const filteredStaff = staffs.filter(
        (s) =>
            s.username.toLowerCase().includes(search.toLowerCase()) ||
            s.email.toLowerCase().includes(search.toLowerCase())
    );

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                >
                    <X className="w-6 h-6" />
                </button>

                <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                    <UserCheck className="text-blue-600" />
                    Chọn nhân viên phụ trách hợp đồng #{contractId}
                </h2>

                {/* Tìm kiếm */}
                <div className="mb-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Tìm theo tên hoặc email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Danh sách staff */}
                {loading ? (
                    <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                    </div>
                ) : filteredStaff.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredStaff.map((staff) => (
                            <div
                                key={staff.id}
                                className="border border-gray-200 rounded-lg p-4 hover:border-blue-400 transition cursor-pointer"
                                onClick={() => handleAssign(staff.id)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                            <span className="text-blue-600 font-bold text-sm">
                                                {staff.username.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{staff.username}</p>
                                            <p className="text-sm text-gray-500">{staff.email}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleAssign(staff.id)}
                                        className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium hover:bg-blue-700 transition"
                                    >
                                        Chọn
                                    </button>
                                </div>
                                {staff.phone && (
                                    <p className="text-xs text-gray-500 mt-2">Phone: {staff.phone}</p>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        Không tìm thấy nhân viên nào.
                    </div>
                )}
            </div>

            {toast && msg && <Toast type={type} msg={msg} />}
        </div>
    );
}