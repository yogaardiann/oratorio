import os
import logging
import json
import jwt
from functools import wraps
from datetime import datetime, timedelta

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from db import get_connection

# =====================================================
# CONFIG
# =====================================================
JWT_SECRET = "GANTI_DENGAN_SECRET_PANJANG_DAN_AMAN"
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_HOURS = 24

logging.basicConfig(level=logging.INFO)

app = Flask(
    __name__,
    static_url_path="/assets",
    static_folder=os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets")
)
CORS(app)

# =====================================================
# UPLOAD
# =====================================================
UPLOAD_FOLDER = os.path.join(app.root_path, 'static', 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def save_file(file):
    filename = secure_filename(file.filename)
    path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(path)
    return filename

# =====================================================
# JWT MIDDLEWARE
# =====================================================
def jwt_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        auth = request.headers.get("Authorization")

        if not auth or not auth.startswith("Bearer "):
            return jsonify({"message": "Token tidak ada"}), 401

        token = auth.split(" ")[1]

        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            request.user = payload
        except jwt.ExpiredSignatureError:
            return jsonify({"message": "Token expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"message": "Token invalid"}), 401

        return fn(*args, **kwargs)
    return wrapper

# =====================================================
# STATIC
# =====================================================
@app.route('/assets/<path:filename>')
def serve_assets(filename):
    return send_from_directory(app.static_folder, filename)

@app.route('/static/uploads/<path:filename>')
def serve_uploads(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# =====================================================
# AUTH
# =====================================================
@app.route("/api/register", methods=["POST"])
def register():
    data = request.json
    email = data.get("email")
    password = data.get("password")
    name = data.get("name") or email.split("@")[0]

    if not email or not password:
        return jsonify({"status": "error", "message": "Email & password wajib"}), 400

    hashed = generate_password_hash(password)

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("SELECT email FROM users WHERE email=%s", (email,))
        if cursor.fetchone():
            return jsonify({"status": "error", "message": "Email sudah terdaftar"}), 400

        cursor.execute("""
            INSERT INTO users (name, email, password, role)
            VALUES (%s, %s, %s, %s)
        """, (name, email, hashed, "user"))
        conn.commit()

        return jsonify({"status": "ok", "message": "Registrasi berhasil"}), 201
    finally:
        cursor.close()
        conn.close()

@app.route("/api/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("""
            SELECT user_id, email, password, role, name
            FROM users WHERE email=%s
        """, (email,))
        user = cursor.fetchone()

        if not user:
            return jsonify({"status": "error", "message": "Email tidak ditemukan"}), 401

        if not check_password_hash(user["password"], password):
            return jsonify({"status": "error", "message": "Password salah"}), 401

        payload = {
            "user_id": user["user_id"],
            "email": user["email"],
            "role": user["role"],
            "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRE_HOURS)
        }

        token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

        return jsonify({
            "status": "ok",
            "token": token,
            "user": {
                "user_id": user["user_id"],
                "email": user["email"],
                "username": user["name"] or user["email"].split("@")[0],
                "role": user["role"]
            }
        }), 200
    finally:
        cursor.close()
        conn.close()

# =====================================================
# WISATA (JWT PROTECTED)
# =====================================================
@app.route('/api/wisata', methods=['GET'])
@jwt_required
def get_all_wisata():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM ar_destinations ORDER BY id DESC")
    data = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(data), 200

# =====================================================
# HISTORY (JWT PROTECTED)
# =====================================================
@app.route('/api/history', methods=['POST'])
@jwt_required
def add_history():
    data = request.json
    user = request.user

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO history (user_id, user_email, action, started_at)
        VALUES (%s, %s, %s, %s)
    """, (
        user["user_id"],
        user["email"],
        data.get("action", "scan"),
        datetime.utcnow()
    ))
    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({"message": "ok"}), 201

# =====================================================
# RUN
# =====================================================
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
