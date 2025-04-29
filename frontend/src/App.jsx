// import { useState } from 'react'
import {Route, Routes} from "react-router-dom";
import Register from './components/Register';
// import './App.css'

function App() {
  return (
    <>
      <Routes>
        <Route path="/register" element={<Register/>}/>
      </Routes>
    </>
  )
}

export default App
