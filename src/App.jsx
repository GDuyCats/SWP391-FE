import { BrowserRouter, Routes, Route } from "react-router-dom"
import NotFound from "./pages/NotFound"
import Users from "./pages/Admin/Users"
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/users" element = {<Users/>}/>
        <Route path = '*' element = {<NotFound/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
