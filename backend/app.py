from flask import Flask, jsonify
from flask_cors import CORS

from routes.student__routes import student_bp

from routes.recognition_routes import (
    recognition_bp
)

# ==========================================
# CREATE FLASK APP
# ==========================================

app = Flask(__name__)

# ==========================================
# ENABLE CORS
# ==========================================

CORS(app)


# ==========================================
# REGISTER BLUEPRINTS
# ==========================================

app.register_blueprint(
    student_bp
)

app.register_blueprint(
    recognition_bp
)


# ==========================================
# HOME API
# ==========================================

@app.route("/")
def home():

    return jsonify({

        "status": "success",

        "message":
            "Face Recognition Attendance API is running."

    })


# ==========================================
# RUN SERVER
# ==========================================

if __name__ == "__main__":

    app.run(

        host="127.0.0.1",

        port=5000,

        debug=True

    )