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

    sorted.forEach(record => {
        const tr = document.createElement("tr");
        const initials = getInitials(record.name);
        const isPresent = (record.status || "Present") === "Present";

        tr.innerHTML = `
            <td class="name-cell">
                <div class="table-student-avatar">${initials}</div>
                <span>${escapeHtml(record.name)}</span>
            </td>
            <td class="mono-cell">${escapeHtml(record.roll_number)}</td>
            <td class="mono-cell" style="color: var(--text-secondary);">${escapeHtml(record.attendance_date)}</td>
            <td class="mono-cell" style="color: var(--text-secondary);">${escapeHtml(record.attendance_time)}</td>
            <td>
                <span class="status-pill ${isPresent ? 'present' : 'absent'}">
                    <span class="pulse-dot"></span>
                    <span>${escapeHtml(record.status || "Present")}</span>
                </span>
            </td>
        `;
        tableBody.appendChild(tr);
    });
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