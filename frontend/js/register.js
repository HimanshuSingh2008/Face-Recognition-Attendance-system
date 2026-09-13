const video = document.getElementById("video");
const message = document.getElementById("message");


// ==========================================
// START CAMERA
// ==========================================

navigator.mediaDevices.getUserMedia({
    video: {
        width: 640,
        height: 480
    }
})
.then(function (stream) {

    video.srcObject = stream;

})
.catch(function (error) {

    console.error("Camera error:", error);

    message.innerText = "Unable to access camera.";
    message.style.color = "red";

});


// ==========================================
// CAPTURE FACE / REGISTER STUDENT
// ==========================================

document
    .getElementById("capture")
    .addEventListener("click", async function () {

        // ==========================================
        // GET FORM VALUES
        // ==========================================

        const name = document
            .getElementById("name")
            .value
            .trim();

        const rollNumber = document
            .getElementById("roll")
            .value
            .trim();


        // ==========================================
        // VALIDATE NAME
        // ==========================================

        if (!name) {

            message.innerText =
                "Please enter student name.";

            message.style.color = "red";

            return;
        }


        if (name.length < 2) {

            message.innerText =
                "Name must contain at least 2 characters.";

            message.style.color = "red";

            return;
        }


        // ==========================================
        // VALIDATE ROLL NUMBER
        // ==========================================

        if (!rollNumber) {

            message.innerText =
                "Please enter roll number.";

            message.style.color = "red";

            return;
        }


        // ==========================================
        // CHECK CAMERA
        // ==========================================

        if (!video.srcObject) {

            message.innerText =
                "Camera is not available.";

            message.style.color = "red";

            return;
        }


        // ==========================================
        // CAPTURE IMAGE FROM VIDEO
        // ==========================================

        const canvas =
            document.getElementById("canvas");

        const context =
            canvas.getContext("2d");


        canvas.width =
            video.videoWidth || 640;

        canvas.height =
            video.videoHeight || 480;


        context.drawImage(
            video,
            0,
            0,
            canvas.width,
            canvas.height
        );


        // ==========================================
        // CONVERT IMAGE TO BASE64
        // ==========================================

        const image =
            canvas.toDataURL(
                "image/jpeg",
                0.9
            );


        // ==========================================
        // SHOW PROCESSING MESSAGE
        // ==========================================

        message.innerText =
            "Registering student...";

        message.style.color = "blue";


        // Disable button while processing
        const captureButton =
            document.getElementById("capture");

        captureButton.disabled = true;

        captureButton.innerText =
            "Registering...";


        // ==========================================
        // SEND DATA TO FLASK
        // ==========================================

        try {

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


            // ==========================================
            // GET SERVER RESPONSE
            // ==========================================

            console.log(
                "HTTP Status:",
                response.status
            );


            const result =
                await response.json();


            console.log(
                "Server response:",
                result
            );


            // ==========================================
            // SUCCESS
            // ==========================================

            if (
                response.ok &&
                result.success === true
            ) {

                message.innerText =
                    result.message ||
                    "Student registered successfully!";

                message.style.color =
                    "green";


                console.log(
                    "Student registered successfully:"
                );

                console.log(
                    "Student ID:",
                    result.student_id
                );

                console.log(
                    "Name:",
                    result.name
                );

                console.log(
                    "Roll Number:",
                    result.roll_number
                );


                // ==========================================
                // CLEAR FORM
                // ==========================================

                document
                    .getElementById("name")
                    .value = "";

                document
                    .getElementById("roll")
                    .value = "";


                // ==========================================
                // OPTIONAL: CLEAR CANVAS
                // ==========================================

                context.clearRect(
                    0,
                    0,
                    canvas.width,
                    canvas.height
                );

            }


            // ==========================================
            // SERVER RETURNED ERROR
            // ==========================================

            else {

                message.innerText =
                    result.message ||
                    "Student registration failed.";

                message.style.color =
                    "red";


                console.error(
                    "Registration failed:",
                    result
                );

            }


        }


        // ==========================================
        // CONNECTION ERROR
        // ==========================================

        catch (error) {

            console.error(
                "Registration error:",
                error
            );


            message.innerText =
                "Unable to connect to server.";

            message.style.color =
                "red";

        }


        // ==========================================
        // ENABLE BUTTON AGAIN
        // ==========================================

        finally {

            captureButton.disabled =
                false;

            captureButton.innerText =
                "Capture Face";

        }

    });