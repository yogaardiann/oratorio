import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/all-page/footer-page/footer';

const API_BASE = 'http://localhost:5000';

const HistoryPage = () => {
  const { user } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [debug, setDebug] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Cek jika user belum ada, stop loading
    if (!user) {
      setDebug('User not logged in or context invalid.');
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    // 2. Definisi fungsi di dalam useEffect yang sama
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("jwt_token");
        const url = `${API_BASE}/api/history/user/${user.user_id}`;
        
        setDebug(`Fetching: ${url}`);

        const res = await fetch(url, { 
          signal: controller.signal,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!res.ok) throw new Error(`Status ${res.status}`);

        const data = await res.json();
        
        // Sorting data terbaru di atas
        const sorted = data.sort(
          (a, b) => new Date(b.started_at) - new Date(a.started_at)
        );

        setItems(sorted);
        setDebug(`Loaded ${sorted.length} items`);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setDebug(`Error: ${err.message}`);
          setItems([]);
        }
      } finally {
        setLoading(false);
      }
    };

    // 3. Panggil fungsinya di sini
    fetchHistory();

    // Cleanup untuk membatalkan fetch jika user pindah halaman sebelum beres
    return () => controller.abort();
    
    // Gunakan user.user_id sebagai dependency agar stabil
  }, [user?.user_id]); 

  if (!user) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-500 font-bold">Silakan login untuk melihat riwayat Anda.</div>
        <div className="text-xs text-gray-500 mt-2">{debug}</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8 text-center py-20">
        <div className="flex justify-center items-center space-x-2">
          <svg className="animate-spin h-8 w-8 text-indigo-600" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
            <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-xl font-medium">Memuat riwayat...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow p-4 md:p-8 max-w-4xl mx-auto w-full">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-2">Riwayat Kunjungan</h1>
        <p className="text-gray-500 mb-6">Jejak petualangan digital Anda.</p>

        {items.length === 0 ? (
          <div className="text-gray-500 bg-gray-50 p-10 rounded-2xl border border-dashed border-gray-300 text-center">
            Belum ada riwayat kunjungan. Yuk, mulai scan objek AR!
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((h, idx) => {
              const started = h.started_at ? new Date(h.started_at) : null;
              const isNewest = idx === 0;

              return (
                <button
                  key={h.history_id || idx}
                  onClick={() => h.destination_id && navigate(`/scan/${h.destination_id}`)}
                  className={`w-full text-left rounded-xl p-5 flex items-start justify-between transition-all border
                    ${isNewest ? 'bg-indigo-50 border-indigo-200 shadow-md' : 'bg-white border-gray-100 shadow-sm hover:shadow-md'}
                  `}
                >
                  <div className="flex-grow">
                    <div className={`text-xl font-bold ${isNewest ? 'text-indigo-700' : 'text-gray-800'}`}>
                      {h.destination_name ?? 'Destinasi Tidak Dikenal'}
                      {isNewest && (
                        <span className="ml-2 inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-600 text-white">
                          Terbaru
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-600 font-mono text-xs">
                        {h.model_type ?? 'AR'}
                      </span>
                      <span>•</span>
                      <span>{h.action === 'scan_start' ? 'Mulai Scan' : 'Selesai Scan'}</span>
                    </div>
                  </div>

                  <div className="text-right flex flex-col items-end shrink-0">
                    <div className="text-sm font-bold text-gray-700">
                      {started?.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) ?? '-'}
                    </div>
                    <div className="text-xs text-gray-400">
                      {started?.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) ?? '-'}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-10 pt-4 border-t text-[10px] text-gray-400 font-mono">
          System Info: User ID {user.user_id} | Status: {debug}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default HistoryPage;