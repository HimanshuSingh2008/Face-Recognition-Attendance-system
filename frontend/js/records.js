"use strict";


const API_URL =
    "http://127.0.0.1:5000/api/attendance/all";


const tableBody =
    document.getElementById(
        "attendanceBody"
    );


const message =
    document.getElementById(
        "message"
    );


const refreshButton =
    document.getElementById(
        "refreshButton"
    );


// ==========================================
// LOAD RECORDS
// ==========================================

async function loadAttendance() {

    message.innerText =
        "Loading attendance...";


    try {

        const response =
            await fetch(
                API_URL
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Unable to load records."
            );

        }


        // Clear table

        tableBody.innerHTML = "";


        // No records

        if (
            data.records.length === 0
        ) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="5">
                        No attendance records found.
                    </td>
                </tr>
            `;


            message.innerText =
                "";

            return;

        }


        // Add records

        data.records.forEach(
            function(record) {

                const row =
                    document.createElement(
                        "tr"
                    );


                row.innerHTML = `

                    <td>
                        ${record.name}
                    </td>

                    <td>
                        ${record.roll_number}
                    </td>

                    <td>
                        ${record.attendance_date}
                    </td>

                    <td>
                        ${record.attendance_time}
                    </td>

                    <td>
                        ${record.status}
                    </td>

                `;


                tableBody.appendChild(
                    row
                );

            }
        );


        message.innerText =
            `${data.count} attendance record(s) found.`;

    }


    catch (error) {

        console.error(
            error
        );


        message.innerText =
            "Unable to load attendance records.";

    }

}


// ==========================================
// REFRESH
// ==========================================

refreshButton.addEventListener(
    "click",
    loadAttendance
);


// ==========================================
// INITIAL LOAD
// ==========================================

loadAttendance();