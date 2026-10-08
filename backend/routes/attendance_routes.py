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


# ==========================================
# DASHBOARD
# ==========================================

@attendance_bp.route("/dashboard", methods=["GET"])
def dashboard():

    from database.db import get_connection
    from datetime import datetime

    connection = get_connection()
    cursor = connection.cursor()

    today = datetime.now().strftime("%Y-%m-%d")

    # Total registered students
    cursor.execute("""
        SELECT COUNT(*) AS total_students
        FROM students
    """)

    total_students = cursor.fetchone()["total_students"]

    # Students present today
    cursor.execute("""
        SELECT COUNT(*) AS present_today
        FROM attendance
        WHERE attendance_date = ?
        AND status = 'Present'
    """, (today,))

    present_today = cursor.fetchone()["present_today"]

    # Attendance rate
    if total_students > 0:
        attendance_rate = (present_today / total_students) * 100
    else:
        attendance_rate = 0

    # Total attendance records in history
    cursor.execute("""
        SELECT COUNT(*) AS total_records
        FROM attendance
    """)
    total_records = cursor.fetchone()["total_records"]

    # Today's attendance records
    cursor.execute("""
        SELECT
            students.name,
            students.roll_number,
            attendance.attendance_time,
            attendance.status
        FROM attendance
        INNER JOIN students
        ON attendance.student_id = students.id
        WHERE attendance.attendance_date = ?
        ORDER BY attendance.attendance_time DESC
    """, (today,))

    records = cursor.fetchall()

    connection.close()

    absent_today = max(0, total_students - present_today)

    return jsonify({
        "success": True,
        "date": today,
        "total_students": total_students,
        "present_today": present_today,
        "absent_today": absent_today,
        "total_records": total_records,
        "attendance_rate": round(attendance_rate, 2),
        "records": [dict(record) for record in records]
    })
