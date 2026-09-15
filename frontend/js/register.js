// ==========================================
// GET ELEMENTS
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
// START CAMERA
// ==========================================

async function startCamera() {

    try {

        const stream =
            await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false
            });

        video.srcObject = stream;

        console.log(
            "Camera started successfully."
        );

    }

    catch (error) {

        console.error(
            "Camera Error:",
            error
        );

        message.innerText =
            "Unable to access camera.";

        message.style.color = "red";
    }
}


// ==========================================
// REGISTER STUDENT
// ==========================================

captureButton.addEventListener(
    "click",
    async function () {

        console.log(
            "Capture button clicked."
        );


        // ----------------------------------
        // GET VALUES
        // ----------------------------------

        const name =
            nameInput.value.trim();

        const rollNumber =
            rollInput.value.trim();


        console.log("Name:", name);
        console.log("Roll:", rollNumber);


        // ----------------------------------
        // VALIDATION
        // ----------------------------------

        if (!name) {

            message.innerText =
                "Please enter student name.";

            message.style.color = "red";

            return;
        }


        if (!rollNumber) {

            message.innerText =
                "Please enter roll number.";

            message.style.color = "red";

            return;
        }


        // ----------------------------------
        // CAMERA CHECK
        // ----------------------------------

        if (
            video.videoWidth === 0 ||
            video.videoHeight === 0
        ) {

            message.innerText =
                "Camera is not ready.";

            message.style.color = "red";

            return;
        }


        // ----------------------------------
        // CAPTURE IMAGE
        // ----------------------------------

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


        const image =
            canvas.toDataURL(
                "image/jpeg",
                0.9
            );


        console.log(
            "Image captured successfully."
        );


        // ----------------------------------
        // SHOW PROCESSING
        // ----------------------------------

        message.innerText =
            "Registering student...";

        message.style.color = "black";

        captureButton.disabled = true;


        // ==================================
        // SEND TO FLASK
        // ==================================

        try {

            console.log(
                "Sending data to Flask..."
            );


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


            const result =
                await response.json();


            console.log(
                "Flask Response:",
                result
            );


            // =================================
            // SUCCESS
            // =================================

            if (
                result.success === true
            ) {

                console.log(
                    "Registration successful!"
                );


                // SUCCESS MESSAGE

                message.innerText =
                    "Student registered successfully!";

                message.style.color =
                    "green";


                // SHOW STUDENT INFO

                studentInfo.style.display =
                    "block";


                if (result.student) {

                    registeredName.innerText =
                        result.student.name;

                    registeredRoll.innerText =
                        result.student.roll_number;

                    registeredId.innerText =
                        result.student.id;

                }


                // Clear fields

                nameInput.value = "";
                rollInput.value = "";

            }


            // =================================
            // ERROR
            // =================================

            else {

                message.innerText =
                    result.message ||
                    "Registration failed.";

                message.style.color =
                    "red";

            }

        }


        catch (error) {

            console.error(
                "FETCH ERROR:",
                error
            );


            message.innerText =
                "Unable to connect to Flask server.";

            message.style.color =
                "red";

        }


        captureButton.disabled =
            false;

    }
);


// ==========================================
// START CAMERA
// ==========================================

startCamera();