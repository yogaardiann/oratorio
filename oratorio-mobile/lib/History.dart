// HistoryPage.dart (Implementasi History User)

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:intl/intl.dart'; // Untuk format tanggal/waktu

// --- BASE URL ---
const String kBaseUrl = 'http://192.168.110.100:5000'; 

class HistoryPage extends StatefulWidget {
  // Menerima data user dari Dashboard (Diperlukan untuk mengambil history spesifik)
  final Map<String, dynamic>? userData; 
  const HistoryPage({super.key, this.userData});

  @override
  State<HistoryPage> createState() => _HistoryPageState();
}

class _HistoryPageState extends State<HistoryPage> {
  List<dynamic> items = [];
  bool loading = true;
  String? errorMessage;

  @override
  void initState() {
    super.initState();
    _fetchHistory();
  }

  // --- FUNGSI MENGAMBIL HISTORY DARI FLASK ---
  Future<void> _fetchHistory() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token');
    final userId = widget.userData?['user_id'];
    
    if (token == null || userId == null) {
      setState(() {
        loading = false;
        errorMessage = 'Autentikasi diperlukan atau ID pengguna hilang.';
      });
      return;
    }

    setState(() {
      loading = true;
      errorMessage = null;
    });

    try {
      // Menggunakan endpoint /api/history/user/<user_id> (di Flask)
      final url = Uri.parse('$kBaseUrl/api/history/user/$userId'); 
      
      final response = await http.get(
        url,
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body) as List<dynamic>;
        // Sort history (Terbaru di atas, seperti di history.jsx)
        data.sort((a, b) => b['started_at'].compareTo(a['started_at'])); 
        setState(() {
          items = data;
          loading = false;
        });
      } else if (response.statusCode == 401 || response.statusCode == 403) {
        setState(() {
          loading = false;
          errorMessage = 'Akses ditolak (401/403). Mohon login ulang.';
        });
      } else {
        final body = json.decode(response.body);
        setState(() {
          loading = false;
          errorMessage = body['message'] ?? 'Gagal memuat riwayat. Status: ${response.statusCode}';
        });
      }
    } catch (e) {
      setState(() {
        loading = false;
        errorMessage = 'Terjadi kesalahan jaringan: ${e.toString()}';
      });
    }
  }

  // --- FORMATTER ---
  String _formatDateTime(String? dateTimeStr) {
    if (dateTimeStr == null) return '-';
    try {
      final dateTime = DateTime.parse(dateTimeStr).toLocal();
      return DateFormat('dd MMM yyyy, HH:mm').format(dateTime);
    } catch (_) {
      return dateTimeStr.substring(0, 10);
    }
  }

  // --- FORMAT DURATION (Menggunakan logic history.jsx) ---
  String _formatDuration(dynamic seconds) {
    if (seconds == null) return '-';
    int sec = int.tryParse(seconds.toString()) ?? 0;
    if (sec <= 0) return '-';
    
    final m = sec ~/ 60;
    final s = sec % 60;
    return m > 0 ? '${m}m ${s}s' : '${s}s';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Riwayat Kunjungan'),
        backgroundColor: const Color(0xFF005954),
        foregroundColor: Colors.white,
      ),
      body: RefreshIndicator(
        onRefresh: _fetchHistory,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Jejak petualangan digital Anda.',
                style: TextStyle(color: Colors.grey, fontSize: 16),
              ),
              const SizedBox(height: 20),

              if (loading)
                const Center(child: CircularProgressIndicator())
              else if (errorMessage != null)
                Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24.0),
                    child: Text('Error: $errorMessage', style: const TextStyle(color: Colors.red)),
                  ),
                )
              else if (items.isEmpty)
                const Center(
                  child: Padding(
                    padding: EdgeInsets.all(24.0),
                    child: Text('Belum ada riwayat kunjungan.', style: TextStyle(color: Colors.grey)),
                  ),
                )
              else
                // --- Daftar Riwayat (Mengikuti Tampilan history.jsx) ---
                ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: items.length,
                  itemBuilder: (context, index) {
                    final h = items[index];
                    final isNewest = index == 0;
                    
                    return GestureDetector(
                      onTap: () {
                        // Navigasi ke ScanARPage (kontekstual) jika ID tersedia
                        if (h['destination_id'] != null) {
                            // Anda perlu mengambil data destinasi lengkap di sini 
                            // atau cukup navigasi ke detail AR jika memungkinkan.
                            // Untuk saat ini, kita akan navigasi ke ScanARPage.
                            ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Navigasi ke Destinasi ID: ${h['destination_id']}')));
                        }
                      },
                      child: Card(
                        margin: const EdgeInsets.only(bottom: 12),
                        elevation: isNewest ? 4 : 1,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                          side: isNewest ? const BorderSide(color: Color(0xFF005954), width: 2) : BorderSide.none,
                        ),
                        child: Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Flexible(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        Text(
                                          h['destination_name'] ?? 'Destinasi Tidak Dikenal',
                                          style: TextStyle(
                                            fontSize: 16,
                                            fontWeight: FontWeight.bold,
                                            color: isNewest ? const Color(0xFF005954) : Colors.black87,
                                          ),
                                        ),
                                        if (isNewest)
                                          const Padding(
                                            padding: EdgeInsets.only(left: 8.0),
                                            child: Chip(
                                              label: Text('Terbaru', style: TextStyle(fontSize: 10, color: Colors.white)),
                                              backgroundColor: Color(0xFF005954),
                                              padding: EdgeInsets.zero,
                                            ),
                                          ),
                                      ],
                                    ),
                                    const SizedBox(height: 4),
                                    Text('Mode: ${h['model_type'] ?? '-'}', style: const TextStyle(fontSize: 12, color: Colors.grey)),
                                    Text('Aksi: ${h['action'] ?? '-'}', style: const TextStyle(fontSize: 12, color: Colors.grey)),
                                    
                                  ],
                                ),
                              ),
                              
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.end,
                                children: [
                                  Text(
                                    _formatDateTime(h['started_at']),
                                    style: const TextStyle(fontSize: 12, color: Colors.black54, fontWeight: FontWeight.w500),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    'Durasi: ${_formatDuration(h['duration_seconds'])}',
                                    style: const TextStyle(fontSize: 11, color: Colors.black45),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ),
                    );
                  },
                ),
            ],
          ),
        ),
      ),
    );
  }
}