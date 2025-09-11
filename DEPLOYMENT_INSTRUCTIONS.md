# Deployment Instructions for MERN Role-Based Dashboard

## Backend Deployment (Render)

Your backend is already successfully deployed at: https://mern-intern-1.onrender.com

The API endpoints are available at:
- Authentication: https://mern-intern-1.onrender.com/api/auth/
- Student Management: https://mern-intern-1.onrender.com/api/students/

## Frontend Deployment (Vercel) - Recommended Approach

### Step 1: Install Vercel CLI

If you haven't already, install the Vercel CLI globally:

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

This will open a browser window where you can log in to your Vercel account.

### Step 3: Deploy the Frontend

Navigate to the frontend directory and deploy:

```bash
cd frontend
vercel --prod
```

During the deployment process, Vercel will ask you several questions:

1. **Set up and deploy**: "y" (yes)
2. **Which scope**: Select your personal account or team
3. **Link to existing project**: "n" (no, create a new project)
4. **What's your project's name**: You can use the default or enter a custom name
5. **In which directory is your code located?**: `./` (current directory)
6. **Want to override the settings?**: "n" (no)

### Step 4: Configure Environment Variables in Vercel Dashboard

After the initial deployment, you need to set the environment variable in the Vercel dashboard:

1. Go to https://vercel.com/dashboard
2. Find your project
3. Click on "Settings" → "Environment Variables"
4. Add the following environment variable:
   - Name: `VITE_API_URL`
   - Value: `https://mern-intern-1.onrender.com/api`

### Step 5: Redeploy

After adding the environment variable, redeploy your project:

1. In the Vercel dashboard, go to your project
2. Click on "Deployments"
3. Find the latest deployment and click on the "..." menu
4. Select "Redeploy"

Alternatively, you can trigger a redeploy by making a small change to any file and pushing it to GitHub.

## Alternative: Deploy Using GitHub Integration

### Step 1: Connect GitHub to Vercel

1. Go to https://vercel.com/dashboard
2. Click "New Project"
3. Click "Continue with GitHub"
4. Install the Vercel GitHub app if prompted
5. Import your repository

### Step 2: Configure Project Settings

When importing your project, configure these settings:

- **Framework Preset**: Vite
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### Step 3: Add Environment Variables

In the "Environment Variables" section during setup, add:

- Name: `VITE_API_URL`
- Value: `https://mern-intern-1.onrender.com/api`

### Step 4: Deploy

Click "Deploy" and wait for the build to complete.

## Environment Variables

### Backend (Render):
- `MONGO_URI` - Your MongoDB connection string
- `JWT_SECRET` - A secure secret key for JWT tokens
- `CLIENT_URL` - Your frontend URL (e.g., https://your-frontend.vercel.app)

### Frontend (Vercel):
- `VITE_API_URL` - Your backend URL (https://mern-intern-1.onrender.com/api)

## Testing Your Deployment

Once both frontend and backend are deployed:

1. Visit your frontend URL (provided by Vercel)
2. Try to register a new user
3. Check that you can log in
4. Verify that the admin dashboard works (if you have admin credentials)
5. Test student functionality

## Default Credentials

- Admin: admin@example.com / admin123
- Student: (You'll need to create student accounts or use the seed script)

## Troubleshooting

If you encounter issues:

1. **CORS errors**: Make sure your backend `CLIENT_URL` environment variable is set to your frontend URL
2. **API connection issues**: Verify that `VITE_API_URL` in your frontend matches your backend URL
3. **Missing environment variables**: Check that all required environment variables are set in both frontend and backend deployments

## Alternative Deployment Options

### Deploy to Netlify

1. Build the frontend locally:
   ```bash
   cd frontend
   npm run build
   ```

2. Drag and drop the `dist` folder to https://app.netlify.com/drop

3. Set the environment variable in Netlify dashboard:
   - Key: `VITE_API_URL`
   - Value: `https://mern-intern-1.onrender.com/api`

### Deploy to Render (Static Site)

1. Create a new "Static Site" in Render
2. Connect it to your GitHub repository
3. Set build command: `npm run build --prefix frontend`
4. Set publish directory: `frontend/dist`
5. Add environment variable:
   - Key: `VITE_API_URL`
   - Value: `https://mern-intern-1.onrender.com/api`

## Single Repository Deployment (Not Recommended)

If you want to keep everything in one Render deployment:

1. **Build the frontend locally:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Commit the dist folder temporarily:**
   ```bash
   git add frontend/dist
   git commit -m "Add pre-built frontend for deployment"
   git push origin main
   ```

3. **Redeploy on Render**

4. **After successful deployment, remove the dist folder from git:**
   ```bash
   git rm -r --cached frontend/dist
   git commit -m "Remove built frontend from repository"
   git push origin main
   ```

This approach works but is not recommended for production as it commits built files to the repository.