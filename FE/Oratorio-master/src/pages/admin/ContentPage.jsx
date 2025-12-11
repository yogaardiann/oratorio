import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiPlus, FiTrash2, FiEdit } from "react-icons/fi";

/*
  ContentPage - Admin Manajemen Konten (single category: Content AR TORIO)
  - Add new with files: marker image (.jpg/.png/.jpeg), mind file (.mind), model (.glb)
  - Uses Tailwind for styling
  - Endpoint assumptions:
      GET  -> http://localhost:5000/api/wisata
      POST -> http://localhost:5000/api/wisata   (multipart/form-data: marker, mind, model, name, description, location)
      PUT  -> http://localhost:5000/api/wisata/:id  (optional)
      DELETE -> http://localhost:5000/api/wisata/:id
*/

const BASE_API_URL = "http://localhost:5000/api/wisata";

const ContentPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  // Form state
  const [form, setForm] = useState({
    name: "",
    location: "",
    description: "",
    markerFile: null,
    mindFile: null,
    modelFile: null,
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await axios.get(BASE_API_URL);
      // backend returns array
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error("fetchItems error", e);
      setMessage({ type: "error", text: "Gagal mengambil data dari server." });
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingItem(null);
    setForm({
      name: "",
      location: "",
      description: "",
      markerFile: null,
      mindFile: null,
      modelFile: null,
    });
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setForm({
      name: item.name ?? item.destination_name ?? "",
      location: item.location ?? "",
      description: item.description ?? "",
      markerFile: null,
      mindFile: null,
      modelFile: null,
    });
    setShowModal(true);
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (!files || files.length === 0) return;
    setForm((s) => ({ ...s, [name]: files[0] }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const fd = new FormData();
      fd.append("name", form.name || "");
      fd.append("description", form.description || "");
      fd.append("location", form.location || "");
      // backend expects keys: marker, mind, model
      if (form.markerFile) fd.append("marker", form.markerFile);
      if (form.mindFile) fd.append("mind", form.mindFile);
      if (form.modelFile) fd.append("model", form.modelFile);

      let res;
      if (editingItem && editingItem.id) {
        // Try PUT multipart update (if backend supports)
        res = await axios.put(`${BASE_API_URL}/${editingItem.id}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        res = await axios.post(BASE_API_URL, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      setMessage({ type: "success", text: "Data tersimpan." });
      setShowModal(false);
      fetchItems();
    } catch (err) {
      console.error("handleSubmit error", err);
      setMessage({
        type: "error",
        text:
          err?.response?.data?.message ??
          "Gagal menyimpan data. Pastikan backend berjalan dan menerima file.",
      });
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (item) => {
    if (!window.confirm(`Hapus konten "${item.name ?? item.destination_name}"?`)) return;
    deleteItem(item);
  };

  const deleteItem = async (item) => {
    try {
      await axios.delete(`${BASE_API_URL}/${item.id ?? item.destination_id}`);
      setMessage({ type: "success", text: "Item dihapus." });
      fetchItems();
    } catch (e) {
      console.error("deleteItem error", e);
      setMessage({ type: "error", text: "Gagal menghapus item." });
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Content AR TORIO</h1>
            <p className="text-sm text-gray-500 mt-1">Kelola konten AR (marker, mind file, 3D model)</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl shadow"
            >
              <FiPlus /> Tambah Content AR
            </button>
          </div>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === "success" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow ring-1 ring-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Preview</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Nama</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Lokasi</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Files</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    Memuat...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                    Belum ada content AR. Tambah dengan tombol "Tambah Content AR".
                  </td>
                </tr>
              ) : (
                items.map((it) => {
                  const id = it.id ?? it.destination_id;
                  const imageUrl = it.marker_image
                    ? `http://localhost:5000/static/uploads/${it.marker_image}`
                    : null;
                  return (
                    <tr key={id}>
                      <td className="px-6 py-4">
                        <div className="w-28 h-20 bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center border">
                          {imageUrl ? (
                            <img src={imageUrl} alt="marker" className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-xs text-gray-400">No Image</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{it.name ?? it.destination_name}</div>
                        <div className="text-xs text-gray-500 mt-1">{it.description ?? ""}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{it.location ?? "-"}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex flex-col gap-1">
                          <div>Marker: {it.marker_image ?? "-"}</div>
                          <div>Mind: {it.mind_file ?? "-"}</div>
                          <div>Model: {it.glb_model ?? "-"}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(it)}
                            className="p-2 rounded-md text-indigo-600 hover:bg-indigo-50"
                            title="Edit"
                          >
                            <FiEdit />
                          </button>
                          <button
                            onClick={() => confirmDelete(it)}
                            className="p-2 rounded-md text-red-600 hover:bg-red-50"
                            title="Hapus"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {showModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={() => setShowModal(false)}
          >
            <div
              className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{editingItem ? "Edit Content AR" : "Tambah Content AR"}</h2>
                  <p className="text-sm text-gray-500 mt-1">Unggah marker image (.jpg/.png), mind file (.mind) dan model (.glb)</p>
                </div>
                <div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600 rounded-full p-2"
                    aria-label="Close"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Destinasi</label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                      placeholder="Nama (mis: Candi Borobudur)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Lokasi</label>
                    <input
                      name="location"
                      value={form.location}
                      onChange={handleChange}
                      className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                      placeholder="Kota, Provinsi"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Deskripsi</label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      rows="3"
                      className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                      placeholder="Deskripsi singkat destinasi"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Marker Image (.jpg/.png)</label>
                    <input
                      type="file"
                      name="markerFile"
                      accept=".jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      className="block w-full text-sm text-gray-600"
                    />
                    {form.markerFile && (
                      <div className="mt-2 text-xs text-gray-600">File: {form.markerFile.name}</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Mind File (.mind)</label>
                    <input
                      type="file"
                      name="mindFile"
                      accept=".mind"
                      onChange={handleFileChange}
                      className="block w-full text-sm text-gray-600"
                    />
                    {form.mindFile && (
                      <div className="mt-2 text-xs text-gray-600">File: {form.mindFile.name}</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">3D Model (.glb)</label>
                    <input
                      type="file"
                      name="modelFile"
                      accept=".glb"
                      onChange={handleFileChange}
                      className="block w-full text-sm text-gray-600"
                    />
                    {form.modelFile && (
                      <div className="mt-2 text-xs text-gray-600">File: {form.modelFile.name}</div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    {loading ? "Menyimpan..." : editingItem ? "Simpan Perubahan" : "Tambah Content AR"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentPage;