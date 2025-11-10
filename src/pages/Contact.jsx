import React from "react";
import { Phone, Mail, MapPin, Clock } from "lucide-react";

function Contact() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 py-10">
      <div className="flex bg-white shadow-lg rounded-xl overflow-hidden max-w-7xl w-full h-[500px]">

        <div className="w-1/2 p-12 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">LIÊN HỆ</h2>

          <div className="space-y-6 text-gray-700 text-lg">
            <div className="flex items-center space-x-3">
              <span className="font-semibold">Quản Trị Viên:</span>
              <span className="text-blue-600 font-semibold">Lương Duy Cát</span>
            </div>

            <div className="flex items-center space-x-3">
              <Phone className="w-6 h-6 text-blue-500" />
              <span>0123 456 789</span>
            </div>

            <div className="flex items-center space-x-3">
              <Mail className="w-6 h-6 text-blue-500" />
              <span>info@evpowerup.com</span>
            </div>

            <div className="flex items-center space-x-3">
              <MapPin className="w-6 h-6 text-blue-500" />
              <span>123 Nguyễn Văn A, Quận 1, Thành Phố Hồ Chí Minh</span>
            </div>

            <div className="flex items-center space-x-3">
              <Clock className="w-6 h-6 text-blue-500" />
              <span>T2 – T7: 8:00 – 17:00</span>
            </div>
          </div>
        </div>

        <div className="w-1/2">
          <img
            src="/bgContact.jpg"
            alt="Contact"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}

export default Contact;
