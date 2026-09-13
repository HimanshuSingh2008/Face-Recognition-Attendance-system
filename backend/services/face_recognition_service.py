import os
import pickle

import face_recognition


ENCODINGS_FILE = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "encodings",
    "face_encodings.pkl"
)


def recognize_face(image_path):

    # Check whether encodings exist
    if not os.path.exists(ENCODINGS_FILE):

        return {
            "success": False,
            "status": "no_data",
            "message": "No registered faces found."
        }


    # Load known encodings
    with open(
        ENCODINGS_FILE,
        "rb"
    ) as file:

        data = pickle.load(file)


    if len(data["encodings"]) == 0:

        return {
            "success": False,
            "status": "no_data",
            "message": "No registered faces found."
        }


    # Load captured image
    image = face_recognition.load_image_file(
        image_path
    )


    # Detect and encode faces
    face_locations = (
        face_recognition.face_locations(image)
    )

    face_encodings = (
        face_recognition.face_encodings(
            image,
            face_locations
        )
    )


    # No face
    if len(face_encodings) == 0:

        return {
            "success": False,
            "status": "no_face",
            "message": "No face detected."
        }


    # Multiple faces
    if len(face_encodings) > 1:

        return {
            "success": False,
            "status": "multiple_faces",
            "message": "Multiple faces detected. Please show only one face."
        }


    captured_encoding = face_encodings[0]


    # Compare against known faces
    distances = face_recognition.face_distance(
        data["encodings"],
        captured_encoding
    )


    # Find closest face
    best_match_index = distances.argmin()

    best_distance = float(
        distances[best_match_index]
    )


    # Recognition threshold
    TOLERANCE = 0.50


    if best_distance <= TOLERANCE:

        student_id = data["student_ids"][
            best_match_index
        ]

        return {

            "success": True,

            "status": "recognized",

            "student_id": int(student_id),

            "distance": best_distance

        }


    return {

        "success": False,

        "status": "unknown",

        "message": "Face not recognized.",

        "distance": best_distance

    }