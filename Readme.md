# CITN Classroom 🎓

A comprehensive full-stack educational platform designed for modern classroom management, student engagement, and intelligent task evaluation. Built with cutting-edge technologies, CITN Classroom combines a powerful backend API with an intuitive frontend interface, supporting both web and desktop applications.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Frontend Features](#frontend-features)
- [Database Models](#database-models)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)

---

## 🎯 Overview

CITN Classroom is a complete educational management system that streamlines classroom operations, task assignments, student evaluation, and real-time communication between instructors and students. The platform features:

- **Real-time Communication**: WebSocket integration for instant notifications and updates
- **AI-Powered Features**: Intelligent task evaluation and student assistance using OpenRouter API
- **Multi-Platform Support**: Available as web application and desktop application (via Electron)
- **Analytics Dashboard**: Comprehensive insights into student performance and engagement
- **Responsive Design**: Modern UI with Tailwind CSS for seamless experience across devices

---

## ✨ Features

### Core Features

#### 👥 User Management
- **Authentication & Authorization**: JWT-based secure login system
- **Role-Based Access**: Support for Admin, Instructor, and Student roles
- **User Profiles**: Personalized student and instructor profiles
- **Password Security**: Bcrypt hashing for secure password storage

#### 📚 Session Management
- Create and manage classroom sessions
- Assign students to sessions
- Track attendance and participation
- Schedule and reschedule sessions

#### 📝 Task & Assignment System
- Create, update, and delete assignments
- Support for various task types
- Task status tracking
- Deadline management
- Bulk task assignment

#### 📤 Submission & Evaluation
- Student task submissions with file upload support
- Instructor evaluation and grading
- Feedback comments
- Submission history and versioning

#### 🤖 AI Integration
- AI-powered assistance for students
- Intelligent evaluation suggestions
- Learning recommendations using OpenRouter API

#### 📊 Analytics & Tracking
- Student performance metrics
- Engagement analytics
- Activity tracking and audit logs
- Leaderboard system for gamification

#### 🔔 Notifications
- Real-time notifications via WebSockets
- Email notifications
- Notification preferences
- Notification history

#### 🏆 Gamification
- Leaderboard rankings
- Performance tracking
- Student achievement system

---

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js 4.21.2
- **Database**: MongoDB (with Mongoose 8.9.5 ODM)
- **Authentication**: JWT (jsonwebtoken 9.0.3)
- **Security**: 
  - Bcryptjs 2.4.3 (Password hashing)
  - CORS enabled
- **Real-time Communication**: Socket.io 4.8.1
- **File Upload**: Multer 1.4.5
- **HTTP Client**: Axios 1.16.1
- **Development**: Nodemon 3.1.9

### Frontend
- **Framework**: Next.js 16.2.6
- **UI Library**: React 19.2.4
- **Language**: TypeScript 5.x
- **Styling**: 
  - Tailwind CSS 4.x
  - Framer Motion 12.40.0 (Animations)
- **Component Icons**: Lucide React 1.17.0
- **HTTP Client**: Axios 1.16.1
- **Real-time**: Socket.io-client 4.8.3
- **Notifications**: React Hot Toast 2.6.0
- **Desktop**: Electron 41.7.1 & Electron Builder 26.15.0
- **Build Tools**: 
  - ESLint 9.x
  - PostCSS 4.x
  - Babel with React Compiler

---

## 📁 Project Structure

```
websolve/
├── backend/                          # Express.js Backend
│   ├── src/
│   │   ├── app.js                   # Express app configuration
│   │   ├── server.js                # Server entry point
│   │   ├── socket.js                # WebSocket initialization
│   │   ├── config/                  # Configuration files
│   │   │   ├── db.js               # MongoDB connection
│   │   │   └── multer.js           # File upload config
│   │   ├── models/                  # Mongoose schemas
│   │   │   ├── Admin.js
│   │   │   ├── Activity.js
│   │   │   ├── Attendance.js
│   │   │   ├── Evaluation.js
│   │   │   ├── Notification.js
│   │   │   ├── Session.js
│   │   │   ├── Student.js
│   │   │   ├── Submission.js
│   │   │   └── Task.js
│   │   ├── routes/                  # API route handlers
│   │   │   ├── admin.routes.js
│   │   │   ├── ai.routes.js
│   │   │   ├── analytics.routes.js
│   │   │   ├── activity.routes.js
│   │   │   ├── auth.routes.js
│   │   │   ├── evaluation.routes.js
│   │   │   ├── leaderboard.routes.js
│   │   │   ├── notification.routes.js
│   │   │   ├── session.routes.js
│   │   │   ├── student.routes.js
│   │   │   ├── submission.routes.js
│   │   │   ├── task.routes.js
│   │   │   └── taskStatus.routes.js
│   │   ├── controllers/             # Business logic
│   │   ├── middleware/              # Custom middleware
│   │   ├── services/                # Utility services
│   │   └── uploads/                 # File storage directory
│   ├── package.json
│   └── .env.example
│
├── frontend/                         # Next.js Frontend
│   ├── src/
│   │   ├── app/                     # Next.js app directory
│   │   ├── components/              # React components
│   │   ├── context/                 # React Context
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── lib/                     # Utilities & helpers
│   │   ├── types/                   # TypeScript types
│   │   ├── middleware.ts            # Next.js middleware
│   │   └── public/                  # Static assets
│   ├── package.json
│   ├── next.config.ts               # Next.js configuration
│   ├── tsconfig.json                # TypeScript configuration
│   ├── tailwind.config.js           # Tailwind CSS config
│   ├── postcss.config.mjs           # PostCSS configuration
│   └── eslint.config.mjs            # ESLint configuration
│
└── README.md                         # This file
```

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v18.x or higher
- **npm**: v9.x or higher (or yarn/pnpm)
- **MongoDB**: v5.x or higher (local or cloud instance like MongoDB Atlas)
- **Git**: For version control

### Optional
- **Docker & Docker Compose**: For containerized deployment
- **Electron**: For desktop application support (included in dependencies)

---

## ⚙️ Installation

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd websolve
```

### Step 2: Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 3: Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### Step 4: Return to Root

```bash
cd ..
```

---

## 🔧 Configuration

### Backend Configuration

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/citn-classroom
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/citn-classroom

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# OpenRouter API (for AI features)
OPENROUTER_API_KEY=your_openrouter_api_key_here

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# File Upload
MAX_FILE_SIZE=52428800  # 50MB in bytes
UPLOAD_DIR=./src/uploads
```

### Frontend Configuration

Create a `.env.local` file in the `frontend` directory:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_WS_URL=http://localhost:5000

# Environment
NEXT_PUBLIC_ENV=development
```

---

## 🚀 Running the Application

### Development Mode

#### Option 1: Run Both Services Separately (Recommended for Development)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend will run on: `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend will run on: `http://localhost:3000`

#### Option 2: Run Both Services Concurrently

From the root directory (if you have `concurrently` installed):
```bash
npm install -g concurrently
concurrently "cd backend && npm run dev" "cd frontend && npm run dev"
```

### Production Mode

**Backend:**
```bash
cd backend
npm start
```

**Frontend - Build and Start:**
```bash
cd frontend
npm run build
npm start
```

### Desktop Application (Electron)

```bash
cd frontend
npm run dev  # Starts dev server
# In another terminal, run Electron
npm run electron  # (if script is configured)
```

---

## 📚 API Documentation

### Base URL
- **Development**: `http://localhost:5000`
- **Production**: `https://your-domain.com`

### Authentication

All authenticated endpoints require a JWT token in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

### Core API Endpoints

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh JWT token

#### Sessions
- `GET /api/session` - Get all sessions
- `POST /api/session` - Create session
- `GET /api/session/:id` - Get session details
- `PUT /api/session/:id` - Update session
- `DELETE /api/session/:id` - Delete session

#### Tasks/Assignments
- `GET /api/task` - Get all tasks
- `POST /api/task` - Create task
- `GET /api/task/:id` - Get task details
- `PUT /api/task/:id` - Update task
- `DELETE /api/task/:id` - Delete task
- `GET /api/task/status/:id` - Get task status

#### Submissions
- `GET /api/submission` - Get all submissions
- `POST /api/submission` - Submit task
- `GET /api/submission/:id` - Get submission details
- `PUT /api/submission/:id` - Update submission

#### Evaluations
- `GET /api/evaluation` - Get all evaluations
- `POST /api/evaluation` - Create evaluation
- `GET /api/evaluation/:id` - Get evaluation details
- `PUT /api/evaluation/:id` - Update evaluation

#### Analytics
- `GET /api/analytics/performance` - Student performance metrics
- `GET /api/analytics/engagement` - Engagement analytics
- `GET /api/analytics/summary` - Analytics summary

#### Leaderboard
- `GET /api/leaderboard` - Get leaderboard rankings
- `GET /api/leaderboard/student/:id` - Get student ranking

#### Notifications
- `GET /api/notification` - Get notifications
- `POST /api/notification` - Create notification
- `PUT /api/notification/:id/read` - Mark notification as read

#### AI Features
- `POST /api/ai/evaluate` - AI-powered task evaluation
- `POST /api/ai/suggest` - Get AI suggestions for student

#### Admin
- `GET /api/admin/users` - List all users
- `POST /api/admin/users` - Create user
- `DELETE /api/admin/users/:id` - Delete user

---

## 🎨 Frontend Features

### Pages & Components

#### Authentication
- Login page with form validation
- Registration page
- Password reset functionality
- JWT token management

#### Dashboard
- Overview of active sessions
- Quick stats (tasks, submissions, evaluations)
- Recent activity feed
- Personalized recommendations

#### Session Management
- List and browse sessions
- Create new sessions
- Manage enrolled students
- View session details and analytics

#### Task Management
- Create and edit assignments
- Set deadlines and priorities
- Bulk operations
- Task templates

#### Student Dashboard
- Assigned tasks and deadlines
- Submission history
- Performance metrics
- Achievements and leaderboard position

#### Instructor Dashboard
- Class overview
- Student performance analytics
- Submission review interface
- Grading and feedback tools

#### Analytics & Reports
- Student performance charts
- Engagement metrics
- Activity timeline
- Custom report generation

#### Real-time Features
- Live notifications
- Online status indicators
- Real-time chat (via WebSockets)
- Instant updates on submissions

---

## 🗄️ Database Models

### Admin
```javascript
{
  email: String,
  password: String,
  name: String,
  role: String
}
```

### Student
```javascript
{
  email: String,
  password: String,
  name: String,
  rollNumber: String,
  sessions: [Session._id],
  submissions: [Submission._id],
  createdAt: Date,
  updatedAt: Date
}
```

### Session
```javascript
{
  name: String,
  description: String,
  instructor: Admin._id,
  students: [Student._id],
  tasks: [Task._id],
  startDate: Date,
  endDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Task
```javascript
{
  title: String,
  description: String,
  session: Session._id,
  dueDate: Date,
  maxScore: Number,
  createdBy: Admin._id,
  submissions: [Submission._id],
  createdAt: Date,
  updatedAt: Date
}
```

### Submission
```javascript
{
  task: Task._id,
  student: Student._id,
  content: String,
  file: String,
  submittedAt: Date,
  status: String,
  evaluation: Evaluation._id,
  createdAt: Date,
  updatedAt: Date
}
```

### Evaluation
```javascript
{
  submission: Submission._id,
  evaluator: Admin._id,
  score: Number,
  feedback: String,
  evaluatedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Notification
```javascript
{
  recipient: Student._id,
  title: String,
  message: String,
  type: String,
  read: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Activity
```javascript
{
  user: Student._id,
  action: String,
  description: String,
  timestamp: Date,
  metadata: Object
}
```

### Attendance
```javascript
{
  session: Session._id,
  student: Student._id,
  date: Date,
  present: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🌍 Environment Variables

### Backend Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment mode | `development` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/citn-classroom` |
| `JWT_SECRET` | Secret key for JWT signing | `your-secret-key` |
| `JWT_EXPIRE` | JWT expiration time | `7d` |
| `OPENROUTER_API_KEY` | API key for OpenRouter AI | `sk-xxxx` |
| `CORS_ORIGIN` | CORS allowed origins | `http://localhost:3000` |
| `MAX_FILE_SIZE` | Max file upload size (bytes) | `52428800` |
| `UPLOAD_DIR` | Directory for file uploads | `./src/uploads` |

### Frontend Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:5000` |
| `NEXT_PUBLIC_WS_URL` | WebSocket server URL | `http://localhost:5000` |
| `NEXT_PUBLIC_ENV` | Environment mode | `development` |

---

## 📖 Getting Started as Developer

### First Time Setup

1. **Clone and install dependencies** (as per Installation section)
2. **Configure environment variables** (as per Configuration section)
3. **Start MongoDB** (local or Atlas)
4. **Run backend and frontend** in development mode

### Useful Commands

**Backend:**
```bash
# Development with auto-reload
npm run dev

# Production start
npm start
```

**Frontend:**
```bash
# Development with hot reload
npm run dev

# Build for production
npm run build

# Start production build
npm start

# Run linter
npm run lint
```

### Development Workflow

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Test thoroughly
4. Commit with clear messages: `git commit -m "Add feature: description"`
5. Push to repository: `git push origin feature/your-feature`
6. Create a Pull Request

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/AmazingFeature`
3. **Commit your changes**: `git commit -m 'Add some AmazingFeature'`
4. **Push to the branch**: `git push origin feature/AmazingFeature`
5. **Open a Pull Request**

### Code Style

- **Backend**: Follow Express.js conventions
- **Frontend**: Follow Next.js and React best practices
- **TypeScript**: Use strict type checking
- **Formatting**: Use ESLint and Prettier

---

## 📞 Support & Contact

For issues, questions, or suggestions:

- Open an issue on the repository
- Contact the development team
- Check existing documentation

---

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

---

## 🙏 Acknowledgments

- Built with [Express.js](https://expressjs.com/)
- Powered by [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Real-time with [Socket.io](https://socket.io/)
- Database by [MongoDB](https://www.mongodb.com/)
- AI Integration via [OpenRouter](https://openrouter.ai/)

---
**Version**: 1.0.0
