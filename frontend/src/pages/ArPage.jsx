import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const ArPage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const LOCAL_API_URL = `http://localhost:5000`;

  useEffect(() => {
    console.log("ID dari URL:", id); // Debug
    axios.get(`${LOCAL_API_URL}/api/wisata/${id}`)
      .then(res => {
        console.log("Data detail berhasil:", res.data);
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetch detail:", err);
        setError("Gagal mengambil data. Pastikan backend berjalan di port 5000.");
        setLoading(false);
      });
  }, [id]);

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-7xl mb-6 animate-spin inline-block">⏳</div>
          <h3 className="text-3xl font-bold text-slate-900 mb-3">Memuat Detail</h3>
          <p className="text-slate-600 font-medium">Harap tunggu...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-teal-50 flex items-center justify-center p-4">
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

  if (!data) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-teal-50">
      
      {/* Header Navigation */}
      <div className="sticky top-0 z-50 bg-white bg-opacity-95 backdrop-blur border-b-2 border-slate-200 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/ar" className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-bold text-lg transition-colors group">
              <span className="text-2xl group-hover:-translate-x-1 transition-transform">←</span>
              Kembali
            </Link>
            <h1 className="text-2xl font-black bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent max-w-xs truncate">
              {data.name}
            </h1>
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          
          {/* Left - Image (2 columns) */}
          <div className="lg:col-span-2">
            <div className="relative group overflow-hidden rounded-3xl shadow-2xl h-96 lg:h-full border-2 border-slate-200">
              <img
                src={`${LOCAL_API_URL}/static/uploads/${data.marker_image}`}
                alt={data.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => (e.target.src = 'https://via.placeholder.com/600x400')}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-40"></div>
              <div className="absolute bottom-6 left-6">
                <span className="inline-block bg-gradient-to-r from-teal-500 to-emerald-500 text-white px-6 py-3 rounded-full text-sm font-bold shadow-lg">
                  ✨ Augmented Reality
                </span>
              </div>
            </div>
          </div>

          {/* Right - Info Cards */}
          <div className="flex flex-col gap-6">
            
            {/* Location Card */}
            <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 hover:border-teal-400 hover:shadow-lg transition-all group">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-3xl">📍</div>
                <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider">Lokasi</h3>
              </div>
              <p className="text-slate-900 text-lg font-bold group-hover:text-teal-600 transition-colors">
                {data.location}
              </p>
            </div>

            {/* Category Card */}
            <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 hover:border-teal-400 hover:shadow-lg transition-all group">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-3xl">🏷️</div>
                <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider">Kategori</h3>
              </div>
              <p className="text-slate-900 text-lg font-bold group-hover:text-teal-600 transition-colors">
                {data.category}
              </p>
            </div>

            {/* Scan AR Button */}
            <Link
              to={`/scan/${data.id}`}
              className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold py-5 rounded-2xl text-center transition-all duration-300 hover:shadow-2xl hover:shadow-teal-500/50 hover:scale-105 border-2 border-teal-600 flex items-center justify-center gap-2"
            >
              <span className="text-2xl">🔍</span>
              <span>Scan Marker</span>
            </Link>
          </div>
        </div>

        {/* Description Section */}
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-8 mb-12 hover:shadow-lg transition-all">
          <h2 className="text-3xl font-bold text-slate-900 mb-6 flex items-center gap-3">
            <span className="text-4xl">📖</span>
            Tentang Wisata Ini
          </h2>
          <p className="text-slate-700 leading-relaxed text-lg">
            {data.description}
          </p>
        </div>

        {/* Guidelines Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          
          {/* How to Use */}
          <div className="bg-gradient-to-br from-teal-50 to-emerald-50 border-2 border-teal-300 rounded-3xl p-8 hover:shadow-lg transition-all">
            <h3 className="text-2xl font-bold text-teal-900 mb-6 flex items-center gap-3">
              <span className="text-3xl">🎮</span>
              Cara Menggunakan
            </h3>
            <ol className="space-y-4 text-teal-800">
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold text-sm">1</span>
                <span className="font-medium">Klik tombol "Scan Marker" di atas</span>
              </li>
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold text-sm">2</span>
                <span className="font-medium">Arahkan kamera HP ke Marker</span>
              </li>
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold text-sm">3</span>
                <span className="font-medium">Nikmati pengalaman AR interaktif</span>
              </li>
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold text-sm">4</span>
                <span className="font-medium">Gerakkan HP untuk sudut berbeda</span>
              </li>
            </ol>
          </div>

          {/* Requirements */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-3xl p-8 hover:shadow-lg transition-all">
            <h3 className="text-2xl font-bold text-blue-900 mb-6 flex items-center gap-3">
              <span className="text-3xl">⚙️</span>
              Persyaratan
            </h3>
            <ul className="space-y-4 text-blue-800">
              <li className="flex gap-3">
                <span className="text-2xl flex-shrink-0">✓</span>
                <span className="font-medium">Smartphone dengan kamera</span>
              </li>
              <li className="flex gap-3">
                <span className="text-2xl flex-shrink-0">✓</span>
                <span className="font-medium">WiFi stabil dengan laptop</span>
              </li>
              <li className="flex gap-3">
                <span className="text-2xl flex-shrink-0">✓</span>
                <span className="font-medium">Chrome/Firefox terbaru</span>
              </li>
              <li className="flex gap-3">
                <span className="text-2xl flex-shrink-0">✓</span>
                <span className="font-medium">Ruang untuk bergerak</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Tips Section */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-3xl p-8 mb-12">
          <h3 className="text-2xl font-bold text-amber-900 mb-6 flex items-center gap-3">
            <span className="text-3xl">💡</span>
            Tips & Trik
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-amber-800">
            <div className="flex gap-3">
              <span className="text-2xl flex-shrink-0">🔦</span>
              <p className="font-medium">Pencahayaan cukup untuk hasil maksimal</p>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl flex-shrink-0">📱</span>
              <p className="font-medium">Jarak 30-50 cm dari marker</p>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl flex-shrink-0">🤳</span>
              <p className="font-medium">Gerakkan HP perlahan</p>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl flex-shrink-0">🔄</span>
              <p className="font-medium">Reload jika AR tidak terdeteksi</p>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center mb-12">
          <Link
            to={`/scan/${data.id}`}
            className="inline-block bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold py-5 px-12 rounded-full text-lg transition-all duration-300 hover:shadow-2xl hover:shadow-teal-500/50 hover:scale-105 border-2 border-teal-600 flex items-center gap-3"
          >
            <span className="text-2xl">📲</span>
            <span>Mulai Scan AR Sekarang</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ArPage;