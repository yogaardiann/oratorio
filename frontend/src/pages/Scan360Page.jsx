import React from 'react';

const Scan360Page = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-teal-900 text-white text-center p-6">
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
                🌐 Mode 360° View
            </h1>
            <p className="text-lg max-w-2xl mb-10 text-slate-300">
                Halaman ini adalah tampilan panorama 360°.  
                Nantinya kamu bisa menampilkan model 3D atau panorama interaktif di sini (misal pakai A-Frame atau React 360).
            </p>

            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-teal-500 w-full max-w-4xl aspect-video">
                <iframe
                    src="https://www.youtube.com/embed/4JkIs37a2JE?autoplay=0"
                    title="Panorama 360° Example"
                    allowFullScreen
                    className="w-full h-full"
                ></iframe>
            </div>
        </div>
    );
};

export default Scan360Page;
