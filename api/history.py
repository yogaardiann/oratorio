import os
import pymysql
from flask import Flask, request, jsonify
from datetime import datetime
import json

app = Flask(__name__)

def get_connection():
    return pymysql.connect(
        host=os.environ['DB_HOST'],
        user=os.environ['DB_USER'],
        password=os.environ['DB_PASSWORD'],
        database=os.environ['DB_NAME'],
        port=int(os.environ.get('DB_PORT', 3306)),
        cursorclass=pymysql.cursors.DictCursor
    )

def _iso_to_sql(iso_str):
    try:
        if not iso_str:
            return None
        dt = datetime.fromisoformat(iso_str.replace('Z', '+00:00'))
        return dt.strftime("%Y-%m-%d %H:%M:%S")
    except Exception as e:
        return None

@app.route('/', methods=['GET'])
def get_all_history():
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT h.*, d.name as destination_name FROM history h LEFT JOIN ar_destinations d ON h.destination_id = d.id ORDER BY h.started_at DESC LIMIT 1000")
        rows = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(rows), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/', methods=['POST'])
def add_history():
    data = request.json or {}
    user_id = data.get("user_id")
    user_email = data.get("user_email")
    destination_id = data.get("destination_id")
    action = data.get("action", "scan_start")
    model_type = data.get("model_type", "AR")
    started_at = data.get("started_at")
    ended_at = data.get("ended_at")
    duration_seconds = data.get("duration_seconds")
    metadata = data.get("metadata")

    started_at_sql = _iso_to_sql(started_at)
    if not started_at_sql:
        started_at_sql = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    
    ended_at_sql = _iso_to_sql(ended_at) if ended_at else None

    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        # Upsert logic
        if user_id is not None and destination_id is not None:
            cursor.execute(
                "SELECT history_id FROM history WHERE user_id = %s AND destination_id = %s LIMIT 1",
                (user_id, destination_id)
            )
            existing = cursor.fetchone()
            if existing:
                hid = existing[0]
                if action == "scan_start":
                    cursor.execute("""
                        UPDATE history SET action=%s, model_type=%s, started_at=%s, ended_at=NULL, duration_seconds=NULL, metadata=%s
                        WHERE history_id=%s
                    """, (action, model_type, started_at_sql, json.dumps(metadata) if metadata else None, hid))
                else:
                    cursor.execute("""
                        UPDATE history SET action=%s, model_type=%s, ended_at=%s, duration_seconds=%s, metadata=%s
                        WHERE history_id=%s
                    """, (action, model_type, ended_at_sql, duration_seconds, json.dumps(metadata) if metadata else None, hid))
                conn.commit()
                cursor.close()
                conn.close()
                return jsonify({"message":"updated","history_id":hid}), 200

        # Insert
        cursor.execute("""
            INSERT INTO history (user_id, user_email, destination_id, action, model_type, started_at, ended_at, duration_seconds, metadata)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            user_id, user_email, destination_id, action, model_type,
            started_at_sql, ended_at_sql, duration_seconds,
            json.dumps(metadata) if metadata else None
        ))
        conn.commit()
        hid = cursor.lastrowid
        cursor.close()
        conn.close()
        return jsonify({"message":"created","history_id":hid}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/user/<int:user_id>', methods=['GET'])
def get_history_by_user(user_id):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        query = "SELECT h.*, d.name as destination_name FROM history h LEFT JOIN ar_destinations d ON h.destination_id = d.id WHERE h.user_id = %s ORDER BY h.started_at DESC LIMIT 200"
        cursor.execute(query, (user_id,))
        rows = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(rows), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500