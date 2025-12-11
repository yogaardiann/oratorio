from flask import Blueprint, request, jsonify
from db import get_connection

user_bp = Blueprint("user_bp", __name__)

# GET /api/users  -> list semua user aktif
@user_bp.route("/", methods=["GET"])
def get_users():
    conn = get_connection()
    if not conn:
        return jsonify({"message": "DB connection failed"}), 500
    cursor = conn.cursor(dictionary=True)
    try:
        # Filter: hanya user dengan is_active = 1
        cursor.execute("""
            SELECT user_id, name, email, role 
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
        cursor.close()
        conn.close()

# DELETE /api/users/<id> -> soft delete (set is_active = 0)
@user_bp.route("/<int:user_id>", methods=["DELETE"])
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

        # SOFT DELETE: set is_active = 0 (safe, no FK violation)
        cursor.execute("UPDATE users SET is_active = 0 WHERE user_id = %s", (user_id,))
        conn.commit()
        print(f"[DELETE] Soft-deleted user {user_id} ({row[1]})")
        
        return jsonify({"message": "User deleted"}), 200
    except Exception as e:
        print(f"[DELETE] Error: {e}")
        conn.rollback()
        return jsonify({"message": str(e)}), 500
    finally:
        cursor.close()
        conn.close()