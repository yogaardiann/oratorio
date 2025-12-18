import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './herosection.css'; // Pastikan path CSS ini benar

// 1. Impor gambar spesifik untuk slide kedua
// Saya menggunakan placeholder dari Unsplash yang mirip dengan desain Anda.
// Ganti dengan path lokal Anda jika sudah punya gambarnya.
const arSlideImage = 'https://images.unsplash.com/photo-1639762681057-408e52192e50?q=80&w=1974&auto=format&fit=crop';

const HeroSection = ({ data }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const navigate = useNavigate();

    const slides = [
        {
            type: 'text',
            title: `${data.name} - Augmented Reality`,
            subtitle: "Ikuti tutorial di bawah untuk memulai petualangan AR Anda!",
        },
        {
            type: 'image',
            // 2. Gunakan gambar yang sudah diimpor, bukan data.thumbnail
            image: arSlideImage, 
            caption: `Unduh QR`,
        },
    ];

    const nextSlide = () => setCurrentSlide(currentSlide === 1 ? 0 : 1);
    const prevSlide = () => setCurrentSlide(currentSlide === 0 ? 1 : 0);

    const handleBack = () => {
        navigate('/dashboard');
    };

    return (
        <section className="hero-slider">
            <button className="back-button" onClick={handleBack}>Kembali</button>

            <div className="arrow left-arrow" onClick={prevSlide}>&#10094;</div>
            <div className="arrow right-arrow" onClick={nextSlide}>&#10095;</div>

            <div className="slide-container">
                {slides.map((slide, index) => (
                    <div key={index} className={index === currentSlide ? 'slide active' : 'slide'}>
                        {slide.type === 'text' && (
                            <div className="text-content">
                                <h1>{slide.title}</h1>
                                <p>{slide.subtitle}</p>
                            </div>
                        )}
                        {slide.type === 'image' && (
                            <div className="image-content">
                                <img src={slide.image} alt={`Tampilan AR ${data.name}`} className="slide-image-inner" />
                                <span>{slide.caption}</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
};

export default HeroSection;