import React, { useEffect, useState, useMemo } from 'react';
import './DashboardPage.css'; // Pastikan file CSS terhubung
import { FiUsers, FiHeart, FiCpu } from 'react-icons/fi';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const API_BASE = "http://localhost:5000/api"; // gunakan full URL agar tidak tertukar dengan dev server; bisa diganti ke "/api" bila proxy terkonfigurasi

const DashboardPage = () => {
  const [users, setUsers] = useState([]);
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch users and history
  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const [uRes, hRes] = await Promise.all([
          fetch(`${API_BASE}/users`).then(r => r.ok ? r.json() : []),
          fetch(`${API_BASE}/history`).then(r => r.ok ? r.json() : []),
        ]);
        if (!mounted) return;
        setUsers(Array.isArray(uRes) ? uRes : []);
        setHistoryItems(Array.isArray(hRes) ? hRes : []);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
        setUsers([]);
        setHistoryItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  // Total users
  const totalUsers = users.length;

  // Popular destinations (from history.destination_name)
  const popularDestinations = useMemo(() => {
    const count = {};
    for (const h of historyItems) {
      const name = h.destination_name || (h.destination_id ? `ID:${h.destination_id}` : 'Unknown');
      count[name] = (count[name] || 0) + 1;
    }
    const arr = Object.entries(count).map(([name, c]) => ({ name, count: c }));
    arr.sort((a, b) => b.count - a.count);
    return arr;
  }, [historyItems]);

  // Favorite model type (AR/VR)
  const favoriteModel = useMemo(() => {
    const count = {};
    for (const h of historyItems) {
      const model = (h.model_type || 'Unknown').toUpperCase();
      count[model] = (count[model] || 0) + 1;
    }
    const entries = Object.entries(count).map(([model, c]) => ({ model, count: c }));
    entries.sort((a, b) => b.count - a.count);
    return entries[0] || { model: 'N/A', count: 0 };
  }, [historyItems]);

  // Visits / activity for last 7 days (based on started_at)
  const last7DaysSeries = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
      days.push({ key, label: d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' }), count: 0 });
    }
    for (const h of historyItems) {
      const ts = h.started_at || h.ended_at;
      if (!ts) continue;
      // normalize (some timestamps may be "YYYY-MM-DD HH:MM:SS")
      const dateStr = ('' + ts).slice(0, 10);
      const idx = days.findIndex(d => d.key === dateStr);
      if (idx !== -1) days[idx].count++;
    }
    return days;
  }, [historyItems]);

  // Recent activities: latest scan_start / AR accesses
  const recentActivities = useMemo(() => {
    const arr = (historyItems || [])
      .filter(h => (h.action || '').toLowerCase().includes('scan') || (h.model_type && h.model_type.toUpperCase() === 'AR'))
      .sort((a, b) => {
        const ta = a.started_at || a.ended_at || '';
        const tb = b.started_at || b.ended_at || '';
        return tb.localeCompare(ta);
      })
      .slice(0, 6)
      .map(h => ({
        id: h.history_id || `${h.user_id}-${h.destination_id}-${h.started_at}`,
        user: h.user_email || `#${h.user_id}`,
        destination: h.destination_name || (h.destination_id ? `ID:${h.destination_id}` : 'Unknown'),
        time: h.started_at || h.ended_at || '',
        action: h.action || '',
      }));
    return arr;
  }, [historyItems]);

  const chartData = {
    labels: last7DaysSeries.map(d => d.label),
    datasets: [
      {
        label: 'Kunjungan 7 Hari',
        data: last7DaysSeries.map(d => d.count),
        borderColor: '#008080',
        backgroundColor: 'rgba(0,128,128,0.08)',
        tension: 0.25,
        fill: true,
      },
    ],
  };

  return (
    <div className="dashboard-page p-6 bg-slate-50 min-h-screen">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-gray-600">Ringkasan aktivitas platform berdasarkan data dari database.</p>
      </header>

      {loading ? (
        <div className="loading-state">Memuat data...</div> // Menggunakan kelas kustom
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            
            {/* Kartu Total Pengguna */}
            <div className="p-4 bg-white rounded shadow flex items-center gap-4 stat-card-custom"> 
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full"><FiUsers size={20} /></div>
              <div>
                <div className="text-sm text-gray-500">Total Pengguna</div>
                <div className="text-xl font-semibold">{totalUsers}</div>
              </div>
            </div>

            {/* Kartu Destinasi Populer */}
            <div className="p-4 bg-white rounded shadow flex items-center gap-4 stat-card-custom"> 
              <div className="p-3 bg-sky-50 text-sky-600 rounded-full"><FiHeart size={20} /></div>
              <div>
                <div className="text-sm text-gray-500">Destinasi Populer</div>
                <div className="text-lg font-semibold">{popularDestinations[0]?.name ?? 'Tidak ada'}</div>
                <div className="text-sm text-gray-500">{popularDestinations[0] ? `${popularDestinations[0].count} kali dilihat` : ''}</div>
              </div>
            </div>

            {/* Kartu Model Favorit */}
            <div className="p-4 bg-white rounded shadow flex items-center gap-4 stat-card-custom"> 
              <div className="p-3 bg-violet-50 text-violet-600 rounded-full"><FiCpu size={20} /></div>
              <div>
                <div className="text-sm text-gray-500">Model Favorit</div>
                <div className="text-lg font-semibold">{favoriteModel.model}</div>
                <div className="text-sm text-gray-500">{favoriteModel.count} kali</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Bagian Grafik */}
            <section className="col-span-2 bg-white rounded shadow p-4 dashboard-section-custom">
              <h2 className="text-lg font-semibold mb-3">Aktivitas Pengguna (7 Hari Terakhir)</h2>
              <Line data={chartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
            </section>

            {/* Bagian Aktivitas Terbaru */}
            <section className="bg-white rounded shadow p-4 dashboard-section-custom">
              <h2 className="text-lg font-semibold mb-3">Aktivitas Terbaru (AR)</h2>
              <div className="space-y-3">
                {recentActivities.length === 0 ? (
                  <div className="text-sm text-gray-500 p-3 bg-slate-50 rounded">Belum ada aktivitas AR terbaru.</div>
                ) : recentActivities.map(act => (
                  <div key={act.id} className="p-3 bg-slate-50 rounded flex justify-between items-center recent-activity-item"> {/* Menggunakan kelas kustom */}
                    <div>
                      <div className="font-medium">{act.destination}</div>
                      <div className="text-sm text-gray-500">{act.user} · {act.action}</div>
                    </div>
                    <div className="text-xs text-gray-400">{act.time ? new Date(act.time).toLocaleString() : '-'}</div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="mt-6 bg-white rounded shadow p-4 dashboard-section-custom"> {/* Menggunakan kelas kustom */}
            <h3 className="text-md font-semibold mb-2">Top Destinasi (semua waktu)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {popularDestinations.slice(0, 6).map(d => (
                <div key={d.name} className="p-3 bg-slate-50 rounded top-destination-card"> {/* Menggunakan kelas kustom */}
                  <div className="font-medium">{d.name}</div>
                  <div className="text-sm text-gray-500">{d.count} kunjungan</div>
                </div>
              ))}
              {popularDestinations.length === 0 && <div className="text-sm text-gray-500 p-3 bg-slate-50 rounded">Belum ada data.</div>}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;