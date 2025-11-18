import React from "react";
import { Link } from 'react-router-dom'; // Impor Link
import "./ar-torio-section.css";

// (Import gambar Anda tetap sama)
import imgBorobudur from "../../assets/images/fav-dest-section-candi-borobudur.jpg";
import imgMonas from "../../assets/images/fav-dest-section-tugu-monas.jpg";
import imgTugu from "../../assets/images/fav-dest-section-tugu-jogja.jpg";
import imgJamGadang from "../../assets/images/fav-dest-section-jam-gadang.jpg";

// Ganti nama komponen agar unik
function VRTorioSection() { 
  const destinations = [
    {
      slug: 'candi-borobudur', // Tambahkan slug
      image: imgBorobudur,
      title: "Candi Borobudur",
      location: "Magelang, Jawa Tengah",
    },
    {
      slug: 'monumen-nasional', // Tambahkan slug
      image: imgMonas,
      title: "Monumen Nasional",
      location: "Jakarta, DKI Jakarta",
    },
    {
      slug: 'tugu-jogja', // Tambahkan slug
      image: imgTugu,
      title: "Tugu Jogjakarya",
      location: "D.I.Yogyakarta",
    },
    {
      slug: 'jam-gadang', // Tambahkan slug
      image: imgJamGadang,
      title: "Jam Gadang",
      location: "Bukit Tinggi, Sumatera",
    },
        // ...tambahkan destinasi lain dengan slug
  ];

  return (
        <section className="ar-torio-section">
      <div className="section-header">
        <div className="line"></div>
        <h2 className="section-title">VR TORIO</h2>
        <div className="line"></div>
      </div>
      <div className="ar-card-container">
        {destinations.map((item) => (
          // Ubah link 'to' ke /vr/
          <Link to={`/vr/${item.slug}`} key={item.slug} className="ar-card-link">
            <div className="ar-card">
              <img src={item.image} alt={item.title} className="ar-image" />
              <div className="ar-card-content">
                <p className="ar-location">📍 {item.title}, {item.location}</p>
              </div>
            </div>
          </Link>
        ))}
        <div className="arrow-button">›</div>
      </div>
    </section>
  );
}

export default VRTorioSection; // Ganti nama export