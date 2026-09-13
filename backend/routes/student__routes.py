import os
import base64
import re

import cv2
import numpy as np

from flask import Blueprint, request, jsonify

from database.db import get_connection
from services.face_encoder import create_encoding_for_student


student_bp = Blueprint(
    "student",
    __name__,
    url_prefix="/api/students"
)


# ==========================================
# DATASET FOLDER
# ==========================================

DATASET_FOLDER = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "dataset",
    "registered_faces"
)

os.makedirs(DATASET_FOLDER, exist_ok=True)


# ==========================================
# REGISTER STUDENT
# ==========================================

@student_bp.route("/register", methods=["POST"])
def register_student():

    connection = None

    try:

        # ==========================================
        # GET JSON DATA
        # ==========================================

        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "message": "No data received."
            }), 400

        name = data.get("name", "").strip()
        roll_number = data.get("roll_number", "").strip()
        image_data = data.get("image")


        # ==========================================
        # VALIDATE NAME
        # ==========================================

        if not name:
            return jsonify({
                "success": False,
                "message": "Student name is required."
            }), 400

        if len(name) < 2:
            return jsonify({
                "success": False,
                "message": "Name must contain at least 2 characters."
            }), 400


        # ==========================================
        # VALIDATE ROLL NUMBER
        # ==========================================

        if not roll_number:
            return jsonify({
                "success": False,
                "message": "Roll number is required."
            }), 400


        # ==========================================
        # VALIDATE IMAGE
        # ==========================================

        if not image_data:
            return jsonify({
                "success": False,
                "message": "Face image is required."
            }), 400


        # ==========================================
        # DATABASE CONNECTION
        # ==========================================

        connection = get_connection()
        cursor = connection.cursor()


        # ==========================================
        # CHECK DUPLICATE ROLL NUMBER
        # ==========================================

        cursor.execute(
            "SELECT id FROM students WHERE roll_number = ?",
            (roll_number,)
        )

        existing_student = cursor.fetchone()

        if existing_student:

            connection.close()
            connection = None

            return jsonify({
                "success": False,
                "message": "Roll number already registered."
            }), 409


        # ==========================================
        # DECODE BASE64 IMAGE
        # ==========================================

        try:

            # Remove "data:image/jpeg;base64," part
            if "," in image_data:
                image_data = image_data.split(",", 1)[1]

            image_bytes = base64.b64decode(image_data)

            np_array = np.frombuffer(
                image_bytes,
                np.uint8
            )

            image = cv2.imdecode(
                np_array,
                cv2.IMREAD_COLOR
            )

        except Exception:

            connection.close()
            connection = None

            return jsonify({
                "success": False,
                "message": "Invalid image data."
            }), 400


        if image is None:

            connection.close()
            connection = None

            return jsonify({
                "success": False,
                "message": "Unable to process image."
            }), 400


        # ==========================================
        # SAVE IMAGE
        # ==========================================

        # Remove unsafe characters
        safe_roll = re.sub(
            r"[^a-zA-Z0-9_-]",
            "_",
            roll_number
        )

        filename = f"{safe_roll}.jpg"

        image_path = os.path.join(
            DATASET_FOLDER,
            filename
        )

        success = cv2.imwrite(
            image_path,
            image
        )

        if not success:

            connection.close()
            connection = None

            return jsonify({
                "success": False,
                "message": "Failed to save face image."
            }), 500


        # Path stored in database
        database_image_path = os.path.join(
            "dataset",
            "registered_faces",
            filename
        )


        # ==========================================
        # INSERT STUDENT
        # ==========================================

        cursor.execute("""
            INSERT INTO students
            (name, roll_number, image_path)
            VALUES (?, ?, ?)
        """, (
            name,
            roll_number,
            database_image_path
        ))

        connection.commit()

        student_id = cursor.lastrowid

        connection.close()
        connection = None


        # ==========================================
        # GENERATE FACE ENCODING
        # ==========================================

        encoding_result = create_encoding_for_student(
            student_id,
            image_path
        )


        # ==========================================
        # FACE ENCODING FAILED
        # ==========================================

        if not encoding_result["success"]:

            # Delete image
            if os.path.exists(image_path):
                os.remove(image_path)


            # Delete student from database
            connection = get_connection()
            cursor = connection.cursor()

            cursor.execute(
                "DELETE FROM students WHERE id = ?",
                (student_id,)
            )

            connection.commit()
            connection.close()
            connection = None


            return jsonify({
                "success": False,
                "message": encoding_result["message"]
            }), 400


        # ==========================================
        # SUCCESS
        # ==========================================

        return jsonify({
            "success": True,
            "message": "Student registered successfully.",
            "student_id": student_id,
            "name": name,
            "roll_number": roll_number
        }), 201


    # ==========================================
    # UNEXPECTED ERROR
    # ==========================================

    except Exception as error:

        print("Registration Error:", error)


        if connection is not None:
            try:
                connection.close()
            except Exception:
                pass


        return jsonify({
            "success": False,
            "message": "Something went wrong while registering the student."
        }), 500