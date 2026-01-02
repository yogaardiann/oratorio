import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import navigasi
import './searchbar.css';

const SearchIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

function ResponsiveSearchBar() {
  const [destination, setDestination] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    // Navigasi ke /ar dengan parameter query 'search'
    if (destination.trim()) {
      navigate(`/ar?search=${encodeURIComponent(destination)}`);
    } else {
      navigate('/ar');
    }
  };

  return (
    <form className="responsive-search-bar" onSubmit={handleSubmit}>
      
      {/* --- Tampilan Mobile --- */}
      <div className="mobile-view">
        <SearchIcon className="search-icon-mobile" />
        <input
          type="text"
          placeholder="Cari destinasi atau aktivitas..."
          className="search-input-mobile"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
        />
      </div>

      {/* --- Tampilan Desktop --- */}
      <div className="desktop-view">
        <div className="search-section">
          <label>Ingin Kemana?</label>
          <input
            type="text"
            placeholder="Cari Tempat dan Rasakan Sensasinya"
            className="search-input-desktop"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          />
        </div>
        <div className="search-divider"></div>
        <button type="submit" className="search-button-desktop">
          <SearchIcon className="search-icon-desktop" />
        </button>
      </div>
      
    </form>
  );
}

export default ResponsiveSearchBar;