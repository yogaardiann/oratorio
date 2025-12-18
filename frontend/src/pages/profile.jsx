import React, { useState, useEffect, useContext } from 'react'; // 1. Import useContext
import './css/profile.css';
import { FiUser } from 'react-icons/fi';
import { AuthContext } from '../context/AuthContext'; // 1. Import AuthContext

const ProfilePage = () => {
    const [editMode, setEditMode] = useState({
        fullName: false,
        email: false,
        phone: false,
        dob: false,
        hometown: false
    });

    // 2. Ambil 'user' dan 'login' (untuk update) dari AuthContext
    const { user, login } = useContext(AuthContext); 

    const [currentUser, setCurrentUser] = useState(null);
    const [formData, setFormData] = useState(null);

    // 3. Perbarui useEffect untuk bergantung pada 'user' dari Context
    useEffect(() => {
        // Jika 'user' dari context ada (sudah login dan dimuat)
        if (user) {
            // Normalisasi data user dari context ke state lokal
            const normalizedUser = {
                firstName: user.firstName || (user.email ? user.email.split("@")[0] : "User"),
                lastName: user.lastName || "",
                username: user.username || (user.email ? user.email.split("@")[0] : "user123"),
                email: user.email || "",
                phone: user.phone || "",
                dob: user.dob || "",
                hometown: user.hometown || ""
            };

            setCurrentUser(normalizedUser);
            setFormData(normalizedUser);
        }
    }, [user]); // Efek ini akan berjalan setiap kali 'user' dari context berubah

    // Tampilkan null/loading selagi data user dimuat
    if (!currentUser) return null;

    const handleEdit = (field) => {
        setFormData(currentUser);
        setEditMode({ ...editMode, [field]: true });
    };

    const handleCancel = (field) => {
        setEditMode({ ...editMode, [field]: false });
    };

    // 4. Perbarui handleSave untuk menggunakan fungsi 'login' dari context
    const handleSave = (field) => {
        const updated = formData;
        setCurrentUser(updated);
        setEditMode({ ...editMode, [field]: false });
        
        // Memanggil 'login' akan memperbarui state di AuthContext DAN localStorage
        login(updated); 
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="account-page">
            <aside className="account-sidebar">
                <div className="user-greeting">
                    <div className="user-avatar">
                        {currentUser.firstName.charAt(0).toUpperCase()}
                    </div>
                    {/* 5. UBAH INI: Ganti teks hardcoded dengan data dari state */}
                    <h2>Hello {currentUser.username}!</h2>
                </div>

                <nav className="account-nav">
                    <a href="#personal" className="nav-item active"><FiUser /> Personal information</a>
                </nav>
            </aside>

            <main className="account-content">
                <section id="personal">
                    <h1 className="personalh1">Personal information</h1>

                    {/* FULL NAME */}
                    {!editMode.fullName ? (
                        <div className="info-item">
                            <div>
                                <label>Full name</label>
                                <span>{currentUser.firstName} {currentUser.lastName}</span>
                            </div>
                            <button onClick={() => handleEdit('fullName')} className="action-link">Edit</button>
                        </div>
                    ) : (
                        <div className="edit-form">
                            <label>Full name</label>
                            <div className="form-inputs">
                                <div className="input-group">
                                    <label htmlFor="firstName">First name</label>
                                    <input
                                        type="text"
                                        id="firstName"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="input-group">
                                    <label htmlFor="lastName">Last name</label>
                                    <input
                                        type="text"
                                        id="lastName"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className="form-actions">
                                <button onClick={() => handleSave('fullName')} className="save-button">Save</button>
                                <button onClick={() => handleCancel('fullName')} className="cancel-link">Cancel</button>
                            </div>
                        </div>
                    )}

                    {/* EMAIL */}
                    {!editMode.email ? (
                        <div className="info-item">
                            <div><label>Email</label><span>{currentUser.email || "Not provided"}</span></div>
                            <button onClick={() => handleEdit('email')} className="action-link">
                                {currentUser.email ? "Edit" : "Add"}
                            </button>
                        </div>
                    ) : (
                        <div className="edit-form">
                            <label>Email</label>
                            <div className="form-inputs">
                                <div className="input-group">
                                    <label htmlFor="email">Email address</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className="form-actions">
                                <button onClick={() => handleSave('email')} className="save-button">Save</button>
                                <button onClick={() => handleCancel('email')} className="cancel-link">Cancel</button>
                            </div>
                        </div>
                    )}

                    {/* PHONE */}
                    {!editMode.phone ? (
                        <div className="info-item">
                            <div><label>Phone number</label><span>{currentUser.phone || "Not provided"}</span></div>
                            <button onClick={() => handleEdit("phone")} className="action-link">
                                {currentUser.phone ? "Edit" : "Add"}
                            </button>
                        </div>
                    ) : (
                        <div className="edit-form">
                            <label>Phone number</label>
                            <div className="form-inputs">
                                <div className="input-group">
                                    <label htmlFor="phone">Phone number</label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className="form-actions">
                                <button onClick={() => handleSave("phone")} className="save-button">Save</button>
                                <button onClick={() => handleCancel("phone")} className="cancel-link">Cancel</button>
                            </div>
                        </div>
                    )}

                    {/* DOB */}
                    {!editMode.dob ? (
                        <div className="info-item">
                            <div><label>Date of birth</label><span>{currentUser.dob || "Not provided"}</span></div>
                            <button onClick={() => handleEdit("dob")} className="action-link">
                                {currentUser.dob ? "Edit" : "Add"}
                            </button>
                        </div>
                    ) : (
                        <div className="edit-form">
                            <label>Date of birth</label>
                            <div className="form-inputs">
                                <div className="input-group">
                                    <label htmlFor="dob">Date of birth</label>
                                    <input
                                        type="date"
                                        id="dob"
                                        name="dob"
                                        value={formData.dob}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className="form-actions">
                                <button onClick={() => handleSave("dob")} className="save-button">Save</button>
                                <button onClick={() => handleCancel("dob")} className="cancel-link">Cancel</button>
                            </div>
                        </div>
                    )}

                    {/* HOMETOWN */}
                    {!editMode.hometown ? (
                        <div className="info-item">
                            <div><label>Home town</label><span>{currentUser.hometown || "Not provided"}</span></div>
                            <button onClick={() => handleEdit("hometown")} className="action-link">
                                {currentUser.hometown ? "Edit" : "Add"}
                            </button>
                        </div>
                    ) : (
                        <div className="edit-form">
                            <label>Home town</label>
                            <div className="form-inputs">
                                <div className="input-group">
                                    <label htmlFor="hometown">Home town</label>
                                    <input
                                        type="text"
                                        id="hometown"
                                        name="hometown"
                                        value={formData.hometown}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className="form-actions">
                                <button onClick={() => handleSave("hometown")} className="save-button">Save</button>
                                <button onClick={() => handleCancel("hometown")} className="cancel-link">Cancel</button>
                            </div>
                        </div>
                    )}

                </section>
            </main>
        </div>
    );
};

export default ProfilePage;