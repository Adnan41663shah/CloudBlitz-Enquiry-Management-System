# CloudBlitz Enquiry Management System

A full-stack enquiry management system built with Node.js, Express, TypeScript, MongoDB, React, and TailwindCSS.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access (admin, staff, user)
- **Enquiry Management**: CRUD operations with filtering, search, and pagination
- **User Management**: Admin can manage users and their roles
- **Soft Delete**: Enquiries are soft-deleted for data integrity
- **Responsive Design**: Modern UI with TailwindCSS
- **Docker Support**: Full containerization with docker-compose
- **Testing**: Comprehensive test suite with Jest + Supertest
- **Type Safety**: Full TypeScript implementation

## 🏗️ Architecture

### Backend
- **Framework**: Node.js + Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT tokens
- **Validation**: Zod schemas
- **Testing**: Jest + Supertest

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **State Management**: React Query + Context API
- **Routing**: React Router v6

## 📁 Project Structure

```
cloudblitz-enquiry/
├── backend/
│   ├── src/
│   │   ├── controllers/     # API controllers
│   │   ├── models/          # Mongoose models
│   │   ├── routes/          # Express routes
│   │   ├── middlewares/     # Custom middlewares
│   │   ├── utils/           # Utility functions
│   │   └── __tests__/       # Test files
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context
│   │   ├── lib/            # API client
│   │   └── routes/         # Route components
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml
└── README.md
```

## 🛠️ Setup & Installation

### Prerequisites
- Node.js 18+
- MongoDB 6+
- Docker & Docker Compose (optional)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cloudblitz-enquiry
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env  # Configure environment variables
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Database Setup**
   - Ensure MongoDB is running on `mongodb://localhost:27017`
   - The application will create the database automatically

### Docker Development

1. **Start all services**
   ```bash
   docker-compose up -d
   ```

2. **View logs**
   ```bash
   docker-compose logs -f
   ```

3. **Stop services**
   ```bash
   docker-compose down
   ```

## 🔧 Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/cloudblitz-enquiry
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Enquiry Endpoints
- `POST /api/enquiries` - Create enquiry (public)
- `GET /api/enquiries` - List enquiries (authenticated)
- `GET /api/enquiries/:id` - Get enquiry by ID (authenticated)
- `PUT /api/enquiries/:id` - Update enquiry (staff/admin)
- `DELETE /api/enquiries/:id` - Delete enquiry (staff/admin)

### User Endpoints (Admin only)
- `GET /api/users` - List users
- `PUT /api/users/:id/role` - Update user role
- `DELETE /api/users/:id` - Delete user

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

## 🚀 Deployment

### Production Build
```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
# Serve with nginx or similar
```

### Docker Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 👥 User Roles

- **Admin**: Full system access, user management
- **Staff**: Enquiry management, cannot manage users
- **User**: Can create enquiries, view own data

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation with Zod
- CORS configuration
- Environment variable protection

## 📱 Features Overview

### Dashboard
- Statistics overview
- Recent enquiries
- Quick actions

### Enquiry Management
- Create new enquiries
- Filter by status
- Search functionality
- Pagination
- Status updates
- Assignment to staff

### User Management (Admin)
- View all users
- Update user roles
- Delete users
- Pagination

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please open an issue in the repository or contact the development team.

---

**Built with ❤️ using modern web technologies**
