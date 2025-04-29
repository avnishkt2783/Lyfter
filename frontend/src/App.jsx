import { Route, Routes } from "react-router-dom";
import Register from './components/Register';
import Login from './components/Login';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} /> {/* Add a home route */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </>
  );
}

function Home() {
  return (
    <div>
      <h2>Welcome to Lyfter!</h2>
      <p>This is the home page. You can go to the <a href="/register">Register</a> page or <a href="/login">login</a> page.</p>
    </div>
  );
}

export default App;
