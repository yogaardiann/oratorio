import React, { useEffect, useState } from "react";

const BASE_API_URL = "http://192.168.110.3:5000/api/wisata";

// --- SVG Icons ---
const FiStar = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279L12 18.251l-7.416 3.962 1.48-8.279L.0 9.306l8.332-1.151L12 .587z"/>
  </svg>
);
const FiEdit = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </svg>
);
const FiTrash2 = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);
const FiPlus = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const FiImage = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);
const FiDownload = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const ContentPage = () => {
  const [wisatas, setWisatas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [isConfirming, setIsConfirming] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    marker_image: null,
    mind_file: null,
    glb_model: null,
  });

  const [previewFiles, setPreviewFiles] = useState({
    marker_image: null,
    mind_file: null,
    glb_model: null,
  });

  // Hapus pesan setelah beberapa waktu
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // GET ALL WISATA
  const fetchWisatas = async () => {
    setLoading(true);
    try {
      const response = await fetch(BASE_API_URL);
      if (!response.ok) {
        throw new Error("Gagal mengambil data");
      }
      const data = await response.json();
      setWisatas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching wisatas:", error);
      setMessage("Gagal terhubung ke server API. Pastikan Flask berjalan.");
      setMessageType("error");
      setWisatas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWisatas();
  }, []);

  // FORM CHANGE TEXT
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // FORM CHANGE FILE
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      setFormData({
        ...formData,
        [name]: file,
      });

      // Preview file
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewFiles({
          ...previewFiles,
          [name]: event.target.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // OPEN ADD MODAL
  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      name: "",
      description: "",
      location: "",
      marker_image: null,
      mind_file: null,
      glb_model: null,
    });
    setPreviewFiles({
      marker_image: null,
      mind_file: null,
      glb_model: null,
    });
    setUploadProgress(0);
    setShowModal(true);
  };

  // OPEN EDIT MODAL
  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name || "",
      description: item.description || "",
      location: item.location || "",
      marker_image: null,
      mind_file: null,
      glb_model: null,
    });
    setPreviewFiles({
      marker_image: item.marker_image ? `http://192.168.110.3:5000/static/uploads/${item.marker_image}` : null,
      mind_file: null,
      glb_model: null,
    });
    setUploadProgress(0);
    setShowModal(true);
  };

  // SUBMIT FORM (ADD OR UPDATE)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.description || !formData.location) {
      setMessage("Nama, deskripsi, dan lokasi harus diisi!");
      setMessageType("error");
      return;
    }

    // Jika menambah, pastikan ketiga file ada
    if (!editingItem && (!formData.marker_image || !formData.mind_file || !formData.glb_model)) {
      setMessage("Untuk menambah wisata baru, semua file (Marker, Mind, Model) harus diupload!");
      setMessageType("error");
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("location", formData.location);

      // Hanya tambah file jika ada file baru
      if (formData.marker_image) formDataToSend.append("marker", formData.marker_image);
      if (formData.mind_file) formDataToSend.append("mind", formData.mind_file);
      if (formData.glb_model) formDataToSend.append("model", formData.glb_model);

      const method = editingItem ? "PUT" : "POST";
      const url = editingItem ? `${BASE_API_URL}/${editingItem.id}` : BASE_API_URL;

      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          setUploadProgress(Math.round(percentComplete));
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status === 200 || xhr.status === 201) {
          const data = JSON.parse(xhr.responseText);
          setMessage(data.message || `Wisata berhasil di${method === "POST" ? "tambah" : "perbarui"}!`);
          setMessageType("success");
          setShowModal(false);
          setUploadProgress(0);
          fetchWisatas();
        } else {
          const data = JSON.parse(xhr.responseText);
          setMessage(`Gagal: ${data.message || "Terjadi kesalahan"}`);
          setMessageType("error");
        }
        setLoading(false);
      });

      xhr.addEventListener("error", () => {
        setMessage("Terjadi kesalahan saat mengirim file");
        setMessageType("error");
        setLoading(false);
      });

      xhr.open(method, url);
      xhr.send(formDataToSend);
    } catch (error) {
      console.error("Error submitting form:", error);
      setMessage("Terjadi kesalahan saat menyimpan data");
      setMessageType("error");
      setLoading(false);
    }
  };

  // DELETE LOGIC
  const confirmDelete = (item) => {
    setItemToDelete(item);
    setIsConfirming(true);
  };

  const deleteWisata = async () => {
    if (!itemToDelete) return;
    setLoading(true);

    try {
      const response = await fetch(`${BASE_API_URL}/${itemToDelete.id}`, { method: "DELETE" });
      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || "Wisata berhasil dihapus!");
        setMessageType("success");
        fetchWisatas();
      } else {
        setMessage(`Gagal: ${data.message || "Terjadi kesalahan"}`);
        setMessageType("error");
      }
    } catch (error) {
      console.error("Error deleting wisata:", error);
      setMessage("Terjadi kesalahan saat menghapus data");
      setMessageType("error");
    } finally {
      setIsConfirming(false);
      setItemToDelete(null);
      setLoading(false);
    }
  };

  // --- RENDER ---
  return (
    <div className="p-4 sm:p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen font-sans">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-6 border-b-2 border-gray-200">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">🎨 Manajemen Destinasi AR</h1>
          <p className="text-gray-600 text-sm">Kelola konten AR wisata dengan mudah</p>
        </div>
        <button
          className="flex items-center space-x-2 bg-gradient-to-r from-[#005954] to-[#007066] hover:from-[#004440] hover:to-[#005954] text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition duration-300 transform hover:scale-[1.02] disabled:opacity-50 mt-4 sm:mt-0"
          onClick={openAddModal}
          disabled={loading}
        >
          <FiPlus className="w-5 h-5" />
          <span>Tambah Wisata AR</span>
        </button>
      </div>

      {/* NOTIFIKASI */}
      {message && (
        <div className={`p-4 mb-6 rounded-xl shadow-md font-medium text-sm transition duration-300 animate-in fade-in ${messageType === "error" ? "bg-red-100 text-red-700 border border-red-300" : "bg-green-100 text-green-700 border border-green-300"}`}>
          {messageType === "error" ? "❌" : "✅"} {message}
        </div>
      )}

      {/* TABEL DATA */}
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden ring-1 ring-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Nama Wisata</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Lokasi</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Files</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {loading && wisatas.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-3 h-3 bg-[#005954] rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
                      <div className="w-3 h-3 bg-[#005954] rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                      <div className="w-3 h-3 bg-[#005954] rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                    </div>
                    <p className="text-[#005954] font-semibold mt-3">Memuat data wisata AR...</p>
                  </td>
                </tr>
              ) : wisatas.length > 0 ? (
                wisatas.map((item) => (
                  <tr key={item.id} className="hover:bg-[#C9E4E2] hover:bg-opacity-20 transition duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-[#005954]">#{item.id}</td>
                    <td className="px-6 py-4 text-sm">
                      <div className="font-semibold text-gray-900">{item.name}</div>
                      <div className="text-gray-500 text-xs mt-1 line-clamp-1">{item.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <span>📍</span>
                        <span>{item.location || "-"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex flex-wrap gap-2">
                        {item.marker_image && (
                          <div className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium flex items-center gap-1">
                            <FiImage className="w-3 h-3" /> Marker
                          </div>
                        )}
                        {item.mind_file && (
                          <div className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium flex items-center gap-1">
                            <FiDownload className="w-3 h-3" /> Mind
                          </div>
                        )}
                        {item.glb_model && (
                          <div className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
                            <FiDownload className="w-3 h-3" /> GLB
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-3">
                        <button
                          className="text-[#005954] hover:text-[#003d3a] p-2 rounded-lg hover:bg-[#C9E4E2] hover:bg-opacity-50 transition duration-150 disabled:opacity-50"
                          onClick={() => openEditModal(item)}
                          title="Edit Wisata"
                          disabled={loading}
                        >
                          <FiEdit className="w-5 h-5" />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-100 transition duration-150 disabled:opacity-50"
                          onClick={() => confirmDelete(item)}
                          title="Hapus Wisata"
                          disabled={loading}
                        >
                          <FiTrash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500 text-lg">
                    📭 Tidak ada data wisata AR. Silakan tambah yang baru.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL FORM */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center p-4 z-50 overflow-y-auto" onClick={() => !loading && setShowModal(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden my-8" onClick={(e) => e.stopPropagation()}>
            {/* Header Modal */}
            <div className="p-6 bg-gradient-to-r from-[#005954] to-[#007066]">
              <h2 className="text-2xl font-bold text-white">{editingItem ? "✏️ Edit Wisata AR" : "➕ Tambah Wisata AR Baru"}</h2>
              <p className="text-[#C9E4E2] text-sm mt-1">Kelola informasi dan file AR wisata</p>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {/* Text Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Nama Wisata *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Contoh: Candi Borobudur"
                    className="w-full border-2 border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-[#005954] focus:border-[#005954] transition duration-150"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Deskripsi *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Tuliskan deskripsi singkat tentang wisata ini..."
                    rows="4"
                    className="w-full border-2 border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-[#005954] focus:border-[#005954] transition duration-150 resize-y"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Lokasi *</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Contoh: Magelang, Jawa Tengah"
                    className="w-full border-2 border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-[#005954] focus:border-[#005954] transition duration-150"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* File Upload Section */}
              <div className="border-t-2 border-gray-200 pt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">📁 File AR {!editingItem && "*"}</h3>
                <p className="text-sm text-gray-600 mb-4">
                  {editingItem ? "Upload file baru untuk mengganti (opsional)" : "Semua file wajib diupload"}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {/* Marker Image */}
                  <div className="border-2 border-dashed border-blue-300 rounded-xl p-4 bg-blue-50">
                    <label className="block text-sm font-bold text-blue-900 mb-3">📷 Marker Image</label>
                    <input
                      type="file"
                      name="marker_image"
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                      id="marker_image"
                      disabled={loading}
                    />
                    <label htmlFor="marker_image" className="cursor-pointer">
                      {previewFiles.marker_image ? (
                        <div className="relative">
                          <img src={previewFiles.marker_image} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
                          <div className="absolute top-1 right-1 bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">✓</div>
                        </div>
                      ) : (
                        <div className="w-full h-32 flex items-center justify-center text-blue-500 hover:text-blue-700 transition">
                          <div className="text-center">
                            <FiImage className="w-8 h-8 mx-auto mb-2" />
                            <p className="text-xs">Klik untuk upload</p>
                          </div>
                        </div>
                      )}
                    </label>
                  </div>

                  {/* Mind File */}
                  <div className="border-2 border-dashed border-purple-300 rounded-xl p-4 bg-purple-50">
                    <label className="block text-sm font-bold text-purple-900 mb-3">🧠 Mind File</label>
                    <input
                      type="file"
                      name="mind_file"
                      onChange={handleFileChange}
                      accept=".mind"
                      className="hidden"
                      id="mind_file"
                      disabled={loading}
                    />
                    <label htmlFor="mind_file" className="cursor-pointer">
                      {formData.mind_file ? (
                        <div className="w-full h-32 flex items-center justify-center bg-white rounded-lg border border-purple-300">
                          <div className="text-center">
                            <div className="text-green-500 text-2xl mb-1">✓</div>
                            <p className="text-xs text-purple-700 font-semibold">{formData.mind_file.name}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-32 flex items-center justify-center text-purple-500 hover:text-purple-700 transition">
                          <div className="text-center">
                            <FiDownload className="w-8 h-8 mx-auto mb-2" />
                            <p className="text-xs">Klik untuk upload</p>
                          </div>
                        </div>
                      )}
                    </label>
                  </div>

                  {/* GLB Model */}
                  <div className="border-2 border-dashed border-green-300 rounded-xl p-4 bg-green-50">
                    <label className="block text-sm font-bold text-green-900 mb-3">🎨 GLB Model</label>
                    <input
                      type="file"
                      name="glb_model"
                      onChange={handleFileChange}
                      accept=".glb"
                      className="hidden"
                      id="glb_model"
                      disabled={loading}
                    />
                    <label htmlFor="glb_model" className="cursor-pointer">
                      {formData.glb_model ? (
                        <div className="w-full h-32 flex items-center justify-center bg-white rounded-lg border border-green-300">
                          <div className="text-center">
                            <div className="text-green-500 text-2xl mb-1">✓</div>
                            <p className="text-xs text-green-700 font-semibold">{formData.glb_model.name}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-32 flex items-center justify-center text-green-500 hover:text-green-700 transition">
                          <div className="text-center">
                            <FiDownload className="w-8 h-8 mx-auto mb-2" />
                            <p className="text-xs">Klik untuk upload</p>
                          </div>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="border-t-2 border-gray-200 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">Upload Progress</span>
                    <span className="text-sm font-bold text-[#005954]">{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#005954] to-[#007066] transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="border-t-2 border-gray-200 pt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-6 py-3 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-xl font-semibold transition duration-150 disabled:opacity-50"
                  onClick={() => setShowModal(false)}
                  disabled={loading}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-[#005954] to-[#007066] hover:from-[#004440] hover:to-[#005954] text-white rounded-xl font-semibold transition duration-150 shadow-lg disabled:opacity-50 flex items-center space-x-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>{editingItem ? "Menyimpan..." : "Menambah..."}</span>
                    </>
                  ) : (
                    <>
                      <span>{editingItem ? "✏️ Perbarui" : "✅ Simpan"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS */}
      {isConfirming && itemToDelete && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center p-4 z-50" onClick={() => setIsConfirming(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 space-y-6" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <div className="text-6xl mb-4">🗑️</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Hapus Wisata?</h2>
              <p className="text-gray-600 mb-4">Apakah Anda yakin ingin menghapus <span className="font-semibold text-gray-900">"{itemToDelete.name}"</span> secara permanen?</p>
              <p className="text-sm text-red-600 font-medium">⚠️ Aksi ini tidak dapat dibatalkan</p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-xl font-medium disabled:opacity-50"
                onClick={() => setIsConfirming(false)}
                disabled={loading}
              >
                Batal
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-xl font-medium shadow-lg disabled:opacity-50 flex items-center space-x-2"
                onClick={deleteWisata}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <>
                    <span>🗑️ Hapus</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentPage;