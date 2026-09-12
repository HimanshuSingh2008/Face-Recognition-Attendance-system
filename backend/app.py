from flask import Flask, jsonify
from flask_cors import CORS

from routes.student__routes import student_bp

app = Flask(__name__)

CORS(app)

app.register_blueprint(student_bp)

@app.route("/")
def home():
    return jsonify({
        "status": "success",
        "message": "Face Recognition Attendance API is running"
    })


if __name__ == "__main__":
    app.run(debug=True)