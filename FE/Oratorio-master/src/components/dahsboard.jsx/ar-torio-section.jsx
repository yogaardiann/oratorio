import { Link } from 'react-router-dom';

const ArTorioSection = () => {
  return (
    <section>
      {/* ... code UI lainnya ... */}
      <h1>Jelajahi Warisan Budaya</h1>
      
      {/* Contoh Item Preview (Bisa fetch 3 item teratas dari API jika mau) */}
      <div className="card">
        <h3>Candi Borobudur</h3>
        {/* Tombol langsung ke Detail */}
        <Link to="/gallery" className="btn-explore">
            Lihat Semua Koleksi
        </Link>
      </div>
    </section>
  );
};
export default ArTorioSection;