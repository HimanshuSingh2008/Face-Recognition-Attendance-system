import os
import pickle

import face_recognition

from database.db import get_connection


ENCODINGS_FILE = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "encodings",
    "face_encodings.pkl"
)


DATASET_FOLDER = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "dataset",
    "registered_faces"
)


def generate_student_encoding(student_id, image_path):
    """
    Generate a face encoding for one student.

    Returns:
        encoding if a face is found
        None if no face is found
    """

    # Load image
    image = face_recognition.load_image_file(image_path)

    # Detect faces and generate encodings
    encodings = face_recognition.face_encodings(image)

    # No face
    if len(encodings) == 0:
        return None

    # More than one face
    if len(encodings) > 1:
        raise ValueError(
            "Multiple faces detected. "
            "Only one face should be present."
        )

    # First and only face
    encoding = encodings[0]

    return encoding


def save_encoding(student_id, encoding):
    """
    Save student's face encoding.
    """

    os.makedirs(
        os.path.dirname(ENCODINGS_FILE),
        exist_ok=True
    )

    # Load existing encodings
    if os.path.exists(ENCODINGS_FILE):

        with open(
            ENCODINGS_FILE,
            "rb"
        ) as file:

            data = pickle.load(file)

    else:

        data = {
            "encodings": [],
            "student_ids": []
        }


    # Remove old encoding for this student
    new_encodings = []
    new_student_ids = []

    for existing_encoding, existing_id in zip(
        data["encodings"],
        data["student_ids"]
    ):

        if existing_id != student_id:

            new_encodings.append(
                existing_encoding
            )

            new_student_ids.append(
                existing_id
            )


    # Add new encoding
    new_encodings.append(encoding)
    new_student_ids.append(student_id)


    data = {
        "encodings": new_encodings,
        "student_ids": new_student_ids
    }


    with open(
        ENCODINGS_FILE,
        "wb"
    ) as file:

        pickle.dump(
            data,
            file
        )


def create_encoding_for_student(
    student_id,
    image_path
):
    """
    Generate and save encoding for a student.
    """

    encoding = generate_student_encoding(
        student_id,
        image_path
    )

    if encoding is None:

        return {
            "success": False,
            "message": "No face detected."
        }


    save_encoding(
        student_id,
        encoding
    )


    return {
        "success": True,
        "message": "Face encoding created successfully."
    }