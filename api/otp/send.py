import os
import random
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask import Flask, request, jsonify
import logging

app = Flask(__name__)

SMTP_EMAIL = os.getenv("SMTP_EMAIL", "yogaardian114@student.uns.ac.id")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "ffbfmmgadegzuxma")
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587

def send_email_otp(email, otp):
    try:
        msg = MIMEMultipart()
        msg['From'] = SMTP_EMAIL
        msg['To'] = email
        msg['Subject'] = "🎯 Verifikasi Akun Oratorio — Kode OTP"

        body = f"""
        Halo!

        Kode OTP Anda untuk verifikasi akun Oratorio adalah:

        {otp}

        Kode ini berlaku selama 5 menit. Jangan bagikan kode ini kepada siapa pun.

        Jika Anda tidak meminta kode ini, abaikan email ini.

        Terima kasih,
        Tim Oratorio
        """
        msg.attach(MIMEText(body, 'plain'))

        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_EMAIL, SMTP_PASSWORD)
        text = msg.as_string()
        server.sendmail(SMTP_EMAIL, email, text)
        server.quit()
        return True
    except Exception as e:
        logging.error(f"Email OTP error for {email}: {e}")
        return False

@app.route('/', methods=['POST'])
def send_otp():
    try:
        data = request.get_json()
        email = data.get("email")
        
        if not email or "@" not in email:
            return jsonify({"status": "error", "message": "Email tidak valid"}), 400
        
        otp = str(random.randint(100000, 999999))
        # Store OTP - placeholder, since Redis not available in serverless easily
        # In production, use Upstash Redis or similar
        
        if not send_email_otp(email, otp):
            return jsonify({"status": "error", "message": "Gagal mengirim email. Coba lagi."}), 500
        
        return jsonify({"status": "ok", "message": "OTP terkirim ke email Anda"}), 200
    
    except Exception as e:
        return jsonify({"status": "error", "message": "Terjadi kesalahan internal"}), 500