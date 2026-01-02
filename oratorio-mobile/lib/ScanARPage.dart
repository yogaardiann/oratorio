import 'dart:async';
import 'package:flutter/material.dart';
import 'package:camera/camera.dart'; // Wajib: Pastikan package ini ada di pubspec.yaml
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart'; 
// Tambahkan import model_viewer_plus (Harus ada di pubspec.yaml)
import 'package:model_viewer_plus/model_viewer_plus.dart'; 
// Import dari ARGalleryPage (Asumsi file ini ada di folder yang sama)
import 'ARGalleryPage.dart' show ScanArguments, resolveApiBase; 

// --- BASE URL & COLORS ---
const String kBaseUrl = 'http://172.20.10.2:5000'; 
const Color kPrimaryColor = Color(0xFF005954);
const Color kAccentColor = Color(0xFFC9E4E2);

// -------------------------------------------------------------------
// 🚀 SCAN AR PAGE (Native Camera Implementation)
// -------------------------------------------------------------------

class ScanARPage extends StatefulWidget {
  // Terima argumen (ScanArguments) dari ARGalleryPage
  const ScanARPage({super.key});

  @override
  State<ScanARPage> createState() => _ScanARPageState();
}

class _ScanARPageState extends State<ScanARPage> {
  // Logic Kamera Native
  CameraController? _cameraController;
  List<CameraDescription>? cameras;
  int _selectedCameraIndex = 0; 
  bool _isCameraInitialized = false;
  
  // Logic Scan AR
  bool _isScanning = false;
  bool _isModelFound = false;
  String _scanStatus = "Menunggu inisialisasi kamera...";
  Timer? _timer;
  
  // Data AR yang Diambil dari API
  Map<String, dynamic> _destinationData = {};
  String? _jwtToken;
  String? _modelUrl; // URL File GLB (dari API)
  String? _mindUrl;  // URL File MIND (dari API)

  @override
  void initState() {
    super.initState();
    // Memuat argumen dan inisialisasi kamera
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadArguments();
      _fetchARDetails(); // 🎯 Ambil detail AR (Model/Mind File)
      _initializeCamera();
    });
  }

  void _loadArguments() {
    // Memastikan argumen dimuat dengan benar dari rute '/scan'
    final args = ModalRoute.of(context)?.settings.arguments;
    if (args != null && args is ScanArguments) {
      _destinationData = args.destinationData;
      _jwtToken = args.jwtToken;
    }
  }
  
  // --- MENGAMBIL DETAIL FILE AR DARI FLASK API ---
  Future<void> _fetchARDetails() async {
      final id = _destinationData['id'];
      if (id == null) return;
      
      final apiUrl = '${resolveApiBase(kBaseUrl)}/api/wisata/$id';
      
      try {
          final response = await http.get(Uri.parse(apiUrl));
          
          if (response.statusCode == 200) {
              final data = json.decode(response.body);
              final resolvedBase = resolveApiBase(kBaseUrl);
              
              setState(() {
                  // Pastikan model_viewer dapat mengakses model 3D
                  _modelUrl = '$resolvedBase/static/uploads/${data['glb_model']}';
                  _mindUrl = '$resolvedBase/static/uploads/${data['mind_file']}';
              });
              debugPrint('Model URL: $_modelUrl');
              
          } else {
              if(mounted) setState(() => _scanStatus = "Gagal memuat detail AR (Status: ${response.statusCode})");
          }
      } catch (e) {
           if(mounted) setState(() => _scanStatus = "Error jaringan saat memuat detail AR: $e");
      }
  }


  // --- INISIALISASI KAMERA BELAKANG ---
  Future<void> _initializeCamera() async {
    try {
      cameras ??= await availableCameras();
      
      if (cameras == null || cameras!.isEmpty) {
        if (mounted) setState(() => _scanStatus = "Error: Tidak ada kamera ditemukan.");
        return;
      }

      // Mencari index kamera BELAKANG
      int backIndex = cameras!.indexWhere((c) => c.lensDirection == CameraLensDirection.back);
      _selectedCameraIndex = backIndex != -1 ? backIndex : 0; 
      
      _cameraController = CameraController(
        cameras![_selectedCameraIndex],
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
    
    _isScanning = !_isScanning;
    
    if (_isScanning) {
      // Mengatur ulang status saat memulai scan baru
      setState(() {
          _isModelFound = false;
      });

      _timer = Timer.periodic(const Duration(milliseconds: 1000), (timer) {
        _captureAndProcessFrame();
      });
      setState(() => _scanStatus = "Scanning marker...");
    } else {
      _timer?.cancel();
      setState(() => _scanStatus = "Scan dihentikan.");
    }
  }

  // --- LOGIKA PENGOLAHAN FRAME (SIMULASI DETEKSI MARKER) ---
  Future<void> _captureAndProcessFrame() async {
    if (!_isScanning || _cameraController == null || !_cameraController!.value.isInitialized) return;

    try {
      // Simulasi: Marker Ditemukan 
      final destinationId = _destinationData['id'] ?? 0;
      
      // Simulasi Deteksi Sukses setelah 3 frame (3 detik)
      if (_timer!.tick % 3 == 0) { 
          // Marker KONTEKSTUAL ditemukan!
          _timer?.cancel();
          _postHistoryAndDisplayAR(destinationId);
          return;

      } else {
          // Marker belum ditemukan
          if (mounted) setState(() => _scanStatus = "Scanning... Arahkan kamera ke marker: ${_destinationData['name']}");
      }

    } catch (e) {
      print("Error capturing/sending frame: $e");
    }
  }
  
  // --- POST HISTORY DAN TAMPILKAN AR MODEL ---
  Future<void> _postHistoryAndDisplayAR(int detectedId) async {
    if (_jwtToken == null) {
      if (mounted) setState(() => _scanStatus = 'Autentikasi hilang.');
      return;
    }
    
    // Hentikan scanning dan set status model ditemukan
    setState(() {
        _isScanning = false;
        _isModelFound = true; // 🎯 Set Model Ditemukan
    });

    try {
      final response = await http.post(
          Uri.parse('${resolveApiBase(kBaseUrl)}/api/history/auth'), 
          headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer $_jwtToken'}, 
          body: json.encode({
              'destination_id': detectedId, 
              'action': 'native_scan_success',
              'model_type': 'Native_Camera', 
              'duration_seconds': 5,
              'ended_at': DateTime.now().toUtc().toIso8601String(),
          }),
      ).timeout(const Duration(seconds: 5));
      
      if (mounted) {
        if (response.statusCode == 201) {
            setState(() => _scanStatus = "Marker DITEMUKAN! Riwayat dicatat.");
        } else {
            setState(() => _scanStatus = "Marker DITEMUKAN, tapi gagal catat riwayat (Status: ${response.statusCode})");
        }
      }

    } catch (e) {
      if (mounted) setState(() => _scanStatus = 'Error mencatat riwayat: $e');
    }
  }


  @override
  void dispose() {
    _cameraController?.dispose();
    _timer?.cancel();
    super.dispose();
  }

  // --- WIDGET AR MODEL VIEWER (IMPLEMENTASI MODEL_VIEWER_PLUS) ---
  Widget _buildARModelViewer() {
    final modelName = _destinationData['name'] ?? 'Model 3D';
    
    // PENTING: model_viewer_plus menggunakan WebView untuk menampilkan model 3D.
    // Pastikan koneksi ke _modelUrl stabil dan file GLB valid.
    return Stack(
      children: [
        // 1. Model 3D Viewer - DIBUNGKUS SIZEDBOX UNTUK KONTROL UKURAN
        SizedBox.expand( 
            child: ModelViewer(
              // URL model GLB dari Flask
              src: _modelUrl!, 
              alt: modelName,
              // Properti 3D Interaktif
              ar: true, // Mengaktifkan mode AR (membutuhkan ARCore/ARKit)
              cameraControls: true, // Memungkinkan rotasi/zoom oleh pengguna
              autoPlay: true, // Auto-animate model
              autoRotate: true,
              shadowIntensity: 1,
              // 🎯 PERBAIKAN: Menghapus properti style yang salah
              // width: double.infinity, 
              // height: double.infinity,
              // Ganti dengan style yang valid (atau hapus)
              // style: const TextStyle(width: double.infinity, height: double.infinity),
              
              // Fallback UI jika model gagal dimuat
              loading: Loading.eager,
              iosSrc: _modelUrl, // Gunakan model yang sama untuk iOS
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
                Text(
                  'Model File: ${_modelUrl!.substring(_modelUrl!.lastIndexOf('/') + 1)}',
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: kAccentColor, fontSize: 12),
                ),
                Text(
                  'Marker File: ${_mindUrl!.substring(_mindUrl!.lastIndexOf('/') + 1)}',
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: kAccentColor, fontSize: 12),
                ),
                Text(
                  'Arahkan HP Anda untuk melihat AR Model.',
                  style: const TextStyle(color: kAccentColor, fontSize: 12),
                ),
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
              Navigator.pop(context); // Kembali ke Gallery
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
    if (_destinationData.isEmpty) {
      return const Scaffold(body: Center(child: Text('Error: Data Destinasi Hilang (Scan Kontekstual).')));
    }
    
    final destinationName = _destinationData['name'] ?? 'Destinasi AR';
    final markerImage = _destinationData['marker_image'] ?? '';
    final imageUrl = markerImage.isNotEmpty ? '${resolveApiBase(kBaseUrl)}/static/uploads/$markerImage' : null;
    
    // Cek loading status (termasuk loading detail AR)
    if (!_isCameraInitialized || _modelUrl == null) {
      return Scaffold(
        backgroundColor: Colors.black,
        body: Center(child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
                const CircularProgressIndicator(color: kPrimaryColor),
                const SizedBox(height: 10),
                Text(_scanStatus, style: const TextStyle(color: Colors.white70)),
                if (_modelUrl == null)
                    const Text('Memuat URL Model AR...', style: TextStyle(color: Colors.white70, fontSize: 12)),
            ],
        )),
      );
    }
    
    // 🎯 LOGIKA SWITCH VIEW UTAMA
    final Widget cameraView = SizedBox(
      height: MediaQuery.of(context).size.height,
      width: MediaQuery.of(context).size.width,
      child: CameraPreview(_cameraController!),
    );

    return Scaffold(
      appBar: AppBar(
        title: Text(_isModelFound ? 'AR View Selesai' : 'Scan Guide: $destinationName'),
        backgroundColor: kPrimaryColor,
        foregroundColor: Colors.white,
      ),
      body: Stack(
        children: [
          // 1. Tampilan Utama: Camera Preview atau AR Model Viewer
          _isModelFound ? _buildARModelViewer() : cameraView,
          
          // 2. Overlay Scanning Status & Guide (Hanya tampil saat TIDAK ModelFound)
          if (!_isModelFound) ...[
            Positioned(
              top: 50,
              left: 20,
              right: 20,
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.black.withOpacity(0.6),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: _isScanning ? Colors.greenAccent : Colors.white),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(_scanStatus, style: const TextStyle(color: Colors.white, fontSize: 16)),
                    const SizedBox(height: 8),
                    Text('Target: ${_destinationData['name']} (ID: ${_destinationData['id']})', style: const TextStyle(color: Colors.white70)),
                    if (_isScanning) const LinearProgressIndicator(color: Colors.greenAccent),
                  ],
                ),
              ),
            ),
            
            // 3. Overlay Marker Mini-Guide
            Positioned(
              bottom: 20,
              right: 20,
              child: Tooltip(
                  message: "Target marker yang harus dipindai",
                  child: Container(
                      width: 100,
                      height: 100,
                      decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: kPrimaryColor, width: 3),
                          boxShadow: const [BoxShadow(color: Colors.black26, blurRadius: 4)]
                      ),
                      child: imageUrl != null 
                          ? Image.network(imageUrl, fit: BoxFit.contain, errorBuilder: (c, e, s) => const Center(child: Icon(Icons.broken_image, size: 30)))
                          : const Center(child: Text("Marker", style: TextStyle(fontSize: 10))),
                  ),
              ),
            ),
            
            // 4. Tombol Stop Scanning
            Positioned(
              bottom: 20,
              left: 20,
              child: ElevatedButton.icon(
                onPressed: _toggleScanning,
                icon: Icon(_isScanning ? Icons.stop : Icons.play_arrow, color: Colors.white),
                label: Text(_isScanning ? "Stop Scan" : "Mulai Scan", style: const TextStyle(color: Colors.white)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: _isScanning ? Colors.red : kPrimaryColor,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
            ),
          ]
        ],
      ),
    );
  }
}