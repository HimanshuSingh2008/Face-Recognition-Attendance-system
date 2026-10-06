from datetime import datetime

from database.db import get_connection


# ==========================================
# MARK ATTENDANCE
# ==========================================

def mark_attendance(student_id):

    connection = get_connection()

    cursor = connection.cursor()


    # --------------------------------------
    # CURRENT DATE AND TIME
    # --------------------------------------

    now = datetime.now()

    attendance_date = now.strftime(
        "%Y-%m-%d"
    )

    attendance_time = now.strftime(
        "%H:%M:%S"
    )


    # --------------------------------------
    # CHECK EXISTING ATTENDANCE
    # --------------------------------------

    cursor.execute(
        """
        SELECT
            id,
            attendance_time,
            status
        FROM attendance
        WHERE student_id = ?
        AND attendance_date = ?
        """,

        (
            student_id,
            attendance_date
        )
    )


    existing = cursor.fetchone()


    # --------------------------------------
    # ALREADY MARKED
    # --------------------------------------

    if existing:

        connection.close()

        return {

            "success": True,

            "status": "already_marked",

            "message":
                "Attendance already marked for today.",

            "attendance_time":
                existing["attendance_time"],

            "attendance_status":
                existing["status"]

        }


    # --------------------------------------
    # INSERT ATTENDANCE
    # --------------------------------------

    try:

        cursor.execute(
            """
            INSERT INTO attendance
            (
                student_id,
                attendance_date,
                attendance_time,
                status
            )
            VALUES (?, ?, ?, ?)
            """,

            (
                student_id,

                attendance_date,

                attendance_time,

                "Present"
            )
        )


        connection.commit()


        attendance_id = (
            cursor.lastrowid
        )


        connection.close()


        return {

            "success": True,

            "status": "marked",

            "message":
                "Attendance marked successfully.",

            "attendance_id":
                attendance_id,

            "attendance_date":
                attendance_date,

            "attendance_time":
                attendance_time,

            "attendance_status":
                "Present"

        }


    except Exception as error:

        connection.rollback()

        connection.close()

        print(
            "Attendance Error:",
            error
        )


        return {

            "success": False,

            "status": "error",

            "message":
                "Unable to mark attendance."

        }


# ==========================================
# GET TODAY'S ATTENDANCE
# ==========================================

def get_today_attendance():

    connection = get_connection()

    cursor = connection.cursor()


    today = datetime.now().strftime(
        "%Y-%m-%d"
    )


    cursor.execute(
        """
        SELECT

            attendance.id,

            students.name,

            students.roll_number,

            attendance.attendance_date,

            attendance.attendance_time,

            attendance.status

        FROM attendance

        INNER JOIN students

        ON attendance.student_id =
           students.id

        WHERE attendance.attendance_date = ?

        ORDER BY attendance.attendance_time DESC
        """,

        (today,)
    )


    records = cursor.fetchall()

    connection.close()


    return [

        dict(record)

        for record in records

    ]


# ==========================================
# GET ALL ATTENDANCE
# ==========================================

def get_all_attendance():

    connection = get_connection()

    cursor = connection.cursor()


    cursor.execute(
        """
        SELECT

            attendance.id,

            students.name,

            students.roll_number,

            attendance.attendance_date,

            attendance.attendance_time,

            attendance.status

        FROM attendance

        INNER JOIN students

        ON attendance.student_id =
           students.id

        ORDER BY
            attendance.attendance_date DESC,
            attendance.attendance_time DESC
        """
    )


    records = cursor.fetchall()

    connection.close()


    return [

        dict(record)

        for record in records

    ]


# ==========================================
# STUDENT ATTENDANCE PERCENTAGE
# ==========================================

def get_student_attendance_percentage(
    student_id
):

    connection = get_connection()

    cursor = connection.cursor()


    # Total attendance records
    cursor.execute(
        """
        SELECT COUNT(*) AS present_days
        FROM attendance
        WHERE student_id = ?
        """,

        (student_id,)
    )


    result = cursor.fetchone()

    present_days = result["present_days"]


    # Total registered days
    cursor.execute(
        """
        SELECT COUNT(DISTINCT attendance_date)
        AS total_days
        FROM attendance
        """
    )


    result = cursor.fetchone()

    total_days = result["total_days"]


    connection.close()


    if total_days == 0:

        percentage = 0

    else:

        percentage = (
            present_days /
            total_days
        ) * 100


    return {

        "student_id":
            student_id,

        "present_days":
            present_days,

        "total_days":
            total_days,

        "percentage":
            round(
                percentage,
                2
            )

    }