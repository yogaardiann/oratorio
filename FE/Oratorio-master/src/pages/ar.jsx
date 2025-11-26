import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const ArDetailGuidancePage = () => {
  const { id } = useParams(); // Ambil ID dari URL
  const [data, setData] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/wisata/${id}`)
      .then(res => setData(res.data))
      .catch(err => console.error(err));
  }, [id]);

  if (!data) return <p>Loading...</p>;

  return (
    <div className="guidance-page">
      <h1>Panduan AR: {data.name}</h1>
      <p>{data.description}</p>
      
      <div className="steps">
        <p>1. Klik tombol "Mulai AR Torio" di bawah.</p>
        <p>2. Arahkan kamera HP Anda ke QR Code yang muncul.</p>
        <p>3. Izinkan akses kamera pada HP.</p>
        <p>4. Arahkan kamera HP ke gambar Marker di layar laptop.</p>
      </div>

      {/* Tombol Lanjut ke Halaman Scan Desktop */}
      <Link to={`/scan/${id}`} className="btn-start-ar">
        Mulai AR Torio
      </Link>
    </div>
  );
};

export default ArDetailGuidancePage;