
import os
import base64
import uuid

import cv2
import numpy as np

from flask import Blueprint, request, jsonify

from database.db import get_connection

from services.attendance_service import (
    mark_attendance
)

from services.face_recognition_service import (
    recognize_face
)


# ==========================================
# BLUEPRINT
# ==========================================

recognition_bp = Blueprint(
    "recognition",
    __name__,
    url_prefix="/api/recognition"
)


# ==========================================
# TEMPORARY IMAGE FOLDER
# ==========================================

TEMP_FOLDER = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "uploads",
    "temp"
)


os.makedirs(
    TEMP_FOLDER,
    exist_ok=True
)


# ==========================================
# RECOGNIZE FACE
# ==========================================

@recognition_bp.route(
    "/recognize",
    methods=["POST"]
)
def recognize_student():

    image_path = None

    try:

        # ==================================
        # GET REQUEST DATA
        # ==================================

        data = request.get_json(silent=True)

        if not isinstance(data, dict):

            return jsonify({

                "success": False,

                "status": "invalid_request",

                "message":
                    "No data received."

            }), 400


        image_data = data.get("image")


        if not isinstance(image_data, str) or not image_data.strip():

            return jsonify({

                "success": False,

                "status": "invalid_image",

                "message":
                    "Face image is required."

            }), 400


        # ==================================
        # DECODE BASE64 IMAGE
        # ==================================

        try:

            # Remove data URL prefix
            if "," in image_data:

                image_data = image_data.split(
                    ",",
                    1
                )[1]


            image_bytes = base64.b64decode(
                image_data,
                validate=True
            )


            np_array = np.frombuffer(
                image_bytes,
                np.uint8
            )


            image = cv2.imdecode(
                np_array,
                cv2.IMREAD_COLOR
            )


        except Exception as error:

            print(
                "Image decode error:",
                error
            )

            return jsonify({

                "success": False,

                "status": "invalid_image",

                "message":
                    "Invalid image data."

            }), 400


        if image is None:

            return jsonify({

                "success": False,

                "status": "invalid_image",

                "message":
                    "Unable to process the captured image."

            }), 400


        # ==================================
        # SAVE TEMPORARY IMAGE
        # ==================================

        filename = (
            f"{uuid.uuid4().hex}.jpg"
        )


        image_path = os.path.join(
            TEMP_FOLDER,
            filename
        )


        saved = cv2.imwrite(
            image_path,
            image
        )


        if not saved:

            return jsonify({

                "success": False,

                "status": "save_error",

                "message":
                    "Unable to save captured image."

            }), 500


        # ==================================
        # FACE RECOGNITION
        # ==================================

        result = recognize_face(
            image_path
        )


        # ==================================
        # FACE NOT RECOGNIZED
        # ==================================

        if not result.get("success"):

            return jsonify(result), 200


        # ==================================
        # GET STUDENT ID
        # ==================================

        student_id = result["student_id"]
        attendance_result = mark_attendance(student_id)


        if student_id is None:

            return jsonify({

                "success": False,

                "status": "invalid_result",

                "message":
                    "Recognition returned an invalid student."

            }), 500


        # ==================================
        # GET STUDENT FROM DATABASE
        # ==================================

        connection = get_connection()

        try:

            cursor = connection.cursor()

            cursor.execute(
                """
                SELECT
                    id,
                    name,
                    roll_number
                FROM students
                WHERE id = ?
                """,
                (student_id,)
            )

            student = cursor.fetchone()

        finally:

            connection.close()


        # ==================================
        # STUDENT NOT FOUND
        # ==================================

        if student is None:

            return jsonify({

                "success": False,

                "status": "student_not_found",

                "message":
                    "Face matched, but student record was not found."

            }), 404


        # ==================================
        # MARK ATTENDANCE
        # ==================================

        attendance_result = mark_attendance(
            student_id
        )

        if not attendance_result.get("success"):

            return jsonify({

                "success": False,

                "status": "attendance_error",

                "message": attendance_result.get(
                    "message",
                    "Unable to mark attendance."
                ),

                "student": {

                    "id": student["id"],

                    "name": student["name"],

                    "roll_number": student["roll_number"]

                },

                "attendance": attendance_result

            }), 500


        # ==================================
        # SUCCESS
        # ==================================

        return jsonify({

            "success": True,

            "status": "recognized",

            "message":
                "Face recognized successfully.",

            "student": {

                "id":
                    student["id"],

                "name":
                    student["name"],

                "roll_number":
                    student["roll_number"]

            },

            "distance":
                result.get("distance"),

            "attendance": attendance_result

        }), 200


    except Exception as error:

        print(
            "Recognition API Error:",
            error
        )


        return jsonify({

            "success": False,

            "status": "server_error",

            "message":
                "Face recognition failed."

        }), 500


    finally:

        # ==================================
        # DELETE TEMPORARY IMAGE
        # ==================================

        if (
            image_path is not None
            and os.path.exists(image_path)
        ):

            try:

                os.remove(
                    image_path
                )

            except Exception as error:

                print(
                    "Temporary image cleanup error:",
                    error
                )
