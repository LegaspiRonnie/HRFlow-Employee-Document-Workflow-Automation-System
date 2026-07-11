import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'

/**
 * Central route table for the SPA. Each feature registers its pages here;
 * Feature 2 will wrap these in role-protected layouts.
 */
function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
    </Routes>
  )
}

export default App
