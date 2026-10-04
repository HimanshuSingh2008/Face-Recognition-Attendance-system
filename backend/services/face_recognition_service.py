import os
import pickle

import face_recognition


# ==========================================
# ENCODINGS FILE
# ==========================================

ENCODINGS_FILE = os.path.join(

    os.path.dirname(
        os.path.dirname(__file__)
    ),

    "encodings",

    "face_encodings.pkl"

)


# ==========================================
# RECOGNIZE FACE
# ==========================================

def recognize_face(image_path):

    # --------------------------------------
    # CHECK ENCODINGS FILE
    # --------------------------------------

    if not os.path.exists(
        ENCODINGS_FILE
    ):

        return {

            "success": False,

            "status": "no_data",

            "message":
                "No registered faces found."

        }


    # --------------------------------------
    # LOAD ENCODINGS
    # --------------------------------------

    try:

        with open(
            ENCODINGS_FILE,
            "rb"
        ) as file:

            data = pickle.load(file)

    except Exception as error:

        print(
            "Encoding load error:",
            error
        )

        return {

            "success": False,

            "status": "encoding_error",

            "message":
                "Unable to load face encodings."

        }


    # --------------------------------------
    # CHECK DATA
    # --------------------------------------

    encodings = data.get("encodings", [])


    student_ids = data.get("student_ids", [])


    if not encodings:

        return {

            "success": False,

            "status": "no_data",

            "message":
                "No registered faces found."

        }


    if len(encodings) != len(
        student_ids
    ):

        return {

            "success": False,

            "status": "encoding_error",

            "message":
                "Face encoding data is invalid."

        }


    # --------------------------------------
    # LOAD CAPTURED IMAGE
    # --------------------------------------

    try:

        image = face_recognition.load_image_file(
                image_path
            )

    except Exception as error:

        print(
            "Image loading error:",
            error
        )

        return {

            "success": False,

            "status": "invalid_image",

            "message":
                "Unable to load captured image."

        }


    # --------------------------------------
    # DETECT FACES
    # --------------------------------------

    face_locations = (
        face_recognition.face_locations(
            image
        )
    )


    # --------------------------------------
    # NO FACE
    # --------------------------------------

    if len(face_locations) == 0:

        return {

            "success": False,

            "status": "no_face",

            "message":
                "No face detected. Please position your face clearly."

        }


    # --------------------------------------
    # MULTIPLE FACES
    # --------------------------------------

    if len(face_locations) > 1:

        return {

            "success": False,

            "status": "multiple_faces",

            "message":
                "Multiple faces detected. Please show only one face."

        }


    # --------------------------------------
    # GENERATE ENCODING
    # --------------------------------------

    face_encodings = (
        face_recognition.face_encodings(
            image,
            face_locations
        )
    )


    if len(face_encodings) == 0:

        return {

            "success": False,

            "status": "encoding_failed",

            "message":
                "Unable to generate face encoding."

        }


    captured_encoding = face_encodings[0]


    # --------------------------------------
    # CALCULATE DISTANCES
    # --------------------------------------

    distances = (
        face_recognition.face_distance(

            encodings,

            captured_encoding

        )
    )


    if len(distances) == 0:

        return {

            "success": False,

            "status": "no_data",

            "message":
                "No face encodings available."

        }


    # --------------------------------------
    # BEST MATCH
    # --------------------------------------

    best_match_index = distances.argmin()


    best_distance = float(
        distances[best_match_index]
    )


    # --------------------------------------
    # RECOGNITION THRESHOLD
    # --------------------------------------

    TOLERANCE = 0.50


    # --------------------------------------
    # MATCH
    # --------------------------------------

    if best_distance <= TOLERANCE:

        student_id = student_ids[
            best_match_index
        ]


        return {

            "success": True,

            "status": "recognized",

            "student_id":
                int(student_id),

            "distance":
                best_distance

        }


    # --------------------------------------
    # UNKNOWN FACE
    # --------------------------------------

    return {

        "success": False,

        "status": "unknown",

        "message":
            "Face not recognized.",

        "distance":
            best_distance

    }