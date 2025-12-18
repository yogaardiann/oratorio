import React, { useState, useEffect } from 'react';
import './stepsectionvr.css';

import metaQuestImage from '../../assets/images/meta-quest.webp';
import oculusQuestImage from '../../assets/images/oculus.webp';

// 1. Terima 'data' sebagai props dari VrPage
const VrStepsSection = ({ data }) => {
    const [selectedMode, setSelectedMode] = useState(null);
    const [isVrSupported, setIsVrSupported] = useState(false);

    useEffect(() => {
        if (navigator.xr && navigator.xr.isSessionSupported('immersive-vr')) {
            navigator.xr.isSessionSupported('immersive-vr').then((supported) => {
                setIsVrSupported(supported);
            });
        }
    }, []);

    const handleStartVR = () => {
        if (!selectedMode) {
            alert("Silakan pilih mode tampilan terlebih dahulu!");
            return;
        }

        // Di sini, kita bisa menggunakan 'data.vr.scene' di masa depan
        if (selectedMode === '360 View') {
            alert(`Mengarahkan ke halaman 360 View untuk ${data.name}...`);
            // Contoh: window.location.href = data.vr.scene;
        }

        if (selectedMode === 'VR Imersif') {
            if (isVrSupported) {
                alert(`Memulai Sesi WebXR Imersif untuk ${data.name}...`);
                // Di sini Anda akan memulai sesi WebXR dengan scene dari 'data.vr.scene'
            } else {
                alert("Mode VR Imersif hanya dapat diakses melalui browser di dalam headset VR.");
            }
        }
    };

    return (
        <section className="vr-steps-container">
            <div className="content-wrapper">
                {/* 2. Gunakan 'data.name' untuk membuat judul lebih spesifik */}
                <h2 className="section-title">Panduan Memulai VR untuk {data.name}</h2>
                
                <div className="mode-selection-grid">
                    <div
                        className={`mode-card ${selectedMode === '360 View' ? 'selected' : ''}`}
                        onClick={() => setSelectedMode('360 View')}
                    >
                        <h3>Mode Tampilan 360° Web View</h3>
                        <p>
                            Cara termudah merasakan {data.name}, seperti melihat melalui jendela ajaib. Anda akan menjadi seorang pengamat (observer).
                        </p>
                        <ol className="steps-list">
                            <li>Klik untuk memilih mode ini.</li>
                            <li>Tekan tombol "Mulai VR TORIO".</li>
                            <li>Gunakan mouse atau geser layar untuk melihat sekeliling.</li>
                        </ol>
                    </div>

                    <div
                        className={`mode-card ${selectedMode === 'VR Imersif' ? 'selected' : ''}`}
                        onClick={() => setSelectedMode('VR Imersif')}
                    >
                        <h3>Mode VR Imersif</h3>
                        <p>
                            Pengalaman VR sesungguhnya di mana Anda "masuk" ke dalam {data.name}. Rasakan sensasi kehadiran dan skala ruang yang realistis.
                        </p>
                        <ol className="steps-list">
                            <li>Buka situs ini dari Browser di dalam Headset VR Anda.</li>
                            <li>Pilih mode ini & tekan "Mulai VR TORIO".</li>
                            <li>Pilih **"Enter VR"** saat browser meminta izin.</li>
                        </ol>
                    </div>
                </div>

                <h2 className="section-title">Rekomendasi Perangkat</h2>
                <div className="device-recommendation-grid">
                    <div className="device-card">
                        <img src={metaQuestImage} alt="Meta Quest 2 Headset" />
                    </div>
                    <div className="device-card">
                        <img src={oculusQuestImage} alt="Oculus Quest 2 Headset and controllers" />
                    </div>
                </div>
                <p className="device-info">Untuk pengalaman imersif terbaik, kami merekomendasikan headset VR standalone seperti Meta Quest 2.</p>

                <button className="mulai-vr-button" onClick={handleStartVR}>
                    MULAI VR TORIO
                </button>
            </div>
        </section>
    );
};

export default VrStepsSection;