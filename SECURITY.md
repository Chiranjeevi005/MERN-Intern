# Security Guidelines for Environment Variables

This document outlines the security practices for handling environment variables in the MERN Role-Based Dashboard application.

## Environment Variable Management

### What Should NOT Be Committed to Git

❌ **NEVER commit actual environment files containing sensitive data:**
- `backend/.env`
- `backend/.env.production`
- `backend/.env.development`
- `frontend/.env`
- `frontend/.env.production`
- `frontend/.env.development`
- Any other `.env.*` files containing real credentials

### What CAN Be Committed to Git

✅ **Safe to commit example/template files:**
- `backend/.env.example`
- `frontend/.env.example`
- `backend/.env.development.example`
- `frontend/.env.development.example`
- `backend/.env.production.example`
- `frontend/.env.production.example`

These example files should contain:
- Placeholder values (not real credentials)
- Comments explaining each variable
- Proper formatting as documentation

## Git Ignore Rules

The project uses comprehensive `.gitignore` rules to prevent accidental commits of sensitive files:

```gitignore
# Environment variables
.env
.env.local
.env.development
.env.test
.env.production
.env*.local
.env.*
```

And explicitly allows example files:
```gitignore
# But allow example files
!*.example
```

## Deployment Security Best Practices

### 1. Render Deployment
- Configure environment variables directly in the Render dashboard
- Never store real credentials in `.env.render` files
- Use the `backend/.env.render.example` as documentation only

### 2. Vercel Deployment
- Configure environment variables directly in the Vercel dashboard
- Never store real credentials in `.env.vercel` files
- Use the `backend/.env.vercel.example` and `frontend/.env.vercel.example` as documentation only

### 3. Local Development
- Create local `.env` files from `.env.example` templates
- Store these files only on your local development machine
- Never share or commit these files

## Credential Management Guidelines

### MongoDB Connection String
- Use strong, unique credentials for production
- Enable IP whitelisting in MongoDB Atlas
- Rotate credentials regularly

### JWT Secret
- Use a cryptographically secure random string (at least 32 characters)
- Never reuse secrets across different environments
- Store secrets securely using platform-specific secret management

### API URLs
- Use HTTPS in production environments
- Ensure proper CORS configuration
- Validate and sanitize all URLs

## Environment File Templates

### Backend (.env.example)
```env
# MongoDB Connection String
# For MongoDB Atlas, use the format:
# MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/<database-name>?retryWrites=true&w=majority
#
# For local MongoDB, use:
# MONGO_URI=mongodb://localhost:27017/your-database-name

NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_connection_string_here
JWT_SECRET=your_jwt_secret_here
CLIENT_URL=http://localhost:5173
```

### Frontend (.env.example)
```env
# Development API URL
VITE_API_URL=http://localhost:5000/api
```

## Verification Commands

To check if files are properly ignored:
```bash
# Check if a specific file is ignored
git check-ignore -v <file-path>

# List all files currently tracked by Git
git ls-files

# Check Git status
git status
```

## Security Incident Response

If you accidentally commit sensitive credentials:

1. **Immediately revoke the compromised credentials**
2. **Generate new credentials**
3. **Update all environment configurations**
4. **Remove the sensitive file from Git history** (if necessary)
5. **Notify relevant team members**
6. **Document the incident**

## Additional Security Resources

- [OWASP Configuration Management](https://owasp.org/www-project-cheat-sheets/cheatsheets/Configuration_Management_Cheat_Sheet)
- [12 Factor App - Config](https://12factor.net/config)
- [Git Secrets Management](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

By following these guidelines, we ensure that sensitive credentials are never exposed in our version control system while maintaining proper documentation for environment configuration.