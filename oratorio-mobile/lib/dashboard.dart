import 'package:flutter/material.dart';
import 'widget.dart'; 
import 'profile.dart'; 
import 'ARGalleryPage.dart'; 
import 'ScanARPage.dart'; 
import 'History.dart'; 
import 'GeneralScanPage.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:async'; // Untuk Duration

// --- Konstanta Warna dan BASE URL ---
const Color kPrimary = Color(0xFF004D40);
const Color kFooterText = Color(0xFFA7A7A7);
const Color kFooterBg = Color(0xFF121212);
// BASE URL HARUS SAMA DENGAN login.dart (http://172.20.10.2:5000)
// Harap pastikan IP ini benar dan Flask server berjalan.
const String kBaseUrl = 'http://172.20.10.2:5000'; 

// --- Assets Paths ---
const String assetHero = 'assets/images/hero-bg2.jpg';
const String assetBorobudur = 'assets/images/fav-dest-section-candi-borobudur.jpg';
const String assetMonas = 'assets/images/fav-dest-section-tugu-monas.jpg';
const String assetTugu = 'assets/images/fav-dest-section-tugu-jogja.jpg';
const String assetGadang = 'assets/images/fav-dest-section-jam-gadang.jpg';
const String assetKresek = 'assets/images/fav-dest-section-monumen-kresek.jpg';
const String assetPrambanan = 'assets/images/fav-dest-section-candi-prambanan.jpg';

final List<Map<String, dynamic>> destinationsData = [
  {'name': 'Monumen Kresek', 'image': assetKresek},
  {'name': 'Monas', 'image': assetMonas},
  {'name': 'Tugu Yogyakarta', 'image': assetTugu},
  {'name': 'Jam Gadang', 'image': assetGadang},
  {'name': 'Candi Borobudur', 'image': assetBorobudur},
  {'name': 'Candi Prambanan', 'image': assetPrambanan},
];

final List<Map<String, dynamic>> vrDestinations = [
  {'slug': 'candi-borobudur', 'image': assetBorobudur, 'title': 'Candi Borobudur', 'location': 'Magelang, Jawa Tengah'},
  {'slug': 'monumen-nasional', 'image': assetMonas, 'title': 'Monumen Nasional', 'location': 'Jakarta, DKI Jakarta'},
];

// --- Dashboard Component Widgets ---

class DashboardPage extends StatefulWidget {
  final Map<String, dynamic>? argumentsData;
  const DashboardPage({super.key, this.argumentsData});

  @override
  State<DashboardPage> createState() => _DashboardPageState();
}

class _DashboardPageState extends State<DashboardPage> {
  int _selectedIndex = 0;
  Map<String, dynamic>? _currentProfileData;
  
  // Instance untuk _DashboardContentState
  final GlobalKey<_DashboardContentState> _homeContentKey = GlobalKey();

  @override
  void initState() {
    super.initState();
    // Inisialisasi data profil dan selectedIndex dari arguments
    if (widget.argumentsData != null) {
      if (widget.argumentsData!.containsKey('username')) {
        _currentProfileData = widget.argumentsData;
      }
      if (widget.argumentsData!.containsKey('selectedIndex')) {
        _selectedIndex = widget.argumentsData!['selectedIndex'] as int;
      }
    }
  }
  
  Future<void> _logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('jwt_token');
    if (mounted) {
        Navigator.pushNamedAndRemoveUntil(context, '/login', (route) => false);
    }
  }

  List<Widget> _pageOptions(Map<String, dynamic>? userData) => <Widget>[
    // Index 0: Home (Dashboard Content Stateful)
    _DashboardContent(key: _homeContentKey),

    // Index 1: Gallery
    const ARGalleryPage(),

    // Index 2: General Scan
    GeneralScanPage(userData: userData), 

    // Index 3: History
    HistoryPage(userData: userData),

    // Index 4: Profile
    ProfilePage(userData: userData),
  ];

// Navigasi Bottom Navbar (Fix Camera Navigation)
void _onNavBarItemTapped(int index) {
  // Index 2 navigasi ke GeneralScanPage (Live AR Render)
  if (index == 2) {
    // Cek otentikasi sebelum membuka kamera (General Scan)
    if (_currentProfileData == null || _currentProfileData!['user_id'] == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Login diperlukan untuk General Scan.')),
      );
      return;
    }
    
    // Karena GeneralScanPage ada di _pageOptions, kita hanya perlu mengubah index
    setState(() {
      _selectedIndex = 2; 
    });
  } else {
    setState(() {
       _selectedIndex = index; 
    });
    
    // Jika kembali ke Home (Index 0), muat ulang data statistik
    if (index == 0 && _homeContentKey.currentState != null) {
        _homeContentKey.currentState!.fetchDashboardData();
    }
  }
}

@override
Widget build(BuildContext context) {
    // Memperbarui _currentProfileData jika datang dari ModalRoute
    final Map<String, dynamic>? routeArguments = ModalRoute.of(context)?.settings.arguments as Map<String, dynamic>?;

    if (routeArguments != null) {
        if (routeArguments.containsKey('username') && _currentProfileData == null) {
             _currentProfileData = routeArguments;
        }
        // Jika argumen datang dari GeneralScanPage (redirect), update index
        if (routeArguments.containsKey('selectedIndex')) {
             _selectedIndex = routeArguments['selectedIndex'] as int;
        }
    }
    
    final String username = _currentProfileData?['username'] ?? 'Pengguna';
    final List<Widget> pageOptionsWithData = _pageOptions(_currentProfileData);
    Widget currentBody = pageOptionsWithData.elementAt(_selectedIndex);
    
    // =========================================================================
    // IMPLEMENTASI CustomBottomNavBar (Menggunakan widget.dart)
    // =========================================================================
    // Asumsi CustomBottomNavBar adalah widget yang berada di file widget.dart
    // Note: Pastikan file widget.dart diimpor dan berisi CustomBottomNavBar
    final Widget bottomNavBar = CustomBottomNavBar(
      selectedIndex: _selectedIndex,
      onItemTapped: _onNavBarItemTapped,
    );
    // =========================================================================


    // Jika index 0 (Home) - Menampilkan semua konten scrollable
    if (_selectedIndex == 0) {
      return Scaffold(
        body: CustomScrollView(
          slivers: [
            _CustomHeader(username: username, onLogout: _logout),
            // Konten Dashboard Content (STATISTICS)
            // Menggunakan buildSliverList() dari stateful widget untuk menampilkan konten atau loading/error
            _homeContentKey.currentState?.buildSliverList() ?? const SliverToBoxAdapter(child: Center(child: Padding(padding: EdgeInsets.all(32), child: CircularProgressIndicator()))),
          ],
        ),
        bottomNavigationBar: bottomNavBar,
      );
    }

    // Untuk Index 1, 2, 3, dan 4
    return Scaffold(
      appBar: _selectedIndex == 2 
              ? null // No AppBar on Scan Page
              : AppBar(
                  title: Text(_getAppBarTitle(_selectedIndex)),
                  backgroundColor: kPrimary,
                  foregroundColor: Colors.white,
                  automaticallyImplyLeading: false,
                ),
      body: currentBody, 
      bottomNavigationBar: bottomNavBar,
    );
  }
  
  String _getAppBarTitle(int index) {
    switch(index) {
      case 1: return 'AR Gallery';
      case 3: return 'Riwayat Kunjungan';
      case 4: return 'Profil Pengguna';
      default: return 'Oratorio';
    }
  }
}

// -----------------------------------------------------------
// 🎯 WIDGET KONTEN DASHBOARD (STATEFUL UNTUK FETCH DATA)
// -----------------------------------------------------------

class _DashboardContent extends StatefulWidget {
  const _DashboardContent({super.key});

  @override
  State<_DashboardContent> createState() => _DashboardContentState();
}

class _DashboardContentState extends State<_DashboardContent> {
  bool _loading = true;
  String _errorMessage = "";
  int _totalUsers = 0;
  String _popularDestination = "Memuat...";
  int _popularDestinationCount = 0;
  String _favoriteModel = "Memuat...";
  int _favoriteModelCount = 0;

  @override
  void initState() {
    super.initState();
    // Panggil fetchDashboardData setelah memastikan build context siap
    WidgetsBinding.instance.addPostFrameCallback((_) {
      fetchDashboardData();
    });
  }
  
  // --- FUNGSI FETCH DATA DASHBOARD ---
  Future<void> fetchDashboardData() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token');

    if (token == null) {
      if (mounted) setState(() {
          _errorMessage = "Autentikasi hilang. Mohon login ulang.";
          _loading = false;
      });
      return;
    }

    setState(() {
      _loading = true;
      _errorMessage = "";
    });

    try {
      // 🎯 Menggunakan Future.wait untuk performa yang lebih baik
      final List<dynamic> results = await Future.wait([
        _fetchUsers(token), 
        _fetchHistory(token),
      ]);

      if (!mounted) return;

      final List<dynamic> users = results[0];
      final List<dynamic> history = results[1];

      _totalUsers = users.length;
      _analyzeHistory(history);

    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = "Gagal memuat statistik. Pastikan server Flask berjalan. Error: ${e.toString()}";
        });
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }
  
  // Menggunakan token untuk akses API
  Future<List<dynamic>> _fetchUsers(String token) async {
    final headers = {'Authorization': 'Bearer $token'};
    final res = await http.get(Uri.parse('$kBaseUrl/api/users'), headers: headers).timeout(const Duration(seconds: 5));
    if (res.statusCode == 200) {
      return json.decode(res.body) as List<dynamic>;
    }
    // Jika 401/403, akan ditangkap oleh try-catch utama
    throw Exception('Gagal memuat pengguna (Status: ${res.statusCode})');
  }

  Future<List<dynamic>> _fetchHistory(String token) async {
    final headers = {'Authorization': 'Bearer $token'};
    final res = await http.get(Uri.parse('$kBaseUrl/api/history'), headers: headers).timeout(const Duration(seconds: 5));
    if (res.statusCode == 200) {
      return json.decode(res.body) as List<dynamic>;
    }
    throw Exception('Gagal memuat riwayat (Status: ${res.statusCode})');
  }

  void _analyzeHistory(List<dynamic> historyItems) {
    if (historyItems.isEmpty) {
      setState(() {
        _popularDestination = "Belum ada data";
        _favoriteModel = "Belum ada data";
      });
      return;
    }

    // 1. Popular Destinations
    final Map<String, int> destCount = {};
    for (final h in historyItems) {
      final name = h['destination_name'] ?? 'Destinasi Tidak Dikenal';
      destCount[name] = (destCount[name] ?? 0) + 1;
    }
    
    final sortedDest = destCount.entries.toList()..sort((a, b) => b.value.compareTo(a.value));
    
    // 2. Favorite Model Type
    final Map<String, int> modelCount = {};
    for (final h in historyItems) {
      final model = h['model_type'] ?? 'Unknown';
      modelCount[model] = (modelCount[model] ?? 0) + 1;
    }
    final sortedModel = modelCount.entries.toList()..sort((a, b) => b.value.compareTo(a.value));

    setState(() {
      _popularDestination = sortedDest.isNotEmpty ? sortedDest.first.key : "N/A";
      _popularDestinationCount = sortedDest.isNotEmpty ? sortedDest.first.value : 0;
      _favoriteModel = sortedModel.isNotEmpty ? sortedModel.first.key : "N/A";
      _favoriteModelCount = sortedModel.isNotEmpty ? sortedModel.first.value : 0;
    });
  }

  // Metode untuk membangun SliverList (dipanggil dari DashboardPage)
  SliverList buildSliverList() {
    final String username = (context.findAncestorStateOfType<_DashboardPageState>()?._currentProfileData?['username'] ?? 'Pengguna');

    if (_loading) {
        return SliverList(
          delegate: SliverChildListDelegate([
            const Center(child: Padding(padding: EdgeInsets.all(32.0), child: CircularProgressIndicator())),
          ]),
        );
    }
    
    if (_errorMessage.isNotEmpty) {
        return SliverList(
          delegate: SliverChildListDelegate([
            Center(child: Padding(padding: const EdgeInsets.all(32.0), child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                    Text(_errorMessage, textAlign: TextAlign.center, style: const TextStyle(color: Colors.red)),
                    const SizedBox(height: 10),
                    ElevatedButton(onPressed: fetchDashboardData, child: const Text("Coba Muat Ulang Statistik")),
                ],
            ))),
          ]),
        );
    }

    return SliverList(
      delegate: SliverChildListDelegate(
        [
          // === STATS SECTION BARU ===
          _StatsBar(
            totalUsers: _totalUsers,
            popularDestination: _popularDestination,
            popularDestinationCount: _popularDestinationCount,
            favoriteModel: _favoriteModel,
            favoriteModelCount: _favoriteModelCount,
          ),
          // === END STATS SECTION ===
          
          _HeroSection(username: username), 
          const _FavoriteDestinationsSection(),
          const _ARTorioSection(),
          const _VRTorioSection(),
          const _FooterSection(),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    // Widget ini hanya berfungsi sebagai container state, konten ditampilkan oleh buildSliverList
    // Memanggil buildSliverList di sini untuk memastikan ia memiliki reference ke statenya
    return buildSliverList();
  }
}

// -----------------------------------------------------------
// 🧱 WIDGET STATISTIK BARU
// -----------------------------------------------------------

class _StatsBar extends StatelessWidget {
  final int totalUsers;
  final String popularDestination;
  final int popularDestinationCount;
  final String favoriteModel;
  final int favoriteModelCount;
  
  const _StatsBar({
    required this.totalUsers,
    required this.popularDestination,
    required this.popularDestinationCount,
    required this.favoriteModel,
    required this.favoriteModelCount,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 16),
      child: Wrap(
        spacing: 16,
        runSpacing: 16,
        alignment: WrapAlignment.center,
        children: [
          _StatCard(icon: Icons.people, label: 'Total Pengguna', value: totalUsers.toString()),
          _StatCard(icon: Icons.favorite, label: 'Destinasi Populer', value: popularDestination, subValue: '$popularDestinationCount kunjungan'),
          _StatCard(icon: Icons.auto_awesome, label: 'Model Favorit', value: favoriteModel, subValue: '$favoriteModelCount sesi'),
        ],
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final String? subValue;

  const _StatCard({required this.icon, required this.label, required this.value, this.subValue});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: (MediaQuery.of(context).size.width / 2) - 24, // Disesuaikan untuk 2 kolom
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: kPrimary.withOpacity(0.05),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: kPrimary.withOpacity(0.1)),
      ),
      child: Row(
        children: [
          Icon(icon, color: kPrimary, size: 28),
          const SizedBox(width: 10),
          Flexible(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: const TextStyle(fontSize: 10, color: Colors.grey)),
                Text(value, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: kPrimary)),
                if (subValue != null) 
                  Text(subValue!, style: const TextStyle(fontSize: 10, color: Colors.black54)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// --- WIDGET BAWAAN LAINNYA (Sama seperti sebelumnya) ---

class _CustomHeader extends StatelessWidget {
  final String username;
  final VoidCallback onLogout; // Ditambahkan
  const _CustomHeader({required this.username, required this.onLogout});

  @override
  Widget build(BuildContext context) {
    return SliverAppBar(
      pinned: true,
      floating: false,
      backgroundColor: Colors.white,
      foregroundColor: kPrimary,
      elevation: 4.0,
      title: Text(
        'Hi, $username!',
        style: const TextStyle(
          fontWeight: FontWeight.bold,
          letterSpacing: 1.0,
          fontSize: 20,
          color: kPrimary,
        ),
      ),
      actions: [
        IconButton(
          icon: const Icon(Icons.logout),
          tooltip: 'Logout',
          onPressed: onLogout, 
        ),
      ],
    );
  }
}

class _HeroSection extends StatelessWidget {
  final String username;
  const _HeroSection({required this.username});

  @override
  Widget build(BuildContext context) {
    final screenHeight = MediaQuery.of(context).size.height;

    return Container(
      height: screenHeight * 0.45,
      decoration: BoxDecoration(
        image: DecorationImage(
          image: const AssetImage(assetHero),
          fit: BoxFit.cover,
          colorFilter: ColorFilter.mode(Colors.black.withOpacity(0.5), BlendMode.darken),
        ),
      ),
      child: Center(
        child: Padding(
          padding: const EdgeInsets.all(32.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const SizedBox(height: 12),
              const Text(
                'Jelajahi Bersama Oratorio. Hidupkan Kembali Sejarah. Jelajahi Budaya Indonesia di Mana Saja.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 12),
            ],
          ),
        ),
      ),
    );
  }
}

class _DestinationCard extends StatelessWidget {
  final String imageSrc;
  final String name;

  const _DestinationCard({required this.imageSrc, required this.name});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 200,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16.0),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 10,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(16.0),
        child: Stack(
          fit: StackFit.expand,
          children: [
            Image.asset(
              imageSrc,
              fit: BoxFit.cover,
              errorBuilder: (context, error, stackTrace) =>
                const Center(child: Icon(Icons.broken_image, color: Colors.grey)),
            ),
            Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [Colors.transparent, Colors.black.withOpacity(0.8)],
                ),
              ),
            ),
            Positioned(
              bottom: 16,
              left: 16,
              child: Text(
                name,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _FavoriteDestinationsSection extends StatelessWidget {
  const _FavoriteDestinationsSection();

  @override

  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: 40, bottom: 40, left: 16, right: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Text(
            'Destinasi Favorit',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.bold,
              color: kPrimary,
            ),
          ),
          const SizedBox(height: 24),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2, // 2 kolom untuk mobile
              crossAxisSpacing: 16.0,
              mainAxisSpacing: 16.0,
              childAspectRatio: 0.9, // sedikit lebih tinggi dari lebar
            ),
            itemCount: destinationsData.length,
            itemBuilder: (context, index) {
              final destination = destinationsData[index];
              return _DestinationCard(
                name: destination['name'] as String,
                imageSrc: destination['image'] as String,
              );
            },
          ),
        ],
      ),
    );
  }
}

class _ARTorioSection extends StatelessWidget {
  const _ARTorioSection();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        children: [
          const _SectionTitle(title: 'AR TORIO', color: kPrimary),
          const SizedBox(height: 16),
          const Text(
            'Jelajahi Warisan Budaya dengan Augmented Reality',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 24),
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: Colors.grey.shade100,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Column(
              children: [
                const Text(
                  'Candi Borobudur',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 16),
                ElevatedButton.icon(
                  onPressed: () {
                    Navigator.pushNamed(context, '/argallery');
                  },
                  icon: const Icon(Icons.auto_awesome_rounded, color: Colors.white),
                  label: const Text('Lihat Semua Koleksi'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: kPrimary,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  final String title;
  final Color color;

  const _SectionTitle({required this.title, required this.color});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        const Expanded(child: Divider(color: Colors.grey, thickness: 1)),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16.0),
          child: Text(
            title,
            style: TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
        ),
        const Expanded(child: Divider(color: Colors.grey, thickness: 1)),
      ],
    );
  }
}

class _VRTorioSection extends StatelessWidget {
  const _VRTorioSection();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const _SectionTitle(title: 'VR TORIO', color: kPrimary),
          const SizedBox(height: 24),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2, // 2 kolom untuk mobile
              crossAxisSpacing: 16.0,
              mainAxisSpacing: 16.0,
              childAspectRatio: 0.8, // Menyesuaikan dengan konten kartu
            ),
            itemCount: vrDestinations.length,
            itemBuilder: (context, index) {
              final item = vrDestinations[index];
              return InkWell(
                onTap: () {
                  // Navigasi ke VR detail page
                },
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(12),
                        child:
                          Image.asset(
                              item['image'] as String,
                              fit: BoxFit.cover,
                              width: double.infinity,
                              errorBuilder: (context, error, stackTrace) =>
                                const Center(child: Icon(Icons.broken_image, color: Colors.grey)),
                            ),
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.only(top: 8.0),
                      child: Text(
                        '📍 ${item['title']}, ${item['location']}',
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                          color: Colors.grey,
                        ),
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}

class _FooterSection extends StatelessWidget {
  const _FooterSection();

  @override
  Widget build(BuildContext context) {
    return Container(
      color: kFooterBg,
      padding: const EdgeInsets.symmetric(vertical: 40.0, horizontal: 24.0),
      child: Column(
        children: [
          // Social Icons
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              IconButton(onPressed: () {}, icon: const Icon(Icons.facebook, color: Colors.white, size: 28)),
              IconButton(onPressed: () {}, icon: const Icon(Icons.share, color: Colors.white, size: 28)),
              IconButton(onPressed: () {}, icon: const Icon(Icons.videocam, color: Colors.white, size: 28)),
              IconButton(onPressed: () {}, icon: const Icon(Icons.photo_camera, color: Colors.white, size: 28)),
            ],
          ),
          const SizedBox(height: 32),
        
          // Footer Links (Dibuat vertikal untuk mobile)
          const _FooterLink(text: 'Help Center'),
          const _FooterLink(text: 'FAQ'),
          const _FooterLink(text: 'About Oratorio'),
          const _FooterLink(text: 'Destinasi'),
          const _FooterLink(text: 'Augmented Reality Interface'),
          const _FooterLink(text: 'Virtual Reality Interface'),
          const _FooterLink(text: 'Kebijakan Privasi'),
          const _FooterLink(text: 'Syarat & Ketentuan'),
         
          const SizedBox(height: 24),
          const Divider(color: Colors.grey, height: 1),
          const SizedBox(height: 16),

        
          // Copyright
          const Text(
            '© 2025 Oratorio, Inc.',
            style: TextStyle(color: kFooterText, fontSize: 12),
          ),
        ],
      ),
    );
  }
}

class _FooterLink extends StatelessWidget {
  final String text;
  const _FooterLink({required this.text});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: TextButton(
        onPressed: () {},
        child: Text(
          text,
          style: const TextStyle(color: Colors.white70, fontSize: 16),
        ),
      ),
    );
  }
}