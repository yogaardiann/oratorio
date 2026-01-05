import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import axios from 'axios';

// 🔑 GANTI DENGAN URL NGROK ANDA YANG SEBENARNYA — TANPA SPASI!
// Contoh valid: "https://7d3b-180-247-27-123.ngrok-free.app"
const NGROK_URL = "https://arcelia-unpronounceable-decretively.ngrok-free.dev";

const ScanARPage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  // ✅ QR code langsung ke HTTPS ngrok
  const PUBLIC_QR_URL = `${NGROK_URL}/mobile-ar/${id}`;

  const postHistory = async (payload) => {
    const token = localStorage.getItem("jwt_token");
    if (!token || token === "undefined") {
      console.error("No valid token found!");
      return;
    }
    try {
      // ✅ Pakai path relatif — karena origin = NGROK_URL (HTTPS)
      const response = await fetch(`/api/history/auth`, {
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
    const startTime = new Date().toISOString();
    const mountTimeMs = Date.now();
    
    postHistory({
      destination_id: id ? parseInt(id, 10) : null,
      action: 'scan_start',
      model_type: 'AR',
      started_at: startTime
    });

    return () => {
      const endTime = new Date().toISOString();
      const duration = Math.max(0, Math.round((Date.now() - mountTimeMs) / 1000));
      
      postHistory({
        destination_id: id ? parseInt(id, 10) : null,
        action: 'scan_end',
        model_type: 'AR',
        started_at: startTime,
        ended_at: endTime,
        duration_seconds: duration
      });
    };
  }, [id]);

  useEffect(() => {
    // ✅ Gunakan path RELATIF — tidak perlu host!
    axios.get(`/api/wisata/${id}`)
      .then(res => {
        setData(res.data);
      })
      .catch(err => {
        setError("Gagal mengambil data AR. Pastikan ngrok aktif dan backend berjalan.");
      });
  }, [id]);

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
          <h3 className="text-3xl font-bold text-slate-900 mb-3">Memuat Data AR...</h3>
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

      {/* 🔁 Diubah: ganti `h-screen flex` → `min-h-screen flex flex-col md:flex-row` */}
      <div className="relative min-h-screen flex flex-col md:flex-row">

        {/* KOLOM KIRI */}
        <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 border-r-2 border-slate-200 bg-gradient-to-br from-blue-50 to-white">
          <Link to={`/ar/${id}`} className="absolute top-6 left-6 ...">← Detail</Link>

          {/* 🔁 Dihapus: `max-w-sm w-full` → diganti dengan wrapper fleksibel */}
          <div className="flex flex-col items-center w-full max-w-4xl">
            {/* 🔁 Judul dipindah ke sini, di-center */}
            <div className="text-center mb-8">
              <h2 className="text-4xl font-black bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                📱 Marker Area
              </h2>
              <p className="text-slate-600 font-medium mt-2">Arahkan kamera HP ke gambar ini</p>
            </div>

            {/* 🔁 Gambar: hapus `w-[700px]` di div luar, pindah ke `max-w-[700px]` di img */}
            <div className="relative group">
              <div className="absolute -inset-1 ..."></div>
              <div className="relative bg-white rounded-3xl border-2 border-slate-200 shadow-xl p-4">
                <img
                  src={`/static/uploads/${data.marker_image}`}
                  alt="AR Marker"
                  className="w-full max-w-[420px] h-auto rounded-2xl ..." 
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentNode.innerHTML += `<div class="w-full aspect-square bg-gradient-to-br from-blue-100 to-teal-100 flex items-center justify-center rounded-2xl text-slate-500 text-center p-6 font-semibold border-2 border-dashed border-slate-300">File tidak ditemukan</div>`;
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN */}
        <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 bg-gradient-to-bl from-teal-50 to-white">
          <Link to={`/ar/${id}`} className="absolute top-6 right-6 ...">Detail →</Link>

          {/* 🔁 Sama seperti kiri: hapus max-w-sm, gunakan max-w-4xl */}
          <div className="flex flex-col items-center w-full max-w-4xl">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-black bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                📲 Scan QR
              </h2>
              <p className="text-slate-600 font-medium mt-2">Gunakan kamera HP atau Google Lens</p>
            </div>

            <div className="relative group">
              <div className="absolute -inset-1 ..."></div>
              <div className="relative bg-white rounded-3xl flex items-center justify-center shadow-2xl border-2 border-slate-200 p-6">
                <QRCodeCanvas 
                  value={PUBLIC_QR_URL} 
                  size={500} 
                  level="H" 
                  includeMargin={true} 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScanARPage;