from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class ArItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False) # Misal: Candi Borobudur
    description = db.Column(db.Text, nullable=True)
    
    # Path file yang diupload
    image_marker_path = db.Column(db.String(200), nullable=False) # marker.jpg untuk ditampilkan di layar kiri
    mind_file_path = db.Column(db.String(200), nullable=False)    # targets.mind untuk tracking
    model_3d_path = db.Column(db.String(200), nullable=False)     # asset.glb
    
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "image_marker": self.image_marker_path,
            "mind_file": self.mind_file_path,
            "model_3d": self.model_3d_path
        }