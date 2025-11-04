import {api} from "../services/api.js";
import {useEffect, useState} from "react";
import {FileText, User, Calendar} from 'lucide-react';
import Toast from "../components/Toast.jsx";

function ContractManagement() {
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(false);
    const [type, setType] = useState("");
    const [msg, setMsg] = useState("");

    async function getContracts() {
        setLoading(true);
        try {
            const res = await api.get("/me/contracts/unsigned");
            console.log(res);
            if (res.status === 200) {
                setContracts(res.data.contracts);
                setToast(true)
                setType("success");
                setMsg("Lấy danh sách hợp đồng thành công")
            }

        } catch (error) {
            console.log(error)
            const status = error?.status;
            const msg = error?.response?.data;
            let errorMsg = "Không thể xem hợp đồng";
            setToast(true);
            setType("error");
            if (status === 401) {
                errorMsg = msg ? msg : "Token thiếu hoặc không hợp lệ";
            } else if (status === 500) {
                errorMsg = msg ? msg : "Lỗi máy chủ";
                setTimeout(() => navigate("/login"), 2000);
            } else if (status === 403) {
                errorMsg = msg ? msg : "Không đủ quyền (chỉ customer)"
            }
            setMsg(errorMsg);
        } finally {
            setTimeout(() => setToast(false), 3000);
        }
    }

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatDateTime = (dateString) => {
        return new Date(dateString).toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    useEffect(() => {
        getContracts();
    }, []);



    console.log(contracts)


    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <FileText className="w-7 h-7 text-blue-600" />
                    Quản Lý Hợp Đồng
                </h1>
                <p className="text-gray-600 mt-1">Các hợp đồng chưa ký cần xử lý</p>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Hợp Đồng</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người Mua</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người Bán</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff</th>
                            <th className="px-6 py-4 text-center w-28 text-xs font-medium text-gray-500 uppercase tracking-wider">Loại</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá Trị</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cập Nhật</th>
                            <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {contracts.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                    <p className="text-lg">Không có hợp đồng nào cần xử lý</p>
                                </td>
                            </tr>
                        ) : (
                            contracts.map((contract) => (
                                <tr key={contract.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 align-middle whitespace-nowrap text-sm font-medium text-gray-900">
                                        #{contract.id}
                                    </td>

                                    <td className="px-6 py-4 align-middle whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{contract.buyer?.username || '—'}</div>
                                        <div className="text-sm text-gray-500">ID: {contract.buyerId}</div>
                                    </td>

                                    <td className="px-6 py-4 align-middle whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{contract.seller?.username || '—'}</div>
                                        <div className="text-sm text-gray-500">ID: {contract.sellerId}</div>
                                    </td>

                                    <td className="px-6 py-4 align-middle whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{contract.staff?.username || 'Chưa phân'}</div>
                                        <div className="text-sm text-gray-500">ID: {contract.staffId || '—'}</div>
                                    </td>

                                    {/* Loại */}
                                    <td className="px-6 py-4 align-middle whitespace-nowrap">
                                        <div className="flex items-center justify-center h-full">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                    contract.side === 'buyer' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                                                }`}
                                            >
                                                {contract.side === 'buyer' ? 'Mua' : 'Bán'}
                                            </span>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 align-middle whitespace-nowrap text-sm font-medium text-gray-900">
                                        {formatCurrency(contract.agreedPrice)}
                                    </td>

                                    <td className="px-6 py-4 align-middle whitespace-nowrap text-sm text-gray-500">
                                        {formatDateTime(contract.updatedAt)}
                                    </td>

                                    {/* Hành động (căn giữa ngang + dọc) */}
                                    <td className="px-6 py-4 align-middle whitespace-nowrap text-center">
                                        <button className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-900 transition">
                                            <FileText className="w-4 h-4" />
                                            Kí OTP
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Toast */}
            {toast && msg && <Toast type={type} msg={msg} />}
        </div>
    );


}

export default ContractManagement;