import os
import pymysql
from flask import Flask, request, jsonify
from werkzeug.security import check_password_hash
import jwt
from datetime import datetime, timedelta

app = Flask(__name__)

SECRET_KEY = 'your_secret_key_here_for_jwt'
TOKEN_LIFESPAN = timedelta(hours=24)

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
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT user_id, email, password, role, name FROM users WHERE email=%s", (email,))
        user = cursor.fetchone()
        if not user:
            return jsonify({"status": "error", "message": "Email tidak ditemukan"}), 401

        if not check_password_hash(user["password"], password):
            return jsonify({"status": "error", "message": "Password salah"}), 401

        admin_email = "yogaardian114@student.uns.ac.id"
        role = "admin" if user["email"] == admin_email else user.get("role", "user")

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
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        cursor.close()
        conn.close()