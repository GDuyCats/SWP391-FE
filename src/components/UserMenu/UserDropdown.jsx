import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const UserDropdown = ({ username }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [hoverTimeoutId, setHoverTimeoutId] = useState(null);

  const handleEnter = () => {
    if (hoverTimeoutId) {
      clearTimeout(hoverTimeoutId);
      setHoverTimeoutId(null);
    }
    setOpen(true);
  };

  const handleLeave = () => {
    const id = setTimeout(() => setOpen(false), 200);
    setHoverTimeoutId(id);
  };

  return (
    <div
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <span className="text-gray-900 px-3 py-2 text-sm font-medium cursor-default">
        Xin chào, <span className="font-bold">{username}</span>
      </span>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-md bg-white shadow-lg ring-1 ring-black/5 z-50">
          <div className="py-1">
            <button
              onClick={() => navigate("/profile")}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Thông tin cá nhân
            </button>
            <button
              onClick={() => navigate("/buy-requests")}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Quản lý yêu cầu mua xe
            </button>

            <button
              onClick={() => navigate("/contract-management")}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Quản lý hợp đồng
            </button>


            <button
              onClick={() => navigate("/postmanagement")}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Quản lý bài đăng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;
