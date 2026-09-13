import os
import pickle

import face_recognition


ENCODINGS_FILE = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "encodings",
    "face_encodings.pkl"
)


def generate_student_encoding(student_id, image_path):

    image = face_recognition.load_image_file(
        image_path
    )

    encodings = face_recognition.face_encodings(
        image
    )

    if len(encodings) == 0:
        return None

    if len(encodings) > 1:
        raise ValueError(
            "Multiple faces detected. Please show only one face."
        )

    return encodings[0]


def save_encoding(student_id, encoding):

    os.makedirs(
        os.path.dirname(ENCODINGS_FILE),
        exist_ok=True
    )

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


    filtered_encodings = []
    filtered_ids = []


    for existing_encoding, existing_id in zip(
        data["encodings"],
        data["student_ids"]
    ):

        if existing_id != student_id:

            filtered_encodings.append(
                existing_encoding
            )

            filtered_ids.append(
                existing_id
            )


    filtered_encodings.append(
        encoding
    )

    filtered_ids.append(
        student_id
    )


    data = {
        "encodings": filtered_encodings,
        "student_ids": filtered_ids
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

    encoding = generate_student_encoding(
        student_id,
        image_path
    )


    if encoding is None:

        return {
            "success": False,
            "message":
                "No face detected. Please make sure your face is clearly visible."
        }


    save_encoding(
        student_id,
        encoding
    )


    return {
        "success": True,
        "message":
            "Face encoding created successfully."
    }