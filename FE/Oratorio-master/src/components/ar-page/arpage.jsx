import React, { useState, useEffect, useRef } from 'react';
import { QrCode, Camera, Sparkles, Lightbulb, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; 

console.log("STEPSSECTIONS BARU DIPAKAI!");

const StepsSections = ({ data = { name: 'Candi Borobudur', ar: { qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=example' } } }) => {
    const [visibleCards, setVisibleCards] = useState([]);
    const sectionRef = useRef(null);
    const navigate = useNavigate(); // Tambahkan hook ini

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setVisibleCards([0, 1, 2]);
                    }
                });
            },
            { threshold: 0.1 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => observer.disconnect();
    }, []);

    const steps = [
        {
            icon: QrCode,
            title: 'Klik Mulai Pindai AR',
            description: 'pindai QR dan objek langsung dari kamera Anda',
            hasQR: false,
        },
        {
            icon: Camera,
            title: 'Buka Kamera AR di Perangkat Anda',
            description: 'Akses fitur kamera AR di perangkat Anda yang mendukung WebXR',
            hasQR: false,
        },
        {
            icon: Sparkles,
            title: 'Pindai QR & Nikmati Pengalamannya',
            description: `Arahkan kamera ke QR Code dan saksikan keajaiban ${data.name} muncul di hadapan Anda!`,
            hasQR: false,
        },
    ];

    const tips = [
        'Pastikan pencahayaan cukup untuk hasil pindai terbaik',
        'Gunakan perangkat dengan browser yang mendukung WebXR',
        'Jaga jarak 20-30 cm dari QR Code untuk hasil optimal',
    ];

    return (
        <section ref={sectionRef} className="relative py-20 px-4 bg-gradient-to-b from-slate-50 via-white to-teal-50 overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-full opacity-5">
                <div className="absolute top-20 left-10 w-64 h-64 bg-teal-500 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-10 w-64 h-64 bg-cyan-500 rounded-full blur-3xl"></div>
            </div>

            <div className="relative max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-16 animate-fade-in-up">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4 w-auto bg-gradient-to-r from-teal-900 to-cyan-900 bg-clip-text text-transparent mb-4 h-auto">
                        Cara Menggunakan AR
                    </h2>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Ikuti langkah-langkah sederhana ini untuk memulai pengalaman augmented reality Anda
                    </p>
                </div>

                {/* Steps Grid */}
                <div className="grid md:grid-cols-3 gap-8 mb-16">
                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        const isVisible = visibleCards.includes(index);
                        
                        return (
                            <div
                                key={index}
                                className={`group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border-2 border-teal-100 hover:border-teal-400 transform hover:-translate-y-2 ${
                                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                                }`}
                                style={{ transitionDelay: `${index * 150}ms` }}
                            >
                                {/* Card Number Badge */}
                                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-teal-900 to-cyan-900 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                                    {index + 1}
                                </div>

                                {/* Icon */}
                                <div className="mb-6 flex justify-center">
                                    <div className="p-4 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                                        <Icon size={48} className="text-teal-600" />
                                    </div>
                                </div>

                                {/* Content */}
                                <h3 className="text-xl font-bold text-slate-800 mb-3 text-center">
                                    {step.title}
                                </h3>

                                {step.hasQR ? (
                                    <div className="flex flex-col items-center space-y-4">
                                        <div className="p-4 bg-white rounded-xl shadow-inner border-2 border-teal-200 group-hover:border-teal-400 transition-colors duration-300">
                                            <img
                                                src={data.ar.qrCode}
                                                alt={`QR Code for ${data.name}`}
                                                className="w-48 h-48 object-contain"
                                            />
                                        </div>
                                        <p className="text-sm text-slate-600 text-center">
                                            {step.description}
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-slate-600 leading-relaxed text-center">
                                        {step.description}
                                    </p>
                                )}

                                {/* Decorative Element */}
                                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-cyan-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-b-2xl"></div>
                            </div>
                        );
                    })}
                </div>

                {/* Tips Card */}
                <div className="max-w-3xl mx-auto mb-12 animate-fade-in-up animation-delay-600">
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8 shadow-lg border-2 border-amber-200">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-amber-100 rounded-xl">
                                <Lightbulb size={32} className="text-amber-600" />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-2xl font-bold text-slate-800 mb-4">Tips & Trik</h4>
                                <ul className="space-y-3">
                                    {tips.map((tip, index) => (
                                        <li key={index} className="flex items-start gap-3 text-slate-700">
                                            <CheckCircle2 size={20} className="text-teal-600 flex-shrink-0 mt-1" />
                                            <span>{tip}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CTA Button */}
                <div className="text-center animate-fade-in-up animation-delay-800">
                    <button 
                        onClick={() => navigate('/scan')} // navigasi ke halaman baru
                        className="group relative px-12 py-5 bg-gradient-to-r from-teal-900 to-cyan-900 text-white text-lg font-bold rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden">
                        <span className="relative z-10 flex items-center gap-3">
                            <Camera size={24} />
                            Mulai Pindai AR
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-teal-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes fade-in-up {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.8s ease-out forwards;
                }
                .animation-delay-600 {
                    animation-delay: 0.6s;
                    opacity: 0;
                }
                .animation-delay-800 {
                    animation-delay: 0.8s;
                    opacity: 0;
                }
            `}</style>
        </section>
    );
};

export default StepsSections;