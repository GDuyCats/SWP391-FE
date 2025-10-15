import { Car, Battery, ArrowLeft } from 'lucide-react';

function PostType() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-gray-50 p-6 md:p-10">
      {/* Header */}
      <div className="text-center pt-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
          Chọn loại sản phẩm bạn muốn đăng
        </h1>
        <p className="text-gray-600">Vui lòng chọn một trong hai loại sản phẩm bên dưới</p>
      </div>

      {/* Cards Section */}
      <div className="w-full max-w-5xl mx-auto flex flex-col md:flex-row gap-6">
        {/* Card Xe Điện */}
        <div className="flex-1 group cursor-pointer">
          <div className="bg-white h-72 flex flex-col justify-center items-center
            rounded-2xl shadow-md border border-gray-200
            hover:shadow-lg hover:border-blue-400
            transition-all duration-200">
            
            {/* Icon container */}
            <div className="mb-5 w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center
              group-hover:bg-blue-500 transition-colors duration-200">
              <Car className="w-10 h-10 text-blue-600 group-hover:text-white transition-colors duration-200" />
            </div>
            
            {/* Text */}
            <div className="text-center">
              <p className="text-2xl font-semibold text-gray-800 mb-2">Xe Điện</p>
              <p className="text-gray-500 text-sm px-6">
                Đăng bán xe điện và xe máy điện
              </p>
            </div>
          </div>
        </div>

        {/* Card Pin */}
        <div className="flex-1 group cursor-pointer">
          <div className="bg-white h-72 flex flex-col justify-center items-center
            rounded-2xl shadow-md border border-gray-200
            hover:shadow-lg hover:border-green-400
            transition-all duration-200">
            
            {/* Icon container */}
            <div className="mb-5 w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center
              group-hover:bg-green-500 transition-colors duration-200">
              <Battery className="w-10 h-10 text-green-600 group-hover:text-white transition-colors duration-200" />
            </div>
            
            {/* Text */}
            <div className="text-center">
              <p className="text-2xl font-semibold text-gray-800 mb-2">Pin</p>
              <p className="text-gray-500 text-sm px-6">
                Đăng bán pin xe điện và phụ kiện
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Button */}
      <div className="text-center pb-8">
        <button
          className="px-10 py-3 bg-white text-gray-700 text-base rounded-full font-medium
            border border-gray-300
            hover:bg-gray-100 hover:border-gray-400
            transition-all duration-200 shadow-sm
            flex items-center gap-2 mx-auto"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại
        </button>
      </div>
    </div>
  );
}

export default PostType;