import React from "react";
import { Link } from 'react-router-dom';
import "./ar-torio-section.css";

// Import gambar destinasi
import imgGWK from '../../assets/images/gwk.jpg';
import imgJamGadang from "../../assets/images/fav-dest-section-jam-gadang.jpg";
import imgSurabaya from '../../assets/images/surabaya.jpg';
import imgMonas from '../../assets/images/monas.jpg';

function ARTorioSection() {
  const destinations = [
    { id: 1, image: imgGWK, title: "Patung Garuda Wisnu Kencana", location: "Badung, Bali" },
    { id: 2, image: imgJamGadang, title: "Jam Gadang", location: "Bukittinggi, Sumatra Barat" },
    { id: 3, image: imgSurabaya, title: "Patung Sura & Baya", location: "Surabaya, Jawa Timur" },
    { id: 4, image: imgMonas, title: "Monumen Nasional", location: "Jakarta, DKI Jakarta" },
  ];

  return (
    <section className="ar-torio-section">
      <div className="section-header">
        <div className="line"></div>
        <h2 className="section-title">AR TORIO</h2>
        <div className="line"></div>
      </div>

      {/* Kontainer kartu yang diarahkan ke ArGalleryPage (/ar) */}
      <div className="ar-card-container">
        {destinations.map((item) => (
          <Link to="/ar" key={item.id} className="ar-card-link">
            <div className="ar-card">
              <img src={item.image} alt={item.title} className="ar-image" />
              <div className="ar-card-content">
                <p className="ar-location">📍 {item.title}, {item.location}</p>
              </div>
            </div>
          </Link>
        ))}
        
        {/* Navigasi panah juga diarahkan ke galeri utama */}
        <Link to="/ar" className="arrow-button" style={{ textDecoration: 'none' }}>
        </Link>
      </div>
    </section>
  );
}

export default ARTorioSection;