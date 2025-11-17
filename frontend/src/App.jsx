import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { AuthProvider } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import Tests from './pages/Tests'
import About from './pages/About'
import Contact from './pages/Contact'
import Signup from './pages/Signup'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import Dashboard from './pages/Dashboard'
import EnhancedDashboard from './pages/EnhancedDashboard'
import TestPlayer from './pages/TestPlayer'
import TestInstructions from './pages/TestInstructions'
import CBTInterface from './pages/CBTInterface'
import TestResult from './pages/TestResult'
import TestReview from './pages/TestReview'
import AdminPanel from './pages/AdminPanel'
import AdminPackages from './pages/AdminPackages'
import DemoTest from './pages/DemoTest'
import Subscription from './pages/Subscription'
import Packages from './pages/Packages'
import PaymentTest from './pages/PaymentTest'
import Reviews from './pages/Reviews'
import Profile from './pages/Profile'
import AdvancedAnalytics from './pages/AdvancedAnalytics'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_relativeSplatPath: true }}>
        <div className="min-h-screen bg-slate-50">
          <Routes>
            <Route path="/cbt/:testId" element={<CBTInterface />} />
            <Route path="*" element={
              <>
                <Navbar />
                <main className="relative">
                  <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/tests" element={<Tests />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/demo-test" element={<DemoTest />} />
                    <Route path="/payment-test" element={<PaymentTest />} />
                    <Route 
                      path="/subscription" 
                      element={
                        <ProtectedRoute>
                          <Subscription />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/reviews" 
                      element={
                        <ProtectedRoute>
                          <Reviews />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/profile" 
                      element={
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/dashboard" 
                      element={
                        <ProtectedRoute>
                          <EnhancedDashboard />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/packages" 
                      element={
                        <ProtectedRoute>
                          <Packages />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/test/:id" 
                      element={
                        <ProtectedRoute>
                          <TestPlayer />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/test/:testId/instructions" 
                      element={
                        <ProtectedRoute>
                          <TestInstructions />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/test/:testId/result" 
                      element={
                        <ProtectedRoute>
                          <TestResult />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/test/:testId/review" 
                      element={
                        <ProtectedRoute>
                          <TestReview />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/admin" 
                      element={
                        <ProtectedRoute adminOnly>
                          <AdminPanel />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/admin/packages" 
                      element={
                        <ProtectedRoute adminOnly>
                          <AdminPackages />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/advanced-analytics" 
                      element={
                        <ProtectedRoute adminOnly>
                          <AdvancedAnalytics />
                        </ProtectedRoute>
                      } 
                    />
                  </Routes>
                </main>
              </>
            } />
          </Routes>
          <ToastContainer 
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      </Router>
    </AuthProvider>
  )
};

export default App;