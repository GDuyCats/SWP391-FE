function RequestBuyCar() {
    return (
        //div lớn nhất
        <div>

            <div>
                <div className="flex justify-between items-center bg-gradient-to-r from-blue-200 to-blue-300 
                shadow-md px-6 py-3 rounded-t-xl border-b border-blue-400">
                    <p className="text-xl font-semibold text-gray-800">
                        Xe Điện VinFast VF8 ECO AWD 2022 — <span className="text-blue-600 font-bold">565 Triệu</span>
                    </p>
                    <p className="text-sm text-gray-600 italic">
                        Đăng ngày <span className="font-medium text-gray-800">6/10/2025</span> • Xem <span className="font-medium">2</span> lượt
                    </p>
                </div>
                <div className="flex mt-10 bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
                    {/* Ảnh xe */}
                    <div className="flex-1 flex justify-center items-center bg-gray-50 p-6">
                        <img
                            src="/carVinfast1.jpg"
                            alt="car1"
                            className="w-[500px] h-[350px] object-cover rounded-lg shadow-md hover:scale-105 transition-transform duration-300"
                        />
                    </div>

                    {/* Đường chia dọc */}
                    <div className="w-[2px] bg-gray-300 mx-4"></div>

                    {/* Thông tin chi tiết */}
                    <div className="flex-1 flex flex-col justify-center p-6">
                        {/* Thông số kỹ thuật */}
                        <div>
                            <p className="text-2xl text-blue-700 font-semibold mb-3 border-b-2 border-blue-500 w-fit pb-1">
                                Thông Số Kĩ Thuật
                            </p>
                            <div className="mt-2 leading-8 text-gray-700 text-lg">
                                <p><span className="font-medium">Năm Sản Xuất:</span> 2022</p>
                                <p><span className="font-medium">Tình Trạng:</span> Mới 100%</p>
                                <p><span className="font-medium">Số Km đã đi:</span> 0 km</p>
                                <p><span className="font-medium">Xuất Xứ:</span> Việt Nam</p>
                                <p><span className="font-medium">Kiểu Dáng:</span> SUV</p>
                                <p><span className="font-medium">Hộp Số:</span> Tự động</p>
                            </div>
                        </div>

                        {/* Thông tin mô tả */}
                        <div className="mt-8">
                            <p className="text-2xl text-blue-700 font-semibold mb-3 border-b-2 border-blue-500 w-fit pb-1">
                                Thông Tin Mô Tả
                            </p>
                            <div className="mt-2 leading-8 text-gray-700 text-lg">
                                <p><span className="font-medium">Hãng Xe:</span> VinFast</p>
                                <p><span className="font-medium">Loại Xe:</span> VF8 ECO AWD</p>
                                <p><span className="font-medium">Phiên Bản:</span> 2022</p>
                                <p><span className="font-medium">Màu Xe:</span> Trắng</p>
                                <p><span className="font-medium">Số Km:</span> 0 km</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <div className="flex items-center justify-between w-full mt-7">

                <div className="flex-1 mx-4 h-[4px] bg-gray-400">
                    <div className="flex justify-between mt-6 ml-5">
                        <p className="text-xl text-red-500">Các Điều Khoản và Chính Sách khi mua xe</p>
                        <button className="bg-black text-white font-semibold px-6 py-2 rounded-full
                   hover:bg-gray-800 ease-in-out transition-all duration-300 cursor-pointer">
                            Gửi Yêu Cầu Mua Xe
                        </button>

                    </div>

                </div>



            </div>
        </div>
    );
}

export default RequestBuyCar