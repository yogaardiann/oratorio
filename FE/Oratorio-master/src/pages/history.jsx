import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:5000'; // backend URL

const HistoryPage = () => {
  const { user } = useContext(AuthContext || {});
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    console.log('[HISTORY PAGE] user from context:', user);

    if (!user?.user_id) {
      setDebugInfo(`No user_id in context. User object: ${JSON.stringify(user)}`);
      setLoading(false);
      return;
    }
    const userId = user.user_id;
    console.log(`[HISTORY PAGE] Fetching ${API_BASE}/api/history/user/${userId}`);
    setDebugInfo(`Fetching history for user ${userId}...`);

    fetch(`${API_BASE}/api/history/user/${userId}`)
      .then(r => {
        console.log('[HISTORY PAGE] Response status:', r.status);
        return r.ok ? r.json() : Promise.reject(r.statusText);
      })
      .then(data => {
        console.log('[HISTORY PAGE] Data received:', data);
        setItems(data || []);
        setDebugInfo(`Loaded ${data?.length || 0} items`);
      })
      .catch(e => {
        console.error('[HISTORY PAGE] Fetch error:', e);
        setDebugInfo(`Error: ${e}`);
        setItems([]);
      })
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-500 font-bold mb-2">Silakan login untuk melihat riwayat Anda.</div>
        <div className="text-xs text-gray-500">Debug: {debugInfo}</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div>Memuat riwayat...</div>
        <div className="text-xs text-gray-500 mt-2">Debug: {debugInfo}</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Riwayat Kunjungan</h1>
      <div className="text-xs text-gray-400 mb-4">User ID: {user?.user_id} | Debug: {debugInfo}</div>

      {items.length === 0 && (
        <div className="text-gray-500">Belum ada riwayat kunjungan.</div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {items.map(h => {
          const started = h.started_at ? new Date(h.started_at) : null;
          const ended = h.ended_at ? new Date(h.ended_at) : null;
          return (
            <button
              key={h.history_id}
              onClick={() => {
                if (h.destination_id) navigate(`/scan/${h.destination_id}`);
              }}
              className="w-full text-left bg-white rounded-lg shadow p-4 flex items-center justify-between hover:shadow-md transition"
            >
              <div>
                <div className="text-lg font-semibold">{h.destination_name ?? 'Destinasi'}</div>
                <div className="text-sm text-gray-500 mt-1">{h.action} · {h.model_type}</div>
                <div className="text-sm text-gray-400 mt-1">Terakhir: {started ? started.toLocaleString() : '-'}</div>
              </div>

              <div className="text-right">
                <div className="text-sm text-gray-500">{ended ? `Durasi: ${h.duration_seconds ?? '-'}s` : '-'}</div>
                <div className="text-xs text-gray-400 mt-2">Klik untuk kembali ke Scan</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default HistoryPage;