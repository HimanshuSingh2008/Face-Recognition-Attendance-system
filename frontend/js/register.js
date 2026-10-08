"use strict";

// ==========================================
// ELEMENTS (Preserved from Original)
// ==========================================
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const captureButton = document.getElementById("capture");
const homeButton = document.getElementById("homeButton");
const nameInput = document.getElementById("name");
const rollInput = document.getElementById("roll");
const message = document.getElementById("message");
const studentInfo = document.getElementById("studentInfo");
const registeredName = document.getElementById("registeredName");
const registeredRoll = document.getElementById("registeredRoll");
const registeredId = document.getElementById("registeredId");
const cameraError = document.getElementById("cameraError");

// ==========================================
// FLASK API
// ==========================================
const API_URL = "http://127.0.0.1:5000/api/students/register";

// ==========================================
// STATE
// ==========================================
let cameraStream = null;
let registrationRunning = false;

// ==========================================
// SHOW MESSAGE
// ==========================================
function showMessage(text, type) {
    if (!message) return;
    message.textContent = text;
    message.className = "status-callout";

    if (type) {
        message.classList.add(type);
    }
}

// ==========================================
// START CAMERA
// ==========================================
async function startCamera() {
    console.log("Starting enrollment camera...");

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        const errorMessage = "Camera is not supported or page lacks secure context (HTTPS/localhost).";
        console.error(errorMessage);
        if (cameraError) cameraError.textContent = errorMessage;
        showMessage(errorMessage, "error");
        return;
    }

    try {
        if (cameraError) cameraError.textContent = "";

        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 640 },
                height: { ideal: 480 },
                facingMode: "user"
            },
            audio: false
        });

        video.srcObject = cameraStream;

        await new Promise(function(resolve) {
            if (video.readyState >= 2) {
                resolve();
                return;
            }
            video.addEventListener("loadedmetadata", resolve, { once: true });
        });

        await video.play();
        showMessage("Camera ready. Enter student credentials and click Capture Face & Enroll Student.", "processing");
        console.log("Enrollment camera active.");
    } catch (error) {
        console.error("Camera access error:", error);
        if (cameraError) cameraError.textContent = "Unable to access camera. Please allow camera permissions.";
        showMessage("Unable to access camera. Check device permissions.", "error");
    }
}

// ==========================================
// STOP CAMERA
// ==========================================
function stopCamera() {
    if (!cameraStream) return;
    cameraStream.getTracks().forEach(function(track) {
        track.stop();
    });
    cameraStream = null;
    if (video) video.srcObject = null;
}

// ==========================================
// CAPTURE IMAGE
// ==========================================
function captureImage() {
    if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
        throw new Error("Camera is not ready.");
    }

    const context = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.90);
}

// ==========================================
// REGISTER STUDENT
// ==========================================
async function registerStudent() {
    if (registrationRunning) return;

    const name = nameInput.value.trim();
    const roll = rollInput.value.trim();

    if (!name) {
        showMessage("Student full name is required.", "error");
        nameInput.focus();
        return;
    }

    if (name.length < 2) {
        showMessage("Student name must contain at least 2 characters.", "error");
        nameInput.focus();
        return;
    }

    if (!roll) {
        showMessage("Student roll number is required.", "error");
        rollInput.focus();
        return;
    }

    registrationRunning = true;
    captureButton.disabled = true;
    if (studentInfo) studentInfo.hidden = true;

    try {
        showMessage("Capturing camera frame...", "processing");
        const image = captureImage();

        showMessage("Transmitting face data & saving student records...", "processing");

        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: name,
                roll_number: roll,
                image: image
            })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            showMessage("Student registered successfully! Face data enrolled.", "success");

            if (data.student) {
                if (registeredName) registeredName.textContent = data.student.name || name;
                if (registeredRoll) registeredRoll.textContent = data.student.roll_number || roll;
                if (registeredId) registeredId.textContent = `#${data.student.id || "--"}`;
            }

            if (studentInfo) studentInfo.hidden = false;

            nameInput.value = "";
            rollInput.value = "";
        } else {
            showMessage(data.message || "Registration failed. Ensure clear facial visibility and lighting.", "error");
        }
    } catch (error) {
        console.error("Registration error:", error);
        showMessage("Unable to connect to Flask server at 127.0.0.1:5000.", "error");
    } finally {
        registrationRunning = false;
        captureButton.disabled = false;
    }
}

// ==========================================
// EVENT LISTENERS
// ==========================================
if (captureButton) {
    captureButton.addEventListener("click", registerStudent);
}

if (homeButton) {
    homeButton.addEventListener("click", function() {
        stopCamera();
        window.location.href = "index.html";
    });
}

window.addEventListener("beforeunload", stopCamera);

// Start on boot
startCamera();
