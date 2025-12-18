import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import * as THREE from 'three';

const ArDetailGuidancePage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const canvasRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    axios.get(`http://192.168.23.214:5000/api/wisata/${id}`)
      .then(res => {
        if (mounted) {
          setData(res.data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (mounted) {
          console.error(err);
          setError('Gagal memuat data');
          setLoading(false);
        }
      });
    return () => { mounted = false; };
  }, [id]);

  // Three.js Interactive 3D Background
  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      canvas: canvasRef.current, 
      alpha: true,
      antialias: true 
    });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    camera.position.z = 10;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xC9E4E2, 0.7);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x005954, 1.8, 100);
    pointLight1.position.set(8, 8, 8);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xC9E4E2, 1.3, 100);
    pointLight2.position.set(-8, -8, 5);
    scene.add(pointLight2);

    // Create floating geometric shapes
    const geometries = [
      new THREE.OctahedronGeometry(0.6),
      new THREE.TetrahedronGeometry(0.7),
      new THREE.IcosahedronGeometry(0.5),
      new THREE.DodecahedronGeometry(0.5)
    ];

    const shapes = [];
    for (let i = 0; i < 20; i++) {
      const geometry = geometries[Math.floor(Math.random() * geometries.length)];
      const material = new THREE.MeshStandardMaterial({ 
        color: i % 3 === 0 ? 0x005954 : i % 3 === 1 ? 0xC9E4E2 : 0xFFFFFF,
        metalness: 0.7,
        roughness: 0.3,
        transparent: true,
        opacity: 0.6,
        wireframe: i % 4 === 0
      });
      const shape = new THREE.Mesh(geometry, material);
      
      shape.position.set(
        Math.random() * 25 - 12.5,
        Math.random() * 25 - 12.5,
        Math.random() * 15 - 20
      );
      
      shapes.push({
        mesh: shape,
        speedX: (Math.random() - 0.5) * 0.008,
        speedY: (Math.random() - 0.5) * 0.008,
        speedZ: (Math.random() - 0.5) * 0.004,
        rotSpeedX: (Math.random() - 0.5) * 0.02,
        rotSpeedY: (Math.random() - 0.5) * 0.02,
        rotSpeedZ: (Math.random() - 0.5) * 0.02,
        floatSpeed: Math.random() * 0.003 + 0.001,
        floatOffset: Math.random() * Math.PI * 2
      });
      scene.add(shape);
    }

    // Create interconnected network lines
    const lineMaterial = new THREE.LineBasicMaterial({ 
      color: 0x005954,
      transparent: true,
      opacity: 0.2
    });
    const lines = [];
    
    for (let i = 0; i < 30; i++) {
      const points = [];
      points.push(new THREE.Vector3(
        Math.random() * 20 - 10,
        Math.random() * 20 - 10,
        Math.random() * 10 - 15
      ));
      points.push(new THREE.Vector3(
        Math.random() * 20 - 10,
        Math.random() * 20 - 10,
        Math.random() * 10 - 15
      ));
      
      const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(lineGeometry, lineMaterial);
      lines.push(line);
      scene.add(line);
    }

    // Spiral rings
    const spirals = [];
    for (let i = 0; i < 3; i++) {
      const torusKnotGeometry = new THREE.TorusKnotGeometry(2 + i, 0.3, 100, 16);
      const torusKnotMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x005954,
        metalness: 0.9,
        roughness: 0.1,
        transparent: true,
        opacity: 0.3
      });
      const torusKnot = new THREE.Mesh(torusKnotGeometry, torusKnotMaterial);
      torusKnot.position.set(
        Math.random() * 8 - 4,
        Math.random() * 8 - 4,
        -10 - i * 3
      );
      spirals.push({
        mesh: torusKnot,
        speedX: (Math.random() - 0.5) * 0.005,
        speedY: (Math.random() - 0.5) * 0.005
      });
      scene.add(torusKnot);
    }

    // Advanced particle system with dynamic movement
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 400;
    const posArray = new Float32Array(particlesCount * 3);
    const colorArray = new Float32Array(particlesCount * 3);
    const velocities = new Float32Array(particlesCount * 3);
    
    for(let i = 0; i < particlesCount * 3; i += 3) {
      posArray[i] = (Math.random() - 0.5) * 35;
      posArray[i + 1] = (Math.random() - 0.5) * 35;
      posArray[i + 2] = (Math.random() - 0.5) * 35;
      
      velocities[i] = (Math.random() - 0.5) * 0.02;
      velocities[i + 1] = (Math.random() - 0.5) * 0.02;
      velocities[i + 2] = (Math.random() - 0.5) * 0.02;
      
      const colorChoice = Math.random();
      if (colorChoice < 0.4) {
        colorArray[i] = 0;
        colorArray[i + 1] = 0.35;
        colorArray[i + 2] = 0.33;
      } else if (colorChoice < 0.7) {
        colorArray[i] = 0.79;
        colorArray[i + 1] = 0.89;
        colorArray[i + 2] = 0.89;
      } else {
        colorArray[i] = 1;
        colorArray[i + 1] = 1;
        colorArray[i + 2] = 1;
      }
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));
    
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.04,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending
    });
    
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Animated grid floor
    const gridHelper = new THREE.GridHelper(30, 30, 0x005954, 0xC9E4E2);
    gridHelper.position.y = -8;
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0.1;
    scene.add(gridHelper);

    // Animation
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handleMouseMove = (e) => {
      targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
      targetMouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove);

    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.01;

      // Smooth mouse following
      mouseX += (targetMouseX - mouseX) * 0.04;
      mouseY += (targetMouseY - mouseY) * 0.04;

      // Animate shapes
      shapes.forEach((shape, index) => {
        shape.mesh.position.x += shape.speedX;
        shape.mesh.position.y += shape.speedY + Math.sin(time * shape.floatSpeed + shape.floatOffset) * 0.015;
        shape.mesh.position.z += shape.speedZ;
        
        shape.mesh.rotation.x += shape.rotSpeedX;
        shape.mesh.rotation.y += shape.rotSpeedY;
        shape.mesh.rotation.z += shape.rotSpeedZ;

        // Boundary bounce
        if (shape.mesh.position.x > 15 || shape.mesh.position.x < -15) shape.speedX *= -1;
        if (shape.mesh.position.y > 15 || shape.mesh.position.y < -15) shape.speedY *= -1;
        if (shape.mesh.position.z > 8 || shape.mesh.position.z < -25) shape.speedZ *= -1;

        // Pulse effect
        const scale = 1 + Math.sin(time * 2 + index * 0.5) * 0.15;
        shape.mesh.scale.set(scale, scale, scale);
      });

      // Animate spirals
      spirals.forEach((spiral, index) => {
        spiral.mesh.rotation.x += spiral.speedX;
        spiral.mesh.rotation.y += spiral.speedY;
        spiral.mesh.rotation.z += 0.003;
        spiral.mesh.position.y += Math.sin(time * 0.8 + index) * 0.015;
      });

      // Animate particles with flowing motion
      const positions = particlesGeometry.attributes.position.array;
      for(let i = 0; i < positions.length; i += 3) {
        positions[i] += velocities[i];
        positions[i + 1] += velocities[i + 1];
        positions[i + 2] += velocities[i + 2];
        
        // Boundary check and reverse
        if (Math.abs(positions[i]) > 20) velocities[i] *= -1;
        if (Math.abs(positions[i + 1]) > 20) velocities[i + 1] *= -1;
        if (Math.abs(positions[i + 2]) > 20) velocities[i + 2] *= -1;
        
        // Add wave motion
        positions[i + 1] += Math.sin(positions[i] * 0.3 + time) * 0.01;
      }
      particlesGeometry.attributes.position.needsUpdate = true;

      // Rotate particle cloud
      particlesMesh.rotation.y += 0.0005;
      particlesMesh.rotation.x += 0.0003;

      // Animate lights
      pointLight1.position.x = Math.sin(time * 0.4) * 8;
      pointLight1.position.y = Math.cos(time * 0.5) * 8;
      
      pointLight2.position.x = Math.cos(time * 0.3) * 8;
      pointLight2.position.y = Math.sin(time * 0.6) * 8;

      // Animate grid
      gridHelper.rotation.z += 0.001;

      // Camera movement
      camera.position.x += (mouseX * 2.5 - camera.position.x) * 0.025;
      camera.position.y += (mouseY * 2.5 - camera.position.y) * 0.025;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#C9E4E2] via-[#FFFFFF] to-[#C9E4E2] relative overflow-hidden">
        <canvas ref={canvasRef} className="fixed inset-0 w-full h-full" style={{ zIndex: 0 }} />
        <div className="text-center space-y-6 relative z-10 bg-white/80 backdrop-blur-xl p-12 rounded-3xl shadow-2xl border-2 border-[#005954]/20">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 border-4 border-[#C9E4E2] rounded-full"></div>
            <div className="absolute inset-0 border-4 border-[#005954] border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div className="space-y-2">
            <p className="text-[#005954] font-semibold text-lg">Memuat AR Experience</p>
            <p className="text-gray-600 text-sm">Menyiapkan konten untuk Anda...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#C9E4E2] via-[#FFFFFF] to-[#C9E4E2] p-4 relative overflow-hidden">
        <canvas ref={canvasRef} className="fixed inset-0 w-full h-full" style={{ zIndex: 0 }} />
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-10 max-w-md text-center border-2 border-gray-100 relative z-10">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Oops! Terjadi Kesalahan</h2>
          <p className="text-gray-600 mb-8">{error || 'Data tidak ditemukan. Silakan coba lagi.'}</p>
          <Link 
            to="/ar" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#005954] hover:bg-[#004440] text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kembali ke Galeri
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#C9E4E2] via-[#FFFFFF] to-[#C9E4E2] relative overflow-hidden">
      {/* Three.js Canvas Background */}
      <canvas ref={canvasRef} className="fixed inset-0 w-full h-full" style={{ zIndex: 0 }} />
      
      {/* Top Navigation Bar */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-[#005954]/10 shadow-lg sticky top-0 z-50 relative">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link 
              to="/ar" 
              className="flex items-center gap-2 text-[#005954] hover:text-[#004440] transition-all group bg-white/60 backdrop-blur-sm px-4 py-2 rounded-xl border border-[#005954]/20 hover:border-[#005954] shadow-sm hover:shadow-md transform hover:scale-105 duration-300"
            >
              <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="font-semibold">Kembali</span>
            </Link>
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#005954] to-[#007066] rounded-full shadow-lg">
              <div className="w-2 h-2 bg-[#C9E4E2] rounded-full animate-pulse"></div>
              <span className="text-white text-sm font-bold">AR Ready</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12 relative z-10">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-[#005954] via-[#007066] to-[#005954] rounded-3xl shadow-2xl overflow-hidden mb-8 border-2 border-[#005954]/30 backdrop-blur-sm relative group">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#C9E4E2] rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"></div>
          </div>
          
          <div className="relative p-8 sm:p-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="px-5 py-2 bg-white/20 backdrop-blur-md rounded-full text-sm font-bold text-white shadow-lg border border-white/30 hover:scale-110 transition-transform duration-300">
                ID: #{data.id}
              </div>
              <div className="px-5 py-2 bg-white/20 backdrop-blur-md rounded-full text-sm font-bold text-white shadow-lg border border-white/30 flex items-center gap-2 hover:scale-110 transition-transform duration-300">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                {data.location || 'Indonesia'}
              </div>
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-black text-white mb-6 leading-tight">
              {data.name}
            </h1>
            
            <p className="text-[#C9E4E2] text-lg max-w-3xl leading-relaxed font-medium">
              {data.description}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Instructions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Marker Preview Card */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border-2 border-[#005954]/20 hover:border-[#005954]/40 transition-all duration-500 hover:shadow-3xl group">
              <div className="p-6 border-b border-[#005954]/10 bg-gradient-to-r from-[#005954]/5 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#005954] to-[#007066] rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-[#005954]">Marker AR</h2>
                    <p className="text-sm text-gray-600 font-semibold">Scan marker ini untuk memulai</p>
                  </div>
                </div>
              </div>
              
              <div className="p-8">
                <div className="relative bg-gradient-to-br from-[#C9E4E2] to-[#005954] rounded-3xl overflow-hidden shadow-2xl group-hover:scale-105 transition-transform duration-500">
                  <div className="aspect-video flex items-center justify-center p-6">
                    <img
                      src={`http://192.168.23.214:5000/static/uploads/${data.marker_image}`}
                      alt="AR Marker"
                      className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl border-4 border-white"
                      onError={(e) => { 
                        e.target.parentElement.innerHTML = '<div class="text-white text-center"><svg class="w-16 h-16 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg><p class="opacity-75 font-bold">Marker tidak tersedia</p></div>';
                      }}
                    />
                  </div>
                  
                  {/* Animated corner decorations */}
                  <div className="absolute top-4 left-4 w-10 h-10 border-t-4 border-l-4 border-white opacity-60 rounded-tl-xl animate-pulse"></div>
                  <div className="absolute top-4 right-4 w-10 h-10 border-t-4 border-r-4 border-white opacity-60 rounded-tr-xl animate-pulse"></div>
                  <div className="absolute bottom-4 left-4 w-10 h-10 border-b-4 border-l-4 border-white opacity-60 rounded-bl-xl animate-pulse"></div>
                  <div className="absolute bottom-4 right-4 w-10 h-10 border-b-4 border-r-4 border-white opacity-60 rounded-br-xl animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Instructions Card */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border-2 border-[#005954]/20 hover:border-[#005954]/40 transition-all duration-500 hover:shadow-3xl">
              <div className="p-6 border-b border-[#005954]/10 bg-gradient-to-r from-[#005954]/5 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#005954] to-[#007066] rounded-2xl flex items-center justify-center shadow-lg">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-[#005954]">Panduan Penggunaan</h2>
                    <p className="text-sm text-gray-600 font-semibold">Ikuti langkah berikut untuk memulai AR</p>
                  </div>
                </div>
              </div>
              
              <div className="p-8">
                <div className="space-y-6">
                  {[
                    {
                      number: 1,
                      title: 'Mulai AR Experience',
                      description: 'Klik tombol "Mulai AR Torio" untuk membuka halaman scanning dengan teknologi AR.',
                      icon: (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )
                    },
                    {
                      number: 2,
                      title: 'Scan QR Code',
                      description: 'Arahkan kamera smartphone Anda ke QR Code yang muncul di layar komputer.',
                      icon: (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                        </svg>
                      )
                    },
                    {
                      number: 3,
                      title: 'Izinkan Akses Kamera',
                      description: 'Berikan izin akses kamera pada browser smartphone Anda untuk pengalaman AR yang optimal.',
                      icon: (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )
                    },
                    {
                      number: 4,
                      title: 'Arahkan ke Marker',
                      description: 'Arahkan kamera smartphone ke marker image yang ditampilkan di layar untuk memicu konten AR.',
                      icon: (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )
                    }
                  ].map((step) => (
                    <div key={step.number} className="flex gap-5 group hover:bg-[#C9E4E2]/20 p-4 rounded-2xl transition-all duration-300">
                      <div className="flex-shrink-0">
                        <div className="w-14 h-14 bg-gradient-to-br from-[#005954] to-[#007066] text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                          {step.number}
                        </div>
                      </div>
                      <div className="flex-1 pt-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="text-[#005954]">{step.icon}</div>
                          <h3 className="font-black text-gray-900 text-lg">{step.title}</h3>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed font-medium">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pro Tip */}
                <div className="mt-8 relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#C9E4E2] via-white to-[#C9E4E2] p-8 border-2 border-[#005954] shadow-xl hover:shadow-2xl transition-all duration-300">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#005954] opacity-5 rounded-full blur-2xl"></div>
                  <div className="flex gap-5 relative">
                    <div className="flex-shrink-0">
                      <div className="w-14 h-14 bg-[#005954] rounded-2xl flex items-center justify-center shadow-lg">
                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-black text-[#005954] mb-4 flex items-center gap-2 text-lg">
                        💡 Pro Tips untuk Pengalaman Terbaik
                      </h4>
                      <ul className="space-y-3 text-sm text-gray-700">
                        <li className="flex items-start gap-3 font-medium">
                          <span className="text-[#005954] mt-0.5 text-lg font-black">•</span>
                          <span>Pastikan smartphone dan laptop terhubung ke jaringan WiFi yang sama</span>
                        </li>
                        <li className="flex items-start gap-3 font-medium">
                          <span className="text-[#005954] mt-0.5 text-lg font-black">•</span>
                          <span>Gunakan pencahayaan yang cukup untuk hasil tracking yang optimal</span>
                        </li>
                        <li className="flex items-start gap-3 font-medium">
                          <span className="text-[#005954] mt-0.5 text-lg font-black">•</span>
                          <span>Jaga jarak 20-30cm antara kamera dan marker untuk deteksi terbaik</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Actions */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Info Card */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border-2 border-[#005954]/20 hover:border-[#005954]/40 transition-all duration-500 hover:shadow-3xl">
                <div className="p-6 bg-gradient-to-br from-[#005954] to-[#007066] relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full blur-2xl"></div>
                  <h3 className="text-xl font-black text-white mb-1 relative">Informasi Destinasi</h3>
                  <p className="text-[#C9E4E2] text-sm font-semibold relative">Detail lokasi wisata AR</p>
                </div>
                
                <div className="p-6 space-y-5">
                  <div className="flex items-start gap-4 group hover:bg-[#C9E4E2]/20 p-3 rounded-2xl transition-all duration-300">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#C9E4E2] to-[#005954]/20 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-6 h-6 text-[#005954]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-[#005954] uppercase tracking-wider mb-2">Nama Destinasi</p>
                      <p className="text-sm font-bold text-gray-900">{data.name}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 group hover:bg-[#C9E4E2]/20 p-3 rounded-2xl transition-all duration-300">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#C9E4E2] to-[#005954]/20 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-6 h-6 text-[#005954]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-[#005954] uppercase tracking-wider mb-2">Lokasi</p>
                      <p className="text-sm font-bold text-gray-900">{data.location || 'Indonesia'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 group hover:bg-[#C9E4E2]/20 p-3 rounded-2xl transition-all duration-300">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#C9E4E2] to-[#005954]/20 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-6 h-6 text-[#005954]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-[#005954] uppercase tracking-wider mb-2">ID Destinasi</p>
                      <p className="text-sm font-bold text-gray-900">#{data.id}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <Link
                  to={`/scan/${id}`}
                  className="group relative w-full flex items-center justify-center gap-3 py-5 px-6 bg-gradient-to-r from-[#005954] to-[#007066] hover:from-[#004440] hover:to-[#005954] text-white font-black rounded-2xl transition-all duration-300 shadow-2xl hover:shadow-3xl overflow-hidden transform hover:scale-105"
                >
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
                  <svg className="w-7 h-7 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                  <span className="relative text-lg">Mulai AR Torio</span>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#C9E4E2] rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                </Link>

                <Link
                  to="/ar"
                  className="w-full flex items-center justify-center gap-3 py-5 px-6 bg-white/90 backdrop-blur-sm hover:bg-white text-[#005954] font-black rounded-2xl transition-all duration-300 border-2 border-[#005954] shadow-lg hover:shadow-2xl transform hover:scale-105"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span>Kembali ke Galeri</span>
                </Link>
              </div>

              {/* Tech Stack Badge */}
              <div className="bg-gradient-to-br from-[#C9E4E2] via-white to-[#C9E4E2] rounded-2xl p-6 border-2 border-[#005954]/20 shadow-lg hover:shadow-xl transition-all duration-300">
                <p className="text-xs font-black text-[#005954] uppercase tracking-wider mb-4">Powered By</p>
                <div className="flex items-center gap-4">
                  <div className="px-4 py-2 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110 transform">
                    <p className="text-[#005954] font-black text-base">A-Frame</p>
                  </div>
                  <div className="text-[#005954] font-black text-xl">+</div>
                  <div className="px-4 py-2 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110 transform">
                    <p className="text-[#005954] font-black text-base">MindAR</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArDetailGuidancePage;