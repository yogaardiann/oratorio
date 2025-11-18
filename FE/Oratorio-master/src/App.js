import React from 'react';
import { AuthProvider } from "./context/AuthContext";
import './App.css';
import './index';
// Perbaikan ada di baris ini
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

// Import semua halaman PUBLIK yang sudah ada
import LandingPage from './pages/landing_page';
import LoginPage from './pages/login';
import RegisterPage from './pages/register';
import Dashboard from './pages/dashboard';
import ArPage from './pages/ar';
import ARScanPage from './pages/ScanARPage';
import VrPage from './pages/vr';
import Scan360Page from './pages/Scan360Page';
import ArGalleryPage from './pages/ARGalleryPage';
import VrGalleryPage from './pages/VRGalleryPage';
import History from './pages/history';
import ProfilePage from './pages/profile';
import Footer from './components/all-page/footer-page/footer';

// IMPORT SEMUA HALAMAN & LAYOUT UNTUK ADMIN
import AdminLayout from './components/admin/AdminLayout';
import DashboardPage from './pages/admin/DashboardPage';
import ContentPage from './pages/admin/ContentPage';
import UsersPage from './pages/admin/UsersPage';
import HistoryPage from './pages/admin/HistoryPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Rute untuk Halaman Publik */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/ar" element={<ArGalleryPage />} />
            <Route path="/vr" element={<VrGalleryPage />} />
            <Route path="/ar/:destinationId" element={<ArPage />} />
            <Route path="/scan" element={<ARScanPage />} />
            <Route path="/vr/:destinationId" element={<VrPage />} />
            <Route path="/scan360" element={<Scan360Page />} />
            <Route path="/history" element={<History />} />
            <Route path="/Profile" element={<ProfilePage />} />
            <Route path="/footer" element={<Footer />} />

            {/* RUTE UNTUK ADMIN DASHBOARD */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="content" element={<ContentPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="history" element={<HistoryPage />} />
              <Route index element={<Navigate to="dashboard" />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;