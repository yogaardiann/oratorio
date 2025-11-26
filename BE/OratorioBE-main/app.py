from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from db import get_connection
import logging
import os

# Coba import blueprint, gunakan try-except agar tidak error jika file belum siap
try:
    from routes.destinations import destinations_bp
except ImportError:
    destinations_bp = None
    print("Warning: routes.destinations not found, skipping blueprint.")

# ================================
# Flask App + Static Files Config
# ================================
app = Flask(
    __name__,
    static_url_path="/assets",  
    static_folder=os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets")
)
CORS(app)

# KONFIGURASI FOLDER UPLOAD KHUSUS AR
# Folder ini akan menyimpan file .glb, .mind, dan .jpg marker
UPLOAD_FOLDER = os.path.join(app.root_path, 'static', 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True) # Buat folder otomatis jika belum ada
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# ================================
# Logging
# ================================
logging.basicConfig(level=logging.INFO)

# ================================
# STATIC ROUTE (Agar file bisa diakses Frontend)
# ================================

# 1. Route untuk Assets Website (Logo, Banner, dll)
@app.route('/assets/<path:filename>')
def serve_assets(filename):
    return send_from_directory(os.path.join(app.root_path, "assets"), filename)

# 2. Route KHUSUS untuk File AR (GLB, Mind, Marker)
@app.route('/static/uploads/<path:filename>')
def serve_uploads(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)


# ================================
# AR ROUTES (Integrasi Database ar_destinations)
# ================================

# GET ALL WISATA (Untuk Gallery Page)
@app.route('/api/wisata', methods=['GET'])
def get_all_wisata():
    conn = get_connection()
    if not conn:
        return jsonify({"status": "error", "message": "Database connection failed"}), 500
    
    cursor = conn.cursor(dictionary=True)
    try:
        # Mengambil data dari tabel 'ar_destinations' sesuai database Anda
        cursor.execute("SELECT * FROM ar_destinations")
        items = cursor.fetchall()
        return jsonify(items), 200
    except Exception as e:
        logging.error(f"Error fetching wisata: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# GET DETAIL WISATA (Untuk Halaman Detail & Scan)
@app.route('/api/wisata/<int:id>', methods=['GET'])
def get_wisata_detail(id):
    conn = get_connection()
    if not conn: return jsonify({"message": "DB Error"}), 500
    
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM ar_destinations WHERE id = %s", (id,))
        item = cursor.fetchone()
        if item:
            return jsonify(item), 200
        return jsonify({"message": "Data not found"}), 404
    finally:
        cursor.close()
        conn.close()

# POST WISATA (Untuk Admin Upload AR Baru)
@app.route('/api/wisata', methods=['POST'])
def add_wisata():
    # 1. Cek kelengkapan file
    if 'marker' not in request.files or 'mind' not in request.files or 'model' not in request.files:
        return jsonify({"error": "File Marker, Mind, atau Model 3D hilang"}), 400
    
    # Ambil data text
    name = request.form.get('name')
    description = request.form.get('description')
    location = request.form.get('location', '') # Optional
    
    # Ambil data file
    marker_file = request.files['marker']
    mind_file = request.files['mind']
    model_file = request.files['model']

    # Helper simpan file
    def save_file(file):
        filename = secure_filename(file.filename)
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        return filename

    try:
        marker_path = save_file(marker_file)
        mind_path = save_file(mind_file)
        model_path = save_file(model_file)

        conn = get_connection()
        cursor = conn.cursor()
        
        # INSERT ke tabel ar_destinations
        # Pastikan kolom 'mind_file' sudah ditambahkan di database lewat SQL
        query = """
            INSERT INTO ar_destinations (name, description, location, marker_image, mind_file, glb_model)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        cursor.execute(query, (name, description, location, marker_path, mind_path, model_path))
        conn.commit()
        
        return jsonify({"status": "ok", "message": "Data AR berhasil ditambahkan"}), 201
    except Exception as e:
        logging.error(f"Error uploading AR: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals(): conn.close()


# ================================
# AUTH ROUTES (Login & Register)
# ================================

@app.route("/api/register", methods=["POST"])
def register():
    data = request.json
    email = data.get("email")
    password = data.get("password")
    name = data.get("name") or (email.split("@")[0] if email else None)

    if not email or not password:
        return jsonify({"status": "error", "message": "Field Email atau Password hilang"}), 400

    hashed_password = generate_password_hash(password)

    conn = get_connection()
    if not conn:
        return jsonify({"status": "error", "message": "Gagal terhubung ke database"}), 500

    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("SELECT * FROM users WHERE email=%s", (email,))
        if cursor.fetchone():
            return jsonify({"status": "error", "message": "Email sudah terdaftar"}), 400

        cursor.execute("""
            INSERT INTO users (name, email, password, role)
            VALUES (%s, %s, %s, %s)
        """, (name, email, hashed_password, "user"))

        conn.commit()
        return jsonify({"status": "ok", "message": "Registrasi berhasil"}), 201

    except Exception as e:
        logging.error(f"Error during registration: {e}")
        conn.rollback()
        return jsonify({"status": "error", "message": "Terjadi kesalahan saat menyimpan data"}), 500

    finally:
        cursor.close()
        conn.close()

@app.route("/api/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    conn = get_connection()
    if not conn:
        return jsonify({"status": "error", "message": "Gagal terhubung ke database"}), 500

    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("SELECT * FROM users WHERE email=%s", (email,))
        user = cursor.fetchone()

        if not user:
            return jsonify({"status": "error", "message": "Email tidak ditemukan"}), 401

        if not check_password_hash(user["password"], password):
            return jsonify({"status": "error", "message": "Password salah"}), 401

        admin_email = "yogaardian114@student.uns.ac.id"
        role = "admin" if user["email"] == admin_email else user["role"]

        return jsonify({
            "status": "ok",
            "message": "Login berhasil",
            "user": {
                "user_id": user.get("user_id"),
                "email": user["email"],
                "username": user["email"].split("@")[0],
                "role": role
            }
        }), 200

    except Exception as e:
        logging.error(f"Error during login: {e}")
        return jsonify({"status": "error", "message": "Terjadi kesalahan server"}), 500

    finally:
        cursor.close()
        conn.close()

# ================================
# REGISTER BLUEPRINTS
# ================================
if destinations_bp:
    app.register_blueprint(destinations_bp, url_prefix="/api")

# ================================
# RUN SERVER
# ================================
if __name__ == "__main__":
    # PERBAIKAN: host='0.0.0.0' agar bisa diakses HP
    app.run(debug=True, host='0.0.0.0', port=5000)