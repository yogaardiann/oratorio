import os
import pymysql
from flask import Flask, request, jsonify
import jwt
from functools import wraps

app = Flask(__name__)

SECRET_KEY = 'your_secret_key_here_for_jwt'

def get_connection():
    return pymysql.connect(
        host=os.getenv('MYSQLHOST'),
        user=os.getenv('MYSQLUSER'),
        password=os.getenv('MYSQLPASSWORD'),
        database=os.getenv('MYSQLDATABASE'),
        port=int(os.getenv('MYSQLPORT', 3306)),
        cursorclass=pymysql.cursors.DictCursor
    )

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token or not token.startswith('Bearer '):
            return jsonify({'message': 'Authorization header is missing or malformed!'}), 401
        try:
            token = token.split(" ")[1]
            data = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            request.current_user_id = data['user_id']
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired!'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Token is invalid!'}), 401
        except Exception as e:
            return jsonify({'message': 'Invalid token format or server error!'}), 401
        return f(*args, **kwargs)
    return decorated

@app.route('/', methods=['GET'])
def get_users():
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT user_id, name, email, role 
            FROM users 
            WHERE is_active = 1
            ORDER BY user_id DESC
        """)
        rows = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(rows), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT user_id FROM users WHERE user_id = %s", (user_id,))
        if not cursor.fetchone():
            cursor.close()
            conn.close()
            return jsonify({"message": "User not found"}), 404
        
        cursor.execute("UPDATE users SET is_active = 0 WHERE user_id = %s", (user_id,))
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({"message": "User deleted"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/profile', methods=['GET'])
@token_required
def get_user_profile():
    user_id = request.current_user_id 
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT user_id, name, email, role, phone, dob, hometown 
            FROM users 
            WHERE user_id=%s
        """, (user_id,))
        user = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if not user:
            return jsonify({"message": "User not found"}), 404
        
        profile_data = {
            "user_id": user.get("user_id"),
            "email": user.get("email"),
            "name": user.get("name"),
            "phone": user.get("phone"),
            "hometown": user.get("hometown"),
        }
        return jsonify(profile_data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/profile', methods=['PUT'])
@token_required
def update_user_profile():
    user_id = request.current_user_id 
    data = request.json
    
    name = data.get("name") 
    phone = data.get("phone")
    hometown = data.get("hometown")
    
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE users SET name=%s, phone=%s, hometown=%s 
            WHERE user_id=%s
        """, (name, phone, hometown, user_id))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"message": "Profile updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500