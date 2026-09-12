<div align="center">

<h1>Face Recognition Attendance System</h1>

<p>
  <strong>AI-powered attendance management system using face recognition</strong>
</p>

<p>
  Automate student attendance using real-time face detection,
  face recognition, and database management.
</p>

<br>

<img src="https://img.shields.io/badge/Python-3.x-blue?style=for-the-badge&logo=python" alt="Python">
<img src="https://img.shields.io/badge/OpenCV-Computer%20Vision-green?style=for-the-badge&logo=opencv" alt="OpenCV">
<img src="https://img.shields.io/badge/Flask-Backend-black?style=for-the-badge&logo=flask" alt="Flask">
<img src="https://img.shields.io/badge/SQLite-Database-blue?style=for-the-badge&logo=sqlite" alt="SQLite">
<img src="https://img.shields.io/badge/HTML5-Frontend-orange?style=for-the-badge&logo=html5" alt="HTML5">
<img src="https://img.shields.io/badge/JavaScript-Frontend-yellow?style=for-the-badge&logo=javascript" alt="JavaScript">

<br><br>

<img src="https://img.shields.io/github/license/HimanshuSingh2008/Face-Recognition-Attendance" alt="License">
<img src="https://img.shields.io/github/stars/HimanshuSingh2008/Face-Recognition-Attendance" alt="Stars">
<img src="https://img.shields.io/github/forks/HimanshuSingh2008/Face-Recognition-Attendance" alt="Forks">

</div>

<hr>

<h2>📌 About The Project</h2>

<p>
  <strong>Face Recognition Attendance System</strong> is an AI-based
  attendance management application designed to automate the process
  of recording student attendance.
</p>

<p>
  The system uses a webcam to capture a student's face, detects the face,
  generates its facial encoding, and compares it with previously registered
  face encodings. If a match is found, the student's attendance is
  automatically recorded in the database.
</p>

<p>
  The project follows a <strong>frontend-backend architecture</strong>,
  making it modular, scalable, and easier to maintain.
</p>

<hr>

<h2>🎯 Project Objectives</h2>

<ul>
  <li>Automate the traditional attendance process.</li>
  <li>Reduce manual attendance errors.</li>
  <li>Use computer vision for real-time face detection.</li>
  <li>Implement face recognition for student identification.</li>
  <li>Maintain attendance records using a database.</li>
  <li>Provide an admin dashboard for managing students and records.</li>
  <li>Create a modular and scalable software architecture.</li>
</ul>

<hr>

<h2>✨ Features</h2>

<h3>👨‍💼 Admin Features</h3>

<ul>
  <li>Secure admin login</li>
  <li>Dashboard</li>
  <li>Student registration</li>
  <li>Student management</li>
  <li>Attendance monitoring</li>
  <li>Attendance record viewing</li>
</ul>

<h3>🤖 Face Recognition Features</h3>

<ul>
  <li>Real-time webcam access</li>
  <li>Face detection</li>
  <li>Face encoding generation</li>
  <li>Face matching</li>
  <li>Registered student identification</li>
  <li>Unknown face detection</li>
</ul>

<h3>📊 Attendance Features</h3>

<ul>
  <li>Automatic attendance marking</li>
  <li>Date and time recording</li>
  <li>Duplicate attendance prevention</li>
  <li>Attendance history</li>
  <li>Student-wise attendance records</li>
</ul>

<hr>

<h2>🏗️ System Architecture</h2>

<p>
  The system is divided into three major layers:
</p>

<ol>
  <li><strong>Frontend:</strong> User interface and webcam interaction.</li>
  <li><strong>Backend:</strong> API, authentication, face recognition and business logic.</li>
  <li><strong>Database:</strong> Storage of student and attendance information.</li>
</ol>

<pre>
                    ┌──────────────────────┐
                    │      FRONTEND        │
                    │                      │
                    │ HTML │ CSS │ JS      │
                    └──────────┬───────────┘
                               │
                               │ HTTP / API
                               ▼
                    ┌──────────────────────┐
                    │       BACKEND        │
                    │                      │
                    │      Flask API       │
                    │                      │
                    │ ┌──────────────────┐ │
                    │ │ Authentication   │ │
                    │ │ Student Routes   │ │
                    │ │ Attendance API   │ │
                    │ │ Recognition API  │ │
                    │ └──────────────────┘ │
                    └──────────┬───────────┘
                               │
                ┌──────────────┼──────────────┐
                │              │              │
                ▼              ▼              ▼
          ┌──────────┐  ┌────────────┐  ┌─────────────┐
          │ SQLite   │  │ Face       │  │ Attendance  │
          │ Database │  │ Recognition│  │ Service     │
          └──────────┘  └────────────┘  └─────────────┘
                               │
                               ▼
                       ┌───────────────┐
                       │ Face Encodings│
                       └───────────────┘
</pre>

<hr>

<h2>📂 Project Structure</h2>

<pre>
Face-Recognition-Attendance/
│
├── frontend/
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── attendance.html
│   ├── students.html
│   ├── records.html
│   │
│   ├── css/
│   │   ├── style.css
│   │   ├── dashboard.css
│   │   └── responsive.css
│   │
│   ├── js/
│   │   ├── camera.js
│   │   ├── register.js
│   │   ├── attendance.js
│   │   ├── students.js
│   │   └── records.js
│   │
│   └── assets/
│       ├── images/
│       └── icons/
│
├── backend/
│   ├── app.py
│   ├── config.py
│   ├── requirements.txt
│   │
│   ├── routes/
│   │   ├── auth_routes.py
│   │   ├── student_routes.py
│   │   ├── attendance_routes.py
│   │   └── recognition_routes.py
│   │
│   ├── services/
│   │   ├── face_encoder.py
│   │   ├── face_recognition.py
│   │   └── attendance_service.py
│   │
│   ├── database/
│   │   ├── db.py
│   │   └── students.db
│   │
│   ├── models/
│   │   ├── student.py
│   │   └── attendance.py
│   │
│   ├── dataset/
│   │   └── registered_faces/
│   │
│   ├── encodings/
│   │   └── face_encodings.pkl
│   │
│   ├── uploads/
│   │   └── temp/
│   │
│   └── logs/
│       └── app.log
│
├── tests/
│   ├── test_database.py
│   ├── test_recognition.py
│   └── test_attendance.py
│
├── docs/
│   ├── project_report.pdf
│   ├── architecture.png
│   └── database_schema.png
│
├── .gitignore
├── README.md
└── LICENSE
</pre>

<hr>

<h2>🖥️ Frontend</h2>

<p>
  The frontend provides the graphical interface through which administrators
  can interact with the attendance system.
</p>

<table>
  <thead>
    <tr>
      <th>File</th>
      <th>Purpose</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>index.html</code></td>
      <td>Dashboard / Home page</td>
    </tr>
    <tr>
      <td><code>login.html</code></td>
      <td>Admin authentication</td>
    </tr>
    <tr>
      <td><code>register.html</code></td>
      <td>Register new students</td>
    </tr>
    <tr>
      <td><code>attendance.html</code></td>
      <td>Face recognition and attendance</td>
    </tr>
    <tr>
      <td><code>students.html</code></td>
      <td>Student management</td>
    </tr>
    <tr>
      <td><code>records.html</code></td>
      <td>Attendance records</td>
    </tr>
  </tbody>
</table>

<h3>🎨 Frontend Technologies</h3>

<ul>
  <li>HTML5</li>
  <li>CSS3</li>
  <li>JavaScript</li>
  <li>Web Camera API</li>
  <li>Responsive Design</li>
</ul>

<hr>

<h2>⚙️ Backend</h2>

<p>
  The backend is responsible for handling API requests, authentication,
  database operations, face recognition, and attendance processing.
</p>

<h3>Backend Components</h3>

<ul>
  <li><strong>app.py:</strong> Main Flask application.</li>
  <li><strong>config.py:</strong> Application configuration.</li>
  <li><strong>routes/:</strong> API endpoint definitions.</li>
  <li><strong>services/:</strong> Business logic and face recognition.</li>
  <li><strong>models/:</strong> Data models.</li>
  <li><strong>database/:</strong> SQLite database operations.</li>
</ul>

<hr>

<h2>🧠 Face Recognition Pipeline</h2>

<pre>
Webcam
   │
   ▼
Capture Image
   │
   ▼
Face Detection
   │
   ▼
Face Encoding
   │
   ▼
Compare With Stored Encodings
   │
   ├───────────────┐
   │               │
   ▼               ▼
Match Found     No Match
   │               │
   ▼               ▼
Identify       Unknown Face
Student
   │
   ▼
Check Attendance
   │
   ▼
Save Attendance
   │
   ▼
SQLite Database
</pre>

<hr>

<h2>🗄️ Database</h2>

<p>
  The application uses <strong>SQLite</strong> as its database system.
  Student information and attendance records are stored locally.
</p>

<h3>Student Data</h3>

<ul>
  <li>Student ID</li>
  <li>Name</li>
  <li>Registration information</li>
  <li>Face encoding reference</li>
</ul>

<h3>Attendance Data</h3>

<ul>
  <li>Attendance ID</li>
  <li>Student ID</li>
  <li>Date</li>
  <li>Time</li>
</ul>

<hr>

<h2>🔐 Authentication</h2>

<p>
  The system provides an administrator login interface.
  Authentication requests are handled by the backend through
  <code>auth_routes.py</code>.
</p>

<p>
  Only authenticated administrators should be allowed to access
  student management and attendance records.
</p>

<hr>

<h2>🚀 Installation</h2>

<h3>Prerequisites</h3>

<ul>
  <li>Python 3.x</li>
  <li>Git</li>
  <li>VS Code or another code editor</li>
  <li>Webcam</li>
</ul>

<h3>1. Clone the Repository</h3>

<pre>
git clone https://github.com/HimanshuSingh2008/Face-Recognition-Attendance.git
</pre>

<h3>2. Navigate to the Project</h3>

<pre>
cd Face-Recognition-Attendance
</pre>

<h3>3. Create a Virtual Environment</h3>

<pre>
python -m venv venv
</pre>

<h3>4. Activate the Virtual Environment</h3>

<p><strong>Windows:</strong></p>

<pre>
venv\Scripts\activate
</pre>

<p><strong>Linux / macOS:</strong></p>

<pre>
source venv/bin/activate
</pre>

<h3>5. Install Backend Dependencies</h3>

<pre>
cd backend
pip install -r requirements.txt
</pre>

<hr>

<h2>▶️ Running the Application</h2>

<h3>Start the Backend</h3>

<pre>
cd backend
python app.py
</pre>

<p>
  The Flask backend will start on the configured local server.
</p>

<h3>Open the Frontend</h3>

<p>
  Open <code>frontend/login.html</code> in your browser or use
  the VS Code Live Server extension.
</p>

<hr>

<h2>📝 Register a Student</h2>

<ol>
  <li>Open the admin login page.</li>
  <li>Log in using administrator credentials.</li>
  <li>Navigate to the student registration page.</li>
  <li>Enter the student's information.</li>
  <li>Capture the student's face using the webcam.</li>
  <li>Generate and store the face encoding.</li>
</ol>

<hr>

<h2>📋 Mark Attendance</h2>

<ol>
  <li>Open the attendance page.</li>
  <li>Allow webcam access.</li>
  <li>Show the registered student's face to the camera.</li>
  <li>The system detects the face.</li>
  <li>The face encoding is compared with stored encodings.</li>
  <li>If a match is found, the student is identified.</li>
  <li>The attendance service records the attendance.</li>
  <li>The record is stored in SQLite.</li>
</ol>

<hr>

<h2>🧪 Testing</h2>

<p>
  Automated tests are included to verify important components of
  the application.
</p>

<table>
  <thead>
    <tr>
      <th>Test File</th>
      <th>Purpose</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>test_database.py</code></td>
      <td>Tests database operations</td>
    </tr>
    <tr>
      <td><code>test_recognition.py</code></td>
      <td>Tests face recognition functionality</td>
    </tr>
    <tr>
      <td><code>test_attendance.py</code></td>
      <td>Tests attendance functionality</td>
    </tr>
  </tbody>
</table>

<h3>Run Tests</h3>

<pre>
pytest
</pre>

<hr>

<h2>📸 Screenshots</h2>

<p>
  Project screenshots can be added to the <code>docs/</code> or
  <code>frontend/assets/images/</code> directory.
</p>

<h3>Login Page</h3>

<img src="docs/login.png" alt="Admin Login" width="800">

<h3>Dashboard</h3>

<img src="docs/dashboard.png" alt="Dashboard" width="800">

<h3>Face Recognition</h3>

<img src="docs/recognition.png" alt="Face Recognition" width="800">

<h3>Attendance Records</h3>

<img src="docs/records.png" alt="Attendance Records" width="800">

<p>
  <em>
    Replace the image paths above with your actual screenshot files.
  </em>
</p>

<hr>

<h2>📚 Documentation</h2>

<p>
  Additional project documentation is available in the
  <code>docs/</code> directory.
</p>

<ul>
  <li><code>project_report.pdf</code> – Detailed project report</li>
  <li><code>architecture.png</code> – System architecture</li>
  <li><code>database_schema.png</code> – Database schema</li>
</ul>

<hr>

<h2>🔒 Privacy &amp; Security</h2>

<p>
  This project processes biometric information and should therefore be
  used responsibly.
</p>

<ul>
  <li>Obtain appropriate consent before collecting facial data.</li>
  <li>Do not publicly expose stored face encodings.</li>
  <li>Protect student information and database files.</li>
  <li>Use secure authentication in production.</li>
  <li>Do not commit sensitive credentials to GitHub.</li>
  <li>Follow applicable privacy and data-protection requirements.</li>
</ul>

<hr>

<h2>🔮 Future Improvements</h2>

<ul>
  <li>📊 Advanced attendance analytics</li>
  <li>📈 Attendance percentage calculation</li>
  <li>📄 Export attendance to CSV and Excel</li>
  <li>📧 Email notifications</li>
  <li>📱 Mobile application</li>
  <li>☁️ Cloud database integration</li>
  <li>🔐 JWT-based authentication</li>
  <li>👥 Multiple-admin support</li>
  <li>🎥 Multi-camera support</li>
  <li>🤖 Improved recognition under different lighting conditions</li>
  <li>📅 Automatic monthly attendance reports</li>
</ul>

<hr>

<h2>⚠️ Important</h2>

<p>
  Files containing sensitive or generated data such as:
</p>

<ul>
  <li><code>students.db</code></li>
  <li><code>face_encodings.pkl</code></li>
  <li>Registered face images</li>
  <li>Temporary uploads</li>
  <li>Application logs</li>
</ul>

<p>
  should generally <strong>not be committed to a public GitHub repository</strong>
  unless they contain only safe test/demo data.
</p>

<hr>

<h2>🤝 Contributing</h2>

<p>
  Contributions and improvements are welcome.
</p>

<ol>
  <li>Fork the repository.</li>
  <li>Create a new feature branch.</li>
  <li>Make your changes.</li>
  <li>Test your changes.</li>
  <li>Create a pull request.</li>
</ol>

<pre>
git checkout -b feature/new-feature
git add .
git commit -m "Add new feature"
git push origin feature/new-feature
</pre>

<hr>

<h2>📄 License</h2>

<p>
  This project is licensed under the <strong>MIT License</strong>.
</p>

<hr>

<h2>👨‍💻 Author</h2>

<div align="center">

<h3>Himanshu Singh</h3>

<p>
  B.Tech Computer Science &amp; Engineering (AI/ML)
</p>

<p>
  <a href="https://github.com/HimanshuSingh2008">
    GitHub Profile
  </a>
</p>

</div>

<hr>

<div align="center">

<h2>⭐ Support</h2>

<p>
  If you found this project useful, please consider giving it a
  <strong>star ⭐</strong> on GitHub.
</p>

<p>
  <strong>Built with Python, Computer Vision &amp; AI 🤖</strong>
</p>

</div>
