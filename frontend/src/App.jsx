import { Route, Routes } from "react-router-dom";
import Register from './components/Register';
import Login from './components/Login';
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import Landing from './components/Landing'; 
import Dashboard from "./components/Dashboard";


function App() {
  return (
    <>
      <div className="min-h-screen flex flex-col">
        <Navbar/>
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard/>}/>
          </Routes>
        </div>
        <Footer />
      </div>
    </>
  );
}

export default App;
