import React from "react";
import { Link } from "react-router-dom";

const CarListing = () => {
  const cars = [
    {
      id: 1,
      name: "Tesla Model 3 2022",
      price: "1.2 tỷ",
      image:
        "https://images.unsplash.com/photo-1560958089-b8a1929cea89?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      mileage: "15,000 km",
      year: "2022",
      location: "TP. Hồ Chí Minh",
      battery: "75 kWh",
    },
    {
      id: 2,
      name: "BMW i3 2021",
      price: "850 triệu",
      image:
        "https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      mileage: "25,000 km",
      year: "2021",
      location: "Hà Nội",
      battery: "42 kWh",
    },
    {
      id: 3,
      name: "Audi e-tron 2020",
      price: "1.5 tỷ",
      image:
        "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      mileage: "30,000 km",
      year: "2020",
      location: "Đà Nẵng",
      battery: "95 kWh",
    },
    {
      id: 4,
      name: "Hyundai Kona Electric 2022",
      price: "650 triệu",
      image:
        "https://images.unsplash.com/photo-1606152421802-db97b9c7a11b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      mileage: "20,000 km",
      year: "2022",
      location: "TP. Hồ Chí Minh",
      battery: "64 kWh",
    },
    {
      id: 5,
      name: "Mercedes EQC 2021",
      price: "1.8 tỷ",
      image:
        "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      mileage: "18,000 km",
      year: "2021",
      location: "Hà Nội",
      battery: "80 kWh",
    },
    {
      id: 6,
      name: "Kia EV6 2023",
      price: "950 triệu",
      image:
        "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      mileage: "8,000 km",
      year: "2023",
      location: "TP. Hồ Chí Minh",
      battery: "77 kWh",
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Xe điện nổi bật
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Khám phá những chiếc xe điện đã qua sử dụng chất lượng tốt nhất
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cars.map((car) => (
            <div
              key={car.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="relative">
                <img
                  src={car.image}
                  alt={car.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 right-4 bg-white px-2 py-1 rounded-full text-sm font-medium text-gray-900">
                  {car.year}
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {car.name}
                </h3>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Giá:</span>
                    <span className="font-semibold text-gray-900">
                      {car.price}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Số km:</span>
                    <span>{car.mileage}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Pin:</span>
                    <span>{car.battery}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Vị trí:</span>
                    <span>{car.location}</span>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Link to={`/listing/ev/${car.id}`} state={{ car }} className="flex-1">
                    <button className="w-full bg-gray-900 text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors font-medium">
                      Xem chi tiết
                    </button>
                  </Link>
                  <button className="flex-1 border border-gray-300 text-gray-900 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors font-medium">
                    Gửi yêu cầu mua xe
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="bg-gray-900 text-white px-8 py-3 rounded-md hover:bg-gray-800 transition-colors font-medium">
            Xem tất cả xe điện
          </button>
        </div>
      </div>
    </section>
  );
};

export default CarListing;
