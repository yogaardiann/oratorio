// ARWebViewPage.dart

import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'ARGalleryPage.dart' show ScanArguments, resolveApiBase; 
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;


// --- BASE URL ---
// IP 192.168.1.12 harus bisa diakses HP dan laptop
const String kBaseUrl = 'http://192.168.1.12:5000'; 
const Color kPrimaryColor = Color(0xFF005954);

class ARWebViewPage extends StatefulWidget {
  final ScanArguments arguments;
  const ARWebViewPage({super.key, required this.arguments});

  @override
  State<ARWebViewPage> createState() => _ARWebViewPageState();
}

class _ARWebViewPageState extends State<ARWebViewPage> {
  late final WebViewController _controller;
  late final int _destinationId;
  late final String _token;
  late final DateTime _startedAt;
  
  bool _isLoading = true;
  Timer? _durationTimer;
  int _durationSeconds = 0;


  @override
  void initState() {
    super.initState();
    _destinationId = widget.arguments.destinationData['id'] ?? 0;
    _token = widget.arguments.jwtToken ?? '';
    _startedAt = DateTime.now();

    // 1. Tentukan URL MindAR
    // URL ini harus menuju ke MobileARView.jsx yang sudah dicompile dan di-host
    // Menggunakan IP lokal agar HP bisa mengaksesnya.
    final webUrl = 'http://192.168.1.12:3000/mobile-ar/$_destinationId';
    
    // 2. Inisialisasi WebView Controller
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0x00000000))
      ..setNavigationDelegate(
        NavigationDelegate(
          onProgress: (int progress) {
            debugPrint('WebView loading: $progress%');
            if (progress == 100 && _isLoading) {
              setState(() => _isLoading = false);
              // Mulai mencatat durasi begitu halaman dimuat
              _startDurationTimer(); 
            }
          },
          onPageStarted: (String url) {
            debugPrint('Page started loading: $url');
          },
          onPageFinished: (String url) {
            debugPrint('Page finished loading: $url');
          },
          onWebResourceError: (WebResourceError error) {
            debugPrint('Web resource error: ${error.description}');
            if (mounted) {
              ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error memuat AR: ${error.description}')));
            }
            setState(() => _isLoading = false);
          },
        ),
      )
      ..loadRequest(Uri.parse(webUrl));
  }

  // --- LOGIKA DURASI & HISTORY END ---
  void _startDurationTimer() {
    _durationTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      setState(() {
        _durationSeconds++;
      });
    });
  }

  Future<void> _postHistoryEnd() async {
    _durationTimer?.cancel();
    if (_token.isEmpty || _destinationId == 0) return;
    
    try {
      await http.post(
          Uri.parse('${resolveApiBase(kBaseUrl)}/api/history/auth'), 
          headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer $_token'}, 
          body: json.encode({
              'destination_id': _destinationId, 
              'action': 'scan_end', // Aksi penutupan
              'model_type': 'MindAR_Web', // Type: MindAR (dari WebView)
              'started_at': _startedAt.toUtc().toIso8601String(), // Waktu mulai
              'ended_at': DateTime.now().toUtc().toIso8601String(), // Waktu selesai
              'duration_seconds': _durationSeconds,
          }),
      ).timeout(const Duration(seconds: 5));
      debugPrint('History scan_end posted successfully. Duration: $_durationSeconds seconds.');
      
    } catch (e) {
      debugPrint('Error posting scan_end history: $e');
    }
  }

  @override
  void dispose() {
    _postHistoryEnd(); // Catat history saat halaman ditutup/dibuang
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('MindAR View (ID: $_destinationId)'),
        backgroundColor: kPrimaryColor,
        foregroundColor: Colors.white,
        actions: [
            Padding(
              padding: const EdgeInsets.only(right: 16.0),
              child: Center(
                  child: Text(
                      'Durasi: ${_durationSeconds}s', 
                      style: const TextStyle(fontWeight: FontWeight.bold)
                  )
              ),
            )
        ],
      ),
      body: Stack(
        children: [
          // WebView untuk menampilkan MindAR/A-Frame
          WebViewWidget(controller: _controller),
          
          if (_isLoading)
            const Center(
              child: CircularProgressIndicator(),
            ),
        ],
      ),
    );
  }
}