// Impor semua gambar lokal dari folder assets Anda dengan path yang benar
import imgKresek from '../assets/images/fav-dest-section-monumen-kresek.jpg';
import imgMonas from '../assets/images/fav-dest-section-tugu-monas.jpg';
import imgTugu from '../assets/images/fav-dest-section-tugu-jogja.jpg';
import imgJamGadang from '../assets/images/fav-dest-section-jam-gadang.jpg';
import imgBorobudur from '../assets/images/fav-dest-section-candi-borobudur.jpg';
import imgPrambanan from '../assets/images/fav-dest-section-candi-prambanan.jpg';

const dummyQrCode = 'https://source.unsplash.com/200x200/?qr-code';

export const destinations = {
    'candi-borobudur': {
        id: 'candi-borobudur',
        name: 'Candi Borobudur',
        location: 'Magelang, Jawa Tengah',
        thumbnail: imgBorobudur,
        ar: { qrCode: dummyQrCode, model: '' },
        vr: { scene: '' }
    },
    'monumen-nasional': {
        id: 'monumen-nasional',
        name: 'Monumen Nasional',
        location: 'Jakarta, DKI Jakarta',
        thumbnail: imgMonas,
        ar: { qrCode: dummyQrCode, model: '' },
        vr: { scene: '' }
    },
    'tugu-yogyakarta': {
        id: 'tugu-yogyakarta',
        name: 'Tugu Yogyakarta',
        location: 'D.I. Yogyakarta',
        thumbnail: imgTugu,
        ar: { qrCode: dummyQrCode, model: '' },
        vr: { scene: '' }
    },
    'jam-gadang': {
        id: 'jam-gadang',
        name: 'Jam Gadang',
        location: 'Bukittinggi, Sumatera Barat',
        thumbnail: imgJamGadang,
        ar: { qrCode: dummyQrCode, model: '' },
        vr: { scene: '' }
    },
    'monumen-kresek': {
        id: 'monumen-kresek',
        name: 'Monumen Kresek',
        location: 'Madiun, Jawa Timur',
        thumbnail: imgKresek,
        ar: { qrCode: dummyQrCode, model: '' },
        vr: { scene: '' }
    },
    'candi-prambanan': {
        id: 'candi-prambanan',
        name: 'Candi Prambanan',
        location: 'Sleman, D.I. Yogyakarta',
        thumbnail: imgPrambanan,
        ar: { qrCode: dummyQrCode, model: '' },
        vr: { scene: '' }
    }
};