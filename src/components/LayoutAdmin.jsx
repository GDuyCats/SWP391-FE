import { Outlet } from "react-router-dom";
import AdminSidebar from "./Admin/AdminSidebar";
import AdminHeader from "./Admin/AdminHeader";

function LayoutAdmin() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <AdminHeader />

      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="w-64 fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white border-r shadow-md">
          <AdminSidebar />
        </div>

        {/* Main content */}
        <div className="flex-1 ml-64 p-6 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default LayoutAdmin;