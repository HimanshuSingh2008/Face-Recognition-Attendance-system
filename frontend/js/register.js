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
.then(function(stream) {

    video.srcObject = stream;

})
.catch(function(error) {

    console.error(
        "Camera error:",
        error
    );

    message.innerText =
        "Unable to access camera.";

});


// ==========================================
// CAPTURE FACE
// ==========================================

document
    .getElementById("capture")
    .addEventListener("click", async function() {


    const name =
        document.getElementById("name")
        .value
        .trim();


    const rollNumber =
        document.getElementById("roll")
        .value
        .trim();


    // ------------------------------
    // Validate name
    // ------------------------------

    if (!name) {

        message.innerText =
            "Please enter student name.";

        return;
    }


    // ------------------------------
    // Validate roll number
    // ------------------------------

    if (!rollNumber) {

        message.innerText =
            "Please enter roll number.";

        return;
    }


    // ------------------------------
    // Capture image
    // ------------------------------

    const canvas =
        document.getElementById("canvas");

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


    message.innerText =
        "Registering student...";


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


        const result =
            await response.json();


        // ------------------------------
        // Handle response
        // ------------------------------

        if (result.success) {

            message.innerText =
                "Student registered successfully!";

            console.log(
                "Student:",
                result.student
            );


            // Clear form
            document.getElementById("name")
                .value = "";

            document.getElementById("roll")
                .value = "";

        }

        else {

            message.innerText =
                result.message;

        }


    }

    catch (error) {

        console.error(
            "Registration error:",
            error
        );

        message.innerText =
            "Unable to connect to server.";

    }

});