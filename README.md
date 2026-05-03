Memory Capsule

A full-stack web application that allows users to create digital "memory capsules" — store photos, messages, and moments that unlock at a future date.

Live Demo:
🌐 Frontend (Vercel): https://memory-capsule-murex.vercel.app
⚙️ Backend (Render): https://memory-capsule-zk9c.onrender.com

Features:
🔐 Secure authentication (JWT-based)
📦 Create personal memory capsules
⏳ Time-based unlocking of memories
👥 Add and manage team members
🖼 Upload images and media
🔔 Real-time updates (Socket.IO)
📅 Timeline & calendar views
🌐 Fully deployed (Frontend + Backend + Cloud DB)

Tech Stack
Frontend
React (Vite + TypeScript)
Tailwind CSS
Axios
React Router
Backend
Node.js
Express.js
MongoDB (Atlas)
Mongoose
Multer (file uploads)
Socket.IO
Deployment
Frontend → Vercel
Backend → Render
Database → MongoDB Atlas

📁 Project Structure
memory-capsule/
│
├── frontend/        # React app
├── backend/         # Node + Express API
├── uploads/         # Uploaded files (local)
└── README.md

⚙️ Environment Variables
🔧 Backend (.env)
PORT=5000
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_secret_key


🌐 Frontend (.env)
VITE_API_URL=https://memory-capsule-zk9c.onrender.com

🛠 Installation & Setup
1️⃣ Clone the repository
git clone https://github.com/keerthu-sri/memory_capsule.git
cd memory_capsule
2️⃣ Backend Setup
cd backend
npm install
npm run dev
3️⃣ Frontend Setup
cd frontend
npm install
npm run dev
📦 API Base URL
https://memory-capsule-zk9c.onrender.com/api

Initial load may be slow due to free-tier hosting
🔮 Future Improvements
☁️ Cloud storage integration (Cloudinary / AWS S3)
🔐 OAuth login (Google)
📱 Mobile responsiveness improvements
📊 Analytics dashboard
🔔 Push notifications

Authors

Keerthana SRI D
Sanjana C
Buhary Fawaaz S F

Built as a full-stack project showcasing real-world deployment and system design.
