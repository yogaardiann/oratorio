import React from 'react';
import { Link } from 'react-router-dom';
import './VRGalleryPage.css'; // Kita bisa menggunakan CSS yang sama jika tampilannya identik
import Footer from '../components/all-page/footer-page/footer';
import { destinations } from '../data/destinations'; // Impor data terpusat Anda

const VrGalleryPage = () => {
    // Ubah objek destinasi menjadi array agar mudah di-map
    const allDestinations = Object.values(destinations);

    return (
        <div>
            {/* <Header /> */}
            <main className="gallery-page-container">
                <div className="gallery-header">
                    <h1>VR Interfaces Gallery</h1>
                    <p>Masuki dunia virtual dan jelajahi situs bersejarah seolah-olah Anda benar-benar berada di sana dalam lingkungan 360°.</p>
                </div>
                <div className="gallery-grid">
                    {allDestinations.map((item) => (
                        // Pastikan link mengarah ke rute /vr/
                        <Link to={`/vr/${item.id}`} key={item.id} className="gallery-card-link">
                            <div className="gallery-card">
                                <img src={item.thumbnail} alt={item.name} className="gallery-card-image" />
                                <div className="gallery-card-content">
                                    <h3>{item.name}</h3>
                                    <p>📍 {item.location}</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </main>
            {/* <Footer /> */}
            <div>
                <Footer />
            </div>
        </div>
    );
};

export default VrGalleryPage;