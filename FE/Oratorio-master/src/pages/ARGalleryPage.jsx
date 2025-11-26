import React, { useState, useEffect } from 'react'; // Import React hooks
import { Link } from 'react-router-dom';            // Import Link untuk navigasi
import axios from 'axios';                          // Import axios untuk request API

// ... kode komponen ARGalleryPage Anda di bawah sini ...
const ARGalleryPage = () => {

  const [items, setItems] = useState([]);

  useEffect(() => {
    axios.get('http://192.168.110.4:5000/api/wisata')
      .then(response => {
          console.log("Data dari API:", response.data); // Cek console browser untuk debug
          setItems(response.data);
      })
      .catch(error => console.error("Error fetching data:", error));
  }, []);

  return (
    <div className="gallery-container">
      <h1>Galeri AR Torio</h1>
      <div className="grid">
        {items.map((item) => (
          <div key={item.id} className="card-item">
            {/* PERHATIKAN NAMA KOLOM INI: item.marker_image */}
            <img 
              src={`http://192.168.110.4:5000/static/uploads/${item.marker_image}`} 
              alt={item.name} 
              className="thumbnail"
              onError={(e) => { e.target.src = "https://via.placeholder.com/150"; }} // Fallback jika gambar error
            />
            <h3>{item.name}</h3>
            <p>{item.location}</p>
            
            <Link to={`/ar/${item.id}`} className="btn-detail">
              Lihat Detail
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ARGalleryPage;