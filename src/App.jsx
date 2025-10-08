import { BrowserRouter, Routes, Route } from "react-router-dom"
import NotFound from "./pages/NotFound"
import Users from "./pages/Admin/Users"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Home from "./pages/Home"
import RequestBuyCar from "./pages/RequestBuyCar"
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/login" element = {<Login/>}/>
        <Route path="/register" element = {<Register/>} />
        <Route path="/users" element = {<Users/>}/>
        <Route path = '*' element = {<NotFound/>}/>
        <Route path="/requestbuycar" element = {<RequestBuyCar/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
