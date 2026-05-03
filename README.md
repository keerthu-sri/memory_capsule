# memory_capsule

Memory Capsule – Fullstack Application

Project Overview

Memory Capsule is a fullstack web application that allows users to create, manage, and share digital memory capsules. It also includes a Team Members module for managing project team details with full CRUD functionality.

---

Features

Authentication

- User Signup & Login
- JWT-based authentication
- Secure password hashing (bcrypt)

Capsule Management

- Create, view, update, delete capsules
- Upload media (images/videos)
- Dashboard with capsule stats

Sharing & Collaboration

- Share capsules with other users
- “Shared by me” and “Shared with me”
- Invite system (pending/accepted)

Team Members Module

- Add team members with full details
- Upload profile picture
- View all members (card layout)
- View detailed member information
- Update and delete members

---

Tech Stack

Frontend

- React (Vite)
- Tailwind CSS
- Axios

Backend

- Node.js
- Express.js
- MongoDB (Mongoose)

Other Tools

- JWT Authentication
- Multer (file uploads)

---

Project Structure

FSD_PROJ/
├── backend/
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   ├── uploads/
│   └── server.js
│
├── memory_capsule/ (frontend)
│   ├── src/
│   ├── components/
│   ├── pages/
│   └── App.jsx
│
├── .gitignore
└── README.md

---

Installation & Setup

🔹 1. Clone the Repository

git clone https://github.com/keerthu-sri/memory_capsule.git

cd fsd_proj

---

🔹 2. Install Backend Dependencies

cd backend
npm install

---

🔹 3. Install Frontend Dependencies

cd ../memory_capsule
npm install

---

🔹 4. Setup Environment Variables

Create a ".env" file inside backend:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key

---

▶️ Running the Application

🔹 Start Backend Server

cd backend
npm start

or (if using nodemon):

npm run dev

---

🔹 Start Frontend

cd memory_capsule
npm run dev

---

🌐 Access Application

Frontend: http://localhost:5173
Backend:  http://localhost:5000

---

API Endpoints

Authentication

POST   /api/auth/register
POST   /api/auth/login

---

Capsules

GET    /api/capsules
POST   /api/capsules
PUT    /api/capsules/:id
DELETE /api/capsules/:id

---

Sharing

POST   /api/share
GET    /api/shared-by-me
GET    /api/shared-with-me

---

Team Members

POST   /api/members
GET    /api/members
GET    /api/members/:id
PUT    /api/members/:id
DELETE /api/members/:id

---

File Upload

- Images are uploaded using Multer
- Stored in "/backend/uploads"
- File path saved in MongoDB

---

Testing APIs

Use:

- Postman
- Thunder Client (VS Code)

---

Future Enhancements

- Notifications system
- Real-time updates
- Deployment (Vercel + Render)
- Role-based access control

---

How to Run (Quick Steps)

git clone <repo-link>
cd fsd_proj

# Backend
cd backend
npm install
npm start

# Frontend
cd ../memory_capsule
npm install
npm run dev

---

Notes

- Ensure MongoDB is running
- Use correct ".env" values
- Do not upload "node_modules"

---

Conclusion

This project demonstrates:

- Fullstack development
- REST API integration
- Authentication & authorization
- File upload handling
- Real-world collaboration features

---

Author

Keerthana Sri D
Sanjana C
Buhary Fawaaz S F
FULL STACK DEVELOPMENT PROJECT
