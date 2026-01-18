import os
import pymysql
from flask import Flask, request, jsonify
from werkzeug.security import generate_password_hash
import jwt
import logging

app = Flask(__name__)

SECRET_KEY = 'your_secret_key_here_for_jwt'

def get_connection():
    return pymysql.connect(
        host=os.environ['DB_HOST'],
        user=os.environ['DB_USER'],
        password=os.environ['DB_PASSWORD'],
        database=os.environ['DB_NAME'],
        port=int(os.environ.get('DB_PORT', 3306)),
        cursorclass=pymysql.cursors.DictCursor
    )

@app.route('/', methods=['POST'])
def register():
    try:
        data = request.get_json()
        temp_token = data.get("temp_token")
        password = data.get("password")
        name = data.get("name")

        if not temp_token or not password:
            return jsonify({"status": "error", "message": "Token verifikasi OTP diperlukan"}), 400

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

        conn = get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute("SELECT user_id FROM users WHERE email=%s", (email,))
            if cursor.fetchone():
                return jsonify({"status": "error", "message": "Email sudah terdaftar"}), 400

            cursor.execute("""
                INSERT INTO users (name, email, password, role)
                VALUES (%s, %s, %s, %s)
            """, (final_name, email, hashed_password, "user"))
            conn.commit()

            return jsonify({
                "status": "ok", 
                "message": "Registrasi berhasil",
                "user": {"email": email, "name": final_name}
            }), 201

        except Exception as e:
            conn.rollback()
            return jsonify({"status": "error", "message": "Gagal menyimpan ke database"}), 500
        finally:
            cursor.close()
            conn.close()

    except Exception as e:
        return jsonify({"status": "error", "message": "Registrasi gagal"}), 500