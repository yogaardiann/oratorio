// ScanARPage.dart (Implementasi Guide & Contextual Scan Logic)

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:url_launcher/url_launcher.dart'; // Untuk membuka link AR
// 🎯 PERBAIKAN: Import resolveApiBase dari ARGalleryPage
import 'ARGalleryPage.dart' show ScanArguments, resolveApiBase;

// --- BASE URL ---
const String kBaseUrl = 'http://192.168.110.100:5000'; 

class ScanARPage extends StatelessWidget {
  // Terima argumen (ScanArguments) dari ARGalleryPage
  ScanARPage({super.key});

  // Fungsi untuk memulai AR View di browser (menggunakan MobileARView.jsx)
  Future<void> _launchARView(BuildContext context, String destinationId) async {
    final url = Uri.parse('$kBaseUrl/mobile-ar/$destinationId');
    try {
      if (await canLaunchUrl(url)) {
        // Mode externalApplication lebih reliable untuk membuka browser/aplikasi eksternal
        await launchUrl(url, mode: LaunchMode.externalApplication); 
      } else {
        // Gagal membuka URL
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Error: Tidak dapat membuka URL $url. Pastikan browser terinstal.')),
          );
        }
      }
    } catch (e) {
      // Menangkap error runtime (seperti yang ditunjukkan di log)
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Gagal Launch AR View. Detail: ${e.toString()}')),
        );
      }
    }
  }

  // Fungsi untuk simulasi pemindaian AR (Untuk navigasi ke AR View)
  void _startARCamera(BuildContext context, ScanArguments args) {
      final destinationId = args.destinationData['id']?.toString();

      if (destinationId != null) {
          // Simulasi: Langsung meluncurkan AR View (di browser eksternal)
          _launchARView(context, destinationId); // Meneruskan context
      } else {
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('ID Destinasi tidak ditemukan.')));
      }
  }

  @override
  Widget build(BuildContext context) {
    final args = ModalRoute.of(context)?.settings.arguments;
    
    // Logika ini harusnya terpicu saat navigasi dari Gallery (via pushNamed)
    if (args == null || args is! ScanArguments) {
      // Ini adalah pesan error yang benar untuk ScanARPage yang HANYA menerima ScanArguments.
      return const Scaffold(body: Center(child: Text('Error: Argumen scan hilang. Mohon kembali ke Gallery.')));
    }
    
    final ScanArguments scanArgs = args;
    final item = scanArgs.destinationData;
    final destinationId = item['id']?.toString() ?? 'N/A';
    final destinationName = item['name'] ?? 'Destinasi AR';
    final markerImage = item['marker_image'] ?? '';
    
    // 🎯 PERBAIKAN: Menggunakan resolveApiBase yang diimpor
    final imageUrl = markerImage.isNotEmpty ? '${resolveApiBase(kBaseUrl)}/static/uploads/$markerImage' : null;

    return Scaffold(
      appBar: AppBar(
        title: Text('Scan Guide: $destinationName'),
        backgroundColor: const Color(0xFF005954),
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // ... (Bagian Panduan dan Marker Image tetap sama) ...
              Card(
                elevation: 8,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                child: Padding(
                  padding: const EdgeInsets.all(20.0),
                  child: Column(
                    children: [
                      const Text('Target Marker:', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w500)),
                      const SizedBox(height: 10),
                      Container(
                        width: double.infinity,
                        height: 250,
                        color: Colors.grey.shade200,
                        child: imageUrl != null 
                          ? Image.network(
                              imageUrl, 
                              fit: BoxFit.contain,
                              errorBuilder: (c, e, s) => const Center(child: Icon(Icons.broken_image, size: 50)),
                            ) 
                          : const Center(child: Text('Marker Image Not Available')),
                      ),
                      const SizedBox(height: 10),
                      Text('ID: $destinationId / File: $markerImage', style: const TextStyle(fontSize: 10, color: Colors.grey)),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 20),

              // --- Button Scan Kamera (Fitur Utama Mobile) ---
              ElevatedButton.icon(
                // PERBAIKAN: Memanggil _startARCamera
                onPressed: () => _startARCamera(context, scanArgs), 
                icon: const Icon(Icons.camera_alt, color: Colors.white),
                label: const Text('Mulai Scan Kamera (Kontekstual)', style: TextStyle(fontSize: 18, color: Colors.white)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF005954),
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
              const SizedBox(height: 10),

              // --- Tampilkan History (Mengikuti Referensi .jsx) ---
              const Divider(height: 40),
              // PENTING: History tidak ditampilkan langsung di ScanARPage.dart, 
              // tapi kita akan menggunakan Widget HistoryPage di sini sebagai referensi.
              // Kita akan membuat widget khusus untuk history user per destination.

              // Placeholder untuk History (Akan diisi di HistoryPage.dart)
              const Text(
                'Riwayat Kunjungan ke Destinasi Ini', 
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 10),
              // Placeholder untuk Widget History yang akan kita buat
              const Center(
                child: Padding(
                  padding: EdgeInsets.all(16.0),
                  child: Text('Riwayat akan dimuat di sini setelah HistoryPage.dart selesai dibuat.', style: TextStyle(color: Colors.grey)),
                ),
              )
            ],
          ),
        ),
      ),
    );
  }
}