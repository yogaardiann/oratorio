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
    if (!user?.user_id) {
      setDebug('User not logged in or context invalid.');
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchHistory = async () => {
      try {
        const url = `${API_BASE}/api/history/user/${user.user_id}`;
        setDebug(`Fetching: ${url}`);

        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`Status ${res.status}`);

        const data = await res.json();
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

    fetchHistory();
    return () => controller.abort();
  }, [user]);

  const formatDuration = (seconds) => {
    if (!seconds) return '-';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

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
      <div className="p-8 text-center">
        <div className="flex justify-center items-center space-x-2">
          <svg className="animate-spin h-5 w-5 text-indigo-600" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
            <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>Memuat riwayat...</span>
        </div>
        <div className="text-xs text-gray-500 mt-2">{debug}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* CONTENT */}
      <div className="flex-grow p-4 md:p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-2">Riwayat Kunjungan</h1>
        <p className="text-gray-500 mb-6">Jejak petualangan digital Anda.</p>

        {items.length === 0 ? (
          <div className="text-gray-500 bg-gray-50 p-6 rounded-lg border border-dashed border-gray-300">
            Belum ada riwayat kunjungan.
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((h, idx) => {
              const started = h.started_at ? new Date(h.started_at) : null;
              const isNewest = idx === 0;

              return (
                <button
                  key={h.history_id}
                  onClick={() => h.destination_id && navigate(`/scan/${h.destination_id}`)}
                  className={`w-full text-left rounded-xl p-5 flex items-start justify-between transition-all
                    ${isNewest ? 'bg-indigo-50 border-2 border-indigo-400 shadow-lg' : 'bg-white shadow hover:shadow-md'}
                  `}
                >
                  <div>
                    <div className={`text-xl font-bold ${isNewest ? 'text-indigo-700' : 'text-gray-800'}`}>
                      {h.destination_name ?? 'Destinasi Tidak Dikenal'}
                      {isNewest && (
                        <span className="ml-2 inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          Terbaru
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Mode: <span className="font-semibold text-gray-700">{h.model_type ?? '-'}</span>
                    </div>
                  </div>

                  <div className="text-right flex flex-col items-end">
                    <div className="text-sm font-medium text-gray-600">
                      {started?.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' }) ?? '-'}
                    </div>
                    <div className="text-xs text-gray-400">
                      Pukul: {started?.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) ?? '-'}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-8 pt-4 border-t text-xs text-gray-400">
          Debug: User ID {user.user_id} — {debug}
        </div>
      </div>

      {/* FOOTER */}
      <Footer />
    </div>
  );
};

export default HistoryPage;
