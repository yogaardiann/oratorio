import React, { useEffect, useState } from 'react';

const AdminHistoryPage = () => {
  const [items, setItems] = useState([]);
  useEffect(() => {
    fetch('/api/history')
      .then(r => r.json())
      .then(setItems)
      .catch(e => console.error(e));
  }, []);
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Riwayat Semua Pengguna</h1>
      <div className="space-y-3">
        {items.map(h => (
          <div key={h.history_id} className="p-3 bg-white rounded shadow flex justify-between">
            <div>
              <div className="font-semibold">{h.destination_name ?? 'Unknown'}</div>
              <div className="text-sm text-gray-500">{h.user_email ?? h.user_id} · {h.action}</div>
            </div>
            <div className="text-sm text-gray-500">{new Date(h.started_at).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
};



export default AdminHistoryPage;