import os
import logging
import json
from datetime import datetime, timedelta
from flask import Flask, request, jsonify, send_from_directory, render_template
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from db import get_connection  # Asumsi db.py ada
import jwt
from functools import wraps
from collections import defaultdict
import time
import redis
import random
import smtplib
from werkzeug.middleware.proxy_fix import ProxyFix
from email.mime.text import MIMEText
from datetime import datetime
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv
load_dotenv()


# ✅ Redis graceful init (jangan crash jika Redis lambat)


# Baca konfigurasi
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
SMTP_EMAIL = os.getenv("SMTP_EMAIL", "yogaardian114@student.uns.ac.id")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "ffbfmmgadegzuxma")
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
# --- APLIKASI UTAMA ---
app = Flask(
    __name__,
    static_url_path='/static', 
    static_folder='static',
    template_folder='templates'
)

app.wsgi_app = ProxyFix(
    app.wsgi_app,
    x_for=1,
    x_proto=1,    # ← Biar Flask tahu: "request asli HTTPS"
    x_host=1,
    x_port=1,
    x_prefix=1
)

CORS(app, resources={r"/api/*": {"origins": "*"}}, allow_headers=["Content-Type", "Authorization"])

r = None
try:
    r = redis.Redis(
        host=REDIS_HOST,
        port=REDIS_PORT,
        db=1,
        decode_responses=True,
        socket_connect_timeout=5,
        socket_timeout=5
    )
    # Coba koneksi tanpa raise exception
    r.ping()
    logging.info(f"✅ Redis connected at {REDIS_HOST}:{REDIS_PORT}")
except Exception as e:
    logging.warning(f"⚠️ Redis not ready yet (OTP disabled): {e}")
    # Jangan raise SystemExit — biarkan app jalan tanpa OTP sementara
    r = None

# --- SECURITY CONSTANTS & UTILITY ---
SECRET_KEY = 'your_secret_key_here_for_jwt'  # Ganti dengan key yang aman
TOKEN_LIFESPAN = timedelta(hours=24)

def format_date_for_mysql(date_str):
    if not date_str:
        return None
    try:
        # Menghapus 'Z' dan mengganti 'T' dengan spasi
        clean_date = date_str.replace('Z', '').replace('T', ' ')
        # Membuang milidetik (bagian setelah titik) karena MySQL DATETIME standar tidak menerimanya
        return clean_date.split('.')[0]
    except Exception as e:
        logging.error(f"Date formatting error: {e}")
        return datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')


def token_required(f):
    """Decorator untuk memeriksa JWT token dan menyimpan user_id ke request.current_user_id."""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')

        if not token or not token.startswith('Bearer '):
            return jsonify({'message': 'Authorization header is missing or malformed!'}), 401

        try:
            token = token.split(" ")[1]
            data = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            # Menyimpan user_id ke objek request
            request.current_user_id = data['user_id']

        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired!'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Token is invalid!'}), 401
        except Exception as e:
            logging.error(f"JWT Decoding Error: {e}")
            return jsonify({'message': 'Invalid token format or server error!'}), 401

        return f(*args, **kwargs)

    return decorated
# --- END SECURITY UTILITY ---


# UPLOAD FOLDER
UPLOAD_FOLDER = os.path.join(app.root_path, 'static', 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


def save_file(file):
    filename = secure_filename(file.filename)
    path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(path)
    return filename

# app.py - TAMBAHKAN DI AWAL FILE SETELAH IMPORTS
# -------------------------------------------------------------------
# NGrok Proxy Configuration untuk Mobile AR
# -------------------------------------------------------------------

# URL Ngrok Anda
NGROK_BASE_URL = "hhttps://arcelia-unpronounceable-decretively.ngrok-free.dev"

@app.route('/mobile-ar/<int:destination_id>')
def mobile_ar_proxy(destination_id):
    """
    Proxy untuk mobile: Mengarahkan ke React (ngrok) 
    dengan session/token yang tepat
    """
    # 1. Verifikasi JWT token dari request headers
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({"error": "Unauthorized"}), 401
    
    # 2. Redirect ke React dengan token
    react_url = f"{NGROK_BASE_URL}/mobile-ar/{destination_id}"
    
    # 3. Return redirect response atau proxy langsung
    response = {
        "status": "ok",
        "message": "Mobile AR session created",
        "redirect_url": react_url,
        "token": token.replace("Bearer ", "")
    }
    
    return jsonify(response), 200

@app.route('/api/mobile-session', methods=['POST'])
@token_required
def create_mobile_session():
    """
    Create mobile AR session dengan JWT
    """
    data = request.get_json()
    destination_id = data.get('destination_id')
    
    if not destination_id:
        return jsonify({"error": "Destination ID required"}), 400
    
    # Generate unique session ID
    import uuid
    session_id = str(uuid.uuid4())
    
    # Store session in Redis (opsional)
    if r:
        try:
            r.setex(f"mobile:session:{session_id}", 3600, json.dumps({
                "user_id": request.current_user_id,
                "destination_id": destination_id,
                "created_at": datetime.utcnow().isoformat()
            }))
        except:
            pass
    
    # Return session info
    return jsonify({
        "session_id": session_id,
        "ar_url": f"{NGROK_BASE_URL}/mobile-ar/{destination_id}",
        "timestamp": datetime.utcnow().isoformat()
    }), 201

# Static serving helpers
@app.route('/assets/<path:filename>')
def serve_assets(filename):
    return send_from_directory(os.path.join(app.root_path, "assets"), filename)


@app.route('/static/uploads/<path:filename>')
def serve_uploads(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)


# =========================================================================
# === START USER ROUTES ===================================================
# =========================================================================

# GET /api/users -> list semua user aktif (Dibutuhkan untuk Dashboard/Admin - NO AUTH)
@app.route("/api/users", methods=["GET"])
# 🎯 PERBAIKAN: Menghapus @token_required agar dashboard bisa mengambil data statistik pengguna.
# @token_required 
def get_users():
    conn = get_connection()
    if not conn:
        return jsonify({"message": "DB connection failed"}), 500
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT user_id, name, email, role, phone, dob, hometown 
            FROM users 
            WHERE is_active = 1
            ORDER BY user_id DESC
        """)
        rows = cursor.fetchall()
        print(f"[GET USERS] Fetched {len(rows)} active users")
        return jsonify(rows or []), 200
    except Exception as e:
        print(f"[GET USERS] Error: {e}")
        return jsonify({"message": str(e)}), 500
    finally:
        if 'cursor' in locals() and cursor:
            cursor.close()
        if 'conn' in locals() and conn:
            conn.close()


# DELETE /api/users/<id> -> soft delete (set is_active = 0)
@app.route("/api/users/<int:user_id>", methods=["DELETE"])
@token_required
def delete_user(user_id):
    conn = get_connection()
    if not conn:
        return jsonify({"message": "DB connection failed"}), 500
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT user_id, email FROM users WHERE user_id = %s", (user_id,))
        row = cursor.fetchone()
        if not row:
            print(f"[DELETE] User {user_id} not found")
            return jsonify({"message": "User not found"}), 404

        cursor.execute("UPDATE users SET is_active = 0 WHERE user_id = %s", (user_id,))
        conn.commit()
        print(f"[DELETE] Soft-deleted user {user_id} ({row[1]})")

        return jsonify({"message": "User deleted"}), 200
    except Exception as e:
        print(f"[DELETE] Error: {e}")
        conn.rollback()
        return jsonify({"message": str(e)}), 500
    finally:
        if 'cursor' in locals() and cursor:
            cursor.close()
        if 'conn' in locals() and conn:
            conn.close()


# =====================================================
# USER PROFILE (JWT PROTECTED)
# =====================================================
# 🎯 PERBAIKAN: Mengubah rute menjadi '/api/users/profile'
@app.route('/api/users/profile', methods=['GET'])
@token_required
def get_user_profile():
    # 🎯 PERBAIKAN: Menggunakan request.current_user_id dari decorator
    user_id = request.current_user_id 
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT user_id, name, email, role, phone, dob, hometown 
            FROM users 
            WHERE user_id=%s
        """, (user_id,))
        user = cursor.fetchone()
        
        if not user:
            return jsonify({"message": "User not found"}), 404
        
        # Mengembalikan data dengan kunci 'name' yang digunakan di Dart
        profile_data = {
            "user_id": user.get("user_id"),
            "email": user.get("email"),
            "name": user.get("name"), # Nama Lengkap sesuai kolom DB
            "phone": user.get("phone"),
            "hometown": user.get("hometown"),
        }
        return jsonify(profile_data), 200
    finally:
        if 'cursor' in locals() and cursor:
            cursor.close()
        if 'conn' in locals() and conn:
            conn.close()

@app.route('/api/users/profile', methods=['PUT'])
@token_required
def update_user_profile():
    # 🎯 PERBAIKAN: Menggunakan request.current_user_id dari token
    user_id = request.current_user_id 
    data = request.json
    
    # 🎯 PERBAIKAN: Mengambil kunci 'name' dari Dart (bukan 'fullName')
    name = data.get("name") 
    phone = data.get("phone")
    hometown = data.get("hometown")
    
    conn = get_connection()
    cursor = conn.cursor()
    try:
        # Query UPDATE
        cursor.execute("""
            UPDATE users SET name=%s, phone=%s, hometown=%s 
            WHERE user_id=%s
        """, (name, phone, hometown, user_id))
        conn.commit()
        return jsonify({"message": "Profile updated successfully"}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({"message": str(e)}), 500
    finally:
        if 'cursor' in locals() and cursor:
            cursor.close()
        if 'conn' in locals() and conn:
            conn.close()
        
# =========================================================================
# === AR API (CRUD) =======================================================
# =========================================================================

# GET semua wisata
@app.route('/api/wisata', methods=['GET'])
def get_all_wisata():
    conn = get_connection()
    if not conn:
        return jsonify({"status": "error", "message": "Database connection failed"}), 500
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM ar_destinations ORDER BY id DESC")
        items = cursor.fetchall()
        return jsonify(items), 200
    except Exception as e:
        logging.error("Error fetching wisata: %s", e)
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


# GET detail wisata
@app.route('/api/wisata/<int:id>', methods=['GET'])
def get_wisata_detail(id):
    conn = get_connection()
    if not conn:
        return jsonify({"status": "error", "message": "Database connection failed"}), 500
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM ar_destinations WHERE id = %s", (id,))
        item = cursor.fetchone()
        if item:
            return jsonify(item), 200
        return jsonify({"status": "error", "message": "Not found"}), 404
    except Exception as e:
        logging.error("Error fetching wisata detail: %s", e)
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


# POST tambah wisata
@app.route('/api/wisata', methods=['POST'])
def add_wisata():
    if 'marker' not in request.files or 'mind' not in request.files or 'model' not in request.files:
        return jsonify({"status": "error", "message": "Files marker/mind/model required"}), 400

    # Ambil data teks
    name = request.form.get('name') or ""
    description = request.form.get('description') or ""
    location = request.form.get('location') or ""

    # Ambil file-file
    marker = request.files['marker']
    mind = request.files['mind']
    model = request.files['model']
    audio = request.files.get('audio') # Ambil audio (boleh kosong)

    try:
        marker_filename = save_file(marker)
        mind_filename = save_file(mind)
        model_filename = save_file(model)
        # 🔥 Simpan file audio jika ada
        audio_filename = save_file(audio) if audio else None

        conn = get_connection()
        if not conn:
            return jsonify({"status": "error", "message": "DB connection failed"}), 500
        
        cursor = conn.cursor()
        # ✅ PERBAIKAN: Masukkan audio_file ke Query INSERT
        cursor.execute("""
            INSERT INTO ar_destinations (name, description, location, marker_image, mind_file, glb_model, audio_file)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (name, description, location, marker_filename, mind_filename, model_filename, audio_filename))
        
        conn.commit()
        new_id = cursor.lastrowid
        return jsonify({"status": "ok", "message": "Created with audio", "id": new_id}), 201
    except Exception as e:
        logging.error("Error adding wisata: %s", e)
        if 'conn' in locals(): conn.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals(): conn.close()


# PUT update wisata
@app.route('/api/wisata/<int:id>', methods=['PUT'])
def update_wisata(id):
    conn = get_connection()
    if not conn:
        return jsonify({"status": "error", "message": "DB connection failed"}), 500
    cursor = conn.cursor()
    try:
        if request.content_type and request.content_type.startswith('multipart/form-data'):
            name = request.form.get('name')
            description = request.form.get('description')
            location = request.form.get('location')

            set_parts = []
            params = []

            if name is not None:
                set_parts.append("name=%s")
                params.append(name)
            if description is not None:
                set_parts.append("description=%s")
                params.append(description)
            if location is not None:
                set_parts.append("location=%s")
                params.append(location)

            if 'marker' in request.files:
                marker_filename = save_file(request.files['marker'])
                set_parts.append("marker_image=%s")
                params.append(marker_filename)
            if 'mind' in request.files:
                mind_filename = save_file(request.files['mind'])
                set_parts.append("mind_file=%s")
                params.append(mind_filename)
            if 'model' in request.files:
                model_filename = save_file(request.files['model'])
                set_parts.append("glb_model=%s")
                params.append(model_filename)
            if 'audio' in request.files:
                audio_filename = save_file(request.files['audio'])
                set_parts.append("audio_file=%s")
                params.append(audio_filename)

            if not set_parts:
                return jsonify({"status": "error", "message": "No fields to update"}), 400

            params.append(id)
            query = f"UPDATE ar_destinations SET {', '.join(set_parts)} WHERE id = %s"
            cursor.execute(query, tuple(params))
            conn.commit()
            if cursor.rowcount == 0:
                return jsonify({"status": "error", "message": "Not found"}), 404
            return jsonify({"status": "ok", "message": "Updated"}), 200
        else:
            data = request.json or {}
            allowed = ['name', 'description', 'location']
            set_parts = []
            params = []
            for k in allowed:
                if k in data:
                    set_parts.append(f"{k}=%s")
                    params.append(data[k])
            if not set_parts:
                return jsonify({"status": "error", "message": "No fields to update"}), 400
            params.append(id)
            query = f"UPDATE ar_destinations SET {', '.join(set_parts)} WHERE id = %s"
            cursor.execute(query, tuple(params))
            conn.commit()
            if cursor.rowcount == 0:
                return jsonify({"status": "error", "message": "Not found"}), 404
            return jsonify({"status": "ok", "message": "Updated"}), 200
    except Exception as e:
        logging.error("Error updating wisata: %s", e)
        conn.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


# DELETE wisata
@app.route('/api/wisata/<int:id>', methods=['DELETE'])
def delete_wisata(id):
    conn = get_connection()
    if not conn:
        return jsonify({"status": "error", "message": "DB connection failed"}), 500
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT marker_image, mind_file, glb_model FROM ar_destinations WHERE id = %s", (id,))
        row = cursor.fetchone()
        if not row:
            return jsonify({"status": "error", "message": "Not found"}), 404

        cursor.execute("DELETE FROM ar_destinations WHERE id = %s", (id,))
        conn.commit()

        for key in ("marker_image", "mind_file", "glb_model"):
            fname = row.get(key)
            if fname:
                try:
                    os.remove(os.path.join(app.config['UPLOAD_FOLDER'], fname))
                except Exception:
                    pass

        return jsonify({"status": "ok", "message": "Deleted"}), 200
    except Exception as e:
        logging.error("Error deleting wisata: %s", e)
        conn.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


# =========================================================================
# === HISTORY API =========================================================
# =========================================================================

@app.route('/api/history', methods=['POST'])
def add_history():
    """Endpoint untuk mencatat history scan - tanpa authentication untuk testing"""
    try:
        data = request.get_json()
        print(f"📥 Received history data: {data}")
        
        # Validasi data yang diperlukan
        required_fields = ['user_id', 'destination_id', 'action']
        for field in required_fields:
            if field not in data:
                print(f"❌ Missing required field: {field}")
                return jsonify({
                    "error": f"Missing required field: {field}",
                    "received_data": data
                }), 400
        
        user_id = data.get('user_id')
        destination_id = data.get('destination_id')
        action = data.get('action', 'scan_success')
        model_type = data.get('model_type', 'AR')
        user_email = data.get('user_email', '')
        
        # Jika tidak ada user_email, cari dari database
        if not user_email:
            conn_temp = get_connection()
            if conn_temp:
                try:
                    cursor_temp = conn_temp.cursor(dictionary=True)
                    cursor_temp.execute("SELECT email FROM users WHERE user_id = %s", (user_id,))
                    user = cursor_temp.fetchone()
                    if user:
                        user_email = user['email']
                    cursor_temp.close()
                except Exception as e:
                     logging.error("Error fetching user email for unauthenticated history: %s", e)
                finally:
                    conn_temp.close()
            
            if not user_email:
                 user_email = f"user_{user_id}@example.com"
        
        # Timestamp
        started_at = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')
        
        # Simpan ke database
        conn = get_connection()
        if not conn:
            return jsonify({"message": "DB connection failed"}), 500
            
        cursor = conn.cursor()
        query = """
            INSERT INTO history (user_id, user_email, destination_id, action, model_type, started_at)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        cursor.execute(query, (
            user_id,
            user_email,
            destination_id,
            action,
            model_type,
            started_at
        ))
        
        conn.commit()
        history_id = cursor.lastrowid
        
        cursor.close()
        conn.close()
        
        print(f"✅ History recorded: user_id={user_id}, destination_id={destination_id}, action={action}")
        
        return jsonify({
            "message": "History recorded successfully",
            "history_id": history_id,
            "data": {
                "user_id": user_id,
                "user_email": user_email,
                "destination_id": destination_id,
                "action": action,
                "model_type": model_type,
                "timestamp": started_at
            }
        }), 201
        
    except Exception as e:
        print(f"❌ Error in /api/history: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/history/auth', methods=['POST'])
@token_required
def add_history_with_auth():
    """Endpoint untuk mencatat history scan - dengan authentication & normalisasi tanggal"""
    try:
        data = request.get_json()
        user_id_from_token = request.current_user_id
        
        # Validasi minimal
        if 'destination_id' not in data:
            return jsonify({
                "error": "Missing required field: destination_id",
                "received_data": data
            }), 400
        
        destination_id = data.get('destination_id')
        action = data.get('action', 'scan_success')
        model_type = data.get('model_type', 'AR')
        
        # Cari user_email dari database
        user_email = ""
        conn_temp = get_connection()
        if conn_temp:
            try:
                cursor_temp = conn_temp.cursor(dictionary=True)
                cursor_temp.execute("SELECT email FROM users WHERE user_id = %s", (user_id_from_token,))
                user = cursor_temp.fetchone()
                if user:
                    user_email = user['email']
                cursor_temp.close()
            except Exception as e:
                 logging.error(f"Error fetching user email: {e}")
            finally:
                conn_temp.close()
        
        if not user_email:
             user_email = f"user_{user_id_from_token}@example.com"
        
        # --- 🎯 PERBAIKAN KRITIS: Normalisasi Format Tanggal ---
        started_at_raw = data.get('started_at')
        ended_at_raw = data.get('ended_at')
        
        # Kita panggil fungsi format_date_for_mysql yang sudah kamu buat di atas
        started_at = format_date_for_mysql(started_at_raw) if started_at_raw else datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')
        ended_at = format_date_for_mysql(ended_at_raw) if ended_at_raw else None
        
        duration_seconds = data.get('duration_seconds', 0)
        
        # Simpan ke database
        conn = get_connection()
        if not conn:
            return jsonify({"message": "DB connection failed"}), 500
            
        cursor = conn.cursor()
        query = """
            INSERT INTO history (user_id, user_email, destination_id, action, model_type, started_at, ended_at, duration_seconds)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        # Gunakan variabel started_at dan ended_at yang SUDAH DIFORMAT
        cursor.execute(query, (
            user_id_from_token,
            user_email,
            destination_id,
            action,
            model_type,
            started_at, 
            ended_at,
            duration_seconds
        ))
        
        conn.commit()
        history_id = cursor.lastrowid
        
        cursor.close()
        conn.close()
        
        print(f"✅ [AUTH] History recorded successfully: ID {history_id} for User {user_id_from_token}")
        
        return jsonify({
            "status": "ok",
            "message": "History recorded successfully",
            "history_id": history_id
        }), 201
        
    except Exception as e:
        logging.error(f"❌ [AUTH] Error in /api/history/auth: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/history', methods=['GET'])
# 🎯 PERBAIKAN: Menghapus @token_required agar dashboard bisa mengambil data statistik riwayat.
# @token_required
def get_all_history():
    conn = get_connection()
    if not conn:
        return jsonify({"message": "DB connection failed"}), 500
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT h.*, d.name as destination_name 
            FROM history h 
            LEFT JOIN ar_destinations d ON h.destination_id = d.id 
            ORDER BY h.started_at DESC 
            LIMIT 1000
        """)
        rows = cursor.fetchall()
        return jsonify(rows), 200
    except Exception as e:
        logging.error("Error get_all_history: %s", e)
        return jsonify({"message": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


@app.route('/api/history/user/<int:user_id>', methods=['GET'])
@token_required 
def get_history_by_user(user_id):
    conn = get_connection()
    if not conn: return jsonify({"message": "DB connection failed"}), 500
    cursor = conn.cursor(dictionary=True)
    try:
        if request.current_user_id != user_id:
            return jsonify({'message': 'Akses ditolak: Tidak diizinkan melihat history pengguna lain.'}), 403

        # PERBAIKAN KRITIS: EKSPLISIT MEMILIH KOLOM AMAN UNTUK MENGHINDARI DATETIME/BYTES ERROR
        cursor.execute("""
            SELECT 
                h.history_id, h.user_id, h.user_email, h.destination_id, h.action, 
                h.model_type, h.started_at, h.ended_at, h.duration_seconds, 
                d.name as destination_name
            FROM history h 
            LEFT JOIN ar_destinations d ON h.destination_id = d.id 
            WHERE h.user_id = %s 
            ORDER BY h.started_at DESC 
            LIMIT 500
        """, (user_id,))
        rows = cursor.fetchall()

        # Konversi tipe data (datetime) ke string ISO 8601 yang aman
        clean_rows = []
        for row in rows:
            clean_row = row.copy()
            
            # Konversi Datetime ke String ISO 8601
            if isinstance(clean_row.get('started_at'), datetime):
                clean_row['started_at'] = clean_row['started_at'].isoformat()
            if isinstance(clean_row.get('ended_at'), datetime):
                clean_row['ended_at'] = clean_row['ended_at'].isoformat()
            
            # Konversi bytes ke string jika ada
            for key, value in clean_row.items():
                if isinstance(value, bytes):
                     clean_row[key] = value.decode('utf-8', 'ignore')

            clean_rows.append(clean_row)
        
        return jsonify(clean_rows), 200
    except Exception as e:
        logging.error("Error get_history_by_user: %s", e)
        return jsonify({"message": "Internal Server Error. Gagal memuat riwayat. (Check log server)"}), 500
    finally:
        cursor.close()
        conn.close()


# =========================================================================
# === AUTH ROUTES =========================================================
# =========================================================================

@app.route("/api/register", methods=["POST"])
def register():
    """Endpoint: /api/register — hanya bisa dipanggil setelah OTP diverifikasi"""
    try:
        data = request.get_json()
        temp_token = data.get("temp_token")  # ✅ Dari hasil /api/otp/verify
        password = data.get("password")
        name = data.get("name")

        if not temp_token or not password:
            return jsonify({"status": "error", "message": "Token verifikasi OTP diperlukan"}), 400

        # Verifikasi temp token
        try:
            decoded = jwt.decode(temp_token, SECRET_KEY, algorithms=['HS256'])
            if not decoded.get('temp'):
                return jsonify({"status": "error", "message": "Token tidak valid untuk registrasi"}), 400
            email = decoded['email']
        except Exception:
            return jsonify({"status": "error", "message": "Token verifikasi kadaluarsa atau tidak valid"}), 401

        if len(password) < 6:
            return jsonify({"status": "error", "message": "Password minimal 6 karakter"}), 400

        hashed_password = generate_password_hash(password)
        final_name = name or email.split("@")[0]

        # Simpan ke DB
        conn = get_connection()
        if not conn:
            return jsonify({"status": "error", "message": "Gagal terhubung ke database"}), 500

        cursor = conn.cursor(dictionary=True)
        try:
            cursor.execute("SELECT user_id FROM users WHERE email=%s", (email,))
            if cursor.fetchone():
                return jsonify({"status": "error", "message": "Email sudah terdaftar"}), 400

            cursor.execute("""
                INSERT INTO users (name, email, password, role)
                VALUES (%s, %s, %s, %s)
            """, (final_name, email, hashed_password, "user"))
            conn.commit()

            logging.info(f"User registered: {email}")
            return jsonify({
                "status": "ok", 
                "message": "Registrasi berhasil",
                "user": {"email": email, "name": final_name}
            }), 201

        except Exception as e:
            conn.rollback()
            logging.error(f"DB register error: {e}")
            return jsonify({"status": "error", "message": "Gagal menyimpan ke database"}), 500
        finally:
            cursor.close()
            conn.close()

    except Exception as e:
        logging.error(f"Register error: {e}")
        return jsonify({"status": "error", "message": "Registrasi gagal"}), 500


@app.route("/api/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    conn = get_connection()
    if not conn:
        return jsonify({"status": "error", "message": "Gagal terhubung ke database."}), 500

    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT user_id, email, password, role, name FROM users WHERE email=%s", (email,))
        user = cursor.fetchone()
        if not user:
            return jsonify({"status": "error", "message": "Email tidak ditemukan"}), 401

        if not check_password_hash(user["password"], password):
            return jsonify({"status": "error", "message": "Password salah"}), 401

        admin_email = "yogaardian114@student.uns.ac.id"
        role = "admin" if user["email"] == admin_email else user.get("role", "user")

        # Generate JWT token
        token = jwt.encode({
            'user_id': user['user_id'],
            'exp': datetime.utcnow() + TOKEN_LIFESPAN
        }, SECRET_KEY, algorithm='HS256')

        return jsonify({
            "status": "ok",
            "message": "Login berhasil",
            "token": token,
            "user": {
                "user_id": user.get("user_id"),
                "email": user["email"],
                "username": user.get("name") or user["email"].split("@")[0],
                "role": role
            }
        }), 200
    except Exception as e:
        logging.error("Error during login: %s", e)
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


# =========================================================================
# === HEALTH CHECK & UTILITY ==============================================
# =========================================================================

@app.route('/')
def home():
    """Health check endpoint"""
    return jsonify({
        "message": "Flask server is running",
        "timestamp": datetime.utcnow().isoformat(),
        "endpoints": {
            "/api/wisata": "GET - Get all destinations",
            "/api/login": "POST - User login",
            "/api/register": "POST - User registration",
            "/api/history": "GET/POST - History (GET now public for dashboard)",
            "/api/history/auth": "POST - Add history record (with auth)",
            "/api/users/profile": "GET/PUT - Get/Update user profile"
        }
    }), 200


@app.route('/health')
def health_check():
    """Simple health check"""
    return jsonify({"status": "healthy", "timestamp": datetime.utcnow().isoformat()}), 200


# =========================================================================
# === OTP ROUTES (Baru) ===================================================
# =========================================================================

# Konfigurasi email (Ganti dengan kredensial Anda)

def send_email_otp(email, otp):
    """Kirim OTP via email — return True jika sukses"""
    try:
        msg = MIMEMultipart()
        msg['From'] = SMTP_EMAIL
        msg['To'] = email
        msg['Subject'] = "🎯 Verifikasi Akun Oratorio — Kode OTP"
        
        body = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background: #f8fafc;">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="font-size: 2.5rem; margin-bottom: 12px;">🔐</div>
            <h2 style="color: #0f172a; margin: 0;">Verifikasi Akun Anda</h2>
            <p style="color: #64748b; margin-top: 8px;">Masukkan kode berikut ke aplikasi Oratorio</p>
          </div>
          
          <div style="text-align: center; margin: 32px 0;">
            <div style="font-size: 2.25rem; font-weight: bold; letter-spacing: 12px; color: #0d9488; background: white; padding: 16px; border-radius: 12px; display: inline-block; border: 2px solid #e2e8f0;">
              {otp}
            </div>
          </div>
          
          <div style="text-align: center; color: #94a3b8; font-size: 0.875rem; margin-top: 24px;">
            <p>Kode berlaku 5 menit. Jangan berikan ke siapa pun.</p>
            <p>© 2026 Oratorio. Jelajahi Dunia AR/VR.</p>
          </div>
        </div>
        """
        msg.attach(MIMEText(body, 'html'))

        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_EMAIL, SMTP_PASSWORD)
        server.sendmail(SMTP_EMAIL, email, msg.as_string())
        server.quit()
        return True
    except Exception as e:
        logging.error(f"Email OTP error for {email}: {e}")
        return False


def is_rate_limited(email: str) -> bool:
    if r is None:
        return False  # Nonaktifkan rate limit jika Redis mati
    try:
        key = f"otp:rate:{email}"
        count = r.incr(key)
        if count == 1:
            r.expire(key, 600)
        return count > 3
    except:
        return False

def store_otp(email: str, otp: str):
    if r is None:
        return
    try:
        r.setex(f"otp:code:{email}", 300, otp)
    except:
        pass

def get_otp(email: str) -> str | None:
    if r is None:
        return None
    try:
        return r.get(f"otp:code:{email}")
    except:
        return None

def delete_otp(email: str):
    if r is None:
        return
    try:
        r.delete(f"otp:code:{email}")
    except:
        pass


@app.route("/api/otp/send", methods=["POST"])
def send_otp():
    try:
        data = request.get_json()
        email = data.get("email")
        
        if not email or "@" not in email:
            return jsonify({"status": "error", "message": "Email tidak valid"}), 400
        
        if is_rate_limited(email):
            return jsonify({"status": "error", "message": "Terlalu banyak permintaan. Coba lagi dalam 10 menit."}), 429
        
        otp = str(random.randint(100000, 999999))
        store_otp(email, otp)  # ✅ Simpan ke Redis
        
        if not send_email_otp(email, otp):
            # Jika gagal kirim email, hapus OTP
            delete_otp(email)
            return jsonify({"status": "error", "message": "Gagal mengirim email. Coba lagi."}), 500
        
        logging.info(f"OTP {otp} sent to {email} (stored in Redis)")
        return jsonify({"status": "ok", "message": "OTP terkirim ke email Anda"}), 200
    
    except Exception as e:
        logging.error(f"Send OTP error: {e}")
        return jsonify({"status": "error", "message": "Terjadi kesalahan internal"}), 500


@app.route("/api/otp/verify", methods=["POST"])
def verify_otp():
    try:
        data = request.get_json()
        email = data.get("email")
        otp_input = data.get("otp")
        
        if not email or not otp_input:
            return jsonify({"status": "error", "message": "Email dan OTP wajib diisi"}), 400
        
        # 🔐 Tambahkan rate limit untuk verifikasi
        verify_key = f"otp:verify:{email}"
        verify_count = r.incr(verify_key)
        if verify_count == 1:
            r.expire(verify_key, 300)  # 5 menit
        if verify_count > 5:  # Maks 5 percobaan
            return jsonify({"status": "error", "message": "Terlalu banyak percobaan. Coba lagi dalam 5 menit."}), 429
        
        # ✅ Sukses — hapus OTP & beri token
        delete_otp(email)
        
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
        logging.error(f"Verify OTP error: {e}")
        return jsonify({"status": "error", "message": "Verifikasi gagal"}), 500

# --- Scan Audio ---

@app.route('/scan/<int:id>')
def scan_destination(id):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM ar_destinations WHERE id = %s", (id,))
    dest = cursor.fetchone()
    cursor.close()
    conn.close()

    if not dest:
        return "Destinasi tidak ditemukan", 404

    # Kirim data ke template HTML (kita buat di langkah 2)
    return render_template('scan_info.html', dest=dest)

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)