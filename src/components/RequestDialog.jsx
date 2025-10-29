import React, { useEffect, useState } from "react";
import { X, ClipboardList, ClipboardCheck } from "lucide-react";
import { api } from "../services/api";
import Toast from "../components/Toast";

export default function ContractDialog({ open, onClose, staffId }) {
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(false);
    const [type, setType] = useState("");
    const [msg, setMsg] = useState("");


    async function getAllContracts() {
        setLoading(true);
        try {
            const res = await api.get("/admin/contracts/allContract");
            if (res.status === 200) {

                const unassigned = (res.data.contracts || []).filter(
                    (c) => !c.staffId
                );
                setContracts(unassigned);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }


    async function handleAssign(id) {
        try {
            const res = await api.post("/admin/contracts/assign-staff", {
                contractId: id,
                staffId: staffId,
            });

            if (res.status === 200) {
                setToast(true);
                setType("success");
                setMsg("Gán nhân viên phụ trách hợp đồng thành công");


                setContracts((prev) => prev.filter((c) => c.id !== id));
            }
        } catch (error) {
            console.log(error);
            const status = error?.status;
            const msg = error?.response?.data;
            let errorMsg = "Không thể gán nhân viên phụ trách hợp đồng";

            if (status === 400)
                errorMsg = msg || "Dữ liệu không hợp lệ hoặc contract không thể gán";
            else if (status === 401)
                errorMsg = msg || "Thiếu hoặc token không hợp lệ";
            else if (status === 403)
                errorMsg = msg || "Không đủ quyền (chỉ admin được phép)";
            else if (status === 404)
                errorMsg = msg || "Không tìm thấy hợp đồng hoặc staff";
            else if (status === 500)
                errorMsg = msg || "Lỗi máy chủ";

            setType("error");
            setMsg(errorMsg);
        } finally {
            setTimeout(() => setToast(false), 3000);
        }
    }

    useEffect(() => {
        if (open) getAllContracts();
    }, [open]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl p-6 relative">

                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                >
                    <X className="w-6 h-6" />
                </button>


                <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                    <ClipboardList className="text-blue-600" />
                    Danh sách hợp đồng chưa có nhân viên phụ trách
                </h2>


                {loading ? (
                    <div className="text-center py-8 text-gray-500 text-sm">
                        Đang tải dữ liệu...
                    </div>
                ) : contracts.length > 0 ? (
                    <div className="overflow-x-auto max-h-[500px] overflow-y-auto border border-gray-200 rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-100 text-gray-600 uppercase text-xs font-semibold">
                                <tr>
                                    <th className="px-5 py-3 text-left">Mã</th>
                                    <th className="px-5 py-3 text-left">Người mua (buyerId)</th>
                                    <th className="px-5 py-3 text-left">Người bán (sellerId)</th>
                                    <th className="px-5 py-3 text-left">Bài đăng (postId)</th>
                                    <th className="px-5 py-3 text-center">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {contracts.map((c) => (
                                    <tr
                                        key={c.id}
                                        className="hover:bg-gray-50 transition-colors duration-150"
                                    >
                                        <td className="px-5 py-3 font-medium text-gray-900">
                                            #{c.id}
                                        </td>
                                        <td className="px-5 py-3 text-gray-700">{c.buyerId}</td>
                                        <td className="px-5 py-3 text-gray-700">{c.sellerId}</td>
                                        <td className="px-5 py-3 text-gray-700">{c.postId}</td>
                                        <td className="px-5 py-3 text-center">
                                            <button
                                                onClick={() => handleAssign(c.id)}
                                                className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all duration-300 mx-auto text-sm"
                                            >
                                                <ClipboardCheck className="w-5 h-5" />
                                                Xác nhận
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center text-gray-500 py-8 text-sm">
                        Tất cả hợp đồng đã có nhân viên phụ trách.
                    </div>
                )}
            </div>

            {toast && msg && <Toast type={type} msg={msg} />}
        </div>
    );
}
