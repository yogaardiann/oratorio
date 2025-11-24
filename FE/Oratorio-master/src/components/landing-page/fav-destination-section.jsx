import React, { useEffect, useState } from 'react'; // Tambahkan useState dan useEffect
import DestinationCard from './destination-section';
import './fav-destination-section.css';
// import useScrollAnimation from '../../animations/useScrollAnimation'; // Asumsi hook ini tidak bermasalah
// Impor gambar statis dihilangkan karena kita akan menggunakan URL dari DB

// URL API dan Kategori. Kategori FAVORIT dikirim sebagai parameter query.
const API_URL = "http://localhost:5000/api/destinations?category=FAVORIT"; 

function FavoriteDestinationsSection() {
// State untuk menyimpan data dinamis dari Backend
const [destinations, setDestinations] = useState([]);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState(null);

// const sectionRef = useScrollAnimation(); // Asumsi ini digunakan untuk animasi

// Lakukan Fetching data dari Backend
useEffect(() => {
const fetchFavorites = async () => {
 try {
const response = await fetch(API_URL);
if (!response.ok) {
const errorData = await response.json().catch(() => ({ message: 'Gagal mengambil data dari server.' }));
          throw new Error(errorData.message || 'Gagal mengambil data favorit.');
} 
const data = await response.json();
setDestinations(data);
} catch (err) {
console.error("Fetch error:", err.message);
setError("Gagal memuat destinasi favorit. Silakan cek koneksi server.");
finally {
setIsLoading(false);
}
};

fetchFavorites();
}, []); // Hanya berjalan sekali saat komponen di-mount

// Tampilkan Status Loading
if (isLoading) {
return (
<section className="fav-destinations-section">
<h2 className="section-title">Destinasi Favorit</h2>
<pV className="loading-message">Memuat destinasi...</p>
</section>
);
}

// Tampilkan Error
) {
return (
<section className="fav-destinations-section">
<h2 className="section-title">Destinasi Favorit</h2>
<p className="error-message">{error}</p>
</section>
);
}
    
// Render data dinamis
return (
{/* Menghilangkan 'ref={sectionRef}' sementara karena hook tidak didefinisikan */}
<section className="fav-destinations-section">
 <div className="section-container">
<h2 className="section-title animate-on-scroll">Destinasi Favorit</h2>
{destinations.length === 0 ? (
            <p className="no-data-message">Belum ada destinasi favorit yang ditambahkan.</p>
        ) : (
<div className="destinations-grid">
{destinations.map((destination, index) => (
{/* Pastikan key unik dan kelas animasi tetap ada */}
<div key={destination.destination_id} className={`animate-on-scroll stagger-${index + 1}`}>
 <DestinationCard
 name={destination.destination_name} // Menggunakan nama dari DB
 imageSrc={destination.image_url} // Menggunakan URL dari DB
 />
 </div>
 ))}
<iv>
      
    </div>
</section>
);
}

export default FavoriteDestinationsSection;