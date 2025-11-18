import React from "react";
import { ArrowLeft, QrCode, Image } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ARScanPage = () => {
  const navigate = useNavigate();

  const markerData = {
    name: "Candi Borobudur",
    image: "/assets/marker-placeholder.png", // ubah nanti sesuai file kamu
  };

  const qrData = {
    link: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://oratorio-ar-scan",
  };

  return (
    <section className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-teal-50 flex flex-col items-center justify-center px-6 py-16 relative overflow-hidden">
      {/* Background Decorative Blurs */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-teal-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-cyan-400 rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl w-full">
        {/* Header Bar */}
        <div className="flex items-center justify-between mb-12">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-700 to-cyan-700 text-white rounded-full shadow-md hover:shadow-lg transition-transform hover:-translate-x-1"
          >
            <ArrowLeft size={20} />
            Kembali
          </button>

          <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-teal-900 to-cyan-900 bg-clip-text text-transparent mb-10">
            Pindai Marker AR
          </h2>

          <div className="w-24" /> {/* Spacer agar header center seimbang */}
        </div>

        {/* Grid 2 Columns */}
        <div className="grid md:grid-cols-2 gap-10 items-center">
          {/* Kiri - Marker */}
          <div className="bg-white rounded-2xl shadow-xl border-2 border-teal-100 p-14 flex flex-col items-center justify-center hover:border-teal-400 transition-all">
            <div className="p-4 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl mb-6 shadow-inner">
              <Image size={48} className="text-teal-600" />
            </div>
            <img
              src={markerData.image}
              alt={`Marker ${markerData.name}`}
              className="w-64 h-64 object-contain mb-6"
            />
            <h3 className="text-xl font-semibold text-slate-800">
              Marker: {markerData.name}
            </h3>
            <p className="text-slate-600 text-center mt-2">
              Arahkan kamera HP Anda ke marker ini setelah membuka mode AR.
            </p>
          </div>

          {/* Kanan - QR Code */}
          <div className="bg-white rounded-2xl shadow-xl border-2 border-teal-100 p-11 flex flex-col items-center justify-center hover:border-teal-400 transition-all">
            <div className="p-4 bg-gradient-to-br from-cyan-50 to-teal-50 rounded-xl mb-6 shadow-inner">
              <QrCode size={48} className="text-cyan-600" />
            </div>
            <img
              src={qrData.link}
              alt="AR QR Code"
              className="w-64 h-64 object-contain mb-6"
            />
            <h3 className="text-xl font-semibold text-slate-800">Scan untuk Membuka Kamera AR</h3>
            <p className="text-slate-600 text-center mt-2">
              Gunakan kamera HP atau Google Lens untuk memindai kode ini.  
              Anda akan diarahkan ke tampilan AR yang menampilkan objek 3D dari marker.
            </p>
          </div>
        </div>

        {/* Info Section */}
      </div>
    </section>
  );
};

export default ARScanPage;
