import React from 'react';
import FeatureCard from './feature-card';
import './why-oratorio-section.css';
import useScrollAnimation from '../../animations/useScrollAnimation';

const featuresData = [
  {
    title: "Akses Instan",
    description: "Tanpa Perlu Instalasi: Nikmati Pengalaman AR & VR Langsung dari Peramban Anda."
  },
  {
    title: "Imersif & Interaktif",
    description: "Lebih dari Sekadar Gambar, Berinteraksi Langsung Dengan Destinasi dan Lingkungan 3D."
  }
];

function FeaturesSection() {
  // 1. Panggil custom hook untuk mendapatkan ref
  const sectionRef = useScrollAnimation();

  return (
    // 2. Pasang ref ke elemen section utama
    <section ref={sectionRef} className="features-section">
      <div className="section-container">
        <h2 className="section-title animate-on-scroll">Mengapa Harus Oratorio?</h2>
        <div className="features-flex">
          {featuresData.map((feature, index) => (
            // 3. Tambahkan class 'animate-on-scroll' ke elemen yang ingin dianimasikan
            <div key={index} className="animate-on-scroll">
              <FeatureCard
                title={feature.title}
                description={feature.description}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// 4. Hapus fungsi 'YourSectionComponent' karena sudah digabungkan ke 'FeaturesSection'
export default FeaturesSection;