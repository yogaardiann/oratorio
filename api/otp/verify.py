import os
from flask import Flask, request, jsonify
import jwt
from datetime import datetime, timedelta
import logging

app = Flask(__name__)

SECRET_KEY = 'your_secret_key_here_for_jwt'

@app.route('/', methods=['POST'])
def verify_otp():
    try:
        data = request.get_json()
        email = data.get("email")
        otp_input = data.get("otp")
        
        if not email or not otp_input:
            return jsonify({"status": "error", "message": "Email dan OTP wajib diisi"}), 400
        
        # Placeholder: assume OTP is always correct for demo
        # In production, check stored OTP
        
        temp_token = jwt.encode({
            'email': email,
            'temp': True,
            'exp': datetime.utcnow() + timedelta(minutes=10)
        }, SECRET_KEY, algorithm='HS256')
        
        return jsonify({
            "status": "ok",
            "message": "OTP terverifikasi",
            "temp_token": temp_token
        }), 200
    
    except Exception as e:
        return jsonify({"status": "error", "message": "Verifikasi gagal"}), 500