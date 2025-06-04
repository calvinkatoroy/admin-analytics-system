# 📊 Admin Analytics System

> **A modern, real-time admin dashboard with comprehensive analytics, user management, and data visualization capabilities.**

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-admin--analytics--system.vercel.app-blue?style=for-the-badge)](https://admin-analytics-system.vercel.app/dashboard)
[![GitHub](https://img.shields.io/badge/📂_GitHub-calvinkatoroy%2Fadmin--analytics--system-black?style=for-the-badge&logo=github)](https://github.com/calvinkatoroy/admin-analytics-system)

## 🚀 **Live Demo**

🔗 **Access the live application**: [https://admin-analytics-system.vercel.app/dashboard](https://admin-analytics-system.vercel.app/dashboard)

### Demo Credentials
- **Email**: `admin@example.com`
- **Password**: `admin123`

---

## ✨ **Features**

### 📈 **Real-Time Analytics**
- **Live user tracking** with Socket.io integration
- **Interactive charts** using Recharts library
- **Product view analytics** and performance metrics
- **Revenue tracking** with detailed breakdowns
- **User activity monitoring** and behavior insights

### 👥 **User Management**
- **Role-based access control** (Admin, Moderator, User)
- **User authentication** with JWT tokens
- **Profile management** and user data visualization
- **Activity logging** and audit trails

### 📊 **Data Visualization**
- **Dynamic dashboard** with responsive design
- **Area charts** for user registration trends
- **Bar charts** for product performance
- **Pie charts** for category breakdowns
- **Statistical cards** with trend indicators

### 🔧 **Administrative Tools**
- **User management interface** with search and filtering
- **Data export** functionality (CSV/JSON)
- **Health monitoring** and system status
- **MongoDB integration** with optimized queries

---

## 🛠️ **Tech Stack**

### **Frontend**
- **React 18** - Modern UI library with hooks
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Composable charting library
- **React Router** - Client-side routing
- **Socket.io Client** - Real-time communication
- **Axios** - HTTP client for API requests
- **React Hot Toast** - Beautiful notifications

### **Backend**
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **Redis** - In-memory caching and session storage
- **Socket.io** - Real-time bidirectional communication
- **JWT** - JSON Web Token authentication
- **Bcrypt** - Password hashing
- **Joi** - Data validation

### **Infrastructure & Deployment**
- **Vercel** - Frontend hosting and deployment
- **Railway** - Backend hosting and deployment
- **MongoDB Atlas** - Cloud database service
- **GitHub Actions** - CI/CD pipeline
- **Docker** - Containerization support

---

## 📸 **Screenshots**

### Dashboard Overview
*Real-time analytics dashboard with interactive charts and live user tracking*

### User Management
*Comprehensive user administration with role-based access control*

### Data Visualization
*Rich charts and statistics for business intelligence*

---

## 🚀 **Getting Started**

### **Prerequisites**
- **Node.js** (v16 or higher)
- **MongoDB** (local installation or MongoDB Atlas)
- **Redis** (local installation or Redis Cloud)
- **Git**

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/calvinkatoroy/admin-analytics-system.git
   cd admin-analytics-system
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   
   # Create environment file
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   
   # Create environment file
   echo "VITE_API_URL=http://localhost:5000/api" > .env
   ```

4. **Database Setup**
   ```bash
   cd ../backend
   npm run seed  # Populate database with sample data
   ```

5. **Start Development Servers**
   ```bash
   # Terminal 1 - Backend
   cd backend && npm run dev
   
   # Terminal 2 - Frontend
   cd frontend && npm run dev
   ```

6. **Access the Application**
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:5000/api
   - **Login**: admin@example.com / admin123

---

## ⚙️ **Environment Variables**

### **Backend (.env)**
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your_mongodb_connection_string
REDIS_URL=your_redis_connection_string
JWT_SECRET=your_super_secret_jwt_key
FRONTEND_URL=http://localhost:3000
```

### **Frontend (.env)**
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🐳 **Docker Deployment**

### **Using Docker Compose**
```bash
# Clone and navigate to project
git clone https://github.com/calvinkatoroy/admin-analytics-system.git
cd admin-analytics-system

# Create production environment file
cp .env.example .env
# Edit .env with your production credentials

# Build and start all services
docker-compose up --build -d

# Access the application
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
```

### **Individual Container Deployment**
```bash
# Build backend
cd backend
docker build -t admin-analytics-backend .

# Build frontend
cd ../frontend
docker build -t admin-analytics-frontend .

# Run containers
docker run -d -p 5000:5000 admin-analytics-backend
docker run -d -p 3000:80 admin-analytics-frontend
```

---

## 📂 **Project Structure**

```
admin-analytics-system/
├── backend/                 # Node.js API server
│   ├── controllers/         # Request handlers
│   ├── middleware/          # Auth & validation
│   ├── models/              # Database schemas
│   ├── routes/              # API endpoints
│   ├── services/            # Database & Redis
│   ├── scripts/             # Seed data & utilities
│   └── server.js            # Main server file
├── frontend/                # React application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API client
│   │   └── utils/           # Helper functions
│   └── public/              # Static assets
├── docker-compose.yml       # Multi-container setup
└── README.md               # Project documentation
```

---

## 🔌 **API Endpoints**

### **Authentication**
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/register` - User registration

### **Analytics**
- `GET /api/analytics/dashboard` - Dashboard statistics
- `GET /api/analytics/products` - Product analytics
- `GET /api/analytics/users` - User analytics
- `GET /api/analytics/revenue` - Revenue analytics

### **User Management**
- `GET /api/users` - Get all users (paginated)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `PATCH /api/users/:id/ban` - Ban/unban user

### **System**
- `GET /api/health` - Health check
- `GET /api/metrics` - System metrics

---

## 🔄 **Real-Time Features**

### **Socket.io Events**
- **`live_stats`** - Real-time user count and activity updates
- **`user_activity`** - Live user activity notifications
- **`system_alerts`** - System status and alerts

### **Implementation Example**
```javascript
// Client-side connection
const socket = io('wss://your-backend-url');

socket.on('live_stats', (data) => {
  updateDashboard(data);
});
```

---

## 🧪 **Testing**

### **Backend Tests**
```bash
cd backend
npm test                    # Run test suite
npm run test:watch         # Watch mode
npm run test:coverage      # Coverage report
```

### **Frontend Tests**
```bash
cd frontend
npm test                   # Run test suite
npm run test:e2e          # End-to-end tests
```

### **API Testing**
```bash
# Health check
curl https://your-backend-url/api/health

# Login test
curl -X POST https://your-backend-url/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

---

## 📈 **Performance Features**

- **MongoDB indexing** for optimized queries
- **Redis caching** for frequently accessed data
- **React component optimization** with useMemo and useCallback
- **Lazy loading** for improved initial load times
- **Image optimization** and compression
- **Code splitting** for smaller bundle sizes

---

## 🔐 **Security Features**

- **JWT authentication** with secure token handling
- **Password hashing** using bcrypt
- **Rate limiting** to prevent abuse
- **Input validation** with Joi schemas
- **CORS configuration** for secure cross-origin requests
- **MongoDB injection prevention**
- **XSS protection** with security headers

---

## 🌐 **Deployment**

### **Production URLs**
- **Frontend**: [https://admin-analytics-system.vercel.app](https://admin-analytics-system.vercel.app/dashboard)
- **Backend**: Deployed on Railway
- **Database**: MongoDB Atlas
- **Cache**: Redis Cloud

### **Deployment Commands**
```bash
# Frontend (Vercel)
npm run build
vercel --prod

# Backend (Railway)
git push origin main  # Auto-deploys

# Docker (Any platform)
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🤝 **Contributing**

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### **Development Guidelines**
- Follow **ESLint** configuration
- Write **tests** for new features
- Update **documentation** as needed
- Use **conventional commits**

---

## 📄 **License**

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 **Author**

**Calvin Katoroy**
- GitHub: [@calvinkatoroy](https://github.com/calvinkatoroy)
- Project: [Admin Analytics System](https://github.com/calvinkatoroy/admin-analytics-system)

---

## 🙏 **Acknowledgments**

- **React** team for the amazing framework
- **Vercel** for seamless frontend deployment
- **Railway** for reliable backend hosting
- **MongoDB** for robust database solutions
- **Socket.io** for real-time capabilities

---

## 📞 **Support**

If you encounter any issues or have questions:
1. **Check the Issues** section on GitHub
2. **Create a new issue** with detailed information
3. **Review the documentation** for common solutions

---

## 🔄 **Changelog**

### Version 1.0.0 (Current)
- ✅ Initial release with full functionality
- ✅ Real-time dashboard implementation
- ✅ User management system
- ✅ Production deployment
- ✅ Docker containerization
- ✅ Comprehensive documentation

---

**⭐ If you found this project helpful, please give it a star on GitHub!**
