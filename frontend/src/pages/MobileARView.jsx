// src/pages/MobileARView.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const NGROK_URL = "https://arcelia-unpronounceable-decretively.ngrok-free.dev";

const MobileARView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [scriptsLoaded, setScriptsLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isStarted, setIsStarted] = useState(false);
  const audioRef = useRef(null);
  const [showSubtitle, setShowSubtitle] = useState(false);

  useEffect(() => {
    axios.get(`${NGROK_URL}/api/wisata/${id}`)
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    const loadScripts = async () => {
      const injectScript = (src) => {
        return new Promise((resolve, reject) => { // Tambahkan reject untuk handle gagal muat
            if (document.querySelector(`script[src="${src}"]`)) {
              resolve();
              return;
            }
            const script = document.createElement('script');
            script.src = src;
            script.async = false;
            script.crossOrigin = "anonymous"; // TAMBAHKAN INI 🎯
            script.onload = () => resolve();
            script.onerror = () => reject(new Error(`Gagal memuat script: ${src}`));
            document.head.appendChild(script);
          });
        };

    try {
        // Muat A-Frame dulu
        await injectScript("https://aframe.io/releases/1.5.0/aframe.min.js");
        
        // 🎯 VALIDASI: Tunggu sampai window.AFRAME benar-benar terdeteksi
        let retry = 0;
        while (!window.AFRAME && retry < 50) {
          await new Promise(r => setTimeout(r, 100));
          retry++;
        }

        // Baru muat MindAR
        await injectScript("https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-aframe.prod.js");
        
        console.log("✅ Engine AR Siap");
        setScriptsLoaded(true);
      } catch (err) {
        console.error("❌ Error loading scripts:", err);
      }
    };

    loadScripts();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, [id]);

  // 🎯 LOGIKA SINKRONISASI AUDIO & MARKER
  useEffect(() => {
    if (scriptsLoaded && data && isStarted) {
      const targetEl = document.querySelector('[mindar-image-target]');
      if (!targetEl) return;
      
      const onTargetFound = () => {
        setShowSubtitle(true);
        console.log("🎯 Marker Found: Play Audio");
        if (audioRef.current) {
          audioRef.current.currentTime = 0; // Ulang dari awal
          audioRef.current.play().catch(e => console.log("Audio play blocked", e));
        }
      };

      const onTargetLost = () => {
        setShowSubtitle(false);
        console.log("❌ Marker Lost: Pause Audio");
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
      };

      targetEl.addEventListener('targetFound', onTargetFound);
      targetEl.addEventListener('targetLost', onTargetLost);

      return () => {
        targetEl.removeEventListener('targetFound', onTargetFound);
        targetEl.removeEventListener('targetLost', onTargetLost);
      };
    }
  }, [scriptsLoaded, data, isStarted]);

  const handleStart = () => {
    // 🔓 Buka kunci audio browser
    if (audioRef.current) {
      audioRef.current.play().then(() => {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      });
    }
    setIsStarted(true);
  };

  if (loading || !scriptsLoaded || !data) {
    return (
      <div style={{
        background: 'black',
        height: '100vh',
        color: 'white',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <h3>Menyiapkan Engine AR...</h3>
      </div>
    );
  }

  const mindFile = `${NGROK_URL}/static/uploads/${data.mind_file}`;
  const modelFile = `${NGROK_URL}/static/uploads/${data.glb_model}`;
  const audioFile = `${NGROK_URL}/static/uploads/${data.audio_file}`;

  // 🔒 ZOOM AMAN VIA SCALE
  const scaleModel = (factor) => {
    const model = document.querySelector('a-gltf-model');
    if (!model) return;

    const s = model.getAttribute('scale');
    const clamp = (v) => Math.min(Math.max(v, 0.3), 1.2);

    model.setAttribute('scale', {
      x: clamp(s.x * factor),
      y: clamp(s.y * factor),
      z: clamp(s.z * factor),
    });
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'black',
      zIndex: 9999
    }}>

      {/* 1. OVERLAY START (Agar Audio Bisa Autoplay) */}
      {!isStarted && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 20000, background: '#0f172a',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white'
        }}>
          <h1 style={{ color: '#2dd4bf', fontSize: '24px', fontWeight: 'bold' }}>{data.name}</h1>
          <p style={{ color: '#94a3b8', marginBottom: '30px' }}>Siapkan kamera untuk melihat AR</p>
          
          {/* 🎯 BUTTON YANG SUDAH DIPERBAIKI TULISANNYA KE TENGAH */}
          <button 
            onClick={handleStart}
            style={{ 
              background: '#0d9488', 
              color: 'white', 
              width: '80px',          // Menggunakan lebar tetap agar bulat sempurna
              height: '80px',         // Menggunakan tinggi tetap
              borderRadius: '50%',    // Membuat button bulat
              border: 'none', 
              fontWeight: 'bold', 
              cursor: 'pointer',
              boxShadow: '0 0 20px rgba(45,212,191,0.4)',
              display: 'flex',        // Aktifkan flexbox
              alignItems: 'center',    // Rata tengah vertikal
              justifyContent: 'center',// Rata tengah horizontal
              fontSize: '20px',        // Ukuran font yang pas
              padding: 0              // Hapus padding bawaan agar tidak geser
            }}
          >
            AR
          </button>
        </div>
      )}

      {/* 2. PANEL SUBTITLE: Muncul di bawah saat marker terdeteksi */}
      {showSubtitle && (
        <div style={{
          position: 'fixed',
          top: '100px', // 🎯 Dipindah ke atas (di bawah tombol kembali)
          left: '50%',
          transform: 'translateX(-50%)',
          width: '85%',
          backgroundColor: 'rgba(15, 23, 42, 0.8)', 
          padding: '12px 15px',
          borderRadius: '16px',
          border: '1px solid rgba(45, 212, 191, 0.4)',
          color: 'white',
          textAlign: 'center',
          backdropFilter: 'blur(8px)',
          zIndex: 10002,
          fontSize: '14px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
          animation: 'fadeInDown 0.5s ease-out' // Animasi ganti jadi "Down" agar lebih natural
        }}>
          <strong style={{ color: '#2dd4bf', display: 'block', fontSize: '16px' }}>
            {data.name}
          </strong>
        </div>
      )}

      {/* 3. AUDIO ELEMENT */}
      <audio 
        ref={audioRef} 
        src={audioFile} 
        preload="auto" 
        />

      {/* 4. ZOOM BUTTONS */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 10001,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
    <button 
          onClick={() => scaleModel(1.1)}
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '14px', // Kotak membulat (modern)
            background: 'rgba(45, 212, 191, 0.8)', // Warna Teal khas Oratorio
            color: 'white',
            border: '1px solid rgba(255,255,255,0.2)',
            fontSize: '24px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
            cursor: 'pointer'
          }}
          aria-label="Perbesar"
        >
          ＋
        </button>

        {/* Tombol Zoom Out */}
        <button 
          onClick={() => scaleModel(0.9)}
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '14px',
            background: 'rgba(15, 23, 42, 0.7)', // Warna Slate gelap
            color: 'white',
            border: '1px solid rgba(255,255,255,0.2)',
            fontSize: '24px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
            cursor: 'pointer'
          }}
          aria-label="Perkecil"
        >
          －
        </button>
      </div>

      {/* 5. AFRAME SCENE */}
      <button 
        onClick={() => {
          if (window.history.length > 1) {
            navigate(-1); // Opsi 2: Kembali ke Mobile AR Gallery
          } else {
            window.location.href = "https://www.google.com";
          }
        }} 
        style={{ 
          position: 'fixed', 
          top: '25px', 
          left: '16px', 
          zIndex: 10001, 
          background: 'rgba(0,0,0,0.6)', 
          color: 'white', 
          borderRadius: '50%', 
          width: '44px', 
          height: '44px', 
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          backdropFilter: 'blur(6px)',
          cursor: 'pointer'
        }}
      >
        ←
      </button>
      
      <a-scene
        key={data.id}
        mindar-image={`imageTargetSrc: ${mindFile}; autoStart: true; uiLoading: no; filterMinCF:0.0001; filterBetaCF:0.001;`}
        embedded
        color-space="sRGB"
        renderer="colorManagement: true, physicallyCorrectLights"
        vr-mode-ui="enabled: false"
        device-orientation-permission-ui="enabled: false"
        style={{ width: "100%", height: "100%" }}
      >
        <a-assets>
          <a-asset-item id="model" src={modelFile}></a-asset-item>
        </a-assets>

        <a-camera position="0 0 0" look-controls="enabled: false"></a-camera>

        <a-entity mindar-image-target="targetIndex: 0">
          <a-gltf-model
            src="#model"
                position="0 0 0"
                rotation="0 0 0"
                /* 🎯 ANIMASI POP-UP: Skala 0 ke 0.5 saat marker ditemukan */
                animation__scale="property: scale; from: 0 0 0; to: 0.5 0.5 0.5; dur: 1200; easing: easeOutElastic; startEvents: targetFound"
                /* Animasi putar tetap dipertahankan */
                animation__rotation="property: rotation; to: 0 360 0; loop: true; dur: 15000; easing: linear"
            />
        </a-entity>
      </a-scene>

      {/* 6. FORCE CAMERA LAYER */}
      <style>{`
        body { margin: 0; overflow: hidden; background: black !important; }
        video {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          object-fit: cover !important;
          z-index: -1 !important;
        }
        .mindar-ui-overlay { z-index: 500; }
        canvas { width: 100vw !important; height: 100vh !important; }

        button {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          border: none;
          background: rgba(0,0,0,0.6);
          color: white;
          font-size: 28px;
          font-weight: bold;
        }
      `}</style>

    </div>
  );
};

export default MobileARView;