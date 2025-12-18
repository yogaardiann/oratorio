import 'dart:async';
import 'package:flutter/material.dart';
import 'package:camera/camera.dart'; 
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart'; 
// Wajib: Tambahkan package ini di pubspec.yaml
import 'package:model_viewer_plus/model_viewer_plus.dart'; 
// Wajib: Tambahkan package ini untuk meminta izin
import 'package:permission_handler/permission_handler.dart';
import 'ARGalleryPage.dart' show resolveApiBase; 

// --- BASE URL & COLORS ---
// Menggunakan IP yang konsisten dengan file Anda
const String kBaseUrl = 'http://172.20.10.2:5000'; 
const Color kPrimaryColor = Color(0xFF005954);
const Color kAccentColor = Color(0xFFC9E4E2);

// -------------------------------------------------------------------
// 🚀 GENERAL SCAN PAGE (Native Camera + Live AR Model Viewer)
// -------------------------------------------------------------------

class GeneralScanPage extends StatefulWidget {
  // Menerima data user dari dashboard untuk otentikasi/history
  final Map<String, dynamic>? userData;
  const GeneralScanPage({super.key, this.userData});

  @override
  State<GeneralScanPage> createState() => _GeneralScanPageState();
}

class _GeneralScanPageState extends State<GeneralScanPage> {
  // Logic Kamera Native
  CameraController? _cameraController;
  List<CameraDescription>? cameras;
  bool _isCameraInitialized = false;
  
  // Logic Scan AR
  bool _isScanning = false;
  bool _isModelFound = false;
  String _scanStatus = "Menunggu aktivasi kamera..."; // Pesan default diubah
  Timer? _timer;
  
  // Data AR yang Diambil dari API
  String? _jwtToken;
  int? _detectedId;
  String? _detectedDestinationName;
  String? _modelUrl; 
  String? _mindUrl;  

  @override
  void initState() {
    super.initState();
    // Memuat token dan inisialisasi kamera
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _getJwtToken();
      _initializeCamera();
    });
  }
  
  Future<void> _getJwtToken() async {
      final prefs = await SharedPreferences.getInstance();
      _jwtToken = prefs.getString('jwt_token');
  }

  // --- MENGAMBIL DETAIL FILE AR DARI FLASK API ---
  Future<bool> _fetchARDetails(int id) async {
      final apiUrl = '${resolveApiBase(kBaseUrl)}/api/wisata/$id';
      
      try {
          final response = await http.get(Uri.parse(apiUrl));
          
          if (response.statusCode == 200) {
              final data = json.decode(response.body);
              final resolvedBase = resolveApiBase(kBaseUrl);
              
              setState(() {
                  _detectedDestinationName = data['name'];
                  _modelUrl = '$resolvedBase/static/uploads/${data['glb_model']}';
                  _mindUrl = '$resolvedBase/static/uploads/${data['mind_file']}';
              });
              return true;
          } else {
              if(mounted) setState(() => _scanStatus = "Gagal memuat detail AR (Status: ${response.statusCode})");
              return false;
          }
      } catch (e) {
           if(mounted) setState(() => _scanStatus = "Error jaringan saat memuat detail AR: $e");
           return false;
      }
  }


  // --- INISIALISASI KAMERA BELAKANG DENGAN IZIN ---
  Future<void> _initializeCamera() async {
    setState(() => _scanStatus = "Meminta izin kamera...");

    // 🎯 KRITIS: Meminta izin kamera secara eksplisit
    var status = await Permission.camera.request();
    
    if (status.isDenied || status.isPermanentlyDenied) {
        if (mounted) setState(() => _scanStatus = "Akses kamera ditolak. Silakan berikan izin di pengaturan aplikasi.");
        return;
    }

    try {
      cameras ??= await availableCameras();
      
      if (cameras == null || cameras!.isEmpty) {
        if (mounted) setState(() => _scanStatus = "Error: Tidak ada kamera ditemukan.");
        return;
      }

      // Default ke kamera BELAKANG
      int backIndex = cameras!.indexWhere((c) => c.lensDirection == CameraLensDirection.back);
      int selectedIndex = backIndex != -1 ? backIndex : 0; 
      
      _cameraController = CameraController(
        cameras![selectedIndex],
        ResolutionPreset.medium, 
        enableAudio: false,
      );

      await _cameraController!.initialize();
      
      if (!mounted) return;
      setState(() {
        _isCameraInitialized = true;
        _scanStatus = "Kamera belakang aktif. Tekan Mulai Scan.";
      });
      
    } catch (e) {
      if (mounted) setState(() => _scanStatus = "Error inisialisasi kamera: $e");
    }
  }

  // --- LOGIKA SCAN AR (MEMULAI/MENGHENTIKAN) ---
  void _toggleScanning() {
    if (!_isCameraInitialized) {
      if (mounted) setState(() => _scanStatus = "Kamera belum siap.");
      return;
    }
    if (_jwtToken == null) {
      if (mounted) setState(() => _scanStatus = "Autentikasi diperlukan. Mohon login ulang.");
      return;
    }
    
    _isScanning = !_isScanning;
    
    if (_isScanning) {
      // Mengatur ulang status saat memulai scan baru
      setState(() {
          _isModelFound = false;
          _detectedId = null;
          _modelUrl = null;
      });

      _timer = Timer.periodic(const Duration(milliseconds: 1500), (timer) {
        _captureAndProcessFrame();
      });
      setState(() => _scanStatus = "Scanning marker (General Mode)...");
    } else {
      _timer?.cancel();
      setState(() => _scanStatus = "Scan dihentikan.");
    }
  }

  // --- LOGIKA PENGOLAHAN FRAME (SIMULASI DETEKSI MARKER) ---
  Future<void> _captureAndProcessFrame() async {
    if (!_isScanning || _cameraController == null || !_cameraController!.value.isInitialized) return;

    try {
      // 1. Ambil Gambar (Simulasi)
      // final XFile imageFile = await _cameraController!.takePicture();
      
      // --- LOGIKA DETEKSI MARKER (SIMULASI) ---
      // General Scan: Bisa mendeteksi ID apapun (kita simulasikan ID 1 atau 2)
      final detectedId = (_timer!.tick % 5 == 0) ? 1 : 0; // Simulasi ID 1 (misal Borobudur)
      
      if (detectedId != 0) { 
          _timer?.cancel();
          _isScanning = false;
          _postHistoryAndDisplayAR(detectedId);
          return;
      } else {
          if (mounted) setState(() => _scanStatus = "Scanning... Arahkan kamera ke marker yang valid.");
      }

    } catch (e) {
      print("Error capturing frame: $e");
    }
  }
  
  // --- POST HISTORY DAN TAMPILKAN AR MODEL ---
  Future<void> _postHistoryAndDisplayAR(int detectedId) async {
    if (_jwtToken == null) {
      if (mounted) setState(() => _scanStatus = 'Autentikasi hilang.');
      return;
    }
    
    // 1. Fetch data model (GLB, mind file) dari Flask
    final success = await _fetchARDetails(detectedId);

    if (success) {
      // Hentikan scanning dan set status model ditemukan
      setState(() {
          _isScanning = false;
          _isModelFound = true; // 🎯 Set Model Ditemukan
          _detectedId = detectedId;
      });

      // 2. Catat riwayat
      try {
        await http.post(
            Uri.parse('${resolveApiBase(kBaseUrl)}/api/history/auth'), 
            headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer $_jwtToken'}, 
            body: json.encode({
                'destination_id': detectedId, 
                'action': 'general_scan_success',
                'model_type': 'Native_General_AR', 
                'duration_seconds': 5,
                'ended_at': DateTime.now().toUtc().toIso8601String(),
            }),
        ).timeout(const Duration(seconds: 5));
        
        if (mounted) {
            setState(() => _scanStatus = "Marker DITEMUKAN! Riwayat dicatat.");
        }
      } catch (e) {
         if (mounted) setState(() => _scanStatus = 'Marker Ditemukan, tapi gagal catat riwayat.');
      }
      
    } else {
      if (mounted) setState(() {
          _scanStatus = 'Marker ditemukan, tetapi gagal memuat model AR.';
          _isModelFound = false;
      });
    }
  }


  @override
  void dispose() {
    _cameraController?.dispose();
    _timer?.cancel();
    super.dispose();
  }

  // --- WIDGET AR MODEL VIEWER (Menggunakan MODEL_VIEWER_PLUS) ---
  Widget _buildARModelViewer() {
    final modelName = _detectedDestinationName ?? 'Model 3D';
    
    return Stack(
      children: [
        // 1. Model 3D Viewer - DIBUNGKUS SIZEDBOX UNTUK KONTROL UKURAN
        SizedBox.expand( 
            child: ModelViewer(
              src: _modelUrl!, 
              alt: modelName,
              // Properti 3D Interaktif
              ar: true, 
              cameraControls: true, 
              autoPlay: true, 
              autoRotate: true,
              shadowIntensity: 1,
              loading: Loading.eager,
              iosSrc: _modelUrl, 
            ),
        ),
        
        // 2. Overlay Status
        Positioned(
          top: 50,
          left: 20,
          right: 20,
          child: Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: kPrimaryColor.withOpacity(0.9),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'AR VIEW AKTIF: ${modelName}',
                  style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 5),
                Text('Scan ID: ${_detectedId}', style: const TextStyle(color: kAccentColor, fontSize: 12)),
              ],
            ),
          ),
        ),

        // 3. Tombol Kembali
        Positioned(
          bottom: 40,
          left: 20,
          right: 20,
          child: ElevatedButton.icon(
            onPressed: () {
              // Kembali ke Dashboard Index 0 (Home) atau Index 3 (History)
              Navigator.pushNamedAndRemoveUntil(context, '/dashboard', (route) => false, arguments: {'selectedIndex': 0});
            },
            icon: const Icon(Icons.close, color: kPrimaryColor),
            label: const Text('Tutup AR View', style: TextStyle(color: kPrimaryColor)),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 15),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    
    // Cek loading status
    if (!_isCameraInitialized) {
      return Scaffold(
        backgroundColor: Colors.black,
        body: Center(child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
                const CircularProgressIndicator(color: kPrimaryColor),
                const SizedBox(height: 10),
                Text(_scanStatus, style: const TextStyle(color: Colors.white70)),
            ],
        )),
      );
    }
    
    // 🎯 LOGIKA SWITCH VIEW UTAMA
    if (_isModelFound && _modelUrl != null) {
      return _buildARModelViewer(); // Tampilkan Model AR jika ditemukan
    }
    
    // Tampilan Kamera (Camera Preview)
    final Widget cameraView = SizedBox(
      height: MediaQuery.of(context).size.height,
      width: MediaQuery.of(context).size.width,
      child: AspectRatio( 
          aspectRatio: _cameraController!.value.aspectRatio,
          child: CameraPreview(_cameraController!),
      ),
    );

    return Scaffold(
      body: Stack(
        children: [
          // 1. Tampilan Kamera
          cameraView,
          
          // 2. Overlay Scanning Status & Tombol (Hanya tampil saat Scanning)
          Positioned(
            top: 50,
            left: 20,
            right: 20,
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.black.withOpacity(0.6),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(_scanStatus, style: const TextStyle(color: Colors.white, fontSize: 16)),
                  if (_isScanning) const LinearProgressIndicator(color: Colors.greenAccent),
                ],
              ),
            ),
          ),
            
          // 3. Tombol Mulai/Stop Scanning
          Positioned(
            bottom: 40,
            left: 20,
            right: 20,
            child: ElevatedButton.icon(
              onPressed: _toggleScanning,
              icon: Icon(_isScanning ? Icons.stop : Icons.play_arrow, color: Colors.white),
              label: Text(_isScanning ? "Stop Scan Umum" : "Mulai Scan Umum", style: const TextStyle(color: Colors.white)),
              style: ElevatedButton.styleFrom(
                backgroundColor: _isScanning ? Colors.red : kPrimaryColor,
                padding: const EdgeInsets.symmetric(vertical: 15),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ),
        ],
      ),
    );
  }
}