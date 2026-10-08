import os
import base64
import re

import cv2
import numpy as np

from flask import Blueprint, request, jsonify, send_from_directory

from database.db import get_connection

from services.face_encoder import (
    create_encoding_for_student
)


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


os.makedirs(
    DATASET_FOLDER,
    exist_ok=True
)


# ==========================================
# REGISTER STUDENT
# ==========================================

@student_bp.route(
    "/register",
    methods=["POST"]
)
def register_student():

    try:

        data = request.get_json()


        if not data:

            return jsonify({

                "success": False,

                "message":
                    "No data received."

            }), 400


        name = data.get(
            "name",
            ""
        ).strip()


        roll_number = data.get(
            "roll_number",
            ""
        ).strip()


        image_data = data.get(
            "image"
        )


        # ==================================
        # NAME VALIDATION
        # ==================================

        if not name:

            return jsonify({

                "success": False,

                "message":
                    "Student name is required."

            }), 400


        if len(name) < 2:

            return jsonify({

                "success": False,

                "message":
                    "Name must contain at least 2 characters."

            }), 400


        # ==================================
        # ROLL VALIDATION
        # ==================================

        if not roll_number:

            return jsonify({

                "success": False,

                "message":
                    "Roll number is required."

            }), 400


        # ==================================
        # IMAGE VALIDATION
        # ==================================

        if not image_data:

            return jsonify({

                "success": False,

                "message":
                    "Face image is required."

            }), 400


        # ==================================
        # DATABASE CONNECTION
        # ==================================

        connection =get_connection()

        cursor =connection.cursor()


        # ==================================
        # DUPLICATE ROLL NUMBER
        # ==================================

        cursor.execute(
            """
            SELECT id
            FROM students
            WHERE roll_number = ?
            """,

            (roll_number,)
        )


        existing_student =cursor.fetchone()


        if existing_student:

            connection.close()

            return jsonify({

                "success": False,

                "message":
                    "Roll number already registered."

            }), 409


        # ==================================
        # DECODE IMAGE
        # ==================================

        try:

            if "," in image_data:

                image_data =image_data.split(
                        ",",
                        1
                    )[1]


            image_bytes =base64.b64decode(
                    image_data
                )


            np_array =np.frombuffer(
                    image_bytes,
                    np.uint8
                )


            image =cv2.imdecode(
                    np_array,
                    cv2.IMREAD_COLOR
                )


        except Exception:

            connection.close()

            return jsonify({

                "success": False,

                "message":
                    "Invalid image data."

            }), 400


        if image is None:

            connection.close()

            return jsonify({

                "success": False,

                "message":
                    "Unable to process image."

            }), 400


        # ==================================
        # SAVE IMAGE
        # ==================================

        safe_roll =re.sub(
                r"[^a-zA-Z0-9_-]",
                "_",
                roll_number
            )


        filename =f"{safe_roll}.jpg"


        image_path =os.path.join(
                DATASET_FOLDER,
                filename
            )


        success =cv2.imwrite(
                image_path,
                image
            )


        if not success:

            connection.close()

            return jsonify({

                "success": False,

                "message":
                    "Unable to save image."

            }), 500


        database_image_path = os.path.join(

            "dataset",

            "registered_faces",

            filename

        )


        # ==================================
        # INSERT STUDENT
        # ==================================

        cursor.execute(
            """
            INSERT INTO students
            (
                name,
                roll_number,
                image_path
            )
            VALUES (?, ?, ?)
            """,

            (
                name,
                roll_number,
                database_image_path
            )
        )


        student_id =cursor.lastrowid


        connection.commit()

        connection.close()


        # ==================================
        # CREATE FACE ENCODING
        # ==================================

        try:

            encoding_result =create_encoding_for_student(

                    student_id,

                    image_path

                )


        except ValueError as error:

            encoding_result = {

                "success": False,

                "message": str(error)

            }


        except Exception as error:

            print(
                "Encoding Error:",
                error
            )

            encoding_result = {

                "success": False,

                "message":
                    "Face encoding failed."

            }


        # ==================================
        # ENCODING FAILED
        # ==================================

        if not encoding_result["success"]:

            # Remove image

            if os.path.exists(
                image_path
            ):

                os.remove(
                    image_path
                )


            # Remove database record

            connection =get_connection()

            cursor =connection.cursor()


            cursor.execute(
                """
                DELETE FROM students
                WHERE id = ?
                """,

                (student_id,)
            )


            connection.commit()

            connection.close()


            return jsonify({

                "success": False,

                "message":
                    encoding_result["message"]

            }), 400


        # ==================================
        # SUCCESS
        # ==================================

        return jsonify({

            "success": True,

            "message":
                "Student registered successfully!",

            "student": {

                "id":
                    student_id,

                "name":
                    name,

                "roll_number":
                    roll_number,

                "image_path":
                    database_image_path

            }

        }), 201


    except Exception as error:

        print(
            "Registration Error:",
            error
        )


        return jsonify({

            "success": False,

            "message":
                "Something went wrong during registration."

        }), 500


# ==========================================
# GET ALL STUDENTS (FOR 3D CARDS / DIRECTORY)
# ==========================================

@student_bp.route("/", methods=["GET"])
@student_bp.route("/list", methods=["GET"])
def get_all_students():

    try:
        from datetime import datetime

        connection = get_connection()
        cursor = connection.cursor()

        today = datetime.now().strftime("%Y-%m-%d")

        cursor.execute("""
            SELECT COUNT(DISTINCT attendance_date) AS total_days
            FROM attendance
        """)
        total_days_row = cursor.fetchone()
        total_days = total_days_row["total_days"] if total_days_row and total_days_row["total_days"] else 0

        cursor.execute("""
            SELECT
                s.id,
                s.name,
                s.roll_number,
                s.image_path,
                s.created_at,
                (SELECT COUNT(*) FROM attendance a WHERE a.student_id = s.id AND a.status = 'Present') AS present_days,
                (SELECT status FROM attendance a WHERE a.student_id = s.id AND a.attendance_date = ?) AS today_status,
                (SELECT attendance_time FROM attendance a WHERE a.student_id = s.id AND a.attendance_date = ?) AS today_time,
                (SELECT attendance_time FROM attendance a WHERE a.student_id = s.id ORDER BY a.attendance_date DESC, a.attendance_time DESC LIMIT 1) AS last_time,
                (SELECT attendance_date FROM attendance a WHERE a.student_id = s.id ORDER BY a.attendance_date DESC, a.attendance_time DESC LIMIT 1) AS last_date
            FROM students s
            ORDER BY s.id DESC
        """, (today, today))

        rows = cursor.fetchall()
        connection.close()

        students = []
        for r in rows:
            p_days = r["present_days"] or 0
            pct = round((p_days / total_days * 100), 1) if total_days > 0 else 100.0
            filename = os.path.basename(r["image_path"]) if r["image_path"] else ""
            
            # Format last attendance string
            if r["today_status"] == "Present" and r["today_time"]:
                last_attended = f"Today at {r['today_time']}"
            elif r["last_date"] and r["last_time"]:
                last_attended = f"{r['last_date']} ({r['last_time']})"
            else:
                last_attended = "No record yet"

            students.append({
                "id": r["id"],
                "name": r["name"],
                "roll_number": r["roll_number"],
                "image_filename": filename,
                "photo_url": f"http://127.0.0.1:5000/api/students/photo/{filename}" if filename else None,
                "department": "Computer Science & Engineering",
                "present_days": p_days,
                "total_days": total_days,
                "attendance_percentage": pct,
                "status_today": r["today_status"] if r["today_status"] else "Absent",
                "last_attendance_time": last_attended,
                "created_at": r["created_at"]
            })

        return jsonify({
            "success": True,
            "count": len(students),
            "students": students
        }), 200

    except Exception as error:
        print("Error fetching student list:", error)
        return jsonify({
            "success": False,
            "message": "Unable to fetch student list."
        }), 500


# ==========================================
# SERVE STUDENT PHOTO
# ==========================================

@student_bp.route("/photo/<path:filename>", methods=["GET"])
def get_student_photo(filename):

    try:
        return send_from_directory(DATASET_FOLDER, filename)
    except Exception as error:
        return jsonify({
            "success": False,
            "message": "Photo not found."
        }), 404