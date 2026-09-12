import os
import base64
import re

import cv2
import numpy as np

from flask import Blueprint, request, jsonify

from database.db import get_connection


student_bp = Blueprint(
    "student",
    __name__,
    url_prefix="/api/students"
)


# Folder where student face images will be stored
DATASET_FOLDER = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "dataset",
    "registered_faces"
)

os.makedirs(DATASET_FOLDER, exist_ok=True)


@student_bp.route("/register", methods=["POST"])
def register_student():

    try:

        # Get JSON data
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "message": "No data received."
            }), 400


        name = data.get("name", "").strip()
        roll_number = data.get("roll_number", "").strip()
        image_data = data.get("image")


        # -----------------------------
        # Validate name
        # -----------------------------

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


        # -----------------------------
        # Validate roll number
        # -----------------------------

        if not roll_number:

            return jsonify({
                "success": False,
                "message": "Roll number is required."
            }), 400


        # -----------------------------
        # Validate image
        # -----------------------------

        if not image_data:

            return jsonify({
                "success": False,
                "message": "Face image is required."
            }), 400


        # -----------------------------
        # Check duplicate roll number
        # -----------------------------

        connection = get_connection()

        cursor = connection.cursor()

        cursor.execute(
            "SELECT id FROM students WHERE roll_number = ?",
            (roll_number,)
        )

        existing_student = cursor.fetchone()


        if existing_student:

            connection.close()

            return jsonify({
                "success": False,
                "message": "Roll number already registered."
            }), 409


        # -----------------------------
        # Decode Base64 image
        # -----------------------------

        try:

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

            return jsonify({
                "success": False,
                "message": "Invalid image data."
            }), 400


        if image is None:

            connection.close()

            return jsonify({
                "success": False,
                "message": "Unable to process image."
            }), 400


        # -----------------------------
        # Save image
        # -----------------------------

        # Remove unsafe characters from filename
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


        cv2.imwrite(
            image_path,
            image
        )


        # Path stored in database
        database_image_path = os.path.join(
            "dataset",
            "registered_faces",
            filename
        )


        # -----------------------------
        # Save student in database
        # -----------------------------

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


        return jsonify({

            "success": True,

            "message":
                "Student registered successfully.",

            "student": {

                "id": student_id,

                "name": name,

                "roll_number": roll_number,

                "image_path":
                    database_image_path
            }

        }), 201


    except Exception as error:

        print("Registration Error:", error)

        return jsonify({

            "success": False,

            "message":
                "Something went wrong while registering the student."

        }), 500