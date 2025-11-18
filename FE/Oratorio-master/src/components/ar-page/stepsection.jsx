import React from 'react';
import './stepsection.css'; // Sesuaikan path CSS Anda

// Komponen sekarang menerima 'data' sebagai props
const StepsSection = ({ data }) => {
    return (
        <section className="steps-container">
            <div className="content-wrapper">
                <div className="steps-grid">
                    <div className="step-card">
                        <h3>1. Unduh atau Siapkan QR Code</h3>
                        {/* Tampilkan QR Code spesifik dari data */}
                        <img src={data.ar.qrCode} alt={`QR Code for ${data.name}`} className="qr-code-image" />
                    </div>
                    <div className="step-card">
                        <h3>2. Buka Kamera AR di Perangkat Anda</h3>
                        <p>Akses fitur kamera AR di perangkat Anda yang mendukung WebXR.</p>
                    </div>
                    <div className="step-card">
                        <h3>3. Pindai QR & Nikmati Pengalamannya</h3>
                        <p>Arahkan kamera ke gambar QR Code dan saksikan keajaiban {data.name} muncul di hadapan Anda!</p>
                    </div>
                </div>
                {/* ... (bagian tips & tombol lainnya) ... */}
                <button className="mulai-ar-button">Mulai Pindai AR</button>
            </div>
        </section>
    );
};

export default StepsSection;