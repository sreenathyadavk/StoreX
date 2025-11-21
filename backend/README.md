# Cloud File Storage - Backend

A secure, scalable file storage REST API built with Spring Boot, MongoDB, and JWT authentication.

## 🚀 Features

- **JWT Authentication** - Secure token-based auth with refresh tokens
- **File Management** - Upload, download, view, and delete files
- **User-Specific Storage** - Each user has isolated file storage
- **Security** - Path traversal protection, file ownership verification, input validation
- **MongoDB Integration** - File metadata storage
- **Global Error Handling** - Consistent JSON error responses
- **CORS Configuration** - Restricted to frontend origin

## 📋 Prerequisites

- **Java 17** or higher
- **Maven 3.6+**
- **MongoDB 4.4+** (running on `localhost:27017`)

## 🛠️ Tech Stack

- **Spring Boot 3.1.5**
- **Spring Security** - Authentication & authorization
- **Spring Data MongoDB** - Database operations
- **JJWT 0.11.5** - JWT token generation & validation
- **BCrypt** - Password hashing

## ⚙️ Configuration

### application.properties

```properties
# MongoDB
spring.data.mongodb.uri=mongodb://localhost:27017/filestorage
spring.data.mongodb.auto-index-creation=true

# File Storage
file.upload-dir=uploads

# Server
server.port=8080

# File Upload Limits
spring.servlet.multipart.max-file-size=3GB
spring.servlet.multipart.max-request-size=3GB

# JWT Configuration
jwt.secret=YOUR_SECRET_KEY_HERE_MIN_256_BITS
jwt.access-token-expiration=900000        # 15 minutes
jwt.refresh-token-expiration=2592000000   # 30 days

# Logging
logging.level.org.springframework.security=DEBUG
```

> **⚠️ IMPORTANT**: Change `jwt.secret` to a strong, random value in production!

## 🚀 Running the Application

### 1. Start MongoDB
```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or use local MongoDB installation
mongod
```

### 2. Build & Run
```bash
# Build the project
./mvnw clean install

# Run the application
./mvnw spring-boot:run
```

The API will be available at `http://localhost:8080`

## 📚 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register new user | No |
| POST | `/login` | Login & get tokens | No |
| POST | `/refresh` | Refresh access token | No (uses refresh token cookie) |
| POST | `/logout` | Logout & invalidate tokens | Yes |
| POST | `/change-password` | Change user password | Yes |
| DELETE | `/delete-account` | Delete user account | Yes |

### File Operations

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/files` | List user's files | Yes |
| GET | `/usage` | Get storage usage | Yes |
| POST | `/upload` | Upload a file | Yes |
| GET | `/download/{id}` | Download a file | Yes |
| GET | `/view/{id}` | View/stream a file | Yes |
| DELETE | `/delete/{id}` | Delete a file | Yes |

## 🔐 Authentication Flow

### 1. Register/Login
```bash
# Register
curl -X POST http://localhost:8080/register \
  -H "Content-Type: application/json" \
  -d '{"username":"john","password":"secret123"}'

# Login
curl -X POST http://localhost:8080/login \
  -H "Content-Type: application/json" \
  -d '{"username":"john","password":"secret123"}' \
  -c cookies.txt
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "username": "john",
  "message": "Login successful"
}
```

The refresh token is automatically set as an httpOnly cookie.

### 2. Make Authenticated Requests
```bash
curl -X GET http://localhost:8080/files \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -b cookies.txt
```

### 3. Refresh Token
```bash
curl -X POST http://localhost:8080/refresh \
  -b cookies.txt
```

## 📁 Project Structure

```
src/main/java/com/example/filestorage/
├── controller/
│   ├── AuthController.java      # Authentication endpoints
│   └── FileController.java      # File management endpoints
├── model/
│   ├── User.java                # User entity
│   ├── FileMetadata.java        # File metadata entity
│   └── RefreshToken.java        # Refresh token entity
├── repository/
│   ├── UserRepository.java
│   ├── FileMetadataRepository.java
│   └── RefreshTokenRepository.java
├── security/
│   ├── SecurityConfig.java      # Spring Security configuration
│   ├── JwtUtil.java             # JWT utility methods
│   ├── JwtAuthenticationFilter.java  # JWT filter
│   └── CustomUserDetailsService.java
├── service/
│   ├── FileStorageService.java  # File operations
│   ├── FileSecurityService.java # File ownership checks
│   └── RefreshTokenService.java # Token management
└── exception/
    └── GlobalExceptionHandler.java  # Global error handling
```

## 🔒 Security Features

### 1. **JWT Authentication**
- Access tokens expire in 15 minutes
- Refresh tokens expire in 30 days
- Tokens signed with HS256 algorithm

### 2. **Password Security**
- BCrypt hashing with salt
- Minimum 6 characters required
- Validation on registration and password change

### 3. **File Security**
- Path traversal protection
- File ownership verification
- User-specific storage directories
- Empty file prevention

### 4. **Input Validation**
- Username: 3-50 characters
- Password: minimum 6 characters
- Filename: no path traversal characters

### 5. **CORS**
- Restricted to frontend origin only
- Credentials allowed for cookie-based refresh tokens

## 🗄️ Database Schema

### Users Collection
```json
{
  "_id": "ObjectId",
  "username": "string",
  "password": "string (bcrypt hash)",
  "roles": ["USER"]
}
```

### File Metadata Collection
```json
{
  "_id": "ObjectId",
  "filename": "string",
  "contentType": "string",
  "size": "number",
  "uploadDate": "date",
  "ownerId": "string"
}
```

### Refresh Tokens Collection
```json
{
  "_id": "ObjectId",
  "token": "string (JWT)",
  "username": "string",
  "expiryDate": "instant",
  "createdDate": "instant"
}
```

## 🐛 Error Handling

All errors return consistent JSON responses:

```json
{
  "message": "Error description"
}
```

### Common HTTP Status Codes
- `200` - Success
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/expired token)
- `403` - Forbidden (not file owner)
- `404` - Not Found
- `500` - Internal Server Error

## 📦 File Storage

Files are stored in the filesystem at:
```
uploads/
└── user_{userId}/
    ├── file1.pdf
    ├── image.jpg
    └── document.txt
```

## 🧪 Testing

```bash
# Run tests
./mvnw test

# Run with coverage
./mvnw clean test jacoco:report
```

## 🚀 Production Deployment

### 1. Update Configuration
- Set strong `jwt.secret` (min 256 bits)
- Configure production MongoDB URI
- Set appropriate file size limits
- Disable debug logging

### 2. Build Production JAR
```bash
./mvnw clean package -DskipTests
```

### 3. Run
```bash
java -jar target/filestorage-0.0.1-SNAPSHOT.jar
```

## 📝 Environment Variables

You can override properties using environment variables:

```bash
export SPRING_DATA_MONGODB_URI=mongodb://prod-server:27017/filestorage
export JWT_SECRET=your-production-secret-key
export SERVER_PORT=8080
```

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 👨‍💻 Author

**Sreenath**
