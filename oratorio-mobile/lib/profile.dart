import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart'; 

// --- BASE URL ---
// 🎯 PASTIKAN IP INI SESUAI DENGAN IP FLASK ANDA SAAT INI
// Mengganti dari 192.168.110.100 (lama) ke 192.168.1.28 (berdasarkan log Anda)
const String kBaseUrl = 'http://172.20.10.2:5000'; 
const Color kPrimaryColor = Color(0xFF004D40); // Warna utama

class ProfilePage extends StatefulWidget {
  final Map<String, dynamic>? userData; 
  const ProfilePage({super.key, this.userData}); 

  @override
  _ProfilePageState createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  // Mapping untuk mengaktifkan mode edit
  // Gunakan key yang sama dengan kolom DB/API: 'name', 'phone', 'hometown'
  Map<String, bool> editMode = {
    'name': false, 
    'phone': false,
    'hometown': false,
  };

  Map<String, dynamic> currentUser = {}; // Data yang sudah tersimpan di DB
  Map<String, dynamic> formData = {};    // Data yang sedang diedit (draft)
  final Map<String, TextEditingController> _controllers = {};

  bool isLoading = true;
  String errorMessage = '';
  
  final String _apiUrl = '$kBaseUrl/api/users/profile'; 

  @override
  void initState() {
    super.initState();
    for (var key in editMode.keys) {
      _controllers[key] = TextEditingController();
    }
    fetchUserProfile();
  }

  @override
  void dispose() {
    _controllers.values.forEach((controller) => controller.dispose());
    super.dispose();
  }

  // --- FUNGSI MENGAMBIL DATA PROFILE (GET) ---
  Future<void> fetchUserProfile() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token');
    
    if (token == null) {
      setState(() { isLoading = false; errorMessage = 'Token tidak ditemukan. Silakan login ulang.'; });
      return;
    }
    
    setState(() { isLoading = true; errorMessage = ''; });

    try {
      final response = await http.get(
        Uri.parse(_apiUrl),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      ).timeout(const Duration(seconds: 10));

      // 🎯 Penanganan error 404/HTML (seperti yang terjadi di log)
      if (response.statusCode != 200) {
        String msg = 'Gagal memuat profil (Status: ${response.statusCode}).';
        
        if (response.body.startsWith('<!doctype html>')) {
             msg = 'Error ${response.statusCode}: Endpoint Salah atau Server Crash. Mohon periksa log Flask.';
        } else {
            final body = json.decode(response.body);
            msg = body['message'] ?? msg;
        }
        
        setState(() { isLoading = false; errorMessage = msg; });
        return;
      }

      // Sukses 200
      final data = json.decode(response.body) as Map<String, dynamic>; 
      setState(() {
        // Hanya menggunakan key yang dikembalikan Flask: name, email, phone, hometown
        currentUser = {
          'name': data['name'] ?? 'Pengguna',
          'email': data['email'] ?? '',
          'phone': data['phone'] ?? '',
          'hometown': data['hometown'] ?? '',
        };
        formData = Map.from(currentUser);
        isLoading = false;
      });
      // Sinkronkan controllers
      _controllers.forEach((key, controller) {
        controller.text = currentUser[key] ?? '';
      });

    } catch (e) {
      setState(() {
        isLoading = false;
        errorMessage = 'Network Error: Gagal terhubung ke $kBaseUrl. ${e.toString()}';
      });
    }
  }

  // --- FUNGSI UPDATE DATA PROFILE (PUT) ---
  Future<void> updateProfile(String field) async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token');
    
    if (token == null || field == 'email') return; // Email read-only
    
    setState(() { isLoading = true; errorMessage = ''; });

    try {
      // 🎯 KRITIS: Kirim semua field yang diizinkan PUT (name, phone, hometown)
      // Flask akan mengupdate semua field ini, memastikan konsistensi.
      final payload = {
        'name': formData['name'], 
        'phone': formData['phone'],
        'hometown': formData['hometown'],
      };
        
      final response = await http.put(
        Uri.parse(_apiUrl), 
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: json.encode(payload),
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        // Panggil ulang fetchUserProfile untuk memastikan data sinkron
        await fetchUserProfile(); 
        
        setState(() { editMode[field] = false; });
        if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Profil berhasil diperbarui.'), backgroundColor: Colors.green));
        }
      } else {
        final errorBody = json.decode(response.body);
        final msg = errorBody['message'] ?? 'Gagal update profil. Status: ${response.statusCode}';
        
        // Rollback form data
        formData[field] = currentUser[field];
        handleCancel(field);

        if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg), backgroundColor: Colors.red));
        }
        setState(() { isLoading = false; errorMessage = msg; });
      }
    } catch (e) {
        if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error jaringan saat update: ${e.toString()}'), backgroundColor: Colors.red));
        }
        setState(() { isLoading = false; errorMessage = 'Jaringan atau Server Error: ${e.toString()}'; });
    }
  }

  void handleEdit(String field) {
    if (field == 'email') return; // Email read-only
    setState(() {
      _controllers[field]?.text = currentUser[field] ?? '';
      editMode[field] = true;
    });
  }

  void handleCancel(String field) {
    setState(() {
      editMode[field] = false;
      // Kembalikan form data ke nilai semula
      formData[field] = currentUser[field];
      _controllers[field]?.text = currentUser[field] ?? '';
    });
  }

  void handleChange(String key, String value) {
    setState(() {
      formData[key] = value;
    });
  }
  
  // --- WIDGET HELPER SINKRONISASI ---
  Widget buildProfileField(String field, String label, {TextInputType keyboardType = TextInputType.text, bool isReadOnly = false}) {
    final bool isEditing = editMode[field] ?? false;
    final String currentValue = currentUser[field] ?? '';
    final TextEditingController controller = _controllers[field] ?? TextEditingController(text: currentValue);
    
    // Pastikan controller listen ke perubahan hanya saat editing
    if (!controller.hasListeners && !isReadOnly) {
        controller.addListener(() => handleChange(field, controller.text));
    }

    // Set nilai controller saat View Mode atau saat nilai currentUser berubah
    if (!isEditing && controller.text != currentValue) {
        controller.text = currentValue;
    }


    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0, horizontal: 16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(fontSize: 12, color: Colors.grey)),
          const SizedBox(height: 4),

          if (!isEditing || isReadOnly) // Mode Tampilan atau Read-Only
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    currentValue.isNotEmpty ? currentValue : 'Not provided',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: isReadOnly ? FontWeight.w500 : FontWeight.w600,
                      color: currentValue.isNotEmpty ? Colors.black87 : Colors.grey,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                if (!isReadOnly) 
                  TextButton(
                    onPressed: () => handleEdit(field),
                    child: Text(
                      currentValue.isNotEmpty ? 'Edit' : 'Add',
                      style: TextStyle(color: kPrimaryColor, fontWeight: FontWeight.bold),
                    ),
                  ),
              ],
            )
          else // Mode Edit
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                TextFormField(
                  controller: controller, 
                  keyboardType: keyboardType,
                  decoration: const InputDecoration(
                    contentPadding: EdgeInsets.symmetric(vertical: 8.0, horizontal: 0),
                    isDense: true,
                    border: UnderlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 10),
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    ElevatedButton(
                      onPressed: () => updateProfile(field),
                      style: ElevatedButton.styleFrom(backgroundColor: kPrimaryColor, foregroundColor: Colors.white),
                      child: const Text('Save'),
                    ),
                    const SizedBox(width: 8),
                    TextButton(
                      onPressed: () => handleCancel(field),
                      child: const Text('Cancel', style: TextStyle(color: Colors.red)),
                    ),
                  ],
                ),
              ],
            ),
          const Divider(height: 1, thickness: 1, color: Colors.black12),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    // ... (Logika build Widget tetap sama, tetapi menggunakan buildProfileField yang baru) ...
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('Profil Saya'),
        backgroundColor: kPrimaryColor,
        foregroundColor: Colors.white,
      ),
      body: SafeArea(
        child: isLoading
            ? const Center(child: CircularProgressIndicator(color: kPrimaryColor))
            : errorMessage.isNotEmpty
                ? Center(
                    child: Padding(
                      padding: const EdgeInsets.all(32.0),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.error_outline, color: Colors.red, size: 40),
                          const SizedBox(height: 10),
                          Text('Error: $errorMessage', textAlign: TextAlign.center, style: const TextStyle(color: Colors.red, fontSize: 16)),
                          const SizedBox(height: 20),
                          ElevatedButton(
                            onPressed: fetchUserProfile,
                            child: const Text('Coba Lagi'),
                          ),
                        ],
                      ),
                    ),
                  )
                : SingleChildScrollView(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        // Header Profile (Nama dan Avatar)
                        Container(
                          padding: const EdgeInsets.only(top: 24.0, bottom: 24.0),
                          decoration: const BoxDecoration(
                            color: kPrimaryColor,
                            borderRadius: BorderRadius.vertical(bottom: Radius.circular(30)),
                          ),
                          child: Column(
                            children: [
                              CircleAvatar(
                                radius: 40,
                                backgroundColor: Colors.white,
                                child: Text(
                                    (currentUser['name'] ?? 'U').substring(0, 1).toUpperCase(),
                                    style: const TextStyle(fontSize: 30, color: kPrimaryColor, fontWeight: FontWeight.bold)
                                ),
                              ),
                              const SizedBox(height: 12),
                              Text(
                                currentUser['name'] ?? 'Pengguna Oratorio',
                                style: const TextStyle(
                                  fontSize: 24,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              ),
                              Text(
                                currentUser['email'] ?? 'No Email',
                                style: const TextStyle(
                                  fontSize: 14,
                                  color: Colors.white70,
                                ),
                              ),
                            ],
                          ),
                        ),
                        
                        const SizedBox(height: 20),

                        // Section Detail Profil
                        const Padding(
                          padding: EdgeInsets.only(left: 16.0, top: 8, bottom: 8),
                          child: Text(
                            'Informasi Akun',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: kPrimaryColor,
                            ),
                          ),
                        ),
                        
                        // Field Nama (Edit/Add)
                        buildProfileField('name', 'Nama Lengkap'),

                        // Field Email (Read-Only)
                        buildProfileField('email', 'Email (Read-Only)', isReadOnly: true, keyboardType: TextInputType.emailAddress), 

                        // Field Phone (Edit/Add)
                        buildProfileField('phone', 'Nomor Telepon', keyboardType: TextInputType.phone),

                        // Field Hometown (Edit/Add)
                        buildProfileField('hometown', 'Asal Kota'),

                        const SizedBox(height: 50),
                      ],
                    ),
                  ),
      ),
    );
  }
}