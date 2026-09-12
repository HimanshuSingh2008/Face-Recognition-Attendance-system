import sqlite3
import os


# Location of database
DATABASE_PATH = os.path.join(
    os.path.dirname(__file__),
    "students.db"
)


def get_connection():
    """
    Create and return a database connection.
    """
    connection = sqlite3.connect(DATABASE_PATH)

    # Allows accessing columns by name
    connection.row_factory = sqlite3.Row

    return connection


def initialize_database():
    """
    Create required database tables.
    """

    connection = get_connection()

    cursor = connection.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            roll_number TEXT NOT NULL UNIQUE,
            image_path TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    connection.commit()

    connection.close()


if __name__ == "__main__":
    initialize_database()

    print("Database initialized successfully.")