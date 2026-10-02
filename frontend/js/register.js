"use strict";


// ==========================================
// ELEMENTS
// ==========================================

const video = document.getElementById("video");

const canvas = document.getElementById("canvas");

const captureButton =
    document.getElementById("capture");

const homeButton =
    document.getElementById("homeButton");

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

const cameraError =
    document.getElementById("cameraError");


// ==========================================
// FLASK API
// ==========================================

const API_URL =
    "http://127.0.0.1:5000/api/students/register";


// ==========================================
// CAMERA VARIABLE
// ==========================================

let cameraStream = null;


// ==========================================
// REGISTRATION LOCK
// ==========================================

let registrationRunning = false;


// ==========================================
// SHOW MESSAGE
// ==========================================

function showMessage(text, type) {

    message.textContent = text;

    message.className = "";

    if (type) {

        message.classList.add(type);

    }

}


// ==========================================
// START CAMERA
// ==========================================

async function startCamera() {

    console.log("Starting camera...");


    // Check browser support

    if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
    ) {

        const errorMessage =
            "Camera is not supported or the page is not running on a secure connection.";

        console.error(errorMessage);

        cameraError.textContent =
            errorMessage;

        showMessage(
            errorMessage,
            "error"
        );

        return;

    }


    try {

        cameraError.textContent = "";


        // Ask browser for camera

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


        console.log(
            "Camera permission granted."
        );


        // Connect camera to video

        video.srcObject =
            cameraStream;


        // Wait for video

        await new Promise(function(resolve) {

            if (
                video.readyState >= 2
            ) {

                resolve();

                return;

            }


            video.addEventListener(
                "loadedmetadata",
                function() {

                    resolve();

                },
                {
                    once: true
                }
            );

        });


        await video.play();


        console.log(
            "Camera started successfully."
        );


        showMessage(
            "Camera ready. Enter student details.",
            "processing"
        );

    }


    catch (error) {

        console.error(
            "CAMERA ERROR:",
            error
        );


        let errorMessage =
            "Unable to access camera.";


        if (
            error.name ===
            "NotAllowedError"
        ) {

            errorMessage =
                "Camera permission was denied. Allow camera access and reload the page.";

        }


        else if (
            error.name ===
            "NotFoundError"
        ) {

            errorMessage =
                "No camera was found on this device.";

        }


        else if (
            error.name ===
            "NotReadableError"
        ) {

            errorMessage =
                "Camera is already being used by another application.";

        }


        else if (
            error.name ===
            "SecurityError"
        ) {

            errorMessage =
                "Camera access was blocked by the browser.";

        }


        cameraError.textContent =
            errorMessage;


        showMessage(
            errorMessage,
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
// REGISTER STUDENT
// ==========================================

async function registerStudent(event) {

    // Stop any default action

    if (event) {

        event.preventDefault();

        event.stopPropagation();

    }


    // Prevent double click

    if (registrationRunning) {

        console.log(
            "Registration already running."
        );

        return;

    }


    registrationRunning = true;

    captureButton.disabled = true;


    console.log(
        "================================"
    );

    console.log(
        "CAPTURE BUTTON CLICKED"
    );

    console.log(
        "================================"
    );


    // ======================================
    // GET VALUES
    // ======================================

    const name =
        nameInput.value.trim();

    const rollNumber =
        rollInput.value.trim();


    // ======================================
    // VALIDATION
    // ======================================

    if (!name) {

        showMessage(
            "Please enter student name.",
            "error"
        );

        registrationRunning = false;

        captureButton.disabled = false;

        return;

    }


    if (!rollNumber) {

        showMessage(
            "Please enter roll number.",
            "error"
        );

        registrationRunning = false;

        captureButton.disabled = false;

        return;

    }


    // ======================================
    // CHECK CAMERA
    // ======================================

    if (
        !cameraStream ||
        video.readyState < 2 ||
        video.videoWidth === 0 ||
        video.videoHeight === 0
    ) {

        showMessage(
            "Camera is not ready. Please wait.",
            "error"
        );

        registrationRunning = false;

        captureButton.disabled = false;

        return;

    }


    try {

        // ==================================
        // CAPTURE
        // ==================================

        showMessage(
            "Capturing face...",
            "processing"
        );


        const image =
            captureImage();


        console.log(
            "Image captured successfully."
        );


        // ==================================
        // SEND TO FLASK
        // ==================================

        showMessage(
            "Registering student...",
            "processing"
        );


        console.log(
            "Sending registration request..."
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

                            name:
                                name,

                            roll_number:
                                rollNumber,

                            image:
                                image

                        })

                }

            );


        console.log(
            "HTTP status:",
            response.status
        );


        // ==================================
        // READ SERVER RESPONSE
        // ==================================

        const responseText =
            await response.text();


        console.log(
            "Server response:",
            responseText
        );


        let result;


        try {

            result =
                JSON.parse(responseText);

        }

        catch (jsonError) {

            console.error(
                "JSON parsing error:",
                jsonError
            );


            throw new Error(
                "Flask returned an invalid response."
            );

        }


        console.log(
            "Parsed result:",
            result
        );


        // ==================================
        // SERVER ERROR
        // ==================================

        if (!response.ok) {

            showMessage(

                result.message ||
                "Registration failed.",

                "error"

            );

            return;

        }


        // ==================================
        // SUCCESS
        // ==================================

        if (result.success === true) {

            console.log(
                "REGISTRATION SUCCESSFUL"
            );


            // Main success message

            showMessage(
                result.message ||
                "Student registered successfully!",
                "success"
            );


            // Show registration information

            studentInfo.hidden = false;


            // Name

            registeredName.textContent =
                name;


            // Roll number

            registeredRoll.textContent =
                rollNumber;


            // Student ID

            if (
                result.student_id
            ) {

                registeredId.textContent =
                    result.student_id;

            }

            else if (
                result.student &&
                result.student.id
            ) {

                registeredId.textContent =
                    result.student.id;

            }

            else {

                registeredId.textContent =
                    "Registered";

            }


            console.log(
                "Student registered successfully!"
            );

        }


        else {

            showMessage(

                result.message ||
                "Registration failed.",

                "error"

            );

        }

    }


    catch (error) {

        console.error(
            "REGISTRATION ERROR:",
            error
        );


        showMessage(

            error.message ||
            "Unable to connect to Flask server.",

            "error"

        );

    }


    finally {

        registrationRunning = false;

        captureButton.disabled = false;

    }

}


// ==========================================
// CAPTURE BUTTON
// ==========================================

captureButton.addEventListener(

    "click",

    registerStudent

);


// ==========================================
// HOME BUTTON
// ==========================================

homeButton.addEventListener(

    "click",

    function(event) {

        event.preventDefault();

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

    function() {

        stopCamera();

    }

);


// ==========================================
// START
// ==========================================

startCamera();
