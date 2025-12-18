import React, { useState } from 'react';
import axios from 'axios';

const AdminPage = () => {
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');
    
    // State untuk file
    const [markerFile, setMarkerFile] = useState(null);
    const [mindFile, setMindFile] = useState(null);
    const [modelFile, setModelFile] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Gunakan FormData untuk kirim file
        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', desc);
        formData.append('marker', markerFile); // Key harus sesuai dengan backend (request.files['marker'])
        formData.append('mind', mindFile);
        formData.append('model', modelFile);

        try {
            const res = await axios.post('http://localhost:5000/api/wisata', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            alert('Upload Berhasil!');
            console.log(res.data);
        } catch (error) {
            console.error(error);
            alert('Gagal Upload');
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
            <h1>Admin Panel - Tambah AR Baru</h1>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                
                <input 
                    type="text" 
                    placeholder="Nama Wisata (Misal: Monas)" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required 
                />
                
                <textarea 
                    placeholder="Deskripsi..." 
                    value={desc} 
                    onChange={(e) => setDesc(e.target.value)} 
                />

                <label>Upload Marker Image (.jpg):</label>
                <input type="file" accept=".jpg,.png" onChange={(e) => setMarkerFile(e.target.files[0])} required />

                <label>Upload Mind File (.mind):</label>
                <input type="file" accept=".mind" onChange={(e) => setMindFile(e.target.files[0])} required />

                <label>Upload 3D Model (.glb):</label>
                <input type="file" accept=".glb" onChange={(e) => setModelFile(e.target.files[0])} required />

                <button type="submit" style={{ padding: '10px', background: 'blue', color: 'white' }}>
                    Upload ke Database
                </button>
            </form>
        </div>
    );
};

export default AdminPage;