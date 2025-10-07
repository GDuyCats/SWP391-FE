import React from "react";

const News = () => {
  const news = [
    {
      id: 1,
      title: "Xu hướng xe điện đã qua sử dụng năm 2024",
      excerpt:
        "Khám phá những xu hướng mới nhất trong thị trường xe điện đã qua sử dụng và những lưu ý khi mua xe.",
      image:
        "https://images.unsplash.com/photo-1593941707882-a5bac6861d75?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      date: "15/01/2024",
      category: "Tin tức",
    },
    {
      id: 2,
      title: "Hướng dẫn kiểm tra pin xe điện khi mua xe cũ",
      excerpt:
        "Những tiêu chí quan trọng cần kiểm tra khi mua xe điện đã qua sử dụng để đảm bảo chất lượng.",
      image:
        "https://images.unsplash.com/photo-1583121274602-3e2820c69888?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      date: "12/01/2024",
      category: "Hướng dẫn",
    },
    {
      id: 3,
      title: "So sánh Tesla Model 3 vs BMW i3: Đâu là lựa chọn tốt hơn?",
      excerpt:
        "Phân tích chi tiết ưu nhược điểm của hai dòng xe điện phổ biến trên thị trường Việt Nam.",
      image:
        "https://images.unsplash.com/photo-1560958089-b8a1929cea89?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      date: "10/01/2024",
      category: "Đánh giá",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Tin tức & Hướng dẫn
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Cập nhật những thông tin mới nhất về xe điện và hướng dẫn mua sắm
            thông minh
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {news.map((article) => (
            <article
              key={article.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow border border-gray-200"
            >
              <div className="relative">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 left-4 bg-gray-900 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {article.category}
                </div>
              </div>

              <div className="p-6">
                <div className="text-sm text-gray-500 mb-2">{article.date}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {article.excerpt}
                </p>
                <a
                  href="#"
                  className="text-gray-900 font-medium hover:text-gray-600 transition-colors inline-flex items-center"
                >
                  Đọc thêm
                  <svg
                    className="w-4 h-4 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </a>
              </div>
            </article>
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="bg-gray-900 text-white px-8 py-3 rounded-md hover:bg-gray-800 transition-colors font-medium">
            Xem tất cả tin tức
          </button>
        </div>
      </div>
    </section>
  );
};

export default News;
