import React from "react";
import Header from "../components/Header";
import Hero from "../components/Home/Hero";
import Features from "../components/Home/Features";
import CarListing from "../components/Home/CarListing";
import News from "../components/Home/News";
import Footer from "../components/Footer";

function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <Hero />
        <Features />
        <CarListing />
        <News />
      </main>
      <Footer />
    </div>
  );
}

export default Home;
