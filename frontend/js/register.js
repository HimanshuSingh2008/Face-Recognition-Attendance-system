// ==========================================
// ELEMENTS
// ==========================================

const video = document.getElementById("video");

const canvas = document.getElementById("canvas");

const captureButton =
    document.getElementById("capture");

const nameInput =
    document.getElementById("name");

const rollInput =
    document.getElementById("roll");

const message =
    document.getElementById("message");

const studentInfo =
    document.getElementById("studentInfo");

const registeredName =
    document.getElementById("registeredName");

const registeredRoll =
    document.getElementById("registeredRoll");

const registeredId =
    document.getElementById("registeredId");


// ==========================================
// CAMERA STREAM
// ==========================================

let cameraStream = null;


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


        console.log(
            "Camera started successfully."
        );


    }

    catch (error) {

        console.error(
            "Camera Error:",
            error
        );


        showMessage(
            "Unable to access camera. Please allow camera permission.",
            "error"
        );

    }

}


// ==========================================
// STOP CAMERA
// ==========================================

function stopCamera() {

    if (cameraStream) {

        cameraStream
            .getTracks()
            .forEach(function(track) {

                track.stop();

            });

    }

}


// ==========================================
// SHOW MESSAGE
// ==========================================

function showMessage(
    text,
    type = ""
) {

    message.innerText = text;

    message.className =
        "message " + type;

}


// ==========================================
// CLEAR MESSAGE
// ==========================================

function clearMessage() {

    message.innerText = "";

    message.className = "message";

}


// ==========================================
// VALIDATE FORM
// ==========================================

function validateForm() {

    const name =
        nameInput.value.trim();

    const rollNumber =
        rollInput.value.trim();


    // Name validation

    if (!name) {

        showMessage(
            "Please enter student name.",
            "error"
        );

        nameInput.focus();

        return false;

    }


    if (name.length < 2) {

        showMessage(
            "Student name must contain at least 2 characters.",
            "error"
        );

        nameInput.focus();

        return false;

    }


    // Roll validation

    if (!rollNumber) {

        showMessage(
            "Please enter roll number.",
            "error"
        );

        rollInput.focus();

        return false;

    }


    return true;

}


// ==========================================
// CAPTURE IMAGE
// ==========================================

function captureImage() {

    const context =
        canvas.getContext("2d");


    if (
        video.videoWidth === 0 ||
        video.videoHeight === 0
    ) {

        showMessage(
            "Camera is not ready. Please wait.",
            "error"
        );

        return null;

    }


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
// REGISTER STUDENT
// ==========================================

async function registerStudent() {

    clearMessage();


    // Validate form

    if (!validateForm()) {

        return;

    }


    // Disable button

    captureButton.disabled = true;

    captureButton.innerText =
        "Processing...";


    showMessage(
        "Capturing face...",
        "loading"
    );


    // Capture image

    const image =
        captureImage();


    if (!image) {

        captureButton.disabled = false;

        captureButton.innerText =
            "Capture & Register";

        return;

    }


    const name =
        nameInput.value.trim();

    const rollNumber =
        rollInput.value.trim();


    try {

        showMessage(
            "Sending image to server...",
            "loading"
        );


        // ==================================
        // SEND TO FLASK
        // ==================================

        const response =
            await fetch(
                "http://127.0.0.1:5000/api/students/register",
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify({

                        name: name,

                        roll_number:
                            rollNumber,

                        image: image

                    })

                }
            );


        console.log(
            "HTTP Status:",
            response.status
        );


        // ==================================
        // READ SERVER RESPONSE
        // ==================================

        const result =
            await response.json();


        console.log(
            "Server Response:",
            result
        );


        // ==================================
        // SUCCESS
        // ==================================

        if (
            response.ok &&
            result.success
        ) {

            showMessage(
                "Student registered successfully!",
                "success"
            );


            // Display student information

            if (result.student) {

                registeredName.innerText =
                    result.student.name;

                registeredRoll.innerText =
                    result.student.roll_number;

                registeredId.innerText =
                    result.student.id;

                studentInfo.style.display =
                    "block";

            }


            // Clear input fields

            nameInput.value = "";

            rollInput.value = "";


            // Keep camera running
            // so another student can register

        }


        // ==================================
        // ERROR
        // ==================================

        else {

            showMessage(

                result.message ||
                "Student registration failed.",

                "error"

            );

        }


    }

    catch (error) {

        console.error(
            "Registration Error:",
            error
        );


        showMessage(
            "Unable to connect to the Flask server. Make sure the backend is running.",
            "error"
        );

    }


    // Enable button again

    captureButton.disabled = false;

    captureButton.innerText =
        "Capture & Register";

}


// ==========================================
// BUTTON EVENT
// ==========================================

captureButton.addEventListener(
    "click",
    registerStudent
);


// ==========================================
// START CAMERA WHEN PAGE LOADS
// ==========================================

startCamera();


// ==========================================
// STOP CAMERA WHEN PAGE CLOSES
// ==========================================

window.addEventListener(
    "beforeunload",
    stopCamera
);