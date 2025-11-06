import { useEffect, useState } from "react";
import { api } from "../services/api";
import { ClipboardList, Calendar, User, CheckCircle, Tag, FileText } from "lucide-react";
import Toast from "./Toast";
import { useNavigate } from "react-router-dom"; // Thêm import

function RequestManagement() {
    const navigate = useNavigate(); // Khai báo navigate

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(null); // Loading riêng cho từng nút
    const [toast, setToast] = useState(false);
    const [type, setType] = useState("");
    const [msg, setMsg] = useState("");

    async function getAllBuyerRequest() {
        setLoading(true);
        try {
            const res = await api.get("/PurchaseRequests/vehicle-purchase-requests");
            if (res.status === 200) {
                const allRequests = res.data.items || [];
                const pendingRequests = allRequests.filter(
                    (req) => req.status !== "accept" && req.status !== "accepted"
                );
                setRequests(pendingRequests);
            }
        } catch (error) {
            console.error(error);
            setToast(true);
            setType("error");
            setMsg("Không thể tải danh sách yêu cầu");
        } finally {
            setLoading(false);
        }
    }

    async function acceptRequest(id) {
        setActionLoading(id);
        try {
            const res = await api.patch(`/PurchaseRequests/${id}/accept`);
            console.log(res)
            if (res.status === 200) {
                setToast(true);
                setType("success");
                setMsg(res.data.message || "Chấp nhận yêu cầu thành công");

                // Xóa khỏi danh sách
                setRequests((prev) => prev.filter((req) => req.id !== id));
            }
        } catch (error) {
            console.log(error);
            const status = error?.response?.status;
            const apiMsg = error?.response?.data?.message;
            let errorMsg = "Không thể chấp nhận yêu cầu mua hàng";

            if (status === 403) errorMsg = apiMsg || "Không có quyền";
            else if (status === 404) errorMsg = apiMsg || "Request không tồn tại";
            else if (status === 500) errorMsg = apiMsg || "Lỗi máy chủ";

            setToast(true);
            setType("error");
            setMsg(errorMsg);
        } finally {
            setActionLoading(null);
            setTimeout(() => setToast(false), 3000);
        }
    }

    useEffect(() => {
        getAllBuyerRequest();
    }, []);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getStatusBadge = (status) => {
        if (status === "pending")
            return (
                <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
          Đang chờ
        </span>
            );
        return null; // "accepted" đã bị lọc → không cần hiển thị
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <ClipboardList className="w-7 h-7 text-blue-600" />
                    Quản Lý Yêu Cầu Mua Hàng
                </h1>
                <p className="text-gray-600 mt-1">Xem và xử lý các yêu cầu mua hàng từ người dùng</p>
            </div>

            {/* Loading toàn bộ */}
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : requests.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                    <p className="text-gray-500 text-lg">Không có yêu cầu mua hàng nào đang chờ xử lý.</p>
                </div>
            ) : (
                <div className="grid gap-5">
                    {requests.map((req) => (
                        <div
                            key={req.id}
                            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200 border border-gray-100"
                        >
                            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                                <div className="flex-1 space-y-3">
                                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                                        <span className="font-medium">ID: #{req.id}</span>
                                        <span>•</span>
                                        <span>Mã tin: #{req.postId}</span>
                                        {req.status && (
                                            <>
                                                <span>•</span>
                                                {getStatusBadge(req.status)}
                                            </>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                                        <FileText className="w-5 h-5 text-blue-600" />
                                        <span className="truncate max-w-md" title={req.Post?.title}>
                      {req.Post?.title || "Không có tiêu đề"}
                    </span>
                                    </div>

                                    {req.Post?.category && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Tag className="w-4 h-4" />
                                            <span className="capitalize">{req.Post.category}</span>
                                        </div>
                                    )}

                                    <p className="text-gray-700 italic">
                                        "{req.message || "Người mua đã gửi yêu cầu mua hàng"}"
                                    </p>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
                                        <div className="flex items-center gap-1">
                                            <User className="w-4 h-4 text-blue-600" />
                                            <span>
                        <strong>Mua:</strong> {req.buyer?.username || "—"} (ID: {req.buyerId})
                      </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <User className="w-4 h-4 text-green-600" />
                                            <span>
                        <strong>Bán:</strong> {req.seller?.username || "—"} (ID: {req.sellerId})
                      </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1 text-sm text-gray-500">
                                        <Calendar className="w-4 h-4" />
                                        <span>{formatDate(req.createdAt)}</span>
                                        {req.expiresAt && (
                                            <>
                                                <span>•</span>
                                                <span className="text-red-600">Hết hạn: {formatDate(req.expiresAt)}</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-2 lg:flex-col lg:items-end">
                                    <button
                                        onClick={() => acceptRequest(req.id)}
                                        disabled={actionLoading === req.id}
                                        className={`flex items-center gap-2 px-5 py-2.5 text-white rounded-lg font-medium shadow-md transition-all text-sm whitespace-nowrap ${
                                            actionLoading === req.id
                                                ? "bg-gray-400 cursor-not-allowed"
                                                : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 hover:shadow-lg transform hover:-translate-y-0.5"
                                        }`}
                                    >
                                        {actionLoading === req.id ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                        ) : (
                                            <CheckCircle className="w-4 h-4" />
                                        )}
                                        {actionLoading === req.id ? "Đang xử lý..." : "Chấp nhận"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Toast – ĐÃ SỬA: không truyền onClose */}
            {toast && msg && <Toast type={type} msg={msg} />}
        </div>
    );
}

export default RequestManagement;