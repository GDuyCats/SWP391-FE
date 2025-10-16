import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import EditButton from "../components/EditButton";
import { api } from "../services/api";
import { SquareUserRound } from "lucide-react";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ email: "", phone: "" });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          setError("Bạn chưa đăng nhập.");
          setLoading(false);
          return;
        }
        const res = await api.post(
          "/profile",
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const user = res.data?.user || null;
        setProfile(user);
        setForm({ email: user?.email || "", phone: user?.phone || "" });
      } catch (e) {
        setError("Không thể tải thông tin hồ sơ.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Thông tin cá nhân</h1>

        {loading && <div className="text-gray-600">Đang tải...</div>}

        {!loading && error && <div className="text-red-600">{error}</div>}

        {!loading && !error && profile && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center">
                <SquareUserRound className="w-16 h-16" />
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Tài khoản</p>
                  <p className="text-lg font-semibold">{profile.username}</p>
                </div>
              </div>
              <EditButton onClick={() => setIsEditing(true)} />
            </div>
            {!isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium break-all">
                    {profile.email || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Số điện thoại</p>
                  <p className="font-medium">{profile.phone || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Trạng thái</p>
                  <p className="font-medium">
                    {profile.isVerify ? "Đã xác minh" : "Chưa xác minh"}
                  </p>
                </div>
              </div>
            ) : (
              <form
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    const token = localStorage.getItem("accessToken");
                    await api.patch(
                      "/profile/update",
                      { email: form.email || null, phone: form.phone || null },
                      { headers: { Authorization: `Bearer ${token}` } }
                    );
                    setProfile({
                      ...profile,
                      email: form.email,
                      phone: form.phone,
                    });
                    setIsEditing(false);
                  } catch (err) {
                    alert("Cập nhật thất bại. Vui lòng thử lại.");
                  }
                }}
              >
                <div>
                  <label className="block text-sm text-gray-500 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    className="w-full border rounded-md px-3 py-2"
                    placeholder="name@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    className="w-full border rounded-md px-3 py-2"
                    placeholder="0123456789"
                  />
                </div>
                <div className="md:col-span-2 flex gap-3 mt-2">
                  <button
                    type="submit"
                    className="bg-gray-900 text-white px-4 py-2 rounded-md"
                  >
                    Lưu
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 rounded-md border"
                    onClick={() => {
                      setIsEditing(false);
                      setForm({
                        email: profile.email || "",
                        phone: profile.phone || "",
                      });
                    }}
                  >
                    Hủy
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default Profile;

// const MainPage = () => {
//     return (
//         <div>
//             <div className="py-10 px-5 bg-blue-800 relative">
//                 <div className="flex justify-between">
//                     <h1 className="text-[25px]">Profile Setting</h1>
//                     <div>
//                         <button>call</button>
//                         <button className="ml-4">info</button>
//                     </div>
//                 </div>
//                 <div className="absolute bottom-0">
//                     <button className="bg-blue-300 px-4 border-1 text-black">button 1</button>
//                     <button className="bg-blue-300 px-4 border-1 text-black">button 1</button>
//                     <button className="bg-blue-300 px-4 border-1 text-black">button 1</button>
//                 </div>
//             </div>
//             <div className="max-w-7xl mx-auto mt-10">
//                 <div className="flex justify-between">
//                     <div>
//                         <h1>My profile</h1>
//                         <p>mmmm</p>
//                     </div>
//                     <div>
//                         <button>Export Data</button>
//                         <button className="ml-4">Edit</button>
//                     </div>
//                 </div>
//                 <div></div>
//                 <div></div>
//                 <div></div>
//             </div>
//             <div></div>

//         </div>
//     )
// }

// export default MainPage
