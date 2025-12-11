import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:5000/api/users";

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_BASE);
      setUsers(res.data || []);
      setMessage({ text: "", type: "" });
    } catch (err) {
      console.error("Failed to GET /api/users:", err);
      setMessage({
        text: "Gagal memuat pengguna. Pastikan backend menjalankan endpoint /api/users.",
        type: "error",
      });
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (user) => {
    const id = user.user_id ?? user.id;
    if (!id) {
      setMessage({ text: "ID pengguna tidak tersedia.", type: "error" });
      return;
    }

    if (!window.confirm(`Hapus pengguna ${user.name ?? user.username ?? user.email}?`)) return;

    try {
      await axios.delete(`${API_BASE}/${id}`);
      setMessage({ text: "Pengguna dihapus.", type: "success" });
      fetchUsers();
    } catch (err) {
      console.error("Failed to delete user:", err);
      setMessage({ text: "Gagal menghapus pengguna.", type: "error" });
    }
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Manajemen Pengguna</h1>
        <p className="text-sm text-gray-600">Tampilkan pengguna yang sudah terdaftar.</p>
      </header>

      {message.text && (
        <div
          className={`mb-4 p-3 rounded ${
            message.type === "success" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="p-6 bg-white rounded shadow text-gray-600">Loading...</div>
      ) : users.length === 0 ? (
        <div className="p-6 bg-white rounded shadow text-gray-600">Tidak ada data pengguna.</div>
      ) : (
        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="w-full text-left table-auto">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-3 text-sm font-medium">ID</th>
                <th className="p-3 text-sm font-medium">Nama</th>
                <th className="p-3 text-sm font-medium">Email</th>
                <th className="p-3 text-sm font-medium">Role</th>
                <th className="p-3 text-sm font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const id = u.user_id ?? u.id ?? "-";
                return (
                  <tr key={id} className="border-t">
                    <td className="p-3 text-sm">{id}</td>
                    <td className="p-3 text-sm">{u.name ?? u.username ?? "-"}</td>
                    <td className="p-3 text-sm">{u.email ?? "-"}</td>
                    <td className="p-3 text-sm">{u.role ?? "-"}</td>
                    <td className="p-3 text-sm text-right">
                      <button
                        onClick={() => handleDelete(u)}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 text-sm"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UsersPage;