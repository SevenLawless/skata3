# Railway Deployment Guide

This guide will walk you through deploying your Agency Work Management application to Railway step by step.

## 🚀 Quick Start Summary

If you're experienced with Railway, here's the TL;DR:

1. Create Railway project from GitHub repo
2. Add MySQL database service
3. Set environment variables (use service references for DB vars)
4. Deploy (automatic on git push)
5. Run `backend/database.sql` to initialize database
6. Set `REACT_APP_API_URL` to your Railway app URL + `/api`

**Required Environment Variables:**
- `NODE_ENV=production`
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` (use `${{MySQL.MYSQLHOST}}` format)
- `JWT_SECRET` (generate a secure random string)
- `REACT_APP_API_URL` (your Railway URL + `/api`)

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Setting Up Railway Account](#setting-up-railway-account)
3. [Creating a New Project](#creating-a-new-project)
4. [Setting Up MySQL Database](#setting-up-mysql-database)
5. [Configuring Environment Variables](#configuring-environment-variables)
6. [Deploying the Application](#deploying-the-application)
7. [Running Database Migrations](#running-database-migrations)
8. [Verifying Deployment](#verifying-deployment)
9. [Troubleshooting](#troubleshooting)
10. [Updating Your Application](#updating-your-application)

---

## Prerequisites

Before you begin, make sure you have:

- ✅ A GitHub account (or GitLab/Bitbucket)
- ✅ Your code pushed to a Git repository
- ✅ A Railway account (free tier available)
- ✅ Basic understanding of environment variables

---

## Step 1: Setting Up Railway Account

1. **Visit Railway**: Go to [https://railway.app](https://railway.app)

2. **Sign Up/Login**:
   - Click "Login" or "Start a New Project"
   - You can sign up with GitHub, GitLab, or email
   - **Recommended**: Use GitHub for easier integration

3. **Verify Your Account**: Follow the email verification process if required

---

## Step 2: Creating a New Project

1. **Create New Project**:
   - Once logged in, click the "+ New Project" button
   - Select "Deploy from GitHub repo" (or your Git provider)
   - Authorize Railway to access your repositories if prompted

2. **Select Your Repository**:
   - Find and select your `skata2` repository
   - Click "Deploy Now"

3. **Wait for Initial Build**:
   - Railway will automatically detect your project structure
   - The first build may take a few minutes
   - You'll see build logs in real-time

---

## Step 3: Setting Up MySQL Database

Your application requires a MySQL database. Railway provides managed MySQL databases.

1. **Add MySQL Service**:
   - In your Railway project dashboard, click "+ New"
   - Select "Database" → "Add MySQL"

2. **Wait for Database Creation**:
   - Railway will create a MySQL instance
   - This takes about 1-2 minutes
   - You'll see a new service in your project

3. **Get Database Connection Details**:
   - Click on the MySQL service
   - Go to the "Variables" tab
   - You'll see connection variables like:
     - `MYSQLHOST`
     - `MYSQLPORT`
     - `MYSQLUSER`
     - `MYSQLPASSWORD`
     - `MYSQLDATABASE`
   - **Note these down** - you'll need them in the next step

---

## Step 4: Configuring Environment Variables

Your application needs several environment variables to run properly.

1. **Open Your Application Service**:
   - In your Railway project, click on your main application service (not the database)
   - Go to the "Variables" tab

2. **Add the Following Environment Variables**:

   Click "New Variable" for each of these:

   | Variable Name | Description | Example Value |
   |--------------|-------------|---------------|
   | `NODE_ENV` | Environment mode | `production` |
   | `PORT` | Server port (Railway sets this automatically, but you can override) | `5000` |
   | `DB_HOST` | MySQL host | Use `${{MySQL.MYSQLHOST}}` (Railway reference) |
   | `DB_PORT` | MySQL port | Use `${{MySQL.MYSQLPORT}}` |
   | `DB_USER` | MySQL username | Use `${{MySQL.MYSQLUSER}}` |
   | `DB_PASSWORD` | MySQL password | Use `${{MySQL.MYSQLPASSWORD}}` |
   | `DB_NAME` | MySQL database name | Use `${{MySQL.MYSQLDATABASE}}` |
   | `JWT_SECRET` | Secret key for JWT tokens | Generate a strong random string (see below) |
   | `REACT_APP_API_URL` | Frontend API URL | Your Railway app URL (e.g., `https://your-app.railway.app/api`) |

3. **Using Railway Service References** (Recommended):
   - Instead of copying database values manually, use Railway's service references
   - For `DB_HOST`: Click "New Variable" → Name: `DB_HOST` → Value: `${{MySQL.MYSQLHOST}}`
   - For `DB_PORT`: `${{MySQL.MYSQLPORT}}`
   - For `DB_USER`: `${{MySQL.MYSQLUSER}}`
   - For `DB_PASSWORD`: `${{MySQL.MYSQLPASSWORD}}`
   - For `DB_NAME`: `${{MySQL.MYSQLDATABASE}}`
   - Replace `MySQL` with your actual MySQL service name if different

4. **Generate JWT_SECRET**:
   - You can generate a secure random string using:
     - Online: [https://randomkeygen.com/](https://randomkeygen.com/)
     - Terminal: `openssl rand -base64 32`
     - Or use any secure random string generator
   - Example: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6`

5. **Set REACT_APP_API_URL**:
   - After your first deployment, Railway will provide a URL like `https://your-app-name.railway.app`
   - Set `REACT_APP_API_URL` to: `https://your-app-name.railway.app/api`
   - **Note**: You'll need to update this after the first deployment to get the actual URL

6. **Save All Variables**:
   - Make sure all variables are saved
   - Railway will automatically redeploy when you add/modify variables

---

## Step 5: Deploying the Application

1. **Configure Build Settings** (if needed):
   - Railway should auto-detect your Node.js application
   - If not, go to your service → Settings → Build & Deploy
   - Build Command: `cd frontend && npm run build`
   - Start Command: `cd backend && npm start`
   - Root Directory: `/` (root of your repository)

2. **Monitor the Deployment**:
   - Go to the "Deployments" tab
   - Watch the build logs
   - The build process will:
     - Install backend dependencies
     - Install frontend dependencies
     - Build the React frontend
     - Start the Node.js server

3. **Check for Errors**:
   - If the build fails, check the logs
   - Common issues:
     - Missing environment variables
     - Build errors in frontend
     - Database connection issues

4. **Get Your Application URL**:
   - Once deployed, Railway will provide a public URL
   - Go to Settings → Networking
   - You'll see a domain like: `https://your-app-name.railway.app`
   - Copy this URL

5. **Update REACT_APP_API_URL** (if needed):
   - If you set a placeholder earlier, update it now with the actual URL
   - Add `/api` at the end: `https://your-app-name.railway.app/api`
   - Railway will redeploy automatically

---

## Step 6: Running Database Migrations

Your database needs to be initialized with the required tables.

### Option A: Using Railway CLI (Recommended)

1. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**:
   ```bash
   railway login
   ```

3. **Link Your Project**:
   ```bash
   railway link
   ```
   - Select your project when prompted

4. **Run Database Migration**:
   ```bash
   railway run mysql -h $MYSQLHOST -u $MYSQLUSER -p$MYSQLPASSWORD $MYSQLDATABASE < backend/database.sql
   ```
   
   Or using Railway's MySQL service:
   ```bash
   railway connect mysql
   ```
   Then paste the contents of `backend/database.sql`

### Option B: Using MySQL Workbench or Command Line

1. **Get Connection String**:
   - In Railway, go to your MySQL service
   - Click "Connect" or check the Variables tab
   - You'll get connection details

2. **Connect to Database**:
   - Use MySQL Workbench, DBeaver, or command line
   - Host: Your `MYSQLHOST`
   - Port: Your `MYSQLPORT`
   - Username: Your `MYSQLUSER`
   - Password: Your `MYSQLPASSWORD`
   - Database: Your `MYSQLDATABASE`

3. **Run SQL Scripts**:
   - Execute `backend/database.sql`
   - Execute `backend/migration_add_name_and_source.sql` (if exists)
   - Execute `backend/migration_add_recurrence_and_activity.sql` (if exists)

### Option C: Using Railway's Web Interface

1. **Open MySQL Service**:
   - Click on your MySQL service in Railway
   - Go to "Data" or "Connect" tab
   - Railway may provide a web-based SQL editor

2. **Run SQL Scripts**:
   - Copy contents of `backend/database.sql`
   - Paste and execute in the SQL editor
   - Run any migration files as well

---

## Step 7: Verifying Deployment

1. **Test Health Endpoint**:
   - Visit: `https://your-app-name.railway.app/api/health`
   - You should see: `{"status":"OK","message":"Server is running"}`

2. **Test Frontend**:
   - Visit: `https://your-app-name.railway.app`
   - You should see your React application

3. **Test Registration**:
   - Try creating a new account
   - Check if it saves to the database

4. **Check Logs**:
   - In Railway dashboard, go to "Deployments"
   - Click on the latest deployment
   - Check "Logs" tab for any errors

---

## Step 8: Troubleshooting

### Build Fails

**Issue**: Build process fails
- **Solution**: Check build logs for specific errors
- Common causes:
  - Missing dependencies in package.json
  - Build script errors
  - Node version incompatibility

### Database Connection Errors

**Issue**: "Cannot connect to database"
- **Solution**: 
  - Verify all database environment variables are set correctly
  - Check that MySQL service is running
  - Verify service references are correct (e.g., `${{MySQL.MYSQLHOST}}`)

### Frontend Can't Connect to API

**Issue**: Frontend shows API errors
- **Solution**:
  - Verify `REACT_APP_API_URL` is set correctly
  - Make sure it includes `/api` at the end
  - Check CORS settings in backend (should allow your Railway domain)

### 404 Errors on Page Refresh

**Issue**: Getting 404 when refreshing pages
- **Solution**: 
  - This is already handled in `server.js` with the catch-all route
  - Verify the production static file serving is working

### Environment Variables Not Working

**Issue**: Variables not being read
- **Solution**:
  - Make sure variables are set in the correct service (your app, not database)
  - Restart the service after adding variables
  - Check variable names match exactly (case-sensitive)

### Port Issues

**Issue**: Application not starting
- **Solution**:
  - Railway automatically sets `PORT` environment variable
  - Your code should use `process.env.PORT || 5000`
  - Don't hardcode port numbers

---

## Step 9: Updating Your Application

1. **Make Changes Locally**:
   - Edit your code
   - Test locally

2. **Commit and Push**:
   ```bash
   git add .
   git commit -m "Your commit message"
   git push origin main
   ```

3. **Automatic Deployment**:
   - Railway will automatically detect the push
   - It will rebuild and redeploy your application
   - Monitor the deployment in Railway dashboard

4. **Manual Redeploy** (if needed):
   - Go to Railway dashboard
   - Click on your service
   - Go to "Deployments"
   - Click "Redeploy" on the latest deployment

---

## Additional Configuration

### Custom Domain (Optional)

1. **Add Custom Domain**:
   - Go to Settings → Networking
   - Click "Custom Domain"
   - Add your domain
   - Follow DNS configuration instructions

2. **Update REACT_APP_API_URL**:
   - Update the environment variable with your custom domain
   - Add `/api` at the end

### Environment-Specific Variables

You can set different variables for different environments:
- Production: Set in Railway dashboard
- Development: Use `.env` file locally (not committed to Git)

### Monitoring and Logs

- **View Logs**: Railway dashboard → Your service → Logs
- **Metrics**: Railway provides basic metrics in the dashboard
- **Alerts**: Set up alerts for deployment failures

---

## Quick Reference: Environment Variables Checklist

Before deploying, ensure you have:

- [ ] `NODE_ENV=production`
- [ ] `DB_HOST` (or `${{MySQL.MYSQLHOST}}`)
- [ ] `DB_PORT` (or `${{MySQL.MYSQLPORT}}`)
- [ ] `DB_USER` (or `${{MySQL.MYSQLUSER}}`)
- [ ] `DB_PASSWORD` (or `${{MySQL.MYSQLPASSWORD}}`)
- [ ] `DB_NAME` (or `${{MySQL.MYSQLDATABASE}}`)
- [ ] `JWT_SECRET` (strong random string)
- [ ] `REACT_APP_API_URL` (your Railway app URL + `/api`)

---

## Support

If you encounter issues:

1. Check Railway documentation: [https://docs.railway.app](https://docs.railway.app)
2. Check Railway status: [https://status.railway.app](https://status.railway.app)
3. Review application logs in Railway dashboard
4. Verify all environment variables are set correctly

---

## Summary

Your application is now deployed! The key steps were:

1. ✅ Created Railway account and project
2. ✅ Added MySQL database service
3. ✅ Configured all environment variables
4. ✅ Deployed application (automatic on git push)
5. ✅ Ran database migrations
6. ✅ Verified deployment

Your app should now be accessible at: `https://your-app-name.railway.app`

---

**Last Updated**: This guide is based on Railway's current interface. Railway may update their UI, but the core concepts remain the same.
