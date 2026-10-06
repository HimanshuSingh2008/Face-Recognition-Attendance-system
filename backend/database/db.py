import sqlite3
import os


# ==========================================
# DATABASE LOCATION
# ==========================================

DATABASE_PATH = os.path.join(
    os.path.dirname(__file__),
    "students.db"
)


# ==========================================
# DATABASE CONNECTION
# ==========================================

def get_connection():

    connection = sqlite3.connect(
        DATABASE_PATH
    )

    connection.row_factory = sqlite3.Row

    return connection


# ==========================================
# INITIALIZE DATABASE
# ==========================================

def initialize_database():

    connection = get_connection()

    cursor = connection.cursor()


    # ======================================
    # STUDENTS TABLE
    # ======================================

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS students (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            name TEXT NOT NULL,

            roll_number TEXT NOT NULL UNIQUE,

            image_path TEXT NOT NULL,

            created_at
                TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)


    # ======================================
    # ATTENDANCE TABLE
    # ======================================

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS attendance (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            student_id INTEGER NOT NULL,

            attendance_date TEXT NOT NULL,

            attendance_time TEXT NOT NULL,

            status TEXT NOT NULL DEFAULT 'Present',

            created_at
                TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (student_id)
                REFERENCES students(id),

            UNIQUE (
                student_id,
                attendance_date
            )
        )
    """)


    connection.commit()

    connection.close()


# ==========================================
# DIRECT EXECUTION
# ==========================================

if __name__ == "__main__":

    initialize_database()

    print(
        "Database initialized successfully."
    )