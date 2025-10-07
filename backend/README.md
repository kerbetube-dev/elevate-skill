# Elevate Skil Backend API

A FastAPI-based backend for the Elevate Skil online learning platform with
PostgreSQL database integration.

## Features

- **User Authentication**: JWT-based authentication with registration and login
- **Course Management**: Browse courses, enroll, track progress
- **Payment Methods**: Manage CBE and Telebirr payment methods
- **Referral System**: Earn rewards for referring friends
- **Dashboard**: User statistics and progress tracking
- **RESTful API**: Clean, documented API endpoints
- **Database Integration**: PostgreSQL with SQLAlchemy async ORM

## Tech Stack

- **FastAPI**: Modern, fast web framework for building APIs
- **PostgreSQL**: Production-ready relational database
- **SQLAlchemy**: Async ORM for database operations
- **JWT**: JSON Web Tokens for authentication
- **Pydantic**: Data validation using Python type annotations
- **Passlib**: Password hashing and verification
- **Uvicorn**: ASGI server for running the application

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables** Create a `.env` file in the backend
   directory with the following variables:
   ```bash
   # Database Configuration
   DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your-supabase-anon-key
   ```

   **Important Notes:**
   - Use the direct database host (not pooler) for better compatibility
   - Ensure `sslmode=require` is present in the DATABASE_URL
   - Percent-encode special characters in passwords (e.g., `@` becomes `%40`)
   - Example:
     `postgresql://postgres:Pass%40123@db.abc123.supabase.co:5432/postgres?sslmode=require`

5. **Run the application**
   ```bash
   uvicorn app:app --host 0.0.0.0 --port 8000 --reload
   ```

   The server will start and show:
   ```
   ✅ Connected to PostgreSQL database (async)
   INFO:     Application startup complete.
   ```

## API Documentation

Once the server is running, you can access:

- **Interactive API docs**: http://localhost:8000/docs
- **ReDoc documentation**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

## API Endpoints

### Authentication

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user

### Courses

- `GET /courses/` - Get all courses
- `GET /courses/{course_id}` - Get specific course
- `POST /courses/{course_id}/enroll` - Enroll in a course
- `GET /courses/{course_id}/lessons` - Get course lessons (requires enrollment)

### User Management

- `GET /user/profile` - Get user profile
- `GET /user/payment-methods` - Get payment methods
- `POST /user/payment-methods` - Add payment method
- `DELETE /user/payment-methods/{method_id}` - Remove payment method
- `PUT /user/payment-methods/{method_id}/default` - Set default payment method
- `GET /user/enrollments` - Get user enrollments
- `PUT /user/enrollments/{enrollment_id}/progress` - Update course progress
- `GET /user/referrals` - Get referral information

### Dashboard

- `GET /dashboard/stats` - Get dashboard statistics
- `GET /dashboard/recent-activity` - Get recent user activity
- `GET /dashboard/progress-overview` - Get course progress overview

## Project Structure

```
backend/
├── app.py              # Main FastAPI application
├── main.py             # Alternative main file (legacy)
├── models.py           # Pydantic models
├── database.py         # Database operations (in-memory)
├── auth.py             # Authentication utilities
├── requirements.txt    # Python dependencies
├── .env.example        # Environment variables template
├── README.md          # This file
└── routes/
    ├── auth.py         # Authentication routes
    ├── courses.py      # Course-related routes
    ├── user.py         # User management routes
    └── dashboard.py    # Dashboard routes
```

## Database

The application uses PostgreSQL with SQLAlchemy async ORM for production-ready
database operations.

### Database Schema

The application expects the following tables in your PostgreSQL database:

- **users**: User accounts with authentication
- **courses**: Available courses with metadata
- **enrollments**: User course enrollments
- **payment_methods**: User payment information
- **referrals**: Referral tracking and rewards

### Database Connection

The application automatically:

- Connects to PostgreSQL using the `DATABASE_URL` environment variable
- Uses SSL connections for security (`sslmode=require`)
- Handles connection pooling through SQLAlchemy
- Converts UUID fields to strings for API responses

## Security Considerations

- Change the `SECRET_KEY` in production
- Use HTTPS in production
- Implement rate limiting
- Add input validation and sanitization
- Use environment variables for sensitive data
- Implement proper logging and monitoring

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Ensure `DATABASE_URL` is correctly formatted
   - Check that `sslmode=require` is present
   - Verify network connectivity to the database host
   - Percent-encode special characters in passwords

2. **"duplicate SASL authentication request" Error**
   - Use the direct database host (not pooler) in DATABASE_URL
   - Ensure you're using the correct connection string from Supabase

3. **"password cannot be longer than 72 bytes" Error**
   - This is fixed in the current version with SHA256 hashing
   - If you see this error, restart the server

4. **UUID Validation Errors**
   - The application automatically converts UUIDs to strings
   - If you see UUID errors, ensure you're using the latest code

### Testing the API

Test the main endpoints:

```bash
# Health check
curl http://localhost:8000/health

# Register a user
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName": "Test User", "email": "test@example.com", "password": "Pass123"}'

# Login
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "Pass123"}'

# Get courses
curl http://localhost:8000/courses/
```

## Future Enhancements

- [x] Real database integration (PostgreSQL)
- [ ] File upload for course materials
- [ ] Email notifications
- [ ] Payment gateway integration
- [ ] Advanced analytics
- [ ] Course content management
- [ ] Video streaming
- [ ] Real-time chat/messaging
- [ ] Mobile app API support
- [ ] Admin dashboard
- [ ] Automated testing
- [ ] Docker containerization
- [ ] CI/CD pipeline

## Development

### Running in Development Mode

```bash
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

### Testing the API

You can test the API using:

1. **FastAPI Interactive Docs**: http://localhost:8000/docs
2. **curl commands**:
   ```bash
   # Register a user
   curl -X POST "http://localhost:8000/auth/register" \
        -H "Content-Type: application/json" \
        -d '{"fullName": "John Doe", "email": "john@example.com", "password": "password123"}'

   # Login
   curl -X POST "http://localhost:8000/auth/login" \
        -H "Content-Type: application/json" \
        -d '{"email": "john@example.com", "password": "password123"}'

   # Get courses
   curl -X GET "http://localhost:8000/courses/"
   ```

3. **Postman or Insomnia**: Import the OpenAPI spec from
   http://localhost:8000/openapi.json

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
