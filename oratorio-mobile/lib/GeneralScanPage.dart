// lib/GeneralScanPage.dart
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:url_launcher/url_launcher.dart'; 

// PENTING: Gunakan URL yang sama dengan file lain
const String kBaseUrl = 'http://192.168.110.100:5000'; 

class GeneralScanPage extends StatefulWidget {
  const GeneralScanPage({super.key});

  @override
  State<GeneralScanPage> createState() => _GeneralScanPageState();
}

class _GeneralScanPageState extends State<GeneralScanPage> {
  // Simulasi ID yang Ditemukan oleh Kamera AR (Ganti dengan output AR Engine)
  int? _simulatedScannedDestinationId; 
  bool _isScanning = false;
  String _scanStatus = "Tekan Mulai untuk mengaktifkan Kamera AR";

  // 🎯 FUNGSI PENGAMBILAN JWT TOKEN
  Future<String?> _getJwtToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('jwt_token'); 
  }
  
  // Fungsi untuk mensimulasikan pemindaian dan posting ke history
  Future<void> _handleGeneralScan() async {
    final String? token = await _getJwtToken();
    if (token == null) {
        setState(() => _scanStatus = "Error: Anda harus Login untuk menggunakan fitur scan.");
        return;
    }

    setState(() {
      _isScanning = true;
      _scanStatus = "Kamera aktif, memindai marker...";
      _simulatedScannedDestinationId = null; 
    });

    // --- LOGIKA SIMULASI AR (Ganti dengan implementasi AR engine nyata) ---
    // Di sini seharusnya Anda memanggil library AR (ar_flutter_plugin)
    // dan menunggu callback saat marker terdeteksi.

    // SIMULASI: Anggap marker ID 5 terdeteksi setelah 3 detik
    await Future.delayed(const Duration(seconds: 3));
    const int detectedId = 5; 
    // --- AKHIR LOGIKA SIMULASI AR ---

    setState(() {
      _scanStatus = "Marker ID $detectedId terdeteksi! Mencatat riwayat...";
      _simulatedScannedDestinationId = detectedId;
    });

    // 1. Post History (Scan Success/End) ke endpoint dengan AUTH
    try {
      final response = await http.post(
          Uri.parse('$kBaseUrl/api/history/auth'), // Menggunakan endpoint JWT
          headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $token', 
          }, 
          body: json.encode({
              'destination_id': detectedId, 
              'action': 'scan_success', 
              'model_type': 'AR',
              'duration_seconds': 10, // Tambahkan durasi simulasi
              'ended_at': DateTime.now().toUtc().toIso8601String(),
          }),
      ).timeout(const Duration(seconds: 5));

      if (response.statusCode == 201) {
          debugPrint('History general scan posted successfully.');
          
          // 2. NAVIGASI OTOMATIS ke History (index 3)
          if (mounted) {
              ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Scan berhasil! Riwayat diperbarui.')),
              );
              // Navigasi ke Dashboard dan kirim index 3 sebagai argument
              // Ini akan memicu Dashboard untuk menampilkan HistoryPage
              Navigator.pushNamedAndRemoveUntil(context, '/dashboard', (route) => false, arguments: {'selectedIndex': 3});
          }
      } else {
          setState(() => _scanStatus = "Error mencatat riwayat (Status: ${response.statusCode})");
      }
      
    } catch (e) {
      setState(() => _scanStatus = 'Error jaringan saat mencatat riwayat: $e');
    } finally {
      if (mounted) setState(() => _isScanning = false);
    }
  }

  // Fungsi untuk memulai AR View di browser (Hanya sebagai contoh)
  Future<void> _launchARViewSimulated(String destinationId) async {
    final url = Uri.parse('$kBaseUrl/mobile-ar/$destinationId');
    if (await canLaunchUrl(url)) {
      await launchUrl(url, mode: LaunchMode.externalApplication);
    } else {
      // Tampilkan error jika tidak bisa meluncurkan URL
      if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Gagal membuka URL: $url')));
      }
    }
  }


  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Scan Kamera Umum'),
        backgroundColor: const Color(0xFF005954),
        foregroundColor: Colors.white,
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(32.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                _isScanning ? Icons.camera_alt_rounded : Icons.camera_enhance_outlined,
                size: 80,
                color: _isScanning ? Colors.green.shade600 : Colors.grey.shade400,
              ),
              const SizedBox(height: 24),
              Text(
                _scanStatus,
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 16,
                  color: _isScanning ? Colors.black87 : Colors.grey.shade600,
                ),
              ),
              if (_isScanning) const Padding(
                padding: EdgeInsets.only(top: 16.0),
                child: CircularProgressIndicator(),
              ),
              const SizedBox(height: 40),
              
              // Tombol Mulai Scan
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: _isScanning ? null : _handleGeneralScan,
                  icon: const Icon(Icons.qr_code_scanner, color: Colors.white),
                  label: Text(
                    _isScanning ? 'Scanning...' : 'Mulai Scan Umum',
                    style: const TextStyle(fontSize: 18, color: Colors.white),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF005954),
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ),

              // Tombol Simulasi AR View (Opsional, untuk debug)
              if (_simulatedScannedDestinationId != null)
                Padding(
                  padding: const EdgeInsets.only(top: 10.0),
                  child: TextButton(
                    onPressed: () => _launchARViewSimulated(_simulatedScannedDestinationId.toString()),
                    child: Text('Lihat AR ID ${_simulatedScannedDestinationId} (Simulasi AR Web)'),
                  ),
                )
            ],
          ),
        ),
      ),
    );
  }
}