import os
import logging
import json
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from db import get_connection

logging.basicConfig(level=logging.INFO)

app = Flask(
    __name__,
    static_url_path="/assets",
    static_folder=os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets")
)
CORS(app)

# Upload folder
UPLOAD_FOLDER = os.path.join(app.root_path, 'static', 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def save_file(file):
    filename = secure_filename(file.filename)
    path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(path)
    return filename

# Try register optional blueprints (non-fatal if missing)
try:
    from routes.user_routes import user_bp
    app.register_blueprint(user_bp, url_prefix="/api/users")
    logging.info("Registered user_bp at /api/users")
except Exception as e:
    logging.info(f"user_bp not registered: {e}")

try:
    from routes.destinations import destinations_bp
    app.register_blueprint(destinations_bp, url_prefix="/api")
    logging.info("Registered destinations_bp at /api")
except Exception as e:
    logging.info(f"destinations_bp not registered: {e}")

# Static serving helpers
@app.route('/assets/<path:filename>')
def serve_assets(filename):
    return send_from_directory(os.path.join(app.root_path, "assets"), filename)

@app.route('/static/uploads/<path:filename>')
def serve_uploads(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# -----------------------
# AR API (CRUD)
# (kept existing endpoints for /api/wisata)
# -----------------------

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

@app.route('/api/wisata', methods=['POST'])
def add_wisata():
    if 'marker' not in request.files or 'mind' not in request.files or 'model' not in request.files:
        return jsonify({"status": "error", "message": "Files marker/mind/model required"}), 400

    name = request.form.get('name') or ""
    description = request.form.get('description') or ""
    location = request.form.get('location') or ""

    marker = request.files['marker']
    mind = request.files['mind']
    model = request.files['model']

    try:
        marker_filename = save_file(marker)
        mind_filename = save_file(mind)
        model_filename = save_file(model)

        conn = get_connection()
        if not conn:
            return jsonify({"status": "error", "message": "DB connection failed"}), 500
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO ar_destinations (name, description, location, marker_image, mind_file, glb_model)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (name, description, location, marker_filename, mind_filename, model_filename))
        conn.commit()
        new_id = cursor.lastrowid
        return jsonify({"status": "ok", "message": "Created", "id": new_id}), 201
    except Exception as e:
        logging.error("Error adding wisata: %s", e)
        if 'conn' in locals():
            conn.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()

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
                set_parts.append("name=%s"); params.append(name)
            if description is not None:
                set_parts.append("description=%s"); params.append(description)
            if location is not None:
                set_parts.append("location=%s"); params.append(location)

            if 'marker' in request.files:
                marker_filename = save_file(request.files['marker'])
                set_parts.append("marker_image=%s"); params.append(marker_filename)
            if 'mind' in request.files:
                mind_filename = save_file(request.files['mind'])
                set_parts.append("mind_file=%s"); params.append(mind_filename)
            if 'model' in request.files:
                model_filename = save_file(request.files['model'])
                set_parts.append("glb_model=%s"); params.append(model_filename)

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

# -----------------------
# History API (new)
# -----------------------
@app.route('/api/history', methods=['POST'])
def add_history():
    data = request.json or {}
    user_id = data.get('user_id')
    user_email = data.get('user_email')
    destination_id = data.get('destination_id')
    action = data.get('action', 'scan_start')
    model_type = data.get('model_type', 'AR')
    started_at = data.get('started_at')  # ISO string optional
    ended_at = data.get('ended_at')
    duration_seconds = data.get('duration_seconds')
    metadata = data.get('metadata')

    # Normalize timestamps
    try:
        if started_at:
            started_str = datetime.fromisoformat(started_at).strftime('%Y-%m-%d %H:%M:%S')
        else:
            started_str = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')
    except Exception:
        started_str = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')

    try:
        conn = get_connection()
        if not conn:
            return jsonify({"message":"DB connection failed"}), 500
        cursor = conn.cursor()
        query = """
            INSERT INTO history (user_id, user_email, destination_id, action, model_type, started_at, ended_at, duration_seconds, metadata)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(query, (
            user_id,
            user_email,
            destination_id,
            action,
            model_type,
            started_str,
            ended_at if ended_at else None,
            duration_seconds,
            json.dumps(metadata) if metadata else None
        ))
        conn.commit()
        hid = cursor.lastrowid
        cursor.close()
        conn.close()
        return jsonify({"message":"ok","history_id":hid}), 201
    except Exception as e:
        logging.error("Error add_history: %s", e)
        return jsonify({"message": str(e)}), 500

@app.route('/api/history', methods=['GET'])
def get_all_history():
    conn = get_connection()
    if not conn:
        return jsonify({"message":"DB connection failed"}), 500
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT h.*, d.name as destination_name FROM history h LEFT JOIN ar_destinations d ON h.destination_id = d.id ORDER BY h.started_at DESC LIMIT 1000")
        rows = cursor.fetchall()
        return jsonify(rows), 200
    except Exception as e:
        logging.error("Error get_all_history: %s", e)
        return jsonify({"message": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/history/user/<int:user_id>', methods=['GET'])
def get_history_by_user(user_id):
    conn = get_connection()
    if not conn:
        return jsonify({"message":"DB connection failed"}), 500
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT h.*, d.name as destination_name FROM history h LEFT JOIN ar_destinations d ON h.destination_id = d.id WHERE h.user_id = %s ORDER BY h.started_at DESC LIMIT 500", (user_id,))
        rows = cursor.fetchall()
        return jsonify(rows), 200
    except Exception as e:
        logging.error("Error get_history_by_user: %s", e)
        return jsonify({"message": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# -----------------------
# AUTH routes (unchanged)
# -----------------------
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
        logging.error("Error during registration: %s", e)
        conn.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500
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

        return jsonify({
            "status": "ok",
            "message": "Login berhasil",
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

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)