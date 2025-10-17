import React, { useState } from "react";
import { api } from "../services/api";



const AdminApprove = () => {

  const [id, setId] = useState(0);
  const handleChange = async () => {
    try {
      const resp = await api.patch(`/${id}/verify`)
      console.log(resp)
    } catch (error) {
      console.log(error)
    }

  }
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">

      
      <header className="bg-blue-800 text-white px-6 py-4 text-2xl font-semibold rounded-b-2xl shadow-md">
        QUẢN LÝ PHÊ DUYỆT
      </header>

      
      <div className="bg-white shadow-lg rounded-2xl p-6 m-6">

        
        <div className="grid grid-cols-4 gap-4 mb-4">
          <input
            className="border p-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Tìm theo tên..."
          />
          <select className="border p-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400">
            <option>Trạng thái</option>
            <option>Chờ duyệt</option>
            <option>Đã duyệt</option>
            <option>Từ chối</option>
          </select>
          <input
            className="border p-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Ngày bắt đầu"
            type="date"
          />
          <input
            className="border p-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Ngày kết thúc"
            type="date"
          />
        </div>

      
        <div className="grid grid-cols-4 gap-4">
          <select className="border p-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400">
            <option>Loại</option>
            <option>Xe</option>
            <option>Pin</option>
          </select>
          <input
            className="border p-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Mã tin"
          />
          <input
            className="border p-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Người đăng"
          />
          <button className="bg-blue-600 text-white py-2 rounded-full hover:bg-blue-700 shadow-md transition">
            Tìm kiếm
          </button>
        </div>

      </div>

     
      <div className="bg-white shadow-lg rounded-2xl m-6 flex-1 overflow-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="p-3 border-b">ID</th>
              <th className="p-3 border-b">Tiêu đề</th>
              <th className="p-3 border-b">Người đăng</th>
              <th className="p-3 border-b">Trạng thái</th>
              <th className="p-3 border-b text-center">Hành động</th>
            </tr>
          </thead>

          <tbody>
            {/* Dòng mẫu 1 */}
            <tr className="hover:bg-gray-50 transition">
              <td className="p-3 border-b">1</td>
              <td className="p-3 border-b">Tin bán xe Vinfast</td>
              <td className="p-3 border-b">Tiến</td>
              <td className="p-3 border-b">
                <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium">
                  Chờ duyệt
                </span>
              </td>
              <td className="p-3 border-b text-center space-x-2">
                <button className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 shadow-sm transition">
                  Duyệt
                </button>
                <button className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 shadow-sm transition">
                  Từ chối
                </button>
              </td>
            </tr>

          
            <tr className="hover:bg-gray-50 transition">
              <td className="p-3 border-b">2</td>
              <td className="p-3 border-b">Tin cho thuê Pin</td>
              <td className="p-3 border-b">Phong</td>
              <td className="p-3 border-b">
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                  Đã duyệt
                </span>
              </td>
              <td className="p-3 border-b text-center space-x-2">
                <button className="bg-gray-300 text-white px-4 py-2 rounded-full cursor-not-allowed"
                onClick={handleChange}>
                  
                  Duyệt
                </button>
                <button className="bg-gray-300 text-white px-4 py-2 rounded-full cursor-not-allowed">
                  Từ chối
                </button>
              </td>
            </tr>

          </tbody>
        </table>
      </div>

    </div>
  );
};

export default AdminApprove;
