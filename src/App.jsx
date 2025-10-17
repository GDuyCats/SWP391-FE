import { BrowserRouter, Routes, Route } from "react-router-dom"
import NotFound from "./pages/NotFound"
import Users from "./pages/Admin/Users"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Home from "./pages/Home"
import ListingBattery from "./pages/Listing/ListingBattery"
import ListingEV from "./pages/Listing/ListingEV"
import ChooseListing from "./pages/Listing/ChooseListing"
import ListingStep2 from "./pages/Listing/ListingStep2"
import Confirmation from "./pages/Confirmation"
import Success from "./pages/Success"
import RequestBuyCar from "./pages/RequestBuyCar"
import AdminApprove from "./pages/AdminApprove"
import PostType from "./pages/PostType"
import ContractA from "./pages/ContractA"
import ContractB from "./pages/ContractB"
import Profile from "./pages/Profile"
import About from "./pages/About"
import Contact from "./pages/Contact"
import Layout from "./components/Layout"
import CarDetails from "./pages/Listing/CarDetails";
import AdminHome from "./pages/Admin/Home";
import Cars from "./pages/Cars";
import Membership from "./pages/Membership/Membership";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />

          <Route path="/users" element={<Users />} />
          <Route path="/chooselisting" element={<ChooseListing />} />
          <Route path="/listing/ev" element={<ListingEV />} />
          <Route path="/listing/ev/:id" element={<CarDetails />} />
          <Route path="/cars" element={<Cars />} />
          <Route path="/listing/pin" element={<ListingBattery />} />
          <Route path="/listing/step2" element={<ListingStep2 />} />
          <Route path="/confirmation" element={<Confirmation />} />
          <Route path="/success" element={<Success />} />
          <Route path='*' element={<NotFound />} />
          <Route path="/requestbuycar" element={<RequestBuyCar />} />
          <Route path="/adminapprove" element={<AdminApprove />} />
          <Route path="/posttype" element={<PostType />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
        </Route>
        <Route path="/membership" element={<Membership />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/contractA" element={<ContractA />} />
        <Route path="/contractB" element={<ContractB />} />
        <Route path="/admin" element={<AdminHome />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
