import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import Dashboard from './pages/Dashboard'
import OrdersPage from './pages/OrdersPage'
import OrderTrackingPage from './pages/OrderTrackingPage'
import NewOrderPage from './pages/NewOrderPage'
import ChatPage from './pages/ChatPage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import TailorDirectoryPage from './pages/TailorDirectoryPage'
import TailorProfilePage from './pages/TailorProfilePage'
import FavoritesPage from './pages/FavoritesPage'
import AdminPanelPage from './pages/AdminPanelPage'
import TailorWorkbenchPage from './pages/TailorWorkbenchPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import FAQPage from './pages/FAQPage'
import NotFoundPage from './pages/NotFoundPage'
import OrderDetailPage from './pages/OrderDetailPage'
import { ProtectedRoute } from './components/ProtectedRoute'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/order-tracking"
          element={
            <ProtectedRoute>
              <OrderTrackingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/:id"
          element={
            <ProtectedRoute>
              <OrderDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/new-order"
          element={
            <ProtectedRoute requiredRole="customer">
              <NewOrderPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tailors"
          element={<TailorDirectoryPage />}
        />
        <Route path="/tailors/:id" element={<TailorProfilePage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminPanelPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tailor-workbench"
          element={
            <ProtectedRoute requiredRole="tailor">
              <TailorWorkbenchPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  )
}

export default App
