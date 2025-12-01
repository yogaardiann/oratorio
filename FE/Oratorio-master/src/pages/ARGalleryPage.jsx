import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ARGalleryPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredItems, setFilteredItems] = useState([]);

  useEffect(() => {
    axios.get('http://192.168.23.214:5000/api/wisata')
      .then(response => {
        setItems(response.data);
        setFilteredItems(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const filtered = items.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredItems(filtered);
  }, [searchTerm, items]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-teal-50">
      
      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-teal-600 to-emerald-600 shadow-xl">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-6xl font-black text-white mb-4 drop-shadow-lg">
              🎨 Galeri AR Torio
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Jelajahi destinasi wisata dengan teknologi Augmented Reality yang memukau
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Cari wisata atau lokasi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 rounded-full bg-white bg-opacity-95 backdrop-blur text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 shadow-2xl transition-all"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="text-7xl animate-bounce mb-4">⏳</div>
            <p className="text-xl text-slate-600 font-semibold">Memuat koleksi wisata...</p>
          </div>
        )}

        {/* Gallery Grid */}
        {!loading && (
          <>
            <div className="mb-8 flex items-center justify-between">
              <p className="text-slate-600 text-sm font-semibold uppercase tracking-wider">
                ✓ {filteredItems.length} Destinasi Tersedia
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredItems.map((item) => (
                <Link key={item.id} to={`/ar/${item.id}`}>
                  <div className="group h-full bg-white border-2 border-slate-100 rounded-3xl overflow-hidden hover:border-teal-400 transition-all duration-300 hover:shadow-2xl hover:shadow-teal-200/50 hover:-translate-y-2 cursor-pointer">
                    
                    {/* Image Container */}
                    <div className="relative overflow-hidden h-64 bg-gradient-to-br from-blue-100 to-teal-100">
                      <img
                        src={`http://192.168.23.214:5000/static/uploads/${item.marker_image}`}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => (e.target.src = 'https://via.placeholder.com/400x300?text=No+Image')}
                      />
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-30 group-hover:opacity-50 transition-opacity"></div>

                      {/* AR Badge */}
                      <div className="absolute top-4 right-4">
                        <span className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg group-hover:from-teal-600 group-hover:to-emerald-600 transition-all">
                          <span className="text-lg">✨</span>
                          AR
                        </span>
                      </div>

                      {/* Category Badge */}
                      <div className="absolute top-4 left-4">
                        <span className="inline-flex bg-gradient-to-r from-blue-500 to-teal-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                          {item.category}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 flex flex-col justify-between h-48">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-teal-600 transition-colors line-clamp-2">
                          {item.name}
                        </h3>
                        <div className="flex items-start gap-2 text-slate-600 text-sm mb-4">
                          <span className="text-lg flex-shrink-0 mt-0.5">📍</span>
                          <span className="line-clamp-2">{item.location}</span>
                        </div>
                      </div>

                      {/* Button */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-200 group-hover:border-teal-300 transition-colors">
                        <span className="text-teal-600 text-sm font-semibold group-hover:translate-x-1 transition-transform">
                          Lihat Detail
                        </span>
                        <span className="text-xl text-teal-600 group-hover:translate-x-1 transition-transform">→</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Empty State */}
            {filteredItems.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-3xl border-2 border-dashed border-slate-300">
                <div className="text-7xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Tidak Ada Hasil</h3>
                <p className="text-slate-600 mb-8">
                  Coba cari dengan kata kunci yang berbeda
                </p>
                <button
                  onClick={() => setSearchTerm("")}
                  className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white px-8 py-3 rounded-full font-semibold transition-all shadow-lg hover:shadow-xl"
                >
                  Reset Pencarian
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ARGalleryPage;