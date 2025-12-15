import 'package:flutter/material.dart';
import 'login.dart';
import 'register.dart';
import 'dashboard.dart';
import 'ARGalleryPage.dart';
import 'ScanARPage.dart';
import 'GeneralScanPage.dart'; // <<< IMPORT BARU
import 'History.dart'; // Import HistoryPage

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Oratorio',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF004D40),
        ),
        useMaterial3: true,
      ),
      initialRoute: '/login',
      routes: {
        '/login': (_) => const LoginPage(),
        '/register': (_) => const RegisterPage(),
        // DashboardPage menerima arguments untuk data user dan redirect index
        '/dashboard': (context) => DashboardPage(argumentsData: ModalRoute.of(context)?.settings.arguments as Map<String, dynamic>?), 
        '/argallery': (_) => const ARGalleryPage(),
        '/scan': (_) => ScanARPage(), // Rute untuk Scan Kontekstual (Guide)
        '/generalscan': (_) => const GeneralScanPage(), // Rute Baru untuk Scan Umum
        // 🎯 PERBAIKAN: Menghapus passing arguments ke /history, karena history diakses dari dashboard
        '/history': (_) => const HistoryPage(), 
        // '/arview': (_) => const ARViewPage(),
      },
    );
  }
}