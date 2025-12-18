from flask import Blueprint, request, jsonify, current_app
from models import db, ArItem
from werkzeug.utils import secure_filename
import os

api_bp = Blueprint('api', __name__)

def save_file(file):
    filename = secure_filename(file.filename)
    path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
    file.save(path)
    return filename

# --- PUBLIC API (Untuk Frontend User) ---

@api_bp.route('/wisata', methods=['GET'])
def get_all_wisata():
    items = ArItem.query.all()
    return jsonify([item.to_dict() for item in items])

@api_bp.route('/wisata/<int:id>', methods=['GET'])
def get_wisata_detail(id):
    item = ArItem.query.get_or_404(id)
    return jsonify(item.to_dict())

# --- ADMIN API (Untuk Upload) ---
@api_bp.route('/wisata', methods=['POST'])
def add_wisata():
    # Pastikan request punya file dan data
    if 'marker' not in request.files or 'mind' not in request.files or 'model' not in request.files:
        return jsonify({"error": "Missing files"}), 400
    
    marker_file = save_file(request.files['marker'])
    mind_file = save_file(request.files['mind'])
    model_file = save_file(request.files['model'])
    
    new_item = ArItem(
        name=request.form['name'],
        description=request.form.get('description', ''),
        image_marker_path=marker_file,
        mind_file_path=mind_file,
        model_3d_path=model_file
    )
    
    db.session.add(new_item)
    db.session.commit()
    
    return jsonify({"message": "Berhasil ditambahkan", "data": new_item.to_dict()}), 201