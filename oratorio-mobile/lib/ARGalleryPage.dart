import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:url_launcher/url_launcher.dart';

// ================= KONSTANTA =================
const Color kPrimaryColor = Color(0xFF005954);
const Color kAccentColor = Color(0xFFC9E4E2);

// ⚠️ WAJIB HTTPS (MindAR + Camera)
const String NGROK_BASE = 'https://arcelia-unpronounceable-decretively.ngrok-free.dev';
const String API_BASE = 'http://192.168.222.112:5000';

// =============================================

class ARGalleryPage extends StatefulWidget {
  const ARGalleryPage({super.key});

  @override
  State<ARGalleryPage> createState() => _ARGalleryPageState();
}

class _ARGalleryPageState extends State<ARGalleryPage> {
  List<dynamic> items = [];
  bool loading = true;
  String? error;

  Future<String?> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('jwt_token');
  }

  @override
  void initState() {
    super.initState();
    _fetchItems();
  }

  Future<void> _fetchItems() async {
    setState(() {
      loading = true;
      error = null;
    });

    final token = await _getToken();
    if (token == null) {
      setState(() {
        loading = false;
        error = 'Token tidak ditemukan. Silakan login ulang.';
      });
      return;
    }

    try {
      final res = await http.get(
        Uri.parse('$API_BASE/api/wisata'),
        headers: {
          'Authorization': 'Bearer $token',
        },
      );

      if (res.statusCode == 200) {
        setState(() {
          items = json.decode(res.body);
          loading = false;
        });
      } else {
        setState(() {
          loading = false;
          error = 'Gagal memuat data (${res.statusCode})';
        });
      }
    } catch (e) {
      setState(() {
        loading = false;
        error = e.toString();
      });
    }
  }

  // ================== INI KUNCI UTAMA ==================
  Future<void> _startAR(Map<String, dynamic> item) async {
    final token = await _getToken();
    final id = item['id'];

    // 1️⃣ POST HISTORY (opsional, tapi kamu pakai)
    try {
      await http.post(
        Uri.parse('$API_BASE/api/history/auth'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: json.encode({
          'destination_id': id,
          'action': 'scan_start',
          'model_type': 'AR',
        }),
      );
    } catch (_) {
      // sengaja diabaikan, jangan ganggu UX
    }

    // 2️⃣ OPEN CHROME (INI YANG MEMBUAT KAMERA JALAN)
    final arUrl = Uri.parse('$NGROK_BASE/mobile-ar/$id');

    final ok = await launchUrl(
      arUrl,
      mode: LaunchMode.externalApplication, // ⬅️ WAJIB
    );

    if (!ok && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Gagal membuka AR di browser')),
      );
    }
  }
  // =====================================================

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Galeri AR'),
        backgroundColor: kPrimaryColor,
      ),
      body: loading
          ? const Center(child: CircularProgressIndicator())
          : error != null
              ? Center(child: Text(error!, style: const TextStyle(color: Colors.red)))
              : GridView.builder(
                  padding: const EdgeInsets.all(16),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    crossAxisSpacing: 16,
                    mainAxisSpacing: 16,
                    childAspectRatio: 0.75,
                  ),
                  itemCount: items.length,
                  itemBuilder: (context, i) {
                    final item = items[i];
                    final imgUrl =
                        '$API_BASE/static/uploads/${item['marker_image']}';

                    return Card(
                      elevation: 6,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Column(
                        children: [
                          Expanded(
                            child: Image.network(
                              imgUrl,
                              fit: BoxFit.cover,
                              errorBuilder: (_, __, ___) =>
                                  const Icon(Icons.broken_image),
                            ),
                          ),
                          Padding(
                            padding: const EdgeInsets.all(12),
                            child: Column(
                              children: [
                                Text(
                                  item['name'] ?? '',
                                  style: const TextStyle(
                                      fontWeight: FontWeight.bold),
                                ),
                                const SizedBox(height: 8),
                                ElevatedButton(
                                  onPressed: () => _startAR(item),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: kPrimaryColor,
                                  ),
                                  child: const Text('Mulai AR Experience'),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                ),
    );
  }
}
