import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CarListing from "../components/Home/CarListing";

function Cars() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <CarListing showViewAll={false} />
      </main>
      <Footer />
    </div>
  );
}

export default Cars;
