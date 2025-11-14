import { useEffect, useState } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";
import Toast from "./Toast";
import { Car, CheckCircle, Clock, FileText, User } from "lucide-react";

function TransactionHistory() {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [msg, setMsg] = useState("");
  const [toast, setToast] = useState(false);
  const [type, setType] = useState("");

  async function getAllContractByUser() {
    try {
      const res = await api.get("/me/contracts");
      console.log("API Response:", res.data);

      if (res.status === 200) {
        const contractList = Array.isArray(res.data.contracts)
          ? res.data.contracts
          : [];

        setContracts(contractList);
        setToast(true);
        setType("success");
        setMsg(`Lấy thành công ${contractList.length} hợp đồng`);
      }
    } catch (error) {
      console.error("Lỗi API:", error);
      const status = error?.status;
      let errorMsg = "Không thể tải dữ liệu";
      setToast(true);
      setType("error");

      if (status === 401) errorMsg = "Phiên hết hạn";
      else if (status === 500) errorMsg = "Lỗi server";
      else if (status === 403) errorMsg = "Không có quyền";

      setMsg(errorMsg);
      if (status === 500) setTimeout(() => navigate("/login"), 2000);
    } finally {
      setTimeout(() => setToast(false), 3000);
    }
  }

  useEffect(() => {
    getAllContractByUser();
  }, []);

  const completedContracts = Array.isArray(contracts)
    ? contracts.filter((contract) => contract.status === "signed")
    : [];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Chưa có";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day} tháng ${month}, ${year} lúc ${hours}:${minutes}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {toast && msg && <Toast type={type} msg={msg} />}

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <h1 className="text-2xl font-bold text-gray-900">Hợp đồng đã hoàn tất</h1>
          </div>
          <p className="text-gray-600">
            Tổng: <strong>{completedContracts.length}</strong> hợp đồng
          </p>
        </div>

        {completedContracts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg">Chưa có hợp đồng nào được ký</p>
          </div>
        ) : (
          <div className="space-y-5">
            {completedContracts.map((contract) => (
              <div
                key={contract.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b border-blue-100">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Car className="w-6 h-6 text-blue-700" />
                      <h3 className="font-semibold text-lg text-gray-900">
                        {contract.Post?.title || "Không có tiêu đề"}
                      </h3>
                    </div>
                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Đã ký
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Người mua</p>
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-100 w-10 h-10 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-blue-700" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{contract.buyer?.username || "—"}</p>
                            <p className="text-sm text-gray-500">{contract.buyer?.email || "—"}</p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Người bán</p>
                        <div className="flex items-center gap-3">
                          <div className="bg-orange-100 w-10 h-10 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-orange-700" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{contract.seller?.username || "—"}</p>
                            <p className="text-sm text-gray-500">{contract.seller?.email || "—"}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">Giá thỏa thuận</span>
                        <span className="font-bold text-lg text-green-700">
                          {formatCurrency(contract.agreedPrice)}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Phí môi giới</span>
                          <span className="font-medium">{formatCurrency(contract.brokerageFee)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Phí kiểm tra pháp lý</span>
                          <span className="font-medium">{formatCurrency(contract.legalAndConditionCheckFee)}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-gray-200">
                          <span className="font-medium text-gray-700">Tổng phí phụ</span>
                          <span className="font-semibold text-red-600">
                            {formatCurrency(contract.totalExtraFees)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Ký lúc</p>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">{formatDate(contract.buyerSignedAt)}</span>
                        </div>
                      </div>
                      {contract.notes && (
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Ghi chú</p>
                          <p className="text-sm text-gray-600 italic bg-gray-50 p-3 rounded-lg">
                            “{contract.notes}”
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-6 py-3 text-xs text-gray-500 border-t border-gray-100">
                  Mã hợp đồng: <span className="font-mono">CT-{contract.id}</span> | 
                  Tạo lúc: {formatDate(contract.createdAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TransactionHistory;