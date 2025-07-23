
import Navbar from "./components/Navbar"
import FindUniversity from "./pages/FindUniversity"
import Homepage from "./pages/Homepage"
import { Routes,Route, useLocation } from "react-router"
import Login from "./pages/Login"
import Register from "./pages/Register"
import { AuthProvider } from "./contexts/AuthContext"
import PrivateRoute from "./components/PrivateRoute"
import Footer from "./components/Footer"

function App() {
  const location = useLocation()
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        {location.pathname !== "/login" && location.pathname !== "/register" && <Navbar/>}
        <main className="flex-grow">
          <Routes>
            <Route index element={<Homepage />} />
            <Route path="/finduniversity" element={
              <PrivateRoute>
                <FindUniversity />
              </PrivateRoute>
            }/>
            <Route path="/login" element={<Login />}/>
            <Route path="/register" element={<Register />} />
          </Routes>
        </main>
        {location.pathname !== "/login" && location.pathname !== "/register" && <Footer/>}
      </div>
    </AuthProvider>
  )
}

export default App