from flask import Blueprint, jsonify

from services.attendance_service import (
    mark_attendance,
    get_today_attendance,
    get_all_attendance,
    get_student_attendance_percentage
)


attendance_bp = Blueprint(
    "attendance",
    __name__,
    url_prefix="/api/attendance"
)


# ==========================================
# MARK ATTENDANCE
# ==========================================

@attendance_bp.route(
    "/mark/<int:student_id>",
    methods=["POST"]
)
def mark_student_attendance(student_id):

    result = mark_attendance(
        student_id
    )


    if not result["success"]:

        return jsonify(result), 500


    return jsonify(result), 200


# ==========================================
# TODAY'S ATTENDANCE
# ==========================================

@attendance_bp.route(
    "/today",
    methods=["GET"]
)
def today_attendance():

    records = get_today_attendance()


    return jsonify({

        "success": True,

        "date":
            __import__(
                "datetime"
            ).datetime.now().strftime(
                "%Y-%m-%d"
            ),

        "count":
            len(records),

        "records":
            records

    }), 200


# ==========================================
# ALL ATTENDANCE
# ==========================================

@attendance_bp.route(
    "/all",
    methods=["GET"]
)
def all_attendance():

    records = get_all_attendance()


    return jsonify({

        "success": True,

        "count":
            len(records),

        "records":
            records

    }), 200


# ==========================================
# ATTENDANCE PERCENTAGE
# ==========================================

@attendance_bp.route(
    "/percentage/<int:student_id>",
    methods=["GET"]
)
def attendance_percentage(student_id):

    result = (
        get_student_attendance_percentage(
            student_id
        )
    )


    return jsonify({

        "success": True,

        "attendance":
            result

    }), 200