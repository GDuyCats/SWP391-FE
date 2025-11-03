import { BrowserRouter, Routes, Route } from "react-router-dom";
import NotFound from "./pages/NotFound";
import Users from "./pages/Admin/Users";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Confirmation from "./pages/Confirmation";
import Success from "./pages/Success";
import RequestBuyCar from "./pages/RequestBuyCar";
import AdminApprove from "./pages/AdminApprove";
import PostType from "./pages/PostType";
import ContractA from "./pages/ContractA";
import ContractB from "./pages/ContractB";
import Profile from "./pages/Profile";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Layout from "./components/Layout";
import CarDetails from "./pages/Listing/CarDetails";
import AdminHome from "./pages/Admin/Home";
import TransactionRecords from "./pages/Admin/TransactionRecords";
import TransactionDetail from "./pages/Admin/TransactionDetail";
import TransactionSuccess from "./pages/Admin/TransactionSuccess";
import StaffAssignment from "./pages/Admin/StaffAssignment";
import Forbidden from "./pages/Admin/Forbidden";
import AdminRoute from "./components/Admin/AdminRoute";
import Cars from "./pages/Cars";
import PaymentSuccessfully from "./pages/PaymentSuccessfully";
import PaymentFails from "./pages/PaymentFails";
import ChooseListing from "./pages/Listing/ChooseListing";
import ListingEV from "./pages/Listing/ListingEV";
import ListingBattery from "./pages/Listing/ListingBattery";
import PackageSelection from "./pages/Listing/PackageSelection";
import PaymentStep from "./pages/Listing/PaymentStep";
import BuyRequests from "./pages/BuyRequests";
import LayoutAdmin from "./components/LayoutAdmin";

import PostManagement from "./pages/PostManagement";
import BuyerContractManagement from "./pages/BuyerContractManagement";
import SellerContractManagement from "./pages/SellerContractManagement";
import RequestManagement from "./components/RequestManagement";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/buyer-contract-management" element={<BuyerContractManagement />} />
          <Route path="/seller-contract-management" element={<SellerContractManagement />} />
          <Route path="/postmanagement" element={<PostManagement />} />
          <Route path="/confirmation" element={<Confirmation />} />
          <Route path="/success" element={<Success />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/requestbuycar" element={<RequestBuyCar />} />
          <Route path="/posttype" element={<PostType />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/buy-requests" element={<BuyRequests />} />

          {/* Listing Routes */}
          <Route path="/chooselisting" element={<ChooseListing />} />
          <Route path="/listing/ev" element={<ListingEV />} />
          <Route path="/listing/battery" element={<ListingBattery />} />
          <Route path="/listing/package" element={<PackageSelection />} />
          <Route path="/listing/payment" element={<PaymentStep />} />
        </Route>

        <Route path="/listing/ev/:id" element={<CarDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/contractA" element={<ContractA />} />
        <Route path="/contractB" element={<ContractB />} />
        <Route path="/admin" element={<AdminHome />} />

        <Route
          path="/admin/assignments"
          element={
            <AdminRoute>
              <StaffAssignment />

            </AdminRoute>
          }
        />
        <Route element={<LayoutAdmin />}>
          <Route path="/users" element={<Users />} />
          <Route path="/adminapprove" element={<AdminApprove />} />
          <Route path="/request-management" element={<RequestManagement />} />
        </Route>

        <Route path="/admin/forbidden" element={<Forbidden />} />
        <Route path="/transactionrecords" element={<TransactionRecords />} />
        <Route path="/transactiondetail/:id" element={<TransactionDetail />} />
        <Route path="/transactionsuccess" element={<TransactionSuccess />} />
        <Route path="/paymentsuccessfully" element={<PaymentSuccessfully />} />
        <Route path="/paymentfails" element={<PaymentFails />} />
        <Route path="/cars" element={<Cars />} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;
