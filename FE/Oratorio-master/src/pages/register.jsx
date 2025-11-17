import React, { useState } from "react";
import "../pages/css/auth.css";

function RegisterPage() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault(); // cegah reload default form

    const res = await fetch("http://localhost:5000/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email,   // email disimpan sebagai username
        password: password
      }),
    });

    const data = await res.json();

    if (data.status === "ok") {
      alert("Register berhasil!");
      window.location.href = "/login";
    } else {
      alert(data.message || "Gagal register");
    }
  };
  

  return (
    <div className="auth-page-wrapper">
      <div className="auth-container">

        <h1>Daftar dan Nikmati Sensasinya Sekarang!</h1>
        <p>Create an account with your email and password.</p>

        <form className="auth-form" onSubmit={handleRegister}>
          <div className="input-group">
            <label htmlFor="email">Email</label>

            <input 
              type="email" 
              id="email"
              placeholder="Daftarkan email Anda"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input 
              type="password"
              id="password"
              placeholder="Daftarkan password Anda"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary">Continue</button>
        </form>

        <div className="auth-links">
          <a href="/login">Have an account? Log in</a>
        </div>

        {/* FOOTERS SAMA SEPERTI KODEMU */}
        <div className="login-footer">
          <div className="footer-social">
            <a href="#" aria-label="Facebook"><svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24" width="24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.85z"/></svg></a>
            <a href="#" aria-label="Instagram"><svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24" width="24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.5-11.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm-5 0c-1.93 0-3.5 1.57-3.5 3.5s1.57 3.5 3.5 3.5 3.5-1.57 3.5-3.5-1.57-3.5-3.5-3.5zm0 5c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg></a>
            <a href="#" aria-label="Pinterest"><svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24" width="24"><path d="M12 2C6.48 2 2 6.48 2 12c0 4.99 3.66 9.13 8.44 9.88.08-.38.12-.87.12-1.25 0-1.13-.42-2.87-.42-2.87s-.12-.25-.12-.62c0-.58.34-.99.75-1 .38-.08.55.28.55.61 0 .38-.25.94-.38 1.47-.12.55.28.99.81.99 1.13 0 1.88-1.4 1.88-3.48 0-1.61-1.13-2.79-2.5-2.79-1.88 0-2.94 1.4-2.94 2.87 0 .38.12.75.25 1 .08.08.08.12 0 .25-.08.25-.25.88-.34 1.13-.08.25-.34.38-.62.25-1.13-.5-1.75-1.88-1.75-3.13 0-2.4 1.75-4.5 5.13-4.5 2.75 0 4.75 2 4.75 4.25 0 2.75-1.5 4.88-3.63 4.88-.75 0-1.4-.38-1.63-.81 0 0-.34 1.4-.42 1.63-.2.55-.61.99-1.12 1.25z"/></svg></a>
          </div>
          <div className="footer-links">
            <div className="link-column"><a href="#">Help Center</a><a href="#">FAQ</a><a href="#">About Oratorio</a></div>
            <div className="link-column"><a href="#">Augmented Reality Interface</a><a href="#">Virtual Reality Interface</a></div>
            <div className="link-column"><a href="#">Kebijakan Privacy</a><a href="#">Syarat & Ketentuan</a></div>
          </div>
          <div className="footer-copyright">
            <p>© 2025 Oratorio, Inc.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
