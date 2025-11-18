import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';
import { Eye, Glasses, Play, CheckCircle2, Lightbulb, Smartphone, Headphones, MousePointer2, RotateCcw } from 'lucide-react';

const metaQuestImage = 'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?q=80&w=2070';
const oculusQuestImage = 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?q=80&w=2078';

const StepsSectionVR = ({ data = { name: 'Candi Borobudur', thumbnail: 'https://images.unsplash.com/photo-1555400038-63f526b1c3b7?q=80&w=2070' } }) => {
    const [selectedMode, setSelectedMode] = useState(null);
    const [isVrSupported, setIsVrSupported] = useState(false);
    const [visibleSections, setVisibleSections] = useState([]);
    const [rotation, setRotation] = useState(0);
    const sectionRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (navigator.xr && navigator.xr.isSessionSupported) {
            navigator.xr.isSessionSupported('immersive-vr').then((supported) => {
                setIsVrSupported(supported);
            }).catch(() => setIsVrSupported(false));
        }
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setVisibleSections(['preview', 'modes', 'devices']);
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

    useEffect(() => {
        const interval = setInterval(() => {
            setRotation(prev => (prev + 0.5) % 360);
        }, 50);
        return () => clearInterval(interval);
    }, []);

// Fungsi navigasi
    const handleStartVR = () => {
        if (!selectedMode) {
            alert("Silakan pilih mode tampilan terlebih dahulu!");
            return;
        }

        if (selectedMode === '360 View') {
            navigate('/scan360'); // arahkan ke halaman baru
            return;
        }

        if (selectedMode === 'VR Imersif') {
            if (isVrSupported) {
                alert(`Memulai Sesi WebXR Imersif untuk ${data.name}...`);
                // Di sini nanti kamu bisa panggil WebXR session
            } else {
                // Sebagai pengganti sementara: tampilkan video fullscreen seperti YouTube
                const videoUrl = 'https://www.youtube.com/embed/4JkIs37a2JE?autoplay=1&enablejsapi=1';
                const win = window.open(videoUrl, '_blank', 'noopener,noreferrer');
                if (win) win.focus();
            }
        }
    };

    const modes = [
        {
            id: '360 View',
            icon: Eye,
            title: 'Mode Tampilan 360° Web View',
            description: `Cara termudah merasakan ${data.name}, seperti melihat melalui jendela ajaib. Anda akan menjadi seorang pengamat (observer).`,
            color: 'from-teal-500 to-cyan-500',
            steps: [
                'Klik untuk memilih mode ini',
                'Tekan tombol "Mulai VR TORIO"',
                'Gunakan mouse atau geser layar untuk melihat sekeliling',
            ],
        },
        {
            id: 'VR Imersif',
            icon: Glasses,
            title: 'Mode VR Imersif',
            description: `Pengalaman VR sesungguhnya di mana Anda "masuk" ke dalam ${data.name}. Rasakan sensasi kehadiran dan skala ruang yang realistis.`,
            color: 'from-cyan-500 to-blue-500',
            steps: [
                'Buka situs ini dari Browser di dalam Headset VR Anda',
                'Pilih mode ini & tekan "Mulai VR TORIO"',
                'Pilih "Enter VR" saat browser meminta izin',
            ],
        },
    ];

    const devices = [
        { image: metaQuestImage, alt: 'Meta Quest 2 Headset' },
        { image: oculusQuestImage, alt: 'Oculus Quest 2 Headset and controllers' },
    ];

    return (
        <section ref={sectionRef} className="relative py-24 px-4 bg-gradient-to-b from-slate-0 via-teal-60 to-cyan-50 overflow-hidden">
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 left-0 w-96 h-96 bg-teal-500 rounded-full blur-3xl animate-pulse-slow"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500 rounded-full blur-3xl animate-pulse-slow animation-delay-2000"></div>
            </div>

            <div className="relative max-w-7xl mx-auto">
                {/* 360° Preview Section */}
                <div className={`mb-24 transition-all duration-1000 ${
                    visibleSections.includes('preview') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}>
                    <div className="text-center mb-10 mt-0">
                        <div className="inline-block mb-4">
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                            Preview Pengalaman 360° VR
                        </h2>
                        <p className="text-lg text-slate-600 max-w-3xl mx-auto">
                            Rasakan simulasi pengalaman virtual reality sebelum memulai
                        </p>
                    </div>

                    <div className="max-w-5xl mx-auto">
                        <div className="relative group">
                            <div className="relative overflow-hidden rounded-3xl shadow-2xl border-4 border-teal-200 bg-gradient-to-br from-slate-900 to-teal-900">
                                <div className="relative aspect-video overflow-hidden">
                                    <img
                                        src={data.thumbnail}
                                        alt={`360° View ${data.name}`}
                                        className="w-full h-full object-cover transform transition-transform duration-1000"
                                        style={{ transform: `scale(1.2) translateX(${rotation * 0.5}px)` }}
                                    />
                                    
                                    <div className="absolute inset-0 bg-gradient-to-r from-teal-900/20 via-transparent to-cyan-900/20"></div>
                                    
                                    <div className="absolute inset-0 opacity-30" style={{
                                        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(20, 184, 166, 0.1) 2px, rgba(20, 184, 166, 0.1) 4px)',
                                    }}></div>

                                    <div className="absolute inset-0 opacity-20" style={{
                                        backgroundImage: 'radial-gradient(circle, rgba(20, 184, 166, 0.4) 1px, transparent 1px)',
                                        backgroundSize: '30px 30px',
                                    }}></div>
                                </div>

                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/30 backdrop-blur-sm">
                                    <div className="text-center space-y-4">
                                        <div className="flex items-center justify-center gap-3 text-white">
                                            <MousePointer2 size={32} className="animate-bounce" />
                                            <span className="text-xl font-bold">Geser untuk Melihat Sekeliling</span>
                                        </div>
                                        <div className="flex items-center justify-center gap-2">
                                            <RotateCcw size={20} className="text-teal-300 animate-spin-slow" />
                                            <span className="text-teal-300">Mode 360° Aktif</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="absolute top-4 left-4 bg-teal-500/90 backdrop-blur-sm px-4 py-2 rounded-full text-white font-semibold text-sm flex items-center gap-2">
                                    <Eye size={16} />
                                    <span>360° View</span>
                                </div>
                                <div className="absolute top-4 right-4 bg-cyan-500/90 backdrop-blur-sm px-4 py-2 rounded-full text-white font-semibold text-sm flex items-center gap-2">
                                    <Play size={16} />
                                    <span>Live Preview</span>
                                </div>

                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                                    <h3 className="text-2xl font-bold text-white mb-2">{data.name}</h3>
                                    <p className="text-teal-300">Jelajahi setiap sudut dengan teknologi 360°</p>
                                </div>
                            </div>

                            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-4 z-10">
                                <div className="bg-white rounded-xl shadow-xl px-6 py-3 border-2 border-teal-200 transform hover:scale-105 transition-transform">
                                    <div className="flex items-center gap-2">
                                        <Eye size={20} className="text-teal-600" />
                                        <span className="font-bold text-slate-800">Rotasi 360°</span>
                                    </div>
                                </div>
                                <div className="bg-white rounded-xl shadow-xl px-6 py-3 border-2 border-cyan-200 transform hover:scale-105 transition-transform">
                                    <div className="flex items-center gap-2">
                                        <Glasses size={20} className="text-cyan-600" />
                                        <span className="font-bold text-slate-800">VR Ready</span>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-3xl blur-2xl opacity-20 -z-10 group-hover:opacity-30 transition-opacity duration-300"></div>
                        </div>
                    </div>
                </div>

                {/* Section Header */}
                <div className="text-center mb-16 animate-fade-in-up">
                    <div className="inline-block mb-4">
                        <div className="p-4 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-2xl">
                            <Glasses size={48} className="text-teal-600" />
                        </div>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                        Panduan Memulai VR untuk {data.name}
                    </h2>
                    <p className="text-lg text-slate-600 max-w-3xl mx-auto">
                        Pilih mode pengalaman VR yang sesuai dengan perangkat Anda dan mulai petualangan virtual
                    </p>
                </div>

                {/* Mode Selection Cards */}
                <div className={`grid md:grid-cols-2 gap-8 mb-20 transition-all duration-1000 ${
                    visibleSections.includes('modes') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}>
                    {modes.map((mode, index) => {
                        const Icon = mode.icon;
                        const isSelected = selectedMode === mode.id;
                        
                        return (
                            <div
                                key={mode.id}
                                onClick={() => setSelectedMode(mode.id)}
                                className={`group relative cursor-pointer transition-all duration-500 ${
                                    isSelected ? 'scale-105' : 'hover:scale-105'
                                }`}
                                style={{ transitionDelay: `${index * 150}ms` }}
                            >
                                <div className={`relative bg-white rounded-3xl p-8 shadow-xl border-4 transition-all duration-300 ${
                                    isSelected 
                                        ? 'border-teal-400 shadow-2xl' 
                                        : 'border-transparent hover:shadow-2xl'
                                }`}>
                                    {isSelected && (
                                        <div className="absolute -top-4 -right-4 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full p-3 shadow-lg animate-bounce-slow">
                                            <CheckCircle2 size={24} className="text-white" />
                                        </div>
                                    )}

                                    <div className="flex items-center gap-4 mb-6">
                                        <div className={`p-4 bg-gradient-to-br ${mode.color} rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                            <Icon size={40} className="text-white" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-slate-800">
                                            {mode.title}
                                        </h3>
                                    </div>

                                    <p className="text-slate-600 leading-relaxed mb-6">
                                        {mode.description}
                                    </p>

                                    <ol className="space-y-3">
                                        {mode.steps.map((step, stepIndex) => (
                                            <li key={stepIndex} className="flex items-start gap-3">
                                                <span className={`flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br ${mode.color} text-white font-bold flex items-center justify-center text-sm`}>
                                                    {stepIndex + 1}
                                                </span>
                                                <span className="text-slate-700 pt-0.5">{step}</span>
                                            </li>
                                        ))}
                                    </ol>

                                    <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${mode.color} transform transition-all duration-500 rounded-b-3xl ${
                                        isSelected ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                                    }`}></div>
                                </div>

                                <div className={`absolute inset-0 bg-gradient-to-r ${mode.color} rounded-3xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 -z-10`}></div>
                            </div>
                        );
                    })}
                </div>

                {/* Device Recommendations */}
                <div className={`mb-16 transition-all duration-1000 delay-300 ${
                    visibleSections.includes('devices') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}>
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                        Rekomendasi Perangkat
                    </h2>
                    <p className="text-center text-slate-600 mb-10">
                        Untuk pengalaman imersif terbaik, kami merekomendasikan headset VR standalone
                    </p>

                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {devices.map((device, index) => (
                            <div
                                key={index}
                                className="group relative overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105"
                                style={{ transitionDelay: `${index * 150}ms` }}
                            >
                                <div className="relative aspect-video">
                                    <img
                                        src={device.image}
                                        alt={device.alt}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-teal-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg">
                                        <Headphones size={24} className="text-teal-600" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="max-w-3xl mx-auto mt-8 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-2xl p-6 border-2 border-teal-200">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-white rounded-xl shadow-md">
                                <Smartphone size={28} className="text-teal-600" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800 mb-2">Meta Quest Series</h4>
                                <p className="text-slate-700 text-sm leading-relaxed">
                                    Headset standalone yang tidak memerlukan PC atau kabel. Dilengkapi dengan teknologi tracking canggih dan perpustakaan konten yang luas.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tips Section */}
                <div className="max-w-4xl mx-auto mb-12 animate-fade-in-up animation-delay-600">
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-8 shadow-lg border-2 border-amber-200">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-amber-100 rounded-xl">
                                <Lightbulb size={32} className="text-amber-600" />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-2xl font-bold text-slate-800 mb-4">Tips VR Terbaik</h4>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-3 text-slate-700">
                                        <CheckCircle2 size={20} className="text-teal-600 flex-shrink-0 mt-1" />
                                        <span>Pastikan ruangan Anda memiliki pencahayaan yang cukup untuk tracking optimal</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-slate-700">
                                        <CheckCircle2 size={20} className="text-teal-600 flex-shrink-0 mt-1" />
                                        <span>Gunakan headphone untuk pengalaman audio yang lebih imersif</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-slate-700">
                                        <CheckCircle2 size={20} className="text-teal-600 flex-shrink-0 mt-1" />
                                        <span>Bersihkan lensa headset sebelum digunakan untuk visual yang lebih jernih</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CTA Button */}
                <div className="text-center animate-fade-in-up animation-delay-800">
                    <button
                        onClick={handleStartVR}
                        disabled={!selectedMode}
                        className="group relative px-12 py-6 bg-gradient-to-r from-teal-600 to-cyan-600 text-white text-xl font-bold rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                        <span className="relative z-10 flex items-center gap-3">
                            <Play size={28} className="group-hover:translate-x-1 transition-transform duration-300" />
                            MULAI VR TORIO
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-teal-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                    </button>
                    {!selectedMode && (
                        <p className="mt-4 text-amber-600 font-semibold animate-pulse">
                            Pilih mode tampilan terlebih dahulu
                        </p>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                @keyframes pulse-slow {
                    0%, 100% { opacity: 0.05; }
                    50% { opacity: 0.1; }
                }
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
                .animate-bounce-slow { animation: bounce-slow 2s ease-in-out infinite; }
                .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
                .animate-spin-slow { animation: spin-slow 3s linear infinite; }
                .animation-delay-600 { animation-delay: 0.6s; opacity: 0; }
                .animation-delay-800 { animation-delay: 0.8s; opacity: 0; }
                .animation-delay-2000 { animation-delay: 2s; }
            `}</style>
        </section>
    );
};

export default StepsSectionVR;