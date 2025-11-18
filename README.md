# 🚀 LinkUp - Coding Challenge Platform

**LinkUp** is a comprehensive platform that connects talented students with innovative companies through coding challenges. Students can showcase their programming skills and earn recognition, while companies can discover and recruit top talent through structured technical assessments.

## ✨ Features Overview

### 👨‍🎓 For Students
- 🔍 **Browse Challenges** - Explore coding challenges from top companies across various difficulty levels
- 💻 **Submit Solutions** - Submit code solutions via GitHub repositories with automated tracking
- 🏆 **Earn Points & Recognition** - Get scored by company reviewers and earn points for achievements
- 📊 **Performance Analytics** - Monitor your progress with detailed statistics and performance metrics
- 🥇 **Competitive Leaderboard** - Compete with peers globally and climb the rankings
- 👤 **Professional Profile** - Showcase your skills, achievements, and coding portfolio
- 📱 **Social Sharing** - Share challenges and achievements on social media platforms
- 🎯 **Challenge Filtering** - Filter challenges by difficulty, company, or technology stack

### 🏢 For Companies
- ➕ **Create Custom Challenges** - Design coding challenges tailored to your hiring needs
- 👀 **Review & Score Submissions** - Evaluate student solutions with detailed feedback system
- 📈 **Advanced Analytics Dashboard** - Track challenge performance, engagement metrics, and candidate quality
- 🔍 **Talent Discovery** - Find and filter skilled developers based on performance and skills
- 📝 **Challenge Management** - Edit, update, or deactivate challenges with version control
- 📊 **Submission Analytics** - View submission statistics and candidate funnel metrics
- 🎯 **Targeted Recruitment** - Identify top performers for direct recruitment opportunities

### 🌐 Public Features
- 🔗 **Public Challenge Sharing** - Anyone can view challenge details via shareable links
- 📊 **Public Leaderboards** - View top performers without registration
- 📈 **Platform Statistics** - Access platform-wide metrics and activity data
- 💡 **No-Registration Preview** - Explore challenges before creating an account

## 🛠️ Technology Stack

### Frontend Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.1.1 | Modern UI library for building interactive interfaces |
| **React Router DOM** | 7.8.2 | Client-side routing and navigation |
| **Tailwind CSS** | 3.4.18 | Utility-first CSS framework for rapid styling |
| **Framer Motion** | 12.23.12 | Advanced animations and micro-interactions |
| **Axios** | 1.11.0 | HTTP client for API communication |
| **Lucide React** | 0.542.0 | Beautiful and consistent icon library |
| **Heroicons** | 2.2.0 | Additional icon set for UI elements |

### Backend Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | Latest LTS | JavaScript runtime environment |
| **Express.js** | 4.21.2 | Fast and minimal web application framework |
| **MongoDB** | Latest | NoSQL database for flexible data storage |
| **Mongoose** | 8.18.0 | MongoDB ODM for data modeling |
| **JWT** | 9.0.2 | Secure authentication and authorization |
| **bcryptjs** | 3.0.2 | Password hashing and security |
| **Express Rate Limit** | 8.0.1 | API rate limiting and DDoS protection |
| **Express Validator** | 7.2.1 | Input validation and sanitization |
| **Helmet** | 8.1.0 | Security middleware for Express |
| **Nodemailer** | 7.0.5 | Email service integration |
| **UUID** | 11.1.0 | Unique identifier generation |

### Development & Testing
| Technology | Purpose |
|------------|---------|
| **Jest** | Unit and integration testing |
| **React Testing Library** | React component testing |
| **ESLint** | Code linting and quality enforcement |
| **PostCSS** | CSS processing and optimization |

## 📋 Prerequisites

Before setting up LinkUp, ensure you have:

- **Node.js** (v18.0.0 or higher) - [Download here](https://nodejs.org/)
- **npm** (v8.0.0 or higher) or **yarn** (v1.22.0 or higher)
- **MongoDB** (v5.0 or higher) - Local installation or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account
- **Git** (v2.0 or higher) - [Download here](https://git-scm.com/)
- **GitHub Account** - For repository hosting and collaboration

## 🚀 Quick Start Guide

### 1. Repository Setup

```bash
# Clone the repository
git clone https://github.com/muhammadnavas/UpLink.git
cd LinkUp

# Verify Node.js installation
node --version
npm --version
```

### 2. Backend Configuration

```bash
# Navigate to backend directory
cd backend

# Install all dependencies
npm install

# Create environment file
touch .env
```

**Configure your `.env` file:**

```env
# ==============================================
# SERVER CONFIGURATION
# ==============================================
PORT=5000
NODE_ENV=development

# ==============================================
# DATABASE CONFIGURATION
# ==============================================
# Local MongoDB
MONGODB_URI=mongodb://localhost:27017/linkup

# Or MongoDB Atlas (recommended for production)
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/linkup?retryWrites=true&w=majority

# ==============================================
# AUTHENTICATION & SECURITY
# ==============================================
JWT_SECRET=your_super_secure_jwt_secret_key_here_make_it_long_and_random
JWT_EXPIRE=30d

# ==============================================
# CORS CONFIGURATION
# ==============================================
FRONTEND_URL=http://localhost:3000

# ==============================================
# EMAIL CONFIGURATION (Optional)
# ==============================================
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password

# ==============================================
# RATE LIMITING
# ==============================================
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Start the backend server:**

```bash
# Development mode with hot reload
npm run dev

# Or production mode
npm start
```

**Backend will be available at:** `http://localhost:5000`

### 3. Frontend Configuration

```bash
# Navigate to frontend directory (from project root)
cd ../frontend

# Install all dependencies
npm install

# Create environment file
touch .env
```

**Configure your `.env` file:**

```env
# ==============================================
# API CONFIGURATION
# ==============================================
REACT_APP_API_URL=http://localhost:5000/api

# ==============================================
# APPLICATION CONFIGURATION
# ==============================================
REACT_APP_APP_NAME=LinkUp
REACT_APP_VERSION=1.0.0

# ==============================================
# FEATURE FLAGS (Optional)
# ==============================================
REACT_APP_ENABLE_ANALYTICS=false
REACT_APP_ENABLE_CHAT=false
```

**Start the frontend development server:**

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

**Frontend will be available at:** `http://localhost:3000`

## 📁 Detailed Project Architecture

```
LinkUp/
├── 📂 backend/                     # Node.js/Express Backend
│   ├── 📂 config/
│   │   └── 📄 db.js               # MongoDB connection configuration
│   ├── 📂 controllers/
│   │   ├── 📄 authController.js   # Authentication business logic
│   │   ├── 📄 leaderboardController.js # Leaderboard calculations
│   │   └── 📄 submissions.js      # Submission handling logic
│   ├── 📂 middleware/
│   │   └── 📄 authMiddleware.js   # JWT verification & authorization
│   ├── 📂 models/
│   │   ├── 📄 Activity.js         # User activity tracking schema
│   │   ├── 📄 Challenge.js        # Challenge data model
│   │   ├── 📄 Submission.js       # Solution submission schema
│   │   └── 📄 User.js             # User profile and authentication
│   ├── 📂 routes/
│   │   ├── 📄 admin.js            # Admin panel endpoints
│   │   ├── 📄 auth.js             # Authentication routes
│   │   ├── 📄 challenges.js       # Challenge CRUD operations
│   │   ├── 📄 dashboard.js        # Dashboard data endpoints
│   │   ├── 📄 leaderboard.js      # Ranking and statistics
│   │   ├── 📄 public.js           # Public API endpoints
│   │   └── 📄 submissions.js      # Submission management
│   ├── 📂 scripts/
│   │   ├── 📄 addLeaderboardFields.js
│   │   ├── 📄 addUsernameField.js
│   │   ├── 📄 cleanupCompanyPoints.js
│   │   └── 📄 initializeLeaderboardFields.js
│   ├── 📂 utils/
│   │   ├── 📄 database.js         # Database utilities and helpers
│   │   ├── 📄 emailService.js     # Email notification service
│   │   ├── 📄 statsUpdater.js     # Statistics calculation utilities
│   │   └── 📄 validators.js       # Input validation schemas
│   ├── 📄 .env                    # Environment variables
│   ├── 📄 .gitignore             # Git ignore rules
│   ├── 📄 package.json           # Dependencies and scripts
│   └── 📄 server.js              # Application entry point
│
├── 📂 frontend/                   # React Frontend Application
│   ├── 📂 public/
│   │   ├── 📄 index.html         # HTML template
│   │   ├── 📄 manifest.json      # PWA configuration
│   │   └── 📄 robots.txt         # SEO crawler instructions
│   ├── 📂 src/
│   │   ├── 📂 components/
│   │   │   ├── 📄 AppRoutes.js   # Application routing logic
│   │   │   ├── 📄 CompanyRoom.js # Company dashboard components
│   │   │   ├── 📄 Header.js      # Navigation header component
│   │   │   ├── 📄 LoadingSpinner.js # Loading UI component
│   │   │   ├── 📄 LoginForm.js   # User authentication form
│   │   │   ├── 📄 ProtectedRoute.js # Route protection wrapper
│   │   │   ├── 📄 RegisterForm.js # User registration form
│   │   │   ├── 📄 RoleSwitcher.js # Role selection component
│   │   │   └── 📄 StudentRoom.js # Student dashboard components
│   │   ├── 📂 contexts/
│   │   │   └── 📄 AuthContext.js # Global authentication state
│   │   ├── 📂 pages/
│   │   │   ├── 📄 ChallengePage.js # Individual challenge view
│   │   │   ├── 📄 ChallengesManagePage.js # Company challenge management
│   │   │   ├── 📄 ChallengesPage.js # Challenge browsing interface
│   │   │   ├── 📄 CompanyDashboard.js # Company analytics dashboard
│   │   │   ├── 📄 CompanySubmissionsPage.js # Submission review interface
│   │   │   ├── 📄 CreateChallengePage.js # Challenge creation form
│   │   │   ├── 📄 Dashboard.js    # Main dashboard router
│   │   │   ├── 📄 EditChallengePage.js # Challenge editing interface
│   │   │   ├── 📄 Home.js         # Landing page
│   │   │   ├── 📄 LeaderboardPage.js # Global rankings display
│   │   │   ├── 📄 ProfilePage.js  # User profile management
│   │   │   ├── 📄 PublicChallengePage.js # Public challenge view
│   │   │   ├── 📄 StudentDashboard.js # Student analytics dashboard
│   │   │   ├── 📄 SubmissionsPage.js # User submissions history
│   │   │   ├── 📄 SubmissionsReviewPage.js # Submission evaluation
│   │   │   └── 📄 UserProfilePage.js # Public user profiles
│   │   ├── 📄 api.js              # API service layer
│   │   ├── 📄 App.css             # Global styles
│   │   ├── 📄 App.js              # Root application component
│   │   ├── 📄 App.test.js         # Application tests
│   │   ├── 📄 index.css           # Global CSS imports
│   │   ├── 📄 index.js            # React application entry point
│   │   ├── 📄 input.css           # Tailwind CSS input file
│   │   ├── 📄 reportWebVitals.js  # Performance monitoring
│   │   └── 📄 setupTests.js       # Test configuration
│   ├── 📄 .env                    # Environment variables
│   ├── 📄 .gitignore             # Git ignore rules
│   ├── 📄 package.json           # Dependencies and scripts
│   ├── 📄 postcss.config.js      # PostCSS configuration
│   └── 📄 tailwind.config.js     # Tailwind CSS configuration
│
├── 📄 .gitignore                  # Root Git ignore file
└── 📄 README.md                   # Project documentation
```

## 🔗 API Documentation

### Authentication Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/auth/register` | Register new user account | ❌ |
| `POST` | `/api/auth/login` | Authenticate user credentials | ❌ |
| `GET` | `/api/auth/me` | Get current user profile | ✅ |
| `PUT` | `/api/auth/profile` | Update user profile information | ✅ |
| `POST` | `/api/auth/logout` | Invalidate user session | ✅ |

### Challenge Management
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/challenges` | Retrieve all active challenges | ✅ |
| `GET` | `/api/challenges/:id` | Get detailed challenge information | ✅ |
| `POST` | `/api/challenges` | Create new challenge (Company only) | ✅ |
| `PUT` | `/api/challenges/:id` | Update challenge details | ✅ |
| `DELETE` | `/api/challenges/:id` | Deactivate challenge | ✅ |
| `GET` | `/api/challenges/:id/submissions` | Get challenge submissions | ✅ |

### Submission System
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/submissions` | Submit solution to challenge | ✅ |
| `GET` | `/api/submissions` | Get user's submission history | ✅ |
| `GET` | `/api/submissions/:id` | Get specific submission details | ✅ |
| `PUT` | `/api/submissions/:id/review` | Review and score submission | ✅ |

### Leaderboard & Analytics
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/leaderboard` | Get global user rankings | ✅ |
| `GET` | `/api/leaderboard/rank/:userId` | Get specific user rank | ✅ |
| `GET` | `/api/dashboard/student-stats` | Student performance metrics | ✅ |
| `GET` | `/api/dashboard/company-stats` | Company analytics dashboard | ✅ |

### Public Access APIs
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/public/leaderboard` | Public leaderboard view | ❌ |
| `GET` | `/api/public/stats` | Platform statistics | ❌ |
| `GET` | `/api/public/challenge/:id` | Public challenge details | ❌ |

## 🧪 Testing Strategy

### Backend Testing
```bash
cd backend

# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- --grep "auth"
```

### Frontend Testing
```bash
cd frontend

# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage report
npm test -- --coverage --watchAll=false
```

### End-to-End Testing
```bash
# Install Cypress (optional)
npm install -g cypress

# Run E2E tests
npx cypress open
```

## 🔧 Development Guidelines

### Code Style & Standards
- **ESLint** configuration for consistent code style
- **Prettier** for automatic code formatting
- **Conventional Commits** for git commit messages
- **Component-based architecture** for React development
- **RESTful API design** principles for backend

### Git Workflow
```bash
# Feature development
git checkout -b feature/new-feature-name
git commit -m "feat: add new feature description"
git push origin feature/new-feature-name

# Bug fixes
git checkout -b fix/bug-description
git commit -m "fix: resolve issue with specific component"
git push origin fix/bug-description
```

## 🚀 Deployment Guide

### Backend Deployment (Render.com)

1. **Prepare for Deployment:**
```bash
# Ensure all dependencies are listed in package.json
npm install --production
```

2. **Environment Setup:**
   - Create account on [Render.com](https://render.com)
   - Connect your GitHub repository
   - Set environment variables in Render dashboard

3. **Deploy:**
   - Select "Web Service"
   - Choose your repository
   - Set build command: `npm install`
   - Set start command: `npm start`

### Frontend Deployment (Vercel)

1. **Prepare for Deployment:**
```bash
# Build the application
npm run build

# Test the build locally
npx serve -s build
```

2. **Deploy to Vercel:**
   - Create account on [Vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Set environment variables
   - Deploy automatically on push to main branch

### Database Setup (MongoDB Atlas)

1. **Create MongoDB Atlas Cluster:**
   - Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a new cluster
   - Set up database user and network access
   - Get connection string

2. **Update Environment Variables:**
```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/linkup
```

## 📊 Performance Optimization

### Frontend Optimizations
- **Code Splitting** with React.lazy()
- **Image Optimization** with next-gen formats
- **Bundle Analysis** with webpack-bundle-analyzer
- **Caching Strategies** for API responses
- **Lazy Loading** for non-critical components

### Backend Optimizations
- **Database Indexing** for frequently queried fields
- **API Response Caching** with Redis
- **Rate Limiting** to prevent abuse
- **Compression** for response payloads
- **Connection Pooling** for database connections

## 🔐 Security Features

### Authentication & Authorization
- **JWT-based authentication** with secure token storage
- **Role-based access control** (Student/Company/Admin)
- **Password hashing** with bcrypt and salt rounds
- **Session management** with automatic token refresh

### API Security
- **Rate limiting** to prevent DDoS attacks
- **Input validation** and sanitization
- **CORS configuration** for cross-origin requests
- **Helmet.js** for security headers
- **MongoDB injection** prevention

### Data Protection
- **Environment variable** management
- **Sensitive data encryption** for database storage
- **Secure HTTP headers** implementation
- **API endpoint protection** with authentication middleware

## 🐛 Common Issues & Solutions

### Setup Issues

**Node.js Version Compatibility**
```bash
# Check Node.js version
node --version

# Use Node Version Manager (nvm)
nvm install 18
nvm use 18
```

**Port Already in Use**
```bash
# Kill process on port 3000
npx kill-port 3000

# Kill process on port 5000
npx kill-port 5000
```

**MongoDB Connection Issues**
```bash
# Check MongoDB service status (Windows)
net start MongoDB

# Check MongoDB service status (macOS/Linux)
brew services start mongodb-community
```

### Development Issues

**CORS Errors**
- Verify `REACT_APP_API_URL` in frontend `.env`
- Check `FRONTEND_URL` in backend `.env`
- Restart both development servers

**Authentication Problems**
- Clear browser localStorage and cookies
- Check JWT_SECRET configuration
- Verify token expiration settings

**Database Connection Timeout**
- Check MongoDB Atlas network access settings
- Verify connection string format
- Ensure database user permissions

### Production Issues

**Build Failures**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Performance Issues**
- Enable compression in Express
- Optimize database queries
- Implement caching strategies
- Use CDN for static assets

## 🤝 Contributing

We welcome contributions to LinkUp! Here's how you can help:

### Getting Started
1. **Fork the repository** on GitHub
2. **Clone your fork** locally
3. **Create a feature branch** from `main`
4. **Make your changes** following our coding standards
5. **Test your changes** thoroughly
6. **Submit a pull request** with a clear description

### Contribution Guidelines
- Follow the existing code style and conventions
- Write clear, concise commit messages
- Include tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

### Areas for Contribution
- 🐛 **Bug Fixes** - Help us identify and fix issues
- ✨ **New Features** - Propose and implement new functionality
- 📚 **Documentation** - Improve guides and API documentation
- 🎨 **UI/UX Improvements** - Enhance user interface and experience
- ⚡ **Performance** - Optimize application performance
- 🧪 **Testing** - Increase test coverage

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

Special thanks to:
- **React Team** for the amazing framework
- **MongoDB** for the flexible database solution
- **Tailwind CSS** for the utility-first CSS framework
- **Express.js** community for the robust backend framework
- **Open Source Community** for inspiration and contributions

## 👨‍💻 Author & Maintainer

**Muhammad Navas**
- 🌐 GitHub: [@muhammadnavas](https://github.com/muhammadnavas)
- 📧 Email: [Contact via GitHub](https://github.com/muhammadnavas)
- 💼 LinkedIn: [Connect with me](https://linkedin.com/in/muhammadnavas)

## 📞 Support & Contact

### Getting Help
- 📖 **Documentation**: Check this README and code comments
- 🐛 **Bug Reports**: [Create an issue](https://github.com/muhammadnavas/UpLink/issues/new?template=bug_report.md)
- 💡 **Feature Requests**: [Request a feature](https://github.com/muhammadnavas/UpLink/issues/new?template=feature_request.md)
- 💬 **Discussions**: [Join our discussions](https://github.com/muhammadnavas/UpLink/discussions)

### Community
- ⭐ **Star** this repository if you find it helpful
- 🍴 **Fork** the project to contribute
- 👥 **Follow** for updates and new projects

---

<div align="center">

**Made with ❤️ by [Muhammad Navas](https://github.com/muhammadnavas)**

*Bridging the gap between talent and opportunity through technology*

[![GitHub Stars](https://img.shields.io/github/stars/muhammadnavas/UpLink?style=social)](https://github.com/muhammadnavas/UpLink/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/muhammadnavas/UpLink?style=social)](https://github.com/muhammadnavas/UpLink/network/members)
[![GitHub Issues](https://img.shields.io/github/issues/muhammadnavas/UpLink)](https://github.com/muhammadnavas/UpLink/issues)
[![GitHub License](https://img.shields.io/github/license/muhammadnavas/UpLink)](https://github.com/muhammadnavas/UpLink/blob/main/LICENSE)

</div>
