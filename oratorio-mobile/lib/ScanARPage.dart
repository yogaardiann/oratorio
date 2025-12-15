import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

const Color kPrimary = Color(0xFF004D40);
const String BASE_URL = 'http://192.168.110.100:5000';

class ScanARPage extends StatefulWidget {
  @override
  State<ScanARPage> createState() => _ScanARPageState();
}

class _ScanARPageState extends State<ScanARPage> {
  bool _isScanning = false;
  String _status = 'Siap memindai marker AR';

  Map<String, dynamic>? user;
  int? destinationId;

  @override
  void initState() {
    super.initState();
    _recordHistory('scan_start');
  }

  @override
  void dispose() {
    _recordHistory('scan_end');
    super.dispose();
  }

  Future<void> _recordHistory(String action) async {
    try {
      await http.post(
        Uri.parse('$BASE_URL/api/history'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          "user_id": user?['user_id'],
          "user_email": user?['email'],
          "destination_id": destinationId,
          "action": action,
          "model_type": "AR",
        }),
      );
    } catch (_) {}
  }

  void _startScan() async {
    setState(() {
      _isScanning = true;
      _status = 'Memindai marker...';
    });

    await Future.delayed(const Duration(seconds: 3));

    setState(() {
      _isScanning = false;
      _status = 'Marker terdeteksi. Membuka AR View...';
    });

    Navigator.pushNamed(context, '/arview');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Scan AR'),
        backgroundColor: kPrimary,
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 280,
              height: 380,
              decoration: BoxDecoration(
                color: Colors.black,
                borderRadius: BorderRadius.circular(16),
              ),
              child: const Icon(Icons.camera_alt, color: Colors.white70, size: 80),
            ),
            const SizedBox(height: 30),
            Text(_status, textAlign: TextAlign.center),
            const SizedBox(height: 20),
            _isScanning
                ? const CircularProgressIndicator()
                : ElevatedButton(
                    onPressed: _startScan,
                    child: const Text('Mulai Scan'),
                  ),
          ],
        ),
      ),
    );
  }
}
