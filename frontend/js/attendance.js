"use strict";


// ==========================================
// ELEMENTS
// ==========================================

const video =
    document.getElementById("video");

const canvas =
    document.getElementById("canvas");

const recognizeButton =
    document.getElementById("recognize");

const homeButton =
    document.getElementById("homeButton");

const result =
    document.getElementById("result");

const studentCard =
    document.getElementById("studentCard");

const studentName =
    document.getElementById("studentName");

const studentRoll =
    document.getElementById("studentRoll");

const studentId =
    document.getElementById("studentId");


// ==========================================
// API URL
// ==========================================

const API_URL =
    "http://127.0.0.1:5000/api/recognition/recognize";


// ==========================================
// CAMERA
// ==========================================

let cameraStream = null;


// ==========================================
// RECOGNITION LOCK
// ==========================================

let recognitionRunning = false;


// ==========================================
// SHOW RESULT
// ==========================================

function showResult(
    text,
    type = ""
) {

    result.textContent = text;

    result.className = "";

    if (type) {

        result.classList.add(type);

    }

}


// ==========================================
// START CAMERA
// ==========================================

async function startCamera() {

    try {

        cameraStream =
            await navigator.mediaDevices.getUserMedia({

                video: {

                    width: {
                        ideal: 640
                    },

                    height: {
                        ideal: 480
                    },

                    facingMode: "user"

                },

                audio: false

            });


        video.srcObject =
            cameraStream;


        await new Promise(
            function(resolve) {

                if (
                    video.readyState >= 2
                ) {

                    resolve();

                    return;

                }


                video.addEventListener(
                    "loadedmetadata",
                    resolve,
                    {
                        once: true
                    }
                );

            }
        );


        await video.play();


        showResult(
            "Camera ready.",
            "processing"
        );


        console.log(
            "Recognition camera started."
        );

    }


    catch (error) {

        console.error(
            "Camera error:",
            error
        );


        showResult(
            "Unable to access camera.",
            "error"
        );

    }

}


// ==========================================
// STOP CAMERA
// ==========================================

function stopCamera() {

    if (!cameraStream) {

        return;

    }


    cameraStream
        .getTracks()
        .forEach(function(track) {

            track.stop();

        });


    cameraStream = null;

    video.srcObject = null;

}


// ==========================================
// CAPTURE IMAGE
// ==========================================

function captureImage() {

    if (

        video.readyState < 2 ||

        video.videoWidth === 0 ||

        video.videoHeight === 0

    ) {

        throw new Error(
            "Camera is not ready."
        );

    }


    const context =
        canvas.getContext("2d");


    canvas.width =
        video.videoWidth;

    canvas.height =
        video.videoHeight;


    context.drawImage(

        video,

        0,

        0,

        canvas.width,

        canvas.height

    );


    return canvas.toDataURL(
        "image/jpeg",
        0.90
    );

}


// ==========================================
// RECOGNIZE FACE
// ==========================================

async function recognizeStudent() {

    if (recognitionRunning) {

        return;

    }


    recognitionRunning = true;

    recognizeButton.disabled =
        true;


    studentCard.hidden = true;


    try {

        // ----------------------------------
        // CAPTURE
        // ----------------------------------

        showResult(
            "Capturing face...",
            "processing"
        );


        const image =
            captureImage();


        console.log(
            "Face image captured."
        );


        // ----------------------------------
        // SEND TO SERVER
        // ----------------------------------

        showResult(
            "Recognizing face...",
            "processing"
        );


        const response =
            await fetch(

                API_URL,

                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            image:
                                image

                        })

                }

            );


        console.log(
            "HTTP status:",
            response.status
        );


        const data =
            await response.json();


        console.log(
            "Recognition response:",
            data
        );


        // ==================================
        // RECOGNIZED
        // ==================================

        if (

            response.ok &&

            data.success === true &&

            data.status ===
                "recognized"

        ) {


            showResult(
                "Face recognized successfully!",
                "success"
            );


            const attendance =
                data.attendance;


            if (
                attendance &&
                attendance.status === "marked"
            ) {

                showResult(
                    "Attendance marked successfully!",
                    "success"
                );

            }
            else if (
                attendance &&
                attendance.status === "already_marked"
            ) {

                showResult(
                    "Attendance already marked for today.",
                    "processing"
                );

            }


            const student =
                data.student;


            studentName.textContent =
                student.name;


            studentRoll.textContent =
                student.roll_number;


            studentId.textContent =
                student.id;


            studentCard.hidden =
                false;


            console.log(
                "Recognized:",
                student.name
            );

        }


        // ==================================
        // NO FACE
        // ==================================

        else if (
            data.status === "no_face"
        ) {

            showResult(
                "No face detected. Please look at the camera.",
                "error"
            );

        }


        // ==================================
        // MULTIPLE FACES
        // ==================================

        else if (
            data.status ===
                "multiple_faces"
        ) {

            showResult(
                "Multiple faces detected. Please show only one face.",
                "error"
            );

        }


        // ==================================
        // UNKNOWN FACE
        // ==================================

        else if (
            data.status === "unknown"
        ) {

            showResult(
                "Face not recognized.",
                "error"
            );

        }


        // ==================================
        // NO REGISTERED FACES
        // ==================================

        else if (
            data.status === "no_data"
        ) {

            showResult(
                "No registered students found.",
                "error"
            );

        }


        // ==================================
        // OTHER ERROR
        // ==================================

        else {

            showResult(

                data.message ||
                "Face recognition failed.",

                "error"

            );

        }

    }


    catch (error) {

        console.error(
            "Recognition error:",
            error
        );


        showResult(
            "Unable to connect to Flask server.",
            "error"
        );

    }


    finally {

        recognitionRunning =
            false;

        recognizeButton.disabled =
            false;

    }

}


// ==========================================
// BUTTON
// ==========================================

recognizeButton.addEventListener(
    "click",
    recognizeStudent
);


// ==========================================
// HOME
// ==========================================

homeButton.addEventListener(
    "click",
    function() {

        stopCamera();

        window.location.href =
            "index.html";

    }
);


// ==========================================
// CLEANUP
// ==========================================

window.addEventListener(
    "beforeunload",
    stopCamera
);


// ==========================================
// START
// ==========================================

startCamera();
