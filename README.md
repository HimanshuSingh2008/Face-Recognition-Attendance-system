<div align="center">

<h1>Face Recognition Attendance System</h1>

<p>
  A smart attendance management system using 
  <strong>Python, OpenCV, Face Recognition, and SQLite</strong>.
</p>

<p>
  <img src="https://img.shields.io/badge/Python-3.x-blue?style=for-the-badge&logo=python" alt="Python">
  <img src="https://img.shields.io/badge/OpenCV-Computer%20Vision-green?style=for-the-badge&logo=opencv" alt="OpenCV">
  <img src="https://img.shields.io/badge/SQLite-Database-blue?style=for-the-badge&logo=sqlite" alt="SQLite">
  <img src="https://img.shields.io/badge/Status-In%20Development-orange?style=for-the-badge" alt="Project Status">
</p>

</div>

<hr>

<h2>📌 About The Project</h2>

<p>
  The <strong>Face Recognition Attendance System</strong> is an automated
  attendance management system that uses a webcam to detect and recognize
  registered faces.
</p>

<p>
  Once a registered person is recognized, the system automatically records
  their attendance along with the <strong>date and time</strong> in an
  SQLite database.
</p>

<p>
  This project demonstrates the practical implementation of
  <strong>Computer Vision, Face Recognition, Image Processing,
  Python Programming, and Database Management</strong>.
</p>

<hr>

<h2>✨ Features</h2>

<ul>
  <li>📷 Real-time webcam face detection</li>
  <li>👤 Face registration</li>
  <li>🧠 Face encoding generation</li>
  <li>🔍 Face recognition and matching</li>
  <li>✅ Automatic attendance marking</li>
  <li>🗄️ SQLite database integration</li>
  <li>⏰ Date and time-based attendance records</li>
  <li>🚫 Prevention of duplicate attendance</li>
  <li>📊 Attendance record management</li>
  <li>💻 Simple and user-friendly interface</li>
</ul>

<hr>

<h2>🛠️ Technologies Used</h2>

<table>
  <thead>
    <tr>
      <th>Technology</th>
      <th>Purpose</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Python</td>
      <td>Main programming language</td>
    </tr>
    <tr>
      <td>OpenCV</td>
      <td>Webcam access and image processing</td>
    </tr>
    <tr>
      <td>face_recognition</td>
      <td>Face encoding and face matching</td>
    </tr>
    <tr>
      <td>NumPy</td>
      <td>Numerical and array operations</td>
    </tr>
    <tr>
      <td>SQLite</td>
      <td>Attendance database</td>
    </tr>
    <tr>
      <td>Git &amp; GitHub</td>
      <td>Version control and project hosting</td>
    </tr>
    <tr>
      <td>VS Code</td>
      <td>Development environment</td>
    </tr>
  </tbody>
</table>

<hr>

<h2>📂 Project Structure</h2>

<pre>
Face-Recognition-Attendance-System/
│
├── app.py
├── database.py
├── face_encoding.py
├── face_recognition_system.py
├── attendance.py
│
├── dataset/
│   └── captured images
│
├── encodings/
│   └── face encodings
│
├── attendance.db
│
├── requirements.txt
├── README.md
├── .gitignore
│
└── screenshots/
    └── project screenshots
</pre>

<p>
  <strong>Note:</strong> Update the structure above according to the actual
  files and folders in your project.
</p>

<hr>

<h2>⚙️ How It Works</h2>

<ol>
  <li>Start the application.</li>
  <li>Open the webcam.</li>
  <li>Capture the person's face.</li>
  <li>Detect the face using OpenCV.</li>
  <li>Generate the face encoding.</li>
  <li>Compare it with registered face encodings.</li>
  <li>Identify the person if a match is found.</li>
  <li>Record attendance in the SQLite database.</li>
</ol>

<hr>

<h2>🚀 Installation</h2>

<h3>1. Clone the Repository</h3>

<pre>
git clone https://github.com/HimanshuSingh2008/Face-Recognition-Attendance-System.git
</pre>

<h3>2. Open the Project Directory</h3>

<pre>
cd Face-Recognition-Attendance-System
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

<p><strong>macOS / Linux:</strong></p>

<pre>
source venv/bin/activate
</pre>

<h3>5. Install Dependencies</h3>

<pre>
pip install -r requirements.txt
</pre>

<p>
  If the <code>requirements.txt</code> file has not been created yet,
  install the main dependencies using:
</p>

<pre>
pip install opencv-python
pip install face-recognition
pip install numpy
</pre>

<hr>

<h2>▶️ Running the Project</h2>

<p>Run the main application file:</p>

<pre>
python app.py
</pre>

<p>
  The application will start and access the webcam for face detection
  and recognition.
</p>

<hr>

<h2>👤 Face Registration</h2>

<ol>
  <li>Start the application.</li>
  <li>Enter the person's details.</li>
  <li>Capture their face using the webcam.</li>
  <li>Generate the face encoding.</li>
  <li>Store the encoding for future recognition.</li>
</ol>

<hr>

<h2>📋 Attendance System</h2>

<p>
  When a registered person appears in front of the webcam, the system
  detects and recognizes the face automatically.
</p>

<table>
  <thead>
    <tr>
      <th>ID</th>
      <th>Name</th>
      <th>Date</th>
      <th>Time</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>1</td>
      <td>Student 1</td>
      <td>2026-09-12</td>
      <td>09:15:23</td>
    </tr>
    <tr>
      <td>2</td>
      <td>Student 2</td>
      <td>2026-09-12</td>
      <td>09:17:41</td>
    </tr>
  </tbody>
</table>

<hr>

<h2>🗄️ Database</h2>

<p>
  The project uses <strong>SQLite</strong> to store attendance information.
</p>

<pre>
Attendance
│
├── id
├── name
├── date
└── time
</pre>

<p>
  SQLite makes the project lightweight because it does not require
  a separate database server.
</p>

<hr>

<h2>📸 Screenshots</h2>

<p>
  Add screenshots of your application in the
  <code>screenshots</code> folder.
</p>

<p>
  Example:
</p>

<img src="screenshots/home.png" alt="Home Screen" width="700">

<br><br>

<img src="screenshots/recognition.png" alt="Face Recognition Screen" width="700">

<br><br>

<img src="screenshots/attendance.png" alt="Attendance Records" width="700">

<hr>

<h2>🎯 Project Goals</h2>

<ul>
  <li>Automate the attendance marking process.</li>
  <li>Reduce manual attendance work.</li>
  <li>Implement face recognition using Python.</li>
  <li>Apply computer vision concepts.</li>
  <li>Store attendance records using a database.</li>
  <li>Build a complete end-to-end AI/ML project.</li>
</ul>

<hr>

<h2>🔮 Future Improvements</h2>

<ul>
  <li>🌐 Web-based dashboard</li>
  <li>👨‍🏫 Admin login system</li>
  <li>📊 Attendance analytics</li>
  <li>📈 Attendance percentage calculation</li>
  <li>📧 Email notifications</li>
  <li>📱 Mobile application</li>
  <li>☁️ Cloud database integration</li>
  <li>📄 Export attendance to CSV/Excel</li>
  <li>🔐 Improved authentication</li>
  <li>🎥 Multiple-camera support</li>
</ul>

<hr>

<h2>🔐 Privacy &amp; Security</h2>

<p>
  This project is intended for educational purposes.
  Face data should be handled responsibly.
</p>

<ul>
  <li>Obtain appropriate user consent.</li>
  <li>Protect stored face encodings.</li>
  <li>Restrict database access.</li>
  <li>Avoid exposing personal information publicly.</li>
  <li>Follow applicable privacy and data-protection requirements.</li>
</ul>

<hr>

<h2>🎓 Academic Project</h2>

<p>
  This project was developed as a college-level
  <strong>Computer Science / AI &amp; ML project</strong> to demonstrate
  practical applications of computer vision, Python programming,
  face recognition, and database management.
</p>

<hr>

<h2>👨‍💻 Author</h2>

<p>
  <strong>Himanshu Singh</strong>
</p>

<p>
  GitHub:
  <a href="https://github.com/HimanshuSingh2008">
    @HimanshuSingh2008
  </a>
</p>

<hr>

<h2>📄 License</h2>

<p>
  This project is licensed under the <strong>MIT License</strong>.
</p>

<hr>

<div align="center">

<h3>⭐ If you find this project useful, consider giving it a star!</h3>

<p>
  Made with ❤️ using Python and Computer Vision
</p>

</div>
