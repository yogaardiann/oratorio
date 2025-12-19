import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import axios from 'axios';

const LAPTOP_IP = "172.31.128.1";
const BACKEND_PORT = "5000";
const FRONTEND_PORT = "3000";

const ScanARPage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const LOCAL_API_URL = `http://localhost:${BACKEND_PORT}`;
  const IMAGE_BASE_URL = `http://localhost:${BACKEND_PORT}`;
  const PUBLIC_QR_URL = `http://${LAPTOP_IP}:${FRONTEND_PORT}/mobile-ar/${id}`;

  const postHistory = async (payload) => {
    const token = localStorage.getItem("jwt_token");
    if (!token || token === "undefined") {
      console.error("No valid token found!");
      return;
    }
    try {
      const response = await fetch(`${LOCAL_API_URL}/api/history/auth`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });
      
      console.log(`History (${payload.action}) response:`, response.status);
    } catch (e) {
      console.error('history post failed:', e);
    }
  };

  useEffect(() => {
    // Record scan_start segera saat masuk halaman
    const startTime = new Date().toISOString();
    const mountTimeMs = Date.now();
    
    postHistory({
      destination_id: id ? parseInt(id) : null,
      action: 'scan_start',
      model_type: 'AR',
      started_at: startTime
    });

    return () => {
      // Record scan_end saat meninggalkan halaman
      const endTime = new Date().toISOString();
      const duration = Math.max(0, Math.round((Date.now() - mountTimeMs) / 1000));
      
      postHistory({
        destination_id: id ? parseInt(id) : null,
        action: 'scan_end',
        model_type: 'AR',
        started_at: startTime,
        ended_at: endTime,
        duration_seconds: duration
      });
    };
  }, [id]);

  useEffect(() => {
    axios.get(`${LOCAL_API_URL}/api/wisata/${id}`)
      .then(res => {
        setData(res.data);
      })
      .catch(err => {
        setError("Gagal mengambil data. Pastikan backend Flask berjalan.");
      });
  }, [id, LOCAL_API_URL]);

  if (error)
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-white to-red-50 p-4">
        <div className="bg-white border-2 border-red-400 rounded-3xl p-12 max-w-md text-center shadow-2xl">
          <div className="text-7xl mb-6">❌</div>
          <h3 className="text-3xl font-bold text-red-600 mb-3">Error</h3>
          <p className="text-red-500 mb-8 font-medium">{error}</p>
          <Link to="/ar" className="inline-block bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-8 py-3 rounded-full font-bold transition-all shadow-lg hover:shadow-xl">
            Kembali
          </Link>
        </div>
      </div>
    );

  if (!data)
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-white via-blue-50 to-teal-50">
        <div className="text-center">
          <div className="text-7xl mb-6 animate-spin inline-block">⏳</div>
          <h3 className="text-3xl font-bold text-slate-900 mb-3">Memuat Data</h3>
          <p className="text-slate-600 font-medium">Harap tunggu sebentar...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-teal-50 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      </div>

      <div className="relative h-screen flex">
        <div className="flex-1 flex flex-col justify-center items-center p-8 md:p-12 border-r-2 border-slate-200 bg-gradient-to-br from-blue-50 to-white">
          <Link to={`/ar/${id}`} className="absolute top-6 left-6 text-slate-600 hover:text-teal-600 transition-colors flex items-center gap-2 font-semibold group">
            <span className="text-2xl group-hover:-translate-x-1 transition-transform">←</span>
            <span>Detail</span>
          </Link>

          <div className="max-w-sm w-full">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-black bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent mb-2">📱 Marker Area</h2>
              <p className="text-slate-600 font-medium">Arahkan kamera HP ke gambar ini</p>
            </div>

            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-teal-400 to-emerald-400 rounded-3xl blur opacity-30 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-white p-8 rounded-3xl border-2 border-slate-200 shadow-xl">
                <img
                  src={`${IMAGE_BASE_URL}/static/uploads/${data.marker_image}`}
                  alt="AR Marker"
                  className="w-full h-auto rounded-2xl shadow-lg group-hover:scale-105 transition-transform duration-300 border-2 border-slate-100"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentNode.innerHTML += `<div class="w-full aspect-square bg-gradient-to-br from-blue-100 to-teal-100 flex items-center justify-center rounded-2xl text-slate-500 text-center p-6 font-semibold border-2 border-dashed border-slate-300">File tidak ditemukan</div>`;
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center items-center p-8 md:p-12 bg-gradient-to-bl from-teal-50 to-white">
          <Link to={`/ar/${id}`} className="absolute top-6 right-6 text-slate-600 hover:text-teal-600 transition-colors flex items-center gap-2 font-semibold group">
            <span>Detail</span>
            <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
          </Link>

          <div className="max-w-sm w-full">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-black bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent mb-2">📲 Scan QR</h2>
              <p className="text-slate-600 font-medium">Gunakan kamera HP atau Google Lens</p>
            </div>

            <div className="relative group mb-12">
              <div className="absolute -inset-1 bg-gradient-to-r from-teal-400 to-blue-400 rounded-3xl blur opacity-30 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-white p-8 rounded-3xl flex items-center justify-center shadow-2xl border-2 border-slate-200">
                <QRCodeCanvas value={PUBLIC_QR_URL} size={260} level="H" includeMargin={true} />
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-100 to-blue-50 border-2 border-blue-400 rounded-2xl p-6 text-center">
              <p className="text-blue-700 text-xs font-bold uppercase tracking-wider mb-3">🔧 IP Jaringan</p>
              <p className="text-blue-900 text-3xl font-black font-mono">{LAPTOP_IP}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScanARPage;