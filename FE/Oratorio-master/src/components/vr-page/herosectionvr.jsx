import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './herosectionvr.css';

// 1. Terima 'data' sebagai props dari komponen induk (VrPage)
const VrHeroSection = ({ data }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const navigate = useNavigate();

    // 2. Buat konten slide menjadi dinamis menggunakan 'data'
    const slides = [
        {
            type: 'text',
            // Gunakan nama destinasi dari 'data'
            title: `${data.name} - Virtual Reality`, 
            subtitle: `Pilih cara Anda menjelajahi ${data.name} dan ikuti tutorialnya untuk pengalaman terbaik!`,
        },
        {
            type: 'image',
            // Gunakan gambar thumbnail dari 'data'
            image: data.thumbnail, 
            caption: `Tampilan 360° untuk ${data.name}`,
        },
    ];

    const nextSlide = () => setCurrentSlide(currentSlide === 1 ? 0 : 1);
    const prevSlide = () => setCurrentSlide(currentSlide === 0 ? 1 : 0);

    const handleBack = () => {
        navigate('/dashboard'); // Arahkan kembali ke dashboard
    };

    // Struktur JSX di bawah ini tidak diubah, hanya kontennya yang menjadi dinamis
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
                                <img src={slide.image} alt={`Tampilan ${data.name}`} className="slide-image-inner" />
                                <span>{slide.caption}</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
};

export default VrHeroSection;