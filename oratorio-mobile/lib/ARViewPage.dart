import 'package:flutter/material.dart';
import 'ARGalleryPage.dart';

class ARViewPage extends StatelessWidget {
  const ARViewPage({super.key});

  @override
  Widget build(BuildContext context) {
    final args = ModalRoute.of(context)?.settings.arguments;

    final Map<String, dynamic> item =
        args is ScanArguments ? args.destinationData : {};

    return Scaffold(
      appBar: AppBar(
        title: Text(item['name'] ?? 'AR Viewer'),
        backgroundColor: const Color(0xFF005954),
      ),
      body: Center(
        child: Text(
          'AR View Placeholder\n${item['name'] ?? ''}',
          textAlign: TextAlign.center,
        ),
      ),
    );
  }
}
