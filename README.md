# LinkUp

**LinkUp** is a platform that bridges the gap between talented students and innovative companies. Students can showcase their programming skills through coding challenges, while companies can discover and recruit top talent.

## 🌟 Features

### For Students
- 📝 **Browse Challenges** - Explore coding challenges from top companies
- 💻 **Submit Solutions** - Submit your code solutions via GitHub repositories
- 🏆 **Earn Points** - Get scored and earn points for completed challenges
- 📊 **Track Progress** - Monitor your performance with detailed statistics
- 🎯 **Leaderboard** - Compete with peers and climb the rankings
- 👤 **Profile Management** - Showcase your skills and achievements

### For Companies
- ➕ **Create Challenges** - Post coding challenges to attract talent
- 👀 **Review Submissions** - Evaluate student solutions
- 📈 **Analytics Dashboard** - Track challenge performance and engagement
- 🔍 **Discover Talent** - Find skilled developers based on performance
- 📝 **Manage Challenges** - Edit or deactivate challenges as needed

## 🛠️ Tech Stack

### Frontend
- **React** 19.1.1 - UI library
- **React Router** 7.8.2 - Navigation and routing
- **Tailwind CSS** 3.x - Styling framework
- **Axios** - HTTP client for API requests
- **Framer Motion** - Animations
- **Lucide React** - Icon library

### Backend
- **Node.js** - Runtime environment
- **Express** 4.x - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas account)
- **Git**

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/muhammadnavas/UpLink.git
cd LinkUp
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

**Configure your `.env` file:**

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=your_mongodb_connection_string

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
```

**Start the backend server:**

```bash
npm start
```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

**Configure your `.env` file:**

```env
REACT_APP_API_URL=http://localhost:5000/api
```

**Start the frontend development server:**

```bash
npm start
```

The frontend will run on `http://localhost:3000`

## 📁 Project Structure

```
LinkUp/
├── backend/
│   ├── config/
│   │   └── db.js              # Database configuration
│   ├── controllers/
│   │   ├── authController.js  # Authentication logic
│   │   ├── leaderboardController.js
│   │   └── submissions.js
│   ├── middleware/
│   │   └── authMiddleware.js  # JWT authentication
│   ├── models/
│   │   ├── User.js           # User schema
│   │   ├── Challenge.js      # Challenge schema
│   │   ├── Submission.js     # Submission schema
│   │   └── Activity.js       # Activity schema
│   ├── routes/
│   │   ├── auth.js
│   │   ├── challenges.js
│   │   ├── submissions.js
│   │   ├── leaderboard.js
│   │   ├── dashboard.js
│   │   ├── admin.js
│   │   └── public.js
│   ├── utils/
│   │   ├── database.js
│   │   ├── emailService.js
│   │   ├── statsUpdater.js
│   │   └── validators.js
│   ├── scripts/
│   │   └── ...               # Database scripts
│   ├── .env
│   ├── package.json
│   └── server.js             # Entry point
│
└── frontend/
    ├── public/
    │   ├── index.html
    │   └── manifest.json
    ├── src/
    │   ├── components/
    │   │   ├── Header.js
    │   │   ├── LoginForm.js
    │   │   ├── RegisterForm.js
    │   │   ├── ProtectedRoute.js
    │   │   └── ...
    │   ├── contexts/
    │   │   └── AuthContext.js
    │   ├── pages/
    │   │   ├── Home.js
    │   │   ├── Dashboard.js
    │   │   ├── ChallengesPage.js
    │   │   ├── LeaderboardPage.js
    │   │   ├── ProfilePage.js
    │   │   └── ...
    │   ├── api.js            # API service
    │   ├── App.js
    │   ├── App.css
    │   └── index.js
    ├── .env
    ├── package.json
    └── tailwind.config.js
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Challenges
- `GET /api/challenges` - Get all challenges
- `GET /api/challenges/:id` - Get single challenge
- `POST /api/challenges` - Create challenge (Company only)
- `PUT /api/challenges/:id` - Update challenge
- `DELETE /api/challenges/:id` - Delete challenge
- `GET /api/challenges/:id/submissions` - Get challenge submissions

### Submissions
- `POST /api/submissions` - Submit solution
- `GET /api/submissions` - Get user submissions
- `GET /api/submissions/:id` - Get single submission
- `PUT /api/submissions/:id/review` - Review submission (Company only)

### Leaderboard
- `GET /api/leaderboard` - Get leaderboard
- `GET /api/leaderboard/rank/:userId` - Get user rank

### Dashboard
- `GET /api/dashboard/student-stats` - Student statistics
- `GET /api/dashboard/company-stats` - Company statistics

### Public Routes
- `GET /api/public/leaderboard` - Public leaderboard
- `GET /api/public/stats` - Public statistics

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🐛 Troubleshooting

### CORS Issues
If you encounter CORS errors, ensure:
1. The `.env` file in frontend has the correct `REACT_APP_API_URL`
2. The backend `.env` has the correct `FRONTEND_URL`
3. Restart both servers after changing environment variables

### Port Already in Use
If port 3000 or 5000 is already in use:
- For frontend: The dev server will automatically prompt to use another port
- For backend: Change `PORT` in backend `.env` file

### MongoDB Connection Issues
- Ensure MongoDB is running (if using local installation)
- Check your `MONGODB_URI` in the backend `.env` file
- Verify network access if using MongoDB Atlas

### Express Version Error
If you see `path-to-regexp` errors:
```bash
cd backend
npm install express@4
```

## 📝 Environment Variables

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/linkup
JWT_SECRET=your_secret_key
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 🚢 Deployment

### Backend (Render.com example)
1. Push your code to GitHub
2. Create a new Web Service on Render
3. Connect your repository
4. Set environment variables in Render dashboard
5. Deploy!

### Frontend (Vercel example)
1. Push your code to GitHub
2. Import project on Vercel
3. Set `REACT_APP_API_URL` environment variable
4. Deploy!

## 👨‍💻 Author

**Muhammad Navas**
- GitHub: [@muhammadnavas](https://github.com/muhammadnavas)

## 📧 Contact

For any queries or suggestions, please reach out:
- Create an issue in the repository
- Contact the maintainer

---
