import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { X, ClipboardList, Calendar, User, CheckCircle } from "lucide-react";
import Toast from "../../components/Toast";

function BuyerDialog({ open, onClose, postId }) {
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(false);
  const [type, setType] = useState("");
  const [msg, setMsg] = useState("");

  async function getAllBuyerRequest() {
    setLoading(true);
    try {
      const res = await api.get(`/PurchaseRequests/post/${postId}`);
      console.log(res);
      if (res.status === 200) {
        setBuyers(res.data.requests || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function acceptRequest(id) {
    console.log(id);
    
    try {
      const res = await api.patch(`/PurchaseRequests/${id}/accept`);
      console.log(res);


      if (res.status === 200) {
        setToast(true);
        setType("success");
        setMsg(res.data.message);

        // Cập nhật lại danh sách
        getAllBuyerRequest();
      }
    } catch (error) {
      console.log(error);
      const status = error?.response?.status;
      const msg = error?.response?.data;
      let errorMsg = "Không thể chấp nhận yêu cầu mua hàng";

      if (status === 403) errorMsg = msg || "Không có quyền";
      else if (status === 404) errorMsg = msg || "Request không tồn tại";
      else if (status === 500) errorMsg = msg || "Lỗi máy chủ";

      setToast(true);
      setType("error");
      setMsg(errorMsg);
    } finally {
      setTimeout(() => setToast(false), 3000);
    }
  }

  useEffect(() => {
    if (open) {
      getAllBuyerRequest();
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <ClipboardList className="text-blue-600" />
          Danh sách người yêu cầu #{postId}
        </h2>

        {loading ? (
          <div className="text-center py-6 text-gray-500">Đang tải dữ liệu...</div>
        ) : buyers.length > 0 ? (
          <div className="overflow-x-auto max-h-[400px] overflow-y-auto border rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Người Yêu Cầu
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tin nhắn
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày tạo
                  </th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {buyers.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm text-gray-900 font-medium">
                      #{r.id}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700 flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-500" />
                      {r.buyer?.username || "—"}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600">
                      {r.buyer?.email || "—"}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700">
                      {r.message || "Không có nội dung"}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-500">
                      <Calendar className="inline w-4 h-4 mr-1 text-gray-400" />
                      {new Date(r.createdAt).toLocaleString("vi-VN")}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button
                        onClick={() => acceptRequest(r.id)}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full hover:bg-green-200 text-sm font-medium transition"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Chấp nhận
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-6">
            Không có người yêu cầu nào
          </div>
        )}
      </div>

      {toast && msg && <Toast type={type} msg={msg} />}
    </div>
  );
}

export default BuyerDialog;
