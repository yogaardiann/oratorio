import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

class ScanARPage extends StatelessWidget {
  const ScanARPage({super.key});

  @override
  Widget build(BuildContext context) {
    // ⚠️ HARDCODE ATAU AMBIL DARI QUERY SEBELUMNYA
    const int id = 1;

    final arUrl = Uri.parse(
      'https://unreveling-marilynn-nontheistical.ngrok-free.dev/mobile-ar/$id',
    );

    Future.microtask(() async {
      await launchUrl(
        arUrl,
        mode: LaunchMode.externalApplication,
      );
      if (context.mounted) Navigator.pop(context);
    });

    return const Scaffold(
      body: Center(
        child: CircularProgressIndicator(),
      ),
    );
  }
}
