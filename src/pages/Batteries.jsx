import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import BatteryListing from "../components/Home/BatteryListing";

function Batteries() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <BatteryListing showViewAll={false} />
      </main>
      <Footer />
    </div>
  );
}

export default Batteries;
