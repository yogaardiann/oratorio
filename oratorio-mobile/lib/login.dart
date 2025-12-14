import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:async'; 
import 'dart:io'; // Tambahkan ini untuk error Socket
import 'package:shared_preferences/shared_preferences.dart';

// --- Konstanta Warna (Disesuaikan dan Dirapikan) ---
const Color kColorPrimary = Color(0xFF004D40); // Hijau Tua / Teal Dark
const Color kColorPrimaryDark = Color(0xFF00332A);
const Color kColorFooterBg = Color(0xFF121212);
const Color kColorFooterText = Color(0xFFA7A7A7);

// ⚠️ IP HOST / SERVER FLASK
const String kBaseUrl = 'http://192.168.1.26:5000'; 

class LoginPage extends StatefulWidget {
    const LoginPage({super.key});

    @override
    State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
    final _formKey = GlobalKey<FormState>();
    final _emailCtl = TextEditingController();
    final _passCtl = TextEditingController();
    bool _loading = false;
    String? _message; // Digunakan untuk menampilkan pesan error di UI (opsional)

    @override
    void dispose() {
        _emailCtl.dispose();
        _passCtl.dispose();
        super.dispose();
    }

    // Fungsi Pembantu untuk menampilkan Snackbar yang rapi
    void _showSnackbar(String message, {Color color = Colors.red}) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(message), backgroundColor: color),
        );
      }
    }

    // 🚀 FUNGSI SUBMIT DENGAN DIAGNOSTIK ERROR YANG LEBIH BAIK
    Future<void> _submit() async {
        if (!_formKey.currentState!.validate()) return;
        
        setState(() {
            _loading = true;
            _message = null; 
        });

        final String email = _emailCtl.text.trim();
        final String password = _passCtl.text;
        
        final body = json.encode({
            "email": email,
            "password": password,
        });
        
        try {
            // --- KIRIM PERMINTAAN LOGIN ---
            final response = await http.post(
                Uri.parse('$kBaseUrl/api/login'), 
                headers: {'Content-Type': 'application/json'},
                body: body,
            ).timeout(const Duration(seconds: 10)); 

            // --- PROSES RESPON ---
            final Map<String, dynamic> responseData = json.decode(response.body);

            if (response.statusCode == 200 && responseData['status'] == 'ok') {
                // ✅ Login Sukses
                if (!mounted) return;
                
                final user = responseData['user'] as Map<String, dynamic>;
                final token = responseData['token'] as String;
                
                // Simpan Token JWT ke SharedPreferences
                final prefs = await SharedPreferences.getInstance();
                await prefs.setString('jwt_token', token);
                
                _showSnackbar('Login berhasil! Selamat datang, ${user['username']}', color: kColorPrimary);
                
                // Navigasi ke Dashboard dan KIRIM DATA USER
                Navigator.pushReplacementNamed(context, '/dashboard', arguments: user);
                
            } else {
                // ❌ Login Gagal (Status Code 400, 401, 403, dll.)
                final errorMessage = responseData['message'] ?? 'Otentikasi gagal. Silakan periksa kembali email dan password Anda.';
                
                setState(() {
                    _message = 'Gagal Login: $errorMessage';
                });
                 _showSnackbar('Gagal Login (Status ${response.statusCode}): $errorMessage', color: Colors.red);
            }
            
        } on TimeoutException {
            _showSnackbar('Koneksi Gagal: Server lambat atau tidak merespons (Timeout 10s).', color: Colors.orange);
            setState(() => _message = 'Timeout: Cek koneksi server.');

        } on SocketException catch (e) {
            // ⚠️ Tangkap Error Jaringan Spesifik (No internet, connection refused, dll.)
            String detailMessage;
            if (e.osError?.errorCode == 111) {
                detailMessage = 'Koneksi Ditolak (Connection Refused). Server Flask tidak berjalan atau Firewall memblokir Port 5000.';
            } else {
                detailMessage = 'Kesalahan jaringan: Periksa koneksi WiFi dan pastikan BASE_URL ($kBaseUrl) sudah benar.';
            }

            _showSnackbar('Error Jaringan: $detailMessage', color: Colors.red.shade700);
            setState(() => _message = detailMessage);

        } catch (e) {
            // Tangkap error JSON decoding atau error lain yang tidak terduga
             _showSnackbar('Error tidak terduga saat memproses respon: ${e.runtimeType}', color: Colors.red);
             setState(() => _message = 'Error: ${e.toString()}');
             
        } finally {
            if (mounted) setState(() => _loading = false);
        }
    }

    @override
    Widget build(BuildContext context) {
        final mq = MediaQuery.of(context);
        final isWide = mq.size.width >= 600;
        final cardWidth = isWide ? 520.0 : mq.size.width * 0.92;

        return Scaffold(
            backgroundColor: Colors.grey[50],
            body: SafeArea(
                child: Center(
                    child: SingleChildScrollView(
                        padding: const EdgeInsets.symmetric(vertical: 24),
                        child: Container(
                            width: cardWidth,
                            decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(12),
                                boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.06), blurRadius: 12)],
                            ),
                            child: Column(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                    Padding(
                                        padding: const EdgeInsets.fromLTRB(28, 28, 28, 8),
                                        child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                                const SizedBox(height: 16),
                                                Text('Masuk dan Mulai Jelajahi Nusantara!', // Teks diparaphrase
                                                    style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w700, color: kColorPrimaryDark)),
                                                const SizedBox(height: 8),
                                                Text('Akses akun Anda menggunakan email dan kata sandi, atau buat akun baru di bawah. Proses yang cepat dan mudah!', // Teks diparaphrase
                                                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: Colors.grey[700])),
                                                const SizedBox(height: 20),
                                                // Tampilkan Pesan Error di UI jika ada
                                                if (_message != null)
                                                    Padding(
                                                        padding: const EdgeInsets.only(bottom: 12.0),
                                                        child: Text(_message!, style: const TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
                                                    ),
                                                Form(
                                                    key: _formKey,
                                                    child: Column(
                                                        children: [
                                                            TextFormField(
                                                                controller: _emailCtl,
                                                                keyboardType: TextInputType.emailAddress,
                                                                decoration: const InputDecoration(
                                                                    labelText: 'Email Pengguna',
                                                                    hintText: 'Masukkan email Anda',
                                                                    border: OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(8))),
                                                                ),
                                                                validator: (v) {
                                                                    if (v == null || v.trim().isEmpty) return 'Email wajib diisi';
                                                                    if (!RegExp(r'^[^@]+@[^@]+\.[^@]+').hasMatch(v.trim())) return 'Format email tidak valid'; // Pesan validasi diparaphrase
                                                                    return null;
                                                                },
                                                            ),
                                                            const SizedBox(height: 12),
                                                            TextFormField(
                                                                controller: _passCtl,
                                                                obscureText: true,
                                                                decoration: const InputDecoration(
                                                                    labelText: 'Kata Sandi',
                                                                    hintText: 'Masukkan kata sandi Anda',
                                                                    border: OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(8))),
                                                                ),
                                                                validator: (v) => (v == null || v.isEmpty) ? 'Kata sandi wajib diisi' : null, // Pesan validasi diparaphrase
                                                            ),
                                                            const SizedBox(height: 16),
                                                            SizedBox(
                                                                width: double.infinity,
                                                                height: 52,
                                                                child: ElevatedButton(
                                                                    onPressed: _loading ? null : _submit,
                                                                    style: ElevatedButton.styleFrom(
                                                                        backgroundColor: kColorPrimary,
                                                                        disabledBackgroundColor: kColorPrimary.withOpacity(0.6),
                                                                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                                                        foregroundColor: Colors.white,
                                                                    ),
                                                                    child: _loading 
                                                                        ? const CircularProgressIndicator(color: Colors.white, strokeWidth: 3) 
                                                                        : const Text('Masuk ke Akun', style: TextStyle(fontWeight: FontWeight.w600)),
                                                                ),
                                                            ),
                                                            const SizedBox(height: 16),
                                                            // ... Bagian register, lupa sandi, dan media sosial tetap sama ...
                                                            Row(
                                                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                                                children: [
                                                                    TextButton(
                                                                        onPressed: () => Navigator.pushNamed(context, '/register'), 
                                                                        child: const Text('Daftar Sekarang', style: TextStyle(color: kColorPrimary)),
                                                                    ),
                                                                    TextButton(onPressed: () {}, child: const Text('Lupa Sandi?', style: TextStyle(color: kColorPrimary))),
                                                                ],
                                                            ),
                                                            const SizedBox(height: 12),
                                                            Row(children: const [
                                                                Expanded(child: Divider()),
                                                                SizedBox(width: 8),
                                                                Text('atau lanjutkan dengan', style: TextStyle(color: Colors.grey, fontSize: 12)),
                                                                SizedBox(width: 8),
                                                                Expanded(child: Divider()),
                                                            ]),
                                                            const SizedBox(height: 12),
                                                            Row(
                                                                children: [
                                                                    Expanded(
                                                                        child: OutlinedButton(
                                                                            onPressed: () {},
                                                                            style: OutlinedButton.styleFrom(
                                                                                side: const BorderSide(color: Colors.grey),
                                                                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                                                                backgroundColor: Colors.white,
                                                                            ),
                                                                            child: const Padding(padding: EdgeInsets.symmetric(vertical: 12), child: Text('Google', style: TextStyle(color: Colors.black87))),
                                                                        ),
                                                                    ),
                                                                    const SizedBox(width: 12),
                                                                    Expanded(
                                                                        child: OutlinedButton(
                                                                            onPressed: () {},
                                                                            style: OutlinedButton.styleFrom(
                                                                                side: const BorderSide(color: Colors.grey),
                                                                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                                                                backgroundColor: Colors.white,
                                                                            ),
                                                                            child: const Padding(padding: EdgeInsets.symmetric(vertical: 12), child: Text('Facebook', style: TextStyle(color: Colors.black87))),
                                                                        ),
                                                                    ),
                                                                ],
                                                            ),
                                                            const SizedBox(height: 12),
                                                            Text.rich(
                                                                TextSpan(
                                                                    text: 'Dengan membuat akun, Anda menyetujui ', // Teks diparaphrase
                                                                    style: const TextStyle(fontSize: 12, color: Colors.grey),
                                                                    children: [
                                                                        TextSpan(text: 'Syarat & Ketentuan', style: const TextStyle(color: kColorPrimary)),
                                                                        const TextSpan(text: ', '),
                                                                        TextSpan(text: 'Kebijakan Privasi', style: const TextStyle(color: kColorPrimary)),
                                                                        const TextSpan(text: ' dan Perjanjian dengan Oratorio.'),
                                                                    ],
                                                                ),
                                                            ),
                                                            const SizedBox(height: 16),
                                                        ],
                                                    ),
                                                ),
                                            ],
                                        ),
                                    ),
                                    // Footer di dalam Card
                                    Container(
                                        width: double.infinity,
                                        decoration: const BoxDecoration(
                                            color: kColorFooterBg,
                                            borderRadius: BorderRadius.vertical(bottom: Radius.circular(12)),
                                        ),
                                        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
                                        child: Column(
                                            children: [
                                                Row(
                                                    mainAxisAlignment: MainAxisAlignment.center,
                                                    children: [
                                                        IconButton(onPressed: () {}, icon: const Icon(Icons.facebook, color: Colors.white)),
                                                        const SizedBox(width: 12),
                                                        IconButton(onPressed: () {}, icon: const Icon(Icons.camera_alt_outlined, color: Colors.white)),
                                                        const SizedBox(width: 12),
                                                        IconButton(onPressed: () {}, icon: const Icon(Icons.push_pin_outlined, color: Colors.white)),
                                                    ],
                                                ),
                                                const SizedBox(height: 12),
                                                Wrap(
                                                    alignment: WrapAlignment.center,
                                                    spacing: 24,
                                                    children: [
                                                        TextButton(onPressed: () {}, child: const Text('Pusat Bantuan', style: TextStyle(color: kColorFooterText))),
                                                        TextButton(onPressed: () {}, child: const Text('FAQ', style: TextStyle(color: kColorFooterText))),
                                                        TextButton(onPressed: () {}, child: const Text('Tentang Oratorio', style: TextStyle(color: kColorFooterText))),
                                                    ],
                                                ),
                                                const SizedBox(height: 12),
                                                const Text('© 2025 Oratorio, Inc. | Semua Hak Cipta Dilindungi.', style: TextStyle(color: kColorFooterText, fontSize: 12)),
                                            ],
                                        ),
                                    ),
                                ],
                            ),
                        ),
                    ),
                ),
            ),
        );
    }
}