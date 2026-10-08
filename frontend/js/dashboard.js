"use strict";


const API_URL =
    "http://127.0.0.1:5000/api/attendance/dashboard";


const totalStudents =
    document.getElementById(
        "totalStudents"
    );


const presentToday =
    document.getElementById(
        "presentToday"
    );


const attendanceRate =
    document.getElementById(
        "attendanceRate"
    );


const todayAttendanceBody =
    document.getElementById(
        "todayAttendanceBody"
    );


const dashboardMessage =
    document.getElementById(
        "dashboardMessage"
    );


const refreshButton =
    document.getElementById(
        "refreshDashboard"
    );


// ==========================================
// LOAD DASHBOARD
// ==========================================

async function loadDashboard() {

    dashboardMessage.innerText =
        "Loading dashboard...";


    try {

        const response =
            await fetch(API_URL);


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Unable to load dashboard."
            );

        }


        // ==================================
        // UPDATE CARDS
        // ==================================

        totalStudents.innerText =
            data.total_students;


        presentToday.innerText =
            data.present_today;


        attendanceRate.innerText =
            data.attendance_rate;


        // ==================================
        // CLEAR TABLE
        // ==================================

        todayAttendanceBody.innerHTML =
            "";


        // ==================================
        // NO ATTENDANCE
        // ==================================

        if (
            data.records.length === 0
        ) {

            todayAttendanceBody.innerHTML = `
                <tr>
                    <td colspan="4">
                        No attendance marked today.
                    </td>
                </tr>
            `;

        }


        // ==================================
        // SHOW ATTENDANCE
        // ==================================

        else {

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
                            ${record.attendance_time}
                        </td>

                        <td>
                            ${record.status}
                        </td>

                    `;


                    todayAttendanceBody.appendChild(
                        row
                    );

                }
            );

        }


        dashboardMessage.innerText =
            "Dashboard updated successfully.";

    }


    catch (error) {

        console.error(
            "Dashboard Error:",
            error
        );


        dashboardMessage.innerText =
            "Unable to load dashboard.";

    }

}


// ==========================================
// REFRESH
// ==========================================

refreshButton.addEventListener(
    "click",
    loadDashboard
);


// ==========================================
// INITIAL LOAD
// ==========================================

loadDashboard();