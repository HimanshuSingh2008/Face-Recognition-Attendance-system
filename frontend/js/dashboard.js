/**
 * CAMPUSATTEND // COLLEGE ATTENDANCE MANAGEMENT SYSTEM
 * Enterprise Application Controller & Biometric Verification Engine
 */
"use strict";

// ==========================================================================
// 1. API CONFIGURATION & CORE DOM REFERENCES
// ==========================================================================
const API_BASE = "http://127.0.0.1:5000";
const DASHBOARD_API = `${API_BASE}/api/attendance/dashboard`;
const ALL_ATTENDANCE_API = `${API_BASE}/api/attendance/all`;
const RECOGNITION_API = `${API_BASE}/api/recognition/recognize`;
const STUDENTS_API = `${API_BASE}/api/students/`;
const REGISTER_API = `${API_BASE}/api/students/register`;

// Dashboard KPI Elements
const totalStudents = document.getElementById("totalStudents");
const presentToday = document.getElementById("presentToday");
const attendanceRate = document.getElementById("attendanceRate");
const absentToday = document.getElementById("absentToday");
const totalRecords = document.getElementById("totalRecords");
const todayAttendanceBody = document.getElementById("todayAttendanceBody");
const dashboardMessage = document.getElementById("dashboardMessage");
const refreshButton = document.getElementById("refreshDashboard");

// Analytics Chart Elements
const chartTotalVal = document.getElementById("chartTotalVal");
const chartPresentVal = document.getElementById("chartPresentVal");
const chartAbsentVal = document.getElementById("chartAbsentVal");
const chartTotalBar = document.getElementById("chartTotalBar");
const chartPresentBar = document.getElementById("chartPresentBar");
const chartAbsentBar = document.getElementById("chartAbsentBar");
const metricComplianceVal = document.getElementById("metricComplianceVal");
const metricComplianceBar = document.getElementById("metricComplianceBar");
const presentContextLabel = document.getElementById("presentContextLabel");
const absentContextLabel = document.getElementById("absentContextLabel");
const rateContextLabel = document.getElementById("rateContextLabel");
const currentDateDisplay = document.getElementById("currentDateDisplay");

// Camera Biometric Elements
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const recognizeButton = document.getElementById("recognize");
const recognizeBtnText = document.getElementById("recognizeBtnText");
const cameraStage = document.getElementById("cameraStage");
const result = document.getElementById("result");
const resultText = document.getElementById("resultText");
const studentCard = document.getElementById("studentCard");
const studentName = document.getElementById("studentName");
const studentRoll = document.getElementById("studentRoll");
const studentId = document.getElementById("studentId");
const attendanceConfirmationStatus = document.getElementById("attendanceConfirmationStatus");
const recognizedTimestamp = document.getElementById("recognizedTimestamp");
const recognizedAvatar = document.getElementById("recognizedAvatar");
const recognizedInitials = document.getElementById("recognizedInitials");
const cameraStatusBadge = document.getElementById("cameraStatusBadge");
const cameraStatusLabel = document.getElementById("cameraStatusLabel");
const toggleCameraBtn = document.getElementById("toggleCameraBtn");

// Shell & Navigation
const appSidebar = document.getElementById("appSidebar");
const menuToggleBtn = document.getElementById("menuToggleBtn");
const currentSectionTitle = document.getElementById("currentSectionTitle");
const liveClockDisplay = document.getElementById("liveClockDisplay");
const toastContainer = document.getElementById("toastContainer");

// Table Search & Filters
const todaySearchInput = document.getElementById("todaySearchInput");
const allRecordsSearchInput = document.getElementById("allRecordsSearchInput");
const allRecordsStatusFilter = document.getElementById("allRecordsStatusFilter");
const allAttendanceBody = document.getElementById("allAttendanceBody");
const allRecordsCountSummary = document.getElementById("allRecordsCountSummary");

// Student Cards View
const students3DGrid = document.getElementById("students3DGrid");
const studentCardsSearchInput = document.getElementById("studentCardsSearchInput");
const studentsCountLabel = document.getElementById("studentsCountLabel");

// Enrollment Form Elements
const enrollName = document.getElementById("enrollName");
const enrollRoll = document.getElementById("enrollRoll");
const enrollVideo = document.getElementById("enrollVideo");
const enrollCanvas = document.getElementById("enrollCanvas");
const captureAndRegisterBtn = document.getElementById("captureAndRegisterBtn");
const captureBtnLabel = document.getElementById("captureBtnLabel");
const enrollMessage = document.getElementById("enrollMessage");
const enrollMessageText = document.getElementById("enrollMessageText");
const enrollSuccessCard = document.getElementById("enrollSuccessCard");
const enrolledStudentName = document.getElementById("enrolledStudentName");
const enrolledStudentRoll = document.getElementById("enrolledStudentRoll");
const enrolledStudentId = document.getElementById("enrolledStudentId");

// State
let cameraStream = null;
let enrollCameraStream = null;
let recognitionRunning = false;
let enrollmentRunning = false;
let cachedTodayRecords = [];
let cachedAllRecords = [];
let cachedStudents = [];
let todaySortKey = "attendance_time";
let todaySortAsc = false;
let allRecordsSortKey = "attendance_date";
let allRecordsSortAsc = false;

// ==========================================================================
// 2. CLEAN TOAST NOTIFICATIONS
// ==========================================================================
function showToast(message, type = "info", duration = 3000) {
    if (!toastContainer) return;
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.innerText = message;
    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(-8px)";
        toast.style.transition = "all 150ms ease";
        setTimeout(() => toast.remove(), 160);
    }, duration);
}

// ==========================================================================
// 3. REAL-TIME CLOCK & INSTITUTIONAL DATE
// ==========================================================================
function initHeaderClock() {
    function update() {
        const now = new Date();
        if (liveClockDisplay) {
            liveClockDisplay.innerText = now.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true
            });
        }
        if (currentDateDisplay) {
            currentDateDisplay.innerText = now.toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
                year: "numeric"
            });
        }
    }
    update();
    setInterval(update, 1000);
}

// ==========================================================================
// 4. NAVIGATION & VIEW SWITCHER
// ==========================================================================
function switchView(targetViewId) {
    const sections = document.querySelectorAll(".view-section");
    const navItems = document.querySelectorAll(".sidebar-nav .nav-item");

    sections.forEach(sec => {
        if (sec.id === targetViewId) {
            sec.classList.add("active-view");
        } else {
            sec.classList.remove("active-view");
        }
    });

    navItems.forEach(item => {
        if (item.getAttribute("data-target") === targetViewId) {
            item.classList.add("active");
        } else {
            item.classList.remove("active");
        }
    });

    // Update Header Breadcrumb Title
    const titles = {
        "view-dashboard": "Dashboard Overview",
        "view-camera": "Face Recognition Attendance",
        "view-students": "Student Directory",
        "view-records": "Attendance Records Ledger",
        "view-register": "Register New Student"
    };
    if (currentSectionTitle) {
        currentSectionTitle.innerText = titles[targetViewId] || "Dashboard";
    }

    // Camera Lifecycle
    if (targetViewId === "view-camera") {
        startRecognitionCamera();
        stopEnrollCamera();
    } else if (targetViewId === "view-register") {
        startEnrollCamera();
        stopRecognitionCamera();
    } else {
        stopRecognitionCamera();
        stopEnrollCamera();
    }

    // Lazy load data
    if (targetViewId === "view-students" && cachedStudents.length === 0) {
        loadStudentCards();
    } else if (targetViewId === "view-records" && cachedAllRecords.length === 0) {
        loadAllAttendanceRecords();
    }

    // Close mobile drawer if open
    if (window.innerWidth <= 900 && appSidebar) {
        appSidebar.classList.remove("mobile-open");
    }

    window.scrollTo({ top: 0, behavior: "auto" });
}

// Attach Nav Clicks
document.querySelectorAll(".sidebar-nav .nav-item[data-target]").forEach(btn => {
    btn.addEventListener("click", () => {
        const target = btn.getAttribute("data-target");
        if (target) switchView(target);
    });
});

if (menuToggleBtn && appSidebar) {
    menuToggleBtn.addEventListener("click", () => {
        appSidebar.classList.toggle("mobile-open");
    });
}

// ==========================================================================
// 5. DASHBOARD DATA & ANALYTICS CHARTS
// ==========================================================================
async function loadDashboard() {
    if (dashboardMessage) dashboardMessage.innerText = "Loading attendance data...";

    try {
        const response = await fetch(DASHBOARD_API);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message || "Failed to load dashboard data.");
        }

        const total = data.total_students || 0;
        const present = data.present_today || 0;
        const absent = (typeof data.absent_today !== "undefined") ? data.absent_today : Math.max(0, total - present);
        const rate = (typeof data.attendance_rate !== "undefined") ? data.attendance_rate : (total > 0 ? ((present / total) * 100).toFixed(1) : 0);
        const recordsCount = data.total_records || (data.records ? data.records.length : 0);

        // Update KPI values
        if (totalStudents) totalStudents.innerText = total.toLocaleString();
        if (presentToday) presentToday.innerText = present.toLocaleString();
        if (absentToday) absentToday.innerText = absent.toLocaleString();
        if (attendanceRate) attendanceRate.innerText = rate;
        if (totalRecords) totalRecords.innerText = recordsCount.toLocaleString();

        // Update contextual hints
        if (presentContextLabel) {
            presentContextLabel.innerText = `${present} of ${total} students present`;
        }
        if (absentContextLabel) {
            absentContextLabel.innerText = `${absent} students unverified`;
        }
        if (rateContextLabel) {
            rateContextLabel.innerText = rate >= 75 ? "Meets institutional target (75%)" : "Below recommended target (75%)";
            rateContextLabel.className = rate >= 75 ? "kpi-indicator positive" : "kpi-indicator negative";
        }

        // Update Distribution Bar Chart
        if (chartTotalVal) chartTotalVal.innerText = total;
        if (chartPresentVal) chartPresentVal.innerText = present;
        if (chartAbsentVal) chartAbsentVal.innerText = absent;

        if (total > 0) {
            const presentPct = Math.round((present / total) * 100);
            const absentPct = Math.round((absent / total) * 100);
            if (chartPresentBar) chartPresentBar.style.height = `${presentPct}%`;
            if (chartAbsentBar) chartAbsentBar.style.height = `${absentPct}%`;
            if (chartTotalBar) chartTotalBar.style.height = "100%";
        } else {
            if (chartPresentBar) chartPresentBar.style.height = "0%";
            if (chartAbsentBar) chartAbsentBar.style.height = "0%";
        }

        if (metricComplianceVal) metricComplianceVal.innerText = `${rate}%`;
        if (metricComplianceBar) metricComplianceBar.style.width = `${Math.min(100, rate)}%`;

        // Render Today's Attendance Table
        cachedTodayRecords = data.records || [];
        renderTodayTable(cachedTodayRecords);

        const apiStatus = document.getElementById("apiStatusText");
        if (apiStatus) apiStatus.innerText = "System Ready • Connected";

        if (dashboardMessage) dashboardMessage.innerText = "Updated successfully.";
    } catch (err) {
        console.error("Dashboard Load Error:", err);
        const apiStatus = document.getElementById("apiStatusText");
        if (apiStatus) apiStatus.innerText = "Backend Offline (127.0.0.1:5000)";

        if (todayAttendanceBody) {
            todayAttendanceBody.innerHTML = `
                <tr>
                    <td colspan="4" class="table-empty-row">
                        <div class="empty-state-content">
                            <span style="font-weight: 600; color: var(--color-danger);">Unable to connect to Flask API server</span>
                            <span style="font-size: 0.8rem; color: var(--color-text-muted);">Ensure Flask backend is started on <code>http://127.0.0.1:5000</code>.</span>
                            <button type="button" class="btn btn-secondary" onclick="loadDashboard()" style="margin-top: 10px;">Retry</button>
                        </div>
                    </td>
                </tr>
            `;
        }
    }
}

// Render Today's Table
function renderTodayTable(records) {
    if (!todayAttendanceBody) return;
    todayAttendanceBody.innerHTML = "";

    const query = (todaySearchInput ? todaySearchInput.value : "").trim().toLowerCase();
    const filtered = records.filter(r => {
        if (!query) return true;
        const name = (r.name || "").toLowerCase();
        const roll = (r.roll_number || "").toLowerCase();
        return name.includes(query) || roll.includes(query);
    });

    if (filtered.length === 0) {
        todayAttendanceBody.innerHTML = `
            <tr>
                <td colspan="4" class="table-empty-row">
                    <div class="empty-state-content">
                        <span style="font-weight: 500; color: var(--color-text-secondary);">${query ? "No matching records found." : "No attendance recorded today."}</span>
                        <span style="font-size: 0.8rem; color: var(--color-text-muted);">Use the Face Recognition section to verify student attendance.</span>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
        const valA = (a[todaySortKey] || "").toString().toLowerCase();
        const valB = (b[todaySortKey] || "").toString().toLowerCase();
        return todaySortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });

    sorted.forEach(record => {
        const tr = document.createElement("tr");
        const initials = getInitials(record.name);
        tr.innerHTML = `
            <td>
                <div class="student-identity-cell">
                    <div class="student-avatar-thumb">${initials}</div>
                    <div class="student-identity-meta">
                        <span class="student-identity-name">${escapeHtml(record.name)}</span>
                        <span class="student-identity-sub">Dept. of Computer Science</span>
                    </div>
                </div>
            </td>
            <td class="mono-cell">${escapeHtml(record.roll_number)}</td>
            <td class="mono-cell">${escapeHtml(record.attendance_time)}</td>
            <td>
                <span class="status-badge present">
                    <span class="badge-dot"></span>
                    <span>${escapeHtml(record.status || "Present")}</span>
                </span>
            </td>
        `;
        todayAttendanceBody.appendChild(tr);
    });
}

function sortTodayTable(key) {
    if (todaySortKey === key) {
        todaySortAsc = !todaySortAsc;
    } else {
        todaySortKey = key;
        todaySortAsc = true;
    }
    renderTodayTable(cachedTodayRecords);
}

if (todaySearchInput) {
    todaySearchInput.addEventListener("input", () => renderTodayTable(cachedTodayRecords));
}

// Export Today CSV
function exportTodayCSV() {
    if (!cachedTodayRecords || cachedTodayRecords.length === 0) {
        showToast("No attendance records to export for today.", "info");
        return;
    }
    const headers = ["Student Name", "Roll Number", "Time", "Status"];
    const rows = cachedTodayRecords.map(r => [
        `"${r.name.replace(/"/g, '""')}"`,
        `"${r.roll_number.replace(/"/g, '""')}"`,
        `"${r.attendance_time}"`,
        `"${r.status || "Present"}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    const todayStr = new Date().toISOString().split("T")[0];
    link.setAttribute("download", `attendance_today_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Today's attendance exported to CSV.", "success");
}

// ==========================================================================
// 6. FACE RECOGNITION BIOMETRIC SYSTEM
// ==========================================================================
async function startRecognitionCamera() {
    if (cameraStream) return;
    
    setCameraStatus("Starting camera...", false);
    if (resultText) resultText.innerText = "Initializing optical camera sensor...";

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraStatus("Camera Unsupported", false);
        showCameraFeedback("Camera device is not supported or not running in a secure context.", "error");
        return;
    }

    try {
        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 640 },
                height: { ideal: 480 },
                facingMode: "user"
            },
            audio: false
        });

        if (video) {
            video.srcObject = cameraStream;
            await new Promise(resolve => {
                if (video.readyState >= 2) resolve();
                else video.addEventListener("loadedmetadata", resolve, { once: true });
            });
            await video.play();
        }

        setCameraStatus("Camera Active", true);
        showCameraFeedback("Camera ready. Position face in frame and click Capture & Verify Face.", "processing");
    } catch (err) {
        console.error("Camera Access Error:", err);
        setCameraStatus("Camera Unavailable", false);
        showCameraFeedback("Unable to access optical camera. Please grant browser permissions.", "error");
    }
}

function stopRecognitionCamera() {
    if (!cameraStream) return;
    cameraStream.getTracks().forEach(track => track.stop());
    cameraStream = null;
    if (video) video.srcObject = null;
    setCameraStatus("Camera Standby", false);
}

function setCameraStatus(label, isActive) {
    if (cameraStatusLabel) cameraStatusLabel.innerText = label;
    if (cameraStatusBadge) {
        cameraStatusBadge.className = isActive ? "status-badge present" : "status-badge absent";
    }
}

function showCameraFeedback(message, type = "") {
    if (resultText) resultText.innerText = message;
    if (result) {
        result.className = "status-callout-clean";
        if (type) result.classList.add(type);
    }
}

function captureVideoFrame() {
    if (!video || video.readyState < 2 || video.videoWidth === 0) {
        throw new Error("Camera frame is not ready.");
    }
    const ctx = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.90);
}

async function recognizeStudent() {
    if (recognitionRunning) return;

    recognitionRunning = true;
    if (recognizeButton) recognizeButton.disabled = true;
    if (recognizeBtnText) recognizeBtnText.innerHTML = `<span class="spinner-clean"></span> Verifying Face...`;
    if (studentCard) studentCard.hidden = true;
    if (cameraStage) {
        cameraStage.classList.add("scanning");
        cameraStage.classList.remove("verified");
    }

    showCameraFeedback("Processing facial features...", "processing");

    try {
        const base64Image = captureVideoFrame();

        const response = await fetch(RECOGNITION_API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: base64Image })
        });

        const data = await response.json();

        if (response.ok && data.success === true && data.status === "recognized") {
            if (cameraStage) {
                cameraStage.classList.remove("scanning");
                cameraStage.classList.add("verified");
            }

            const student = data.student || {};
            const attendance = data.attendance || {};

            let statusMessage = "Attendance marked successfully.";
            if (attendance.status === "already_marked") {
                statusMessage = "Attendance already marked for today.";
            }

            showCameraFeedback(`Verified: ${student.name}. ${statusMessage}`, "success");
            showToast(`${student.name}: ${statusMessage}`, "success");

            // Populate Verified Student Card
            if (studentName) studentName.innerText = student.name || "Student";
            if (studentRoll) studentRoll.innerText = student.roll_number || "--";
            if (studentId) studentId.innerText = `#${student.id || "--"}`;
            if (attendanceConfirmationStatus) {
                attendanceConfirmationStatus.innerText = attendance.status === "already_marked" ? "Already Checked In" : "Attendance Recorded";
            }
            if (recognizedTimestamp) {
                recognizedTimestamp.innerText = attendance.attendance_time || new Date().toLocaleTimeString();
            }
            if (recognizedInitials) {
                recognizedInitials.innerText = getInitials(student.name);
            }

            if (studentCard) studentCard.hidden = false;

            // Refresh table
            loadDashboard();
            if (cachedStudents.length > 0) loadStudentCards();
        } else if (data.status === "no_face") {
            showCameraFeedback("No face detected. Please face the camera directly.", "error");
        } else if (data.status === "multiple_faces") {
            showCameraFeedback("Multiple faces detected. Please show only one face.", "error");
        } else if (data.status === "unknown") {
            showCameraFeedback("Face not recognized in registered student database.", "error");
        } else if (data.status === "no_data") {
            showCameraFeedback("No registered students found. Please register students first.", "error");
        } else {
            showCameraFeedback(data.message || "Face recognition failed.", "error");
        }
    } catch (err) {
        console.error("Recognition Error:", err);
        showCameraFeedback("Unable to communicate with recognition server.", "error");
    } finally {
        recognitionRunning = false;
        if (recognizeButton) recognizeButton.disabled = false;
        if (recognizeBtnText) recognizeBtnText.innerText = "Capture & Verify Face";
        setTimeout(() => {
            if (cameraStage) cameraStage.classList.remove("scanning");
        }, 1200);
    }
}

if (recognizeButton) {
    recognizeButton.addEventListener("click", recognizeStudent);
}

if (toggleCameraBtn) {
    toggleCameraBtn.addEventListener("click", () => {
        stopRecognitionCamera();
        setTimeout(startRecognitionCamera, 150);
    });
}

// ==========================================================================
// 7. STUDENT CARDS (CLEAN RECTANGULAR DIRECTORY CARDS)
// ==========================================================================
async function loadStudentCards() {
    if (!students3DGrid) return;
    students3DGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--color-text-muted);">
            <div class="spinner-clean" style="border-color: #cbd5e1; border-top-color: var(--color-primary); width: 22px; height: 22px; margin: 0 auto 10px;"></div>
            <span>Loading student directory...</span>
        </div>
    `;

    try {
        const response = await fetch(STUDENTS_API);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();

        cachedStudents = (data.success && Array.isArray(data.students)) ? data.students : [];
        renderStudentCards(cachedStudents);
    } catch (err) {
        console.warn("Could not load /api/students/, falling back to dashboard data:", err);
        if (cachedTodayRecords && cachedTodayRecords.length > 0) {
            cachedStudents = cachedTodayRecords.map((r, idx) => ({
                id: idx + 1,
                name: r.name,
                roll_number: r.roll_number,
                department: "Computer Science & Engineering",
                attendance_percentage: 100,
                status_today: r.status || "Present",
                last_attendance_time: `Today at ${r.attendance_time}`
            }));
            renderStudentCards(cachedStudents);
        } else {
            students3DGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--color-text-muted);">
                    <p style="font-weight: 500; color: var(--color-text-primary);">No registered students found.</p>
                    <p style="font-size: 0.8rem; margin-top: 4px;">Use Register Student to enroll students into the database.</p>
                </div>
            `;
        }
    }
}

function renderStudentCards(students) {
    if (!students3DGrid) return;
    students3DGrid.innerHTML = "";

    const query = (studentCardsSearchInput ? studentCardsSearchInput.value : "").trim().toLowerCase();
    const filtered = students.filter(s => {
        if (!query) return true;
        const name = (s.name || "").toLowerCase();
        const roll = (s.roll_number || "").toLowerCase();
        return name.includes(query) || roll.includes(query);
    });

    if (studentsCountLabel) {
        studentsCountLabel.innerText = `Showing ${filtered.length} registered student${filtered.length === 1 ? "" : "s"}`;
    }

    if (filtered.length === 0) {
        students3DGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--color-text-muted);">
                <p>No students match "${escapeHtml(query)}"</p>
            </div>
        `;
        return;
    }

    filtered.forEach(student => {
        const card = document.createElement("div");
        card.className = "student-card-clean";

        const pct = Math.round(student.attendance_percentage || 0);
        const isPresent = (student.status_today || "Absent") === "Present";
        const initials = getInitials(student.name);

        const photoHtml = student.photo_url
            ? `<img src="${escapeHtml(student.photo_url)}" alt="${escapeHtml(student.name)}" onerror="this.outerHTML='<span>${initials}</span>'">`
            : `<span>${initials}</span>`;

        card.innerHTML = `
            <div>
                <div class="student-card-header">
                    <div class="student-card-avatar">${photoHtml}</div>
                    <div>
                        <div class="student-card-name">${escapeHtml(student.name)}</div>
                        <div class="student-card-roll">${escapeHtml(student.roll_number)}</div>
                        <div class="student-card-dept">${escapeHtml(student.department || "Dept. of Computer Science")}</div>
                    </div>
                </div>

                <div class="student-card-metric">
                    <div class="metric-row">
                        <span class="metric-label">Semester Attendance</span>
                        <span class="metric-pct" style="color: ${pct >= 75 ? 'var(--color-success)' : 'var(--color-danger)'}">${pct}%</span>
                    </div>
                    <div class="metric-track">
                        <div class="metric-fill" style="width: ${pct}%; background-color: ${pct >= 75 ? 'var(--color-success)' : 'var(--color-danger)'};"></div>
                    </div>
                </div>
            </div>

            <div class="student-card-footer">
                <span class="status-badge ${isPresent ? 'present' : 'absent'}">
                    <span class="badge-dot"></span>
                    <span>${isPresent ? 'Present Today' : 'Absent Today'}</span>
                </span>
                <span style="font-family: var(--font-mono); color: var(--color-text-muted); font-size: 0.725rem;">
                    ${escapeHtml(student.last_attendance_time || "No record")}
                </span>
            </div>
        `;

        students3DGrid.appendChild(card);
    });
}

if (studentCardsSearchInput) {
    studentCardsSearchInput.addEventListener("input", () => renderStudentCards(cachedStudents));
}

// ==========================================================================
// 8. ATTENDANCE RECORDS (LEDGER & REPORTS)
// ==========================================================================
async function loadAllAttendanceRecords() {
    if (!allAttendanceBody) return;
    allAttendanceBody.innerHTML = `
        <tr>
            <td colspan="5" class="table-empty-row">
                <div class="empty-state-content">
                    <div class="spinner-clean" style="border-color: #cbd5e1; border-top-color: var(--color-primary); width: 22px; height: 22px;"></div>
                    <span>Loading historical records ledger...</span>
                </div>
            </td>
        </tr>
    `;

    try {
        const response = await fetch(ALL_ATTENDANCE_API);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();

        cachedAllRecords = (data.success && Array.isArray(data.records)) ? data.records : [];
        renderAllRecordsTable(cachedAllRecords);
    } catch (err) {
        console.error("All Records Error:", err);
        allAttendanceBody.innerHTML = `
            <tr>
                <td colspan="5" class="table-empty-row">
                    <span>Unable to load attendance ledger. Please verify server connection.</span>
                </td>
            </tr>
        `;
    }
}

function renderAllRecordsTable(records) {
    if (!allAttendanceBody) return;
    allAttendanceBody.innerHTML = "";

    const query = (allRecordsSearchInput ? allRecordsSearchInput.value : "").trim().toLowerCase();
    const statusFilter = (allRecordsStatusFilter ? allRecordsStatusFilter.value : "ALL");

    const filtered = records.filter(r => {
        const name = (r.name || "").toLowerCase();
        const roll = (r.roll_number || "").toLowerCase();
        const date = (r.attendance_date || "").toLowerCase();
        const matchesQuery = !query || name.includes(query) || roll.includes(query) || date.includes(query);
        const matchesStatus = statusFilter === "ALL" || (r.status || "Present") === statusFilter;
        return matchesQuery && matchesStatus;
    });

    if (allRecordsCountSummary) {
        allRecordsCountSummary.innerText = `Displaying ${filtered.length} of ${records.length} total attendance transaction(s)`;
    }

    if (filtered.length === 0) {
        allAttendanceBody.innerHTML = `
            <tr>
                <td colspan="5" class="table-empty-row">
                    <div class="empty-state-content">
                        <span>No records found matching current criteria.</span>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
        const valA = (a[allRecordsSortKey] || "").toString().toLowerCase();
        const valB = (b[allRecordsSortKey] || "").toString().toLowerCase();
        return allRecordsSortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });

    sorted.forEach(record => {
        const tr = document.createElement("tr");
        const initials = getInitials(record.name);
        const isPresent = (record.status || "Present") === "Present";

        tr.innerHTML = `
            <td>
                <div class="student-identity-cell">
                    <div class="student-avatar-thumb">${initials}</div>
                    <span class="student-identity-name">${escapeHtml(record.name)}</span>
                </div>
            </td>
            <td class="mono-cell">${escapeHtml(record.roll_number)}</td>
            <td class="mono-cell">${escapeHtml(record.attendance_date)}</td>
            <td class="mono-cell">${escapeHtml(record.attendance_time)}</td>
            <td>
                <span class="status-badge ${isPresent ? 'present' : 'absent'}">
                    <span class="badge-dot"></span>
                    <span>${escapeHtml(record.status || "Present")}</span>
                </span>
            </td>
        `;
        allAttendanceBody.appendChild(tr);
    });
}

function sortAllRecordsTable(key) {
    if (allRecordsSortKey === key) {
        allRecordsSortAsc = !allRecordsSortAsc;
    } else {
        allRecordsSortKey = key;
        allRecordsSortAsc = true;
    }
    renderAllRecordsTable(cachedAllRecords);
}

if (allRecordsSearchInput) {
    allRecordsSearchInput.addEventListener("input", () => renderAllRecordsTable(cachedAllRecords));
}
if (allRecordsStatusFilter) {
    allRecordsStatusFilter.addEventListener("change", () => renderAllRecordsTable(cachedAllRecords));
}

function exportAllRecordsCSV() {
    if (!cachedAllRecords || cachedAllRecords.length === 0) {
        showToast("No records available to export.", "info");
        return;
    }
    const headers = ["Student Name", "Roll Number", "Date", "Time", "Status"];
    const rows = cachedAllRecords.map(r => [
        `"${r.name.replace(/"/g, '""')}"`,
        `"${r.roll_number.replace(/"/g, '""')}"`,
        `"${r.attendance_date}"`,
        `"${r.attendance_time}"`,
        `"${r.status || "Present"}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `all_attendance_records.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Full attendance records exported to CSV.", "success");
}

// ==========================================================================
// 9. BIOMETRIC REGISTRATION ENGINE
// ==========================================================================
async function startEnrollCamera() {
    if (enrollCameraStream) return;
    try {
        enrollCameraStream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 640 },
                height: { ideal: 480 },
                facingMode: "user"
            },
            audio: false
        });

        if (enrollVideo) {
            enrollVideo.srcObject = enrollCameraStream;
            await new Promise(resolve => {
                if (enrollVideo.readyState >= 2) resolve();
                else enrollVideo.addEventListener("loadedmetadata", resolve, { once: true });
            });
            await enrollVideo.play();
        }
    } catch (err) {
        console.error("Enrollment Camera Error:", err);
        setEnrollFeedback("Unable to access registration camera.", "error");
    }
}

function stopEnrollCamera() {
    if (!enrollCameraStream) return;
    enrollCameraStream.getTracks().forEach(track => track.stop());
    enrollCameraStream = null;
    if (enrollVideo) enrollVideo.srcObject = null;
}

function setEnrollFeedback(message, type = "") {
    if (enrollMessageText) enrollMessageText.innerText = message;
    if (enrollMessage) {
        enrollMessage.className = "status-callout-clean";
        if (type) enrollMessage.classList.add(type);
    }
}

async function registerStudent() {
    if (enrollmentRunning) return;

    const name = (enrollName ? enrollName.value : "").trim();
    const roll = (enrollRoll ? enrollRoll.value : "").trim();

    if (!name || name.length < 2) {
        setEnrollFeedback("Please enter a valid student name (at least 2 characters).", "error");
        showToast("Student name is required.", "error");
        if (enrollName) enrollName.focus();
        return;
    }

    if (!roll) {
        setEnrollFeedback("Please enter a student roll number.", "error");
        showToast("Roll number is required.", "error");
        if (enrollRoll) enrollRoll.focus();
        return;
    }

    if (!enrollVideo || enrollVideo.readyState < 2 || enrollVideo.videoWidth === 0) {
        setEnrollFeedback("Camera is not ready. Please allow camera permissions.", "error");
        return;
    }

    enrollmentRunning = true;
    if (captureAndRegisterBtn) captureAndRegisterBtn.disabled = true;
    if (captureBtnLabel) captureBtnLabel.innerHTML = `<span class="spinner-clean"></span> Processing Face Encodings...`;
    if (enrollSuccessCard) enrollSuccessCard.hidden = true;

    setEnrollFeedback("Capturing face frame and computing biometric encodings...", "processing");

    try {
        const ctx = enrollCanvas.getContext("2d");
        enrollCanvas.width = enrollVideo.videoWidth;
        enrollCanvas.height = enrollVideo.videoHeight;
        ctx.drawImage(enrollVideo, 0, 0, enrollCanvas.width, enrollCanvas.height);
        const imageBase64 = enrollCanvas.toDataURL("image/jpeg", 0.90);

        const response = await fetch(REGISTER_API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: name,
                roll_number: roll,
                image: imageBase64
            })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            setEnrollFeedback("Student registered successfully!", "success");
            showToast(`Registered: ${name}`, "success");

            if (enrolledStudentName) enrolledStudentName.innerText = name;
            if (enrolledStudentRoll) enrolledStudentRoll.innerText = roll;
            if (enrolledStudentId) enrolledStudentId.innerText = data.student ? data.student.id : "--";
            if (enrollSuccessCard) enrollSuccessCard.hidden = false;

            if (enrollName) enrollName.value = "";
            if (enrollRoll) enrollRoll.value = "";

            loadDashboard();
            loadStudentCards();
        } else {
            setEnrollFeedback(data.message || "Registration failed.", "error");
            showToast(data.message || "Registration failed.", "error");
        }
    } catch (err) {
        console.error("Enrollment Exception:", err);
        setEnrollFeedback("Failed to connect to enrollment server.", "error");
    } finally {
        enrollmentRunning = false;
        if (captureAndRegisterBtn) captureAndRegisterBtn.disabled = false;
        if (captureBtnLabel) captureBtnLabel.innerText = "Capture & Register Face";
    }
}

if (captureAndRegisterBtn) {
    captureAndRegisterBtn.addEventListener("click", registerStudent);
}

// ==========================================
// 10. UTILITIES & LIFECYCLE
// ==========================================
function getInitials(name) {
    if (!name) return "ST";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
}

function escapeHtml(text) {
    if (!text) return "";
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

if (refreshButton) {
    refreshButton.addEventListener("click", () => {
        loadDashboard();
        if (cachedStudents.length > 0) loadStudentCards();
        if (cachedAllRecords.length > 0) loadAllAttendanceRecords();
        showToast("Attendance data refreshed.", "info");
    });
}

window.addEventListener("beforeunload", () => {
    stopRecognitionCamera();
    stopEnrollCamera();
});

// Boot
document.addEventListener("DOMContentLoaded", () => {
    initHeaderClock();
    loadDashboard();
});

initHeaderClock();
loadDashboard();