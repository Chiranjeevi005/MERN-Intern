# Application Architecture

## System Diagram

```mermaid
graph TB
    A[Client Browser] --> B[React Frontend]
    B --> C[Express Backend API]
    C --> D[MongoDB Database]
    C --> E[Email Service]
    
    subgraph Frontend
        B
    end
    
    subgraph Backend
        C
    end
    
    subgraph Services
        D
        E
    end
```

## Component Interactions

### Authentication Flow
```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant D as Database
    participant E as Email Service

    U->>F: Visit signup page
    F->>B: POST /auth/signup
    B->>D: Save user (unverified)
    B->>E: Send verification email
    E-->>U: Verification email
    U->>F: Click verification link
    F->>B: GET /auth/verify-email/:token
    B->>D: Update user to verified
    U->>F: Visit login page
    F->>B: POST /auth/login
    B->>D: Validate credentials
    B-->>F: JWT token
    F-->>U: Redirect to dashboard
```

### Admin Student Management
```mermaid
sequenceDiagram
    participant A as Admin
    participant F as Frontend
    participant B as Backend
    participant D as Database

    A->>F: Visit admin dashboard
    F->>B: GET /students?page=1
    B->>D: Fetch students with pagination
    D-->>B: Student data
    B-->>F: Paginated student list
    F-->>A: Display students
    
    A->>F: Click "Add Student"
    F->>B: POST /students
    B->>D: Create new student
    D-->>B: Student data
    B-->>F: Success response
    F->>B: GET /students?page=1
    B->>D: Fetch updated student list
    D-->>B: Updated student data
    B-->>F: Updated student list
    F-->>A: Refresh student list
```

### Student Profile Management
```mermaid
sequenceDiagram
    participant S as Student
    participant F as Frontend
    participant B as Backend
    participant D as Database

    S->>F: Visit student dashboard
    F->>B: GET /students/me
    B->>D: Fetch student profile
    D-->>B: Student data
    B-->>F: Student profile
    F-->>S: Display profile
    
    S->>F: Click "Edit Profile"
    S->>F: Update profile info
    F->>B: PUT /students/me
    B->>D: Update student profile
    D-->>B: Updated student data
    B-->>F: Success response
    F-->>S: Show success message
```

## Data Models

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (admin|student),
  isVerified: Boolean,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  timestamps: { createdAt, updatedAt }
}
```

### Student Model
```javascript
{
  name: String,
  email: String (unique),
  course: String,
  enrollmentDate: Date,
  user: ObjectId (ref to User),
  timestamps: { createdAt, updatedAt }
}
```

## API Layer

### Authentication Endpoints
- `/api/auth/signup` - Public
- `/api/auth/verify-email/:token` - Public
- `/api/auth/login` - Public
- `/api/auth/forgot-password` - Public
- `/api/auth/reset-password/:token` - Public
- `/api/auth/change-password` - Protected (Authenticated users)

### Student Endpoints
- `/api/students` - Protected (Admin only)
- `/api/students/me` - Protected (Student only)
- `/api/students/:id` - Protected (Admin only)

## Security Layers

1. **Network Layer**: HTTPS in production
2. **Authentication Layer**: JWT tokens
3. **Authorization Layer**: Role-based middleware
4. **Data Layer**: Input validation and sanitization
5. **Application Layer**: Error handling without information leakage