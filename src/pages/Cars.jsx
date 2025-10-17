import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CarListing from "../components/Home/CarListing";

function Cars() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Danh sách xe</h1>
          <CarListing />
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Cars;
