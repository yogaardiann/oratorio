import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart'; 

// --- BASE URL ---
const String kBaseUrl = 'http://192.168.110.100:5000'; 

class ProfilePage extends StatefulWidget {
  final Map<String, dynamic>? userData; 
  const ProfilePage({super.key, this.userData}); 

  @override
  _ProfilePageState createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  // Mapping untuk mengaktifkan mode edit (sinkron dengan PUT di Flask)
  Map<String, bool> editMode = {
    'name': false, 
    'phone': false,
    'hometown': false,
  };

  Map<String, dynamic> currentUser = {};
  Map<String, dynamic> formData = {};

  bool isLoading = true;
  String errorMessage = '';
  
  final String _apiUrl = '$kBaseUrl/api/users/profile'; // Endpoint API Flask

  @override
  void initState() {
    super.initState();
    fetchUserProfile();
  }

  // --- FUNGSI MENGAMBIL DATA PROFILE (GET) ---
  Future<void> fetchUserProfile() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token');
    
    if (token == null) {
      setState(() {
        isLoading = false;
        errorMessage = 'Token tidak ditemukan. Silakan login ulang.';
      });
      return;
    }
    
    setState(() {
      isLoading = true;
      errorMessage = '';
    });

    try {
      final response = await http.get(
        Uri.parse(_apiUrl),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        final data = json.decode(response.body) as Map<String, dynamic>; 
        setState(() {
          currentUser = data; 
          formData = Map.from(currentUser);
          isLoading = false;
        });
      } else if (response.statusCode == 401) {
          setState(() {
              isLoading = false;
              errorMessage = 'Sesi habis/Token tidak valid (401). Mohon login ulang.';
          });
      } else {
        String msg = 'Gagal memuat profil. Status: ${response.statusCode}.';
        final body = json.decode(response.body);
        msg = body['message'] ?? msg;
        setState(() {
          isLoading = false;
          errorMessage = msg;
        });
      }
    } catch (e) {
      String msg = 'Network/API Error: ${e.toString()}';
      setState(() {
        isLoading = false;
        errorMessage = msg;
      });
    }
  }

  // --- FUNGSI UPDATE DATA PROFILE (PUT) ---
  Future<void> updateProfile(String field) async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token');
    
    if (token == null) return;
    
    setState(() {
        isLoading = true; 
    });

    try {
      // Kirim seluruh formData karena endpoint PUT Flask menangani semua field
      final payload = {
        'firstName': formData['firstName'],
        'lastName': formData['lastName'],
        'email': formData['email'], // Kirim email meskipun tidak diizinkan edit
        'phone': formData['phone'],
        'dob': formData['dob'],
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
        
        setState(() {
          editMode[field] = false;
        });
        if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Profil berhasil diperbarui.'), backgroundColor: Colors.green));
        }
      } else {
        final errorBody = json.decode(response.body);
        final msg = errorBody['message'] ?? 'Gagal update profil. Status: ${response.statusCode}';
        if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg), backgroundColor: Colors.red));
        }
        setState(() {
            isLoading = false;
        });
      }
    } catch (e) {
        if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error jaringan saat update: ${e.toString()}'), backgroundColor: Colors.red));
        }
        setState(() {
            isLoading = false;
        });
    }
  }

  void handleEdit(String field) {
    setState(() {
      formData = Map.from(currentUser);
      editMode[field] = true;
    });
  }

  void handleCancel(String field) {
    setState(() {
      editMode[field] = false;
    });
  }

  void handleChange(String key, String value) {
    setState(() {
      formData[key] = value;
    });
  }
  
  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final bool isMobile = screenWidth < 600;

    if (isLoading && currentUser.isEmpty) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }
    
    if (currentUser.isEmpty && errorMessage.isNotEmpty) {
      return Scaffold(
        appBar: isMobile ? AppBar(title: const Text("Profile")) : null,
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.error_outline, color: Colors.red, size: 40),
                const SizedBox(height: 10),
                Text('Error: $errorMessage', textAlign: TextAlign.center),
                const SizedBox(height: 20),
                ElevatedButton(
                  onPressed: fetchUserProfile,
                  child: const Text('Coba Lagi'),
                ),
              ],
            ),
          ),
        ),
      );
    }
    
    // --- Konten Sidebar ---
    final Widget sidebarContent = Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            CircleAvatar(
              radius: 29,
              backgroundColor: const Color(0xFF008080),
              child: Text(
                (currentUser['firstName'] ?? 'U').substring(0, 1).toUpperCase(),
                style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
              ),
            ),
            const SizedBox(width: 15),
            Text(
              'Hello ${currentUser['username'] ?? 'User'}!',
              style: TextStyle(
                fontSize: isMobile ? 20 : 24, 
                fontWeight: FontWeight.bold
              ),
            ),
          ],
        ),
      ],
    );

    // --- Konten Utama (Daftar Profil) ---
    final Widget mainContent = Padding(
      padding: EdgeInsets.all(isMobile ? 20 : 40),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Personal information',
            style: TextStyle(fontSize: isMobile ? 28 : 36, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 20),
          
          // Full Name
          buildInfoItem(
            'name', 
            'Full name', 
            '${currentUser['firstName'] ?? ''} ${currentUser['lastName'] ?? ''}', 
            [ buildTextField('firstName', 'First name'), buildTextField('lastName', 'Last name') ]
          ),
          
          // Email (Tidak diizinkan edit di mode ini)
          buildInfoItem(
            'email', 
            'Email', 
            currentUser['email'] ?? 'Not provided', 
            [ buildTextField('email', 'Email address', keyboardType: TextInputType.emailAddress) ],
            isEditable: false
          ),
          
          // Phone
          buildInfoItem(
            'phone', 
            'Phone number', 
            currentUser['phone'] ?? 'Not provided', 
            [ buildTextField('phone', 'Phone number', keyboardType: TextInputType.phone) ]
          ),
          
          // DOB
          buildInfoItem(
            'dob', 
            'Date of birth', 
            currentUser['dob'] ?? 'Not provided', 
            [ buildTextField('dob', 'Date of birth') ],
            isEditable: false // Biarkan tidak bisa di-edit untuk menghindari DatePicker complexity
          ),
          
          // Hometown
          buildInfoItem(
            'hometown', 
            'Home town', 
            currentUser['hometown'] ?? 'Not provided', 
            [ buildTextField('hometown', 'Home town') ]
          ),
          
          if (isLoading && currentUser.isNotEmpty) 
              const Center(child: Padding(padding: EdgeInsets.all(16.0), child: CircularProgressIndicator())),
        ],
      ),
    );

    // --- Layout Utama ---
     return Scaffold(
      body: SingleChildScrollView( 
        child: isMobile
            ? Column( // MODE MOBILE
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.only(top: 20, left: 20, right: 20, bottom: 0),
                    child: sidebarContent,
                  ),
                  const Divider(),
                  mainContent,
                ],
              )
            : Row( // MODE WEB/DESKTOP
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 400,
                    padding: const EdgeInsets.all(20),
                    decoration: const BoxDecoration(
                      border: Border(right: BorderSide(color: Colors.grey)),
                    ),
                    child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                            sidebarContent, 
                            const SizedBox(height: 40),
                            const Text(
                                'Personal information',
                                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w500),
                            ),
                        ]
                    ),
                  ),
                  Expanded(
                    child: mainContent,
                  ),
                ],
              ),
      ),
    );
  }

  // Widget untuk menampilkan/mengedit satu item informasi
  Widget buildInfoItem(String field, String label, String value, List<Widget> editFields, {bool isEditable = true}) {
    final bool isInEditMode = editMode.containsKey(field) && editMode[field]!;
    
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 20),
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: Colors.grey)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        crossAxisAlignment: isInEditMode ? CrossAxisAlignment.start : CrossAxisAlignment.center,
        children: [
          // Bagian Display (Label dan Value)
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: const TextStyle(fontWeight: FontWeight.bold)),
              Text(value, style: const TextStyle(color: Colors.grey)),
            ],
          ),
          
          // Bagian Edit/Add Button/Form
          if (isEditable)
            if (!isInEditMode)
              TextButton(
                onPressed: () => handleEdit(field),
                child: Text(value.isEmpty || value == 'Not provided' ? 'Add' : 'Edit'),
              )
            else
              // Bagian Form Edit (Jika editMode aktif)
              Expanded( 
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    ...editFields, 
                    Row(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        ElevatedButton(
                          onPressed: () => updateProfile(field),
                          child: const Text('Save'),
                        ),
                        TextButton(
                          onPressed: () => handleCancel(field),
                          child: const Text('Cancel'),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
        ],
      ),
    );
  }

  // Widget untuk membuat TextField
  Widget buildTextField(String key, String label, {TextInputType keyboardType = TextInputType.text}) {
    // Controller untuk setiap field dalam mode edit (agar input tidak hilang saat form rebuild)
    final controller = TextEditingController(text: formData[key] ?? '');
    
    // Sinkronkan perubahan kembali ke formData saat input berubah
    controller.addListener(() {
        if (formData[key] != controller.text) {
            handleChange(key, controller.text);
        }
    });

    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: TextField(
        decoration: InputDecoration(labelText: label),
        keyboardType: keyboardType,
        controller: controller, // Gunakan controller
        // onChanged: (value) => handleChange(key, value), // Dihapus karena menggunakan listener
      ),
    );
  }
}