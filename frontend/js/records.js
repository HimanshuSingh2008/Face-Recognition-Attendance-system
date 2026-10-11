"use strict";

// ==========================================
// CONSTANTS & ELEMENTS
// ==========================================
const API_URL = "http://127.0.0.1:5000/api/attendance/all";

const tableBody = document.getElementById("attendanceBody");
const message = document.getElementById("message");
const refreshButton = document.getElementById("refreshButton");
const recordsSearch = document.getElementById("recordsSearch");
const statusFilter = document.getElementById("statusFilter");
const exportCsvBtn = document.getElementById("exportCsvBtn");

let cachedRecords = [];
let sortKey = "attendance_date";
let sortAsc = false;

// ==========================================
// LOAD RECORDS
// ==========================================
async function loadAttendance() {
    message.innerText = "Loading attendance...";

    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || "Unable to load records.");
        }

        cachedRecords = data.records || [];
        renderRecordsTable(cachedRecords);

        message.innerText = `${data.count} institutional attendance record(s) loaded.`;
    } catch (error) {
        console.error("Records Load Error:", error);
        message.innerText = "Unable to connect to Flask server at 127.0.0.1:5000.";

        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="table-empty-state">
                    <span class="empty-title">Cannot reach attendance server</span>
                    <p style="font-size: 0.85rem;">Check if Flask is active on port 5000.</p>
                </td>
            </tr>
        `;
    }
}

// ==========================================
// RENDER TABLE
// ==========================================
function renderRecordsTable(records) {
    if (!tableBody) return;
    tableBody.innerHTML = "";

    const query = (recordsSearch ? recordsSearch.value : "").trim().toLowerCase();
    const currentStatus = (statusFilter ? statusFilter.value : "ALL");

    const filtered = records.filter(r => {
        const name = (r.name || "").toLowerCase();
        const roll = (r.roll_number || "").toLowerCase();
        const date = (r.attendance_date || "").toLowerCase();
        const matchesQuery = !query || name.includes(query) || roll.includes(query) || date.includes(query);
        const matchesStatus = currentStatus === "ALL" || (r.status || "Present") === currentStatus;
        return matchesQuery && matchesStatus;
    });

    if (filtered.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="table-empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="40" height="40" style="color: var(--text-disabled);">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="8" y1="12" x2="16" y2="12"></line>
                    </svg>
                    <span class="empty-title">${query ? "No matching records found" : "No attendance records found"}</span>
                </td>
            </tr>
        `;
        return;
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
        const valA = (a[sortKey] || "").toString().toLowerCase();
        const valB = (b[sortKey] || "").toString().toLowerCase();
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });

    const fragment = document.createDocumentFragment();

    sorted.forEach(record => {
        const row = document.createElement("tr");
        const name = displayValue(record.name);
        const status = displayValue(record.status, "Present");
        const nameCell = document.createElement("td");
        nameCell.className = "name-cell";

        const avatar = document.createElement("div");
        avatar.className = "table-student-avatar";
        avatar.textContent = getInitials(name);

        const nameText = document.createElement("span");
        nameText.textContent = name;
        nameCell.append(avatar, nameText);
        row.appendChild(nameCell);

        [record.roll_number, record.attendance_date, record.attendance_time].forEach(value => {
            const cell = document.createElement("td");
            cell.className = "mono-cell";
            cell.textContent = displayValue(value);
            row.appendChild(cell);
        });

        const statusCell = document.createElement("td");
        const statusPill = document.createElement("span");
        statusPill.className = `status-pill ${status === "Present" ? "present" : "absent"}`;

        const statusDot = document.createElement("span");
        statusDot.className = "pulse-dot";
        const statusText = document.createElement("span");
        statusText.textContent = status;
        statusPill.append(statusDot, statusText);
        statusCell.appendChild(statusPill);
        row.appendChild(statusCell);
        fragment.appendChild(row);
    });

    tableBody.appendChild(fragment);
}

function sortTable(key) {
    if (sortKey === key) {
        sortAsc = !sortAsc;
    } else {
        sortKey = key;
        sortAsc = true;
    }
    renderRecordsTable(cachedRecords);
}

// ==========================================
// EXPORT CSV
// ==========================================
function exportCSV() {
    if (!cachedRecords || cachedRecords.length === 0) {
        alert("No records to export.");
        return;
    }
    const headers = ["Student Name", "Roll Number", "Date", "Time", "Status"];
    const rows = cachedRecords.map(r => [
        `"${(r.name || "").replace(/"/g, '""')}"`,
        `"${(r.roll_number || "").replace(/"/g, '""')}"`,
        `"${r.attendance_date || ""}"`,
        `"${r.attendance_time || ""}"`,
        `"${r.status || "Present"}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `all_attendance_records.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Helpers
function getInitials(name) {
    if (!name) return "ST";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
}

function displayValue(value, fallback = "") {
    return value === null || value === undefined ? fallback : String(value);
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

// ==========================================
// EVENT LISTENERS
// ==========================================
if (refreshButton) {
    refreshButton.addEventListener("click", loadAttendance);
}
if (recordsSearch) {
    recordsSearch.addEventListener("input", () => renderRecordsTable(cachedRecords));
}
if (statusFilter) {
    statusFilter.addEventListener("change", () => renderRecordsTable(cachedRecords));
}
if (exportCsvBtn) {
    exportCsvBtn.addEventListener("click", exportCSV);
}

// Start
loadAttendance();
