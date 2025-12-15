// lib/services/user_service.dart

import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart'; // Ganti dengan flutter_secure_storage

// ⚠️ IP HOST / SERVER FLASK (Ambil dari login.dart)
const String kBaseUrl = 'http://192.168.110.100:5000'; 

class UserService {

    // Fungsi Pembantu: Mengambil JWT dari penyimpanan
    static Future<String?> _getToken() async {
        final prefs = await SharedPreferences.getInstance();
        // Anda bisa tambahkan logic untuk refresh token di sini jika dibutuhkan
        return prefs.getString('jwt_token');
    }

    // ==========================================================
    // Fungsi 1: Mengambil Data Profile (GET /api/user/profile)
    // Walaupun data profile sudah ada di dashboard, ini penting 
    // untuk update data atau refresh dari server.
    // ==========================================================
    static Future<Map<String, dynamic>> fetchUserProfile() async {
        final token = await _getToken();
        if (token == null) throw Exception("User belum login atau token hilang.");

        // NOTE: Kita asumsikan ada endpoint /api/user/profile yang 
        // mengembalikan data user_id, name, email, role, dll.
        // Di app.py Anda, belum ada endpoint GET /api/user/profile, 
        // tapi kita bisa buatkan. Untuk sementara, kita bisa menggunakan
        // endpoint yang ada di app.py yang dilindungi, misalnya /api/wisata
        // sebagai uji coba.
        
        // Cek kembali: Saat ini user data sudah di passing. 
        // Kita simpan implementasi ini untuk nanti di ProfilePage.dart.
        
        throw UnimplementedError('Endpoint profile belum tersedia di Flask.');
    }
    
    // ==========================================================
    // Fungsi 2: Mengambil Data Gallery (GET /api/wisata)
    // ==========================================================
    static Future<List<Map<String, dynamic>>> fetchGalleryDestinations() async {
        final token = await _getToken();
        if (token == null) throw Exception("User belum login atau token hilang.");

        final url = Uri.parse('$kBaseUrl/api/wisata'); 
        
        final response = await http.get(
            url,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer $token', // PENTING: Mengirim JWT
            },
        );

        if (response.statusCode == 200) {
            // Flask mengembalikan List<Map>
            final List<dynamic> data = json.decode(response.body);
            return data.cast<Map<String, dynamic>>();
        } else if (response.statusCode == 401) {
            throw Exception("Token tidak valid atau expired. Silakan login kembali.");
        } else {
            throw Exception("Gagal mengambil data galeri: Status ${response.statusCode}");
        }
    }
}