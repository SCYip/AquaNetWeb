import { Routes, Route } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { Footer } from './components/Footer'
import { MotionProvider } from './components/MotionProvider'
import { ProtectedRoute } from './components/ProtectedRoute'
import { HomePage } from './pages/HomePage'
import { MapPage } from './pages/MapPage'
import { LoginPage } from './pages/LoginPage'
import { ContactPage } from './pages/ContactPage'
import { DevicesPage } from './pages/DevicesPage'
import { AboutPage } from './pages/AboutPage'
import { ReportsPage } from './pages/ReportsPage'
import { DispatchesPage } from './pages/DispatchesPage'

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <MotionProvider>
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/dispatches" element={<DispatchesPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route
              path="/devices"
              element={
                <ProtectedRoute>
                  <DevicesPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
        <Footer />
      </MotionProvider>
    </div>
  )
}

export default App
