# Campus Safety App - Authentication System

## Overview
The Campus Safety App now includes a comprehensive role-based authentication system with three user roles: Student, Staff, and Security.

## Features

### 🔐 Authentication
- **Signup**: Users can create accounts with role selection
- **Login**: Secure authentication with JWT tokens
- **Role-based Access Control**: Different permissions for each role
- **Protected Routes**: Automatic redirection based on authentication status

### 👥 User Roles

#### Student
- **Permissions**: 
  - Create SOS alerts
  - Submit incident reports
  - View own alerts and reports
  - Access safety features
- **UI Features**: SOS button, report forms, safety dashboard

#### Staff
- **Permissions**:
  - View all incident reports
  - Close incident reports
  - View statistics
  - Assist students
- **UI Features**: Reports dashboard, guardian angel features

#### Security
- **Permissions**:
  - View all SOS alerts
  - Resolve SOS alerts
  - View all incident reports
  - Close incident reports
  - View statistics
  - Access patrol features
- **UI Features**: Alerts dashboard, patrol map, emergency management

## Technical Implementation

### Backend Integration
- **API Base URL**: `http://localhost:3000/api`
- **Authentication Endpoints**:
  - `POST /auth/signup` - User registration with role
  - `POST /auth/login` - User authentication
  - `POST /auth/profile` - Get user profile

### Frontend Architecture
- **Authentication Service**: `src/services/authService.js`
- **Security Context**: `src/state/SecurityContext.jsx`
- **Protected Routes**: `src/components/ProtectedRoute.jsx`
- **Role-based Navigation**: `src/components/RoleBasedNavigation.jsx`

### State Management
- User authentication state
- Role-based permissions
- JWT token management
- Local storage persistence

## Usage

### Signup Process
1. User fills out signup form with name, email, password
2. User selects role (Student, Staff, or Security)
3. Form validates input and sends to backend
4. Backend creates user and returns JWT token
5. User is automatically logged in and redirected

### Login Process
1. User enters email and password
2. Backend validates credentials
3. Returns JWT token with user data and role
4. User is redirected to role-appropriate dashboard

### Role-based Access
- **Students**: See SOS button and safety features
- **Staff**: See reports dashboard and guardian features
- **Security**: See alerts dashboard and emergency management

## Security Features
- JWT token-based authentication
- Role-based route protection
- Input validation and sanitization
- Secure password handling
- Token expiration handling

## UI/UX Features
- Consistent theming across all auth pages
- Responsive design for mobile devices
- Loading states and error handling
- Role-based navigation and content
- User-friendly error messages

## Testing
To test the authentication system:

1. **Start the backend server**:
   ```bash
   npm start
   ```

2. **Start the frontend development server**:
   ```bash
   cd campus-safety-app
   npm run dev
   ```

3. **Test different roles**:
   - Sign up as a Student and test SOS features
   - Sign up as Staff and test report viewing
   - Sign up as Security and test alert management

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - Authenticate user
- `POST /api/auth/profile` - Get user profile

### Role-based Endpoints
- `POST /api/sos` - Create SOS alert (Students only)
- `GET /api/sos` - View SOS alerts (Security only)
- `POST /api/report` - Submit incident report (Students only)
- `GET /api/reports` - View incident reports (Staff/Security only)

## Error Handling
- Network errors are caught and displayed to users
- Invalid credentials show appropriate error messages
- Role-based access violations show permission denied messages
- Form validation provides real-time feedback

## Future Enhancements
- Password reset functionality
- Email verification
- Two-factor authentication
- Role management for administrators
- Audit logging for security events
