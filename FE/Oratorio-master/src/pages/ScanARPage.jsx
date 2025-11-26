import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react'; 
import axios from 'axios';

// --- KONFIGURASI PENTING ---
// SUDAH DIUPDATE SESUAI IPCONFIG ANDA
const LAPTOP_IP = "192.168.110.4"; 
const BACKEND_PORT = "5000";
const FRONTEND_PORT = "3000";

const ScanARPage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  // URL API Localhost (Untuk Fetch Data di Laptop agar cepat)
  const LOCAL_API_URL = `http://localhost:${BACKEND_PORT}`;
  
  // URL API Public (Untuk Gambar Marker agar sesuai dengan data database)
  // Kita gunakan localhost juga untuk tampilan laptop agar gambar pasti muncul
  const IMAGE_BASE_URL = `http://localhost:${BACKEND_PORT}`;

  // URL QR Code (Wajib IP Address agar HP bisa akses)
  const PUBLIC_QR_URL = `http://${LAPTOP_IP}:${FRONTEND_PORT}/mobile-ar/${id}`;

  useEffect(() => {
    // Fetch data menggunakan Localhost
    axios.get(`${LOCAL_API_URL}/api/wisata/${id}`)
      .then(res => {
        console.log("Data sukses diambil:", res.data);
        setData(res.data);
      })
      .catch(err => {
        console.error("Gagal ambil data:", err);
        setError("Gagal mengambil data. Pastikan backend Flask berjalan.");
      });
  }, [id, LOCAL_API_URL]);

  if (error) return <div style={{textAlign: 'center', marginTop: '50px', color: 'red'}}>{error}</div>;
  if (!data) return <div style={{textAlign: 'center', marginTop: '50px'}}>Loading Data...</div>;

  return (
    <div className="scan-layout" style={{ display: 'flex', height: '100vh', fontFamily: 'Arial, sans-serif' }}>
      
      {/* Sisi Kiri: Marker */}
      <div className="left-panel" style={{ flex: 1, background: '#f0f0f0', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', borderRight: '2px solid #ddd' }}>
        <h2 style={{marginBottom: '10px'}}>Marker Area</h2>
        <p style={{marginBottom: '20px', color: '#666'}}>Arahkan kamera HP ke gambar ini</p>
        
        {/* Gambar Marker */}
        <img 
          src={`${IMAGE_BASE_URL}/static/uploads/${data.marker_image}`} 
          alt="AR Marker" 
          style={{ width: '80%', maxWidth: '400px', border: '5px solid #333', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}
          onError={(e) => {
            e.target.onerror = null; 
            // Fallback teks sederhana jika gambar gagal (tanpa internet)
            e.target.style.display = 'none';
            e.target.parentNode.innerHTML += `<div style="width:300px; height:300px; background:#ccc; display:flex; align-items:center; justify-content:center; border:2px dashed #666;">Gambar ${data.marker_image} Tidak Ditemukan</div>`;
          }}
        />
        <p style={{marginTop: '10px', fontSize: '12px', color: '#999'}}>
            File: {data.marker_image}
        </p>
      </div>

      {/* Sisi Kanan: QR Code */}
      <div className="right-panel" style={{ flex: 1, background: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
        <h2 style={{marginBottom: '10px'}}>Scan QR Code</h2>
        <p style={{marginBottom: '30px', color: '#666'}}>Gunakan Google Lens atau Kamera Bawaan</p>
        
        {/* QR Code dengan Link IP Address */}
        <div style={{padding: '20px', background: 'white', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)'}}>
            <QRCodeCanvas value={PUBLIC_QR_URL} size={256} />
        </div>
        
        <p style={{marginTop: '30px', textAlign: 'center'}}>
          Atau buka link ini di HP:<br/> 
          <a href={PUBLIC_QR_URL} target="_blank" rel="noreferrer" style={{color: 'blue', textDecoration: 'none', fontWeight: 'bold'}}>
            {PUBLIC_QR_URL}
          </a>
        </p>
        
        <div style={{marginTop: '20px', fontSize: '12px', color: '#555', background: '#eef', padding: '10px', borderRadius: '5px'}}>
            IP Config: <b>{LAPTOP_IP}</b>
        </div>
      </div>

    </div>
  );
};

export default ScanARPage;