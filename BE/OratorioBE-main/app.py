from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from db import get_connection
import json

app = Flask(__name__)
CORS(app)

# DESTINATIONS
@app.route("/api/destinations", methods=["GET"])
def get_destinations():
    with open("destinations.json", "r", encoding="utf-8") as file:
        data = json.load(file)
    return jsonify(data)


# ---------------------------------------
# REGISTER
# ---------------------------------------
@app.route("/api/register", methods=["POST"])
def register():
    data = request.json
    email = data.get("email")
    password = data.get("password")
    name = data.get("name") or email.split("@")[0]

    if not email or not password:
        return jsonify({"status": "error", "message": "Missing fields"}), 400

    hashed = generate_password_hash(password)

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    # cek apakah email sudah terdaftar
    cursor.execute("SELECT * FROM users WHERE email=%s", (email,))
    exist = cursor.fetchone()

    if exist:
        return jsonify({"status": "error", "message": "Email already exists"}), 400

    # insert user baru
    cursor.execute("""
        INSERT INTO users (name, email, password, role)
        VALUES (%s, %s, %s, %s)
    """, (name, email, hashed, "user"))

    conn.commit()

    return jsonify({"status": "ok", "message": "Register success"}), 201


# ---------------------------------------
# LOGIN
# ---------------------------------------
@app.route("/api/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM users WHERE email=%s", (email,))
    user = cursor.fetchone()

    if not user:
        return jsonify({"status": "error", "message": "Email not found"}), 401

    if not check_password_hash(user["password"], password):
        return jsonify({"status": "error", "message": "Wrong password"}), 401

    # normalisasi nama
    name_parts = user["name"].split(" ")
    first_name = name_parts[0]
    last_name = " ".join(name_parts[1:]) if len(name_parts) > 1 else ""
    
    # --- PERUBAHAN DI SINI ---
    # Logika username sekarang SELALU mengambil dari email
    username = user["email"].split("@")[0] 
    # ---------------------------

    return jsonify({
        "status": "ok",
        "message": "Login success",
        "user": {
            "user_id": user["user_id"],
            "email": user["email"],
            "username": username,    # Ini sekarang akan mengirim "tes11"
            "role": user["role"]
        }
    }), 200


# ---------------------------------------
# RUN
# ---------------------------------------
if __name__ == "__main__":
    app.run(debug=True)
