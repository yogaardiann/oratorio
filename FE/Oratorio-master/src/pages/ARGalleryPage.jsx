import React from 'react';
import { Link } from 'react-router-dom';
import './ARGalleryPage.css'; // We'll create this CSS file next
import Footer from '../components/all-page/footer-page/footer';
import { destinations } from '../data/destinations'; // Import your central data source

// Import necessary components if they are separate
// import Header from '../components/all-page/header-page/header'; 
// import Footer from '../components/all-page/footer-page/footer';

const ArGalleryPage = () => {
    // Convert the destinations object into an array to easily map over it
    const allDestinations = Object.values(destinations);

    return (
        <div>
            {/* <Header /> */}
            <main className="gallery-page-container">
                <div className="gallery-header">
                    <h1>AR Interfaces Gallery</h1>
                    <p>Discover historical sites and artifacts in Augmented Reality. Click on any destination to begin your adventure.</p>
                </div>
                <div className="gallery-grid">
                    {allDestinations.map((item) => (
                        <Link to={`/ar/${item.id}`} key={item.id} className="gallery-card-link">
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

export default ArGalleryPage;