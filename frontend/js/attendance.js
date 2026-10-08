"use strict";

// ==========================================
// ELEMENTS
// ==========================================
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const recognizeButton = document.getElementById("recognize");
const homeButton = document.getElementById("homeButton");
const result = document.getElementById("result");
const studentCard = document.getElementById("studentCard");
const studentName = document.getElementById("studentName");
const studentRoll = document.getElementById("studentRoll");
const studentId = document.getElementById("studentId");
const cameraStage = document.getElementById("cameraStage");
const avatarInitials = document.getElementById("avatarInitials");

// ==========================================
// API URL
// ==========================================
const API_URL = "http://127.0.0.1:5000/api/recognition/recognize";

// ==========================================
// CAMERA & STATE
// ==========================================
let cameraStream = null;
let recognitionRunning = false;

// ==========================================
// SHOW RESULT
// ==========================================
function showResult(text, type = "") {
    if (!result) return;
    result.textContent = text;
    result.className = "status-callout";

    if (type) {
        result.classList.add(type);
    }
}

// ==========================================
// START CAMERA
// ==========================================
async function startCamera() {
    try {
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

        if (cameraStage) cameraStage.classList.add("active");
        showResult("Camera active. Position face within the frame.", "processing");
        console.log("Attendance camera started.");
    } catch (error) {
        console.error("Camera error:", error);
        showResult("Unable to access camera. Please allow camera permissions.", "error");
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
    if (cameraStage) cameraStage.classList.remove("active");
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
// RECOGNIZE FACE
// ==========================================
async function recognizeStudent() {
    if (recognitionRunning) return;

    recognitionRunning = true;
    recognizeButton.disabled = true;
    if (studentCard) studentCard.hidden = true;
    if (cameraStage) {
        cameraStage.classList.add("scanning");
        cameraStage.classList.remove("matched");
    }

    try {
        showResult("Capturing camera frame...", "processing");
        const image = captureImage();

        showResult("Verifying face against attendance database...", "processing");

        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: image })
        });

        const data = await response.json();

        // RECOGNIZED
        if (response.ok && data.success === true && data.status === "recognized") {
            if (cameraStage) {
                cameraStage.classList.remove("scanning");
                cameraStage.classList.add("matched");
            }

            const attendance = data.attendance;
            if (attendance && attendance.status === "marked") {
                showResult("Face verified! Attendance recorded successfully.", "success");
            } else if (attendance && attendance.status === "already_marked") {
                showResult("Face verified! Attendance already marked for today.", "processing");
            } else {
                showResult("Face verified successfully.", "success");
            }

            const student = data.student;
            if (studentName) studentName.textContent = student.name;
            if (studentRoll) studentRoll.textContent = student.roll_number;
            if (studentId) studentId.textContent = `#${student.id}`;

            if (avatarInitials) {
                const parts = student.name.trim().split(" ");
                avatarInitials.textContent = parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : student.name.slice(0, 2).toUpperCase();
            }

            if (studentCard) studentCard.hidden = false;
        }
        // NO FACE
        else if (data.status === "no_face") {
            showResult("No face detected in camera viewport. Please face the camera directly.", "error");
        }
        // MULTIPLE FACES
        else if (data.status === "multiple_faces") {
            showResult("Multiple faces detected. Please ensure only one student is in frame.", "error");
        }
        // UNKNOWN FACE
        else if (data.status === "unknown") {
            showResult("Face not recognized in registered student records.", "error");
        }
        // NO REGISTERED FACES
        else if (data.status === "no_data") {
            showResult("No registered students found in database. Please enroll students first.", "error");
        }
        // OTHER ERROR
        else {
            showResult(data.message || "Face recognition failed.", "error");
        }
    } catch (error) {
        console.error("Recognition error:", error);
        showResult("Unable to connect to Flask server at 127.0.0.1:5000.", "error");
    } finally {
        recognitionRunning = false;
        recognizeButton.disabled = false;
        setTimeout(() => {
            if (cameraStage) cameraStage.classList.remove("scanning");
        }, 1200);
    }
}

// ==========================================
// BUTTON EVENT LISTENERS
// ==========================================
if (recognizeButton) {
    recognizeButton.addEventListener("click", recognizeStudent);
}

if (homeButton) {
    homeButton.addEventListener("click", function() {
        stopCamera();
        window.location.href = "index.html";
    });
}

window.addEventListener("beforeunload", stopCamera);

// ==========================================
// INITIALIZE CAMERA ON LOAD
// ==========================================
startCamera();
