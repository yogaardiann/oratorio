import React from 'react';
import { AuthProvider } from "./context/AuthContext";
import './App.css';
import './index';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

// --- IMPORT HALAMAN PUBLIK ---
import LandingPage from './pages/landing_page';
import LoginPage from './pages/login';
import RegisterPage from './pages/register';
import Dashboard from './pages/dashboard';

// Import Halaman AR (Updated Logic)
import ArGalleryPage from './pages/ARGalleryPage'; // Halaman List Candi
import ArPage from './pages/ar';                 // Halaman Panduan (Guidance)
import ARScanPage from './pages/ScanARPage';     // Halaman Desktop (Kiri Marker, Kanan QR)
import MobileARView from './pages/MobileARView'; // Halaman Mobile (Kamera AR) - PASTIKAN FILE INI DIBUAT

// Import Halaman VR & Lainnya
import VrGalleryPage from './pages/VRGalleryPage';
import VrPage from './pages/vr';
import Scan360Page from './pages/Scan360Page';
import History from './pages/history';
import ProfilePage from './pages/profile';
import Footer from './components/all-page/footer-page/footer';

// --- IMPORT ADMIN ---
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
            {/* --- RUTE HALAMAN PUBLIK --- */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/history" element={<History />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/footer" element={<Footer />} />

            {/* --- ALUR AR SYSTEM (INTEGRATED) --- */}
            {/* 1. Galeri: User memilih wisata */}
            <Route path="/ar" element={<ArGalleryPage />} />
            
            {/* 2. Panduan: User melihat detail & cara pakai (menggunakan ID dinamis) */}
            <Route path="/ar/:id" element={<ArPage />} />
            
            {/* 3. Scan Desktop: Tampil Marker & QR Code (menggunakan ID dinamis) */}
            <Route path="/scan/:id" element={<ARScanPage />} />
            
            {/* 4. Mobile AR: Halaman yang dibuka HP via QR Code */}
            <Route path="/mobile-ar/:id" element={<MobileARView />} />


            {/* --- ALUR VR SYSTEM --- */}
            <Route path="/vr" element={<VrGalleryPage />} />
            <Route path="/vr/:destinationId" element={<VrPage />} />
            <Route path="/scan360" element={<Scan360Page />} />


            {/* --- RUTE ADMIN DASHBOARD --- */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="content" element={<ContentPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="history" element={<HistoryPage />} />
              {/* Redirect default admin ke dashboard */}
              <Route index element={<Navigate to="dashboard" />} />
            </Route>

          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;