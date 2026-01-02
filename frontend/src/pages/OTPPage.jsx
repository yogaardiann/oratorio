// src/pages/OTPPage.jsx
import React, { useState, useEffect, useRef } from "react";
import "../pages/otp.css"; // CSS khusus — tidak ganggu auth.css

function OTPPage() {
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [email, setEmail] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);

  // Ambil email dari localStorage (dikirim dari RegisterPage)
  useEffect(() => {
    const saved = localStorage.getItem("otp_email");
    if (!saved) {
      window.location.href = "/register";
      return;
    }
    setEmail(saved);
  }, []);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleOtpChange = (index, value) => {
    if (/^\d$/.test(value) || value === "") {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 5) inputRefs.current[index + 1].focus();
      if (error) setError("");
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").slice(0, 6);
    if (/^\d{1,6}$/.test(pasted)) {
      const newOtp = Array(6).fill("");
      pasted.split("").forEach((char, i) => (newOtp[i] = char));
      setOtp(newOtp);
      inputRefs.current[Math.min(pasted.length, 5)].focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setError("Masukkan 6 digit kode OTP");
      return;
    }

    setLoading(true);
    try {
      // 1. Verifikasi OTP → dapatkan temp_token
      const verifyRes = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpCode }),
      });
      const verifyData = await verifyRes.json();
      if (verifyData.status !== "ok") throw new Error(verifyData.message);

      // 2. Daftar akun
      const { password } = JSON.parse(localStorage.getItem("otp_data") || "{}");
      const registerRes = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          temp_token: verifyData.temp_token,
          password,
          name: email.split("@")[0],
        }),
      });
      const registerData = await registerRes.json();
      if (registerData.status !== "ok") throw new Error(registerData.message);

      // Bersihkan & redirect
      localStorage.removeItem("otp_email");
      localStorage.removeItem("otp_data");
      alert("Registrasi berhasil!");
      window.location.href = "/login";
    } catch (err) {
      setError(err.message || "Verifikasi gagal");
      setOtp(Array(6).fill(""));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setLoading(true);
    try {
      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.status === "ok") {
        setCountdown(60);
        setError("");
      } else {
        setError(data.message);
      }
    } catch {
      setError("Gagal mengirim ulang OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="otp-page-wrapper">
      <div className="otp-container">
        <div className="otp-header">
          <h1>🔐 Verifikasi Email</h1>
          <p>Kami telah mengirim kode ke <strong>{email}</strong></p>
        </div>

        {error && <div className="otp-error">{error}</div>}

        <form onSubmit={handleVerify} className="otp-form">
          <div className="otp-grid">
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => (inputRefs.current[i] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onPaste={handlePaste}
                className={`otp-input ${digit ? "filled" : ""}`}
              />
            ))}
          </div>

          <button type="submit" className="otp-btn" disabled={loading}>
            {loading ? "Memverifikasi..." : "Verifikasi & Daftar"}
          </button>
        </form>

        <div className="otp-resend">
          {countdown > 0 ? (
            <span className="otp-timer">Kirim ulang dalam {countdown}s</span>
          ) : (
            <button type="button" onClick={handleResend} className="otp-resend-btn">
              Kirim Ulang Kode
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            localStorage.removeItem("otp_email");
            localStorage.removeItem("otp_data");
            window.location.href = "/register";
          }}
          className="otp-back"
        >
          ← Ubah Email/Password
        </button>
      </div>
    </div>
  );
}

export default OTPPage;