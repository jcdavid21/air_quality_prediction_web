import { useState } from 'react'
import './App.css'
import { Route, Routes, BrowserRouter } from 'react-router-dom'
import AirQualityDashboard from './components/AirQualityDashboard'


function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AirQualityDashboard />}
          />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
