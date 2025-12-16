import 'package:flutter/material.dart';
import 'login.dart';
import 'register.dart';
import 'dashboard.dart';
import 'ARGalleryPage.dart';
import 'ScanARPage.dart';
import 'GeneralScanPage.dart';
import 'History.dart';
import 'profile.dart'; // Pastikan ProfilePage di-import
// Tidak perlu import ARViewPage karena kita menggunakan ScanARPage

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
        // Rute untuk Scan Kontekstual (Guide)
        '/scan': (context) {
          final args = ModalRoute.of(context)?.settings.arguments;
          // Perlu casting yang aman di sini, namun ScanARPage diimplementasikan tanpa arguments
          // di constructor. Kita menggunakan ModalRoute.of(context) di dalam ScanARPage.
          return const ScanARPage(); 
        }, 
        // Rute untuk Scan Umum (General)
        '/generalscan': (context) => const GeneralScanPage(), 
        // Rute History
        '/history': (_) => const HistoryPage(), 
      },
    );
  }
}