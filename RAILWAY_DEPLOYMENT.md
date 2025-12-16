# Railway Deployment Guide - Complete Step-by-Step Instructions

This comprehensive guide will walk you through deploying your Agency Work Management application to Railway with **three separate services**: MySQL Database, Backend API, and Frontend.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Overview](#project-overview)
3. [Step 1: Create Railway Account and Project](#step-1-create-railway-account-and-project)
4. [Step 2: Add MySQL Database Service](#step-2-add-mysql-database-service)
5. [Step 3: Deploy Backend Service](#step-3-deploy-backend-service)
6. [Step 4: Deploy Frontend Service](#step-4-deploy-frontend-service)
7. [Step 5: Configure Environment Variables](#step-5-configure-environment-variables)
8. [Step 6: Initialize Database](#step-6-initialize-database)
9. [Step 7: Verify Deployment](#step-7-verify-deployment)
10. [Step 8: Troubleshooting](#step-8-troubleshooting)
11. [Step 9: Updating Your Application](#step-9-updating-your-application)

---

## Prerequisites

Before starting, ensure you have:

- ✅ **GitHub Account** (or GitLab/Bitbucket) with your code repository
- ✅ **Railway Account** - Sign up at [railway.app](https://railway.app) (free tier available)
- ✅ **Code Pushed to Git** - Your `skata2` repository must be pushed to GitHub
- ✅ **Basic Terminal Knowledge** - For running commands (optional, for database setup)

---

## Project Overview

Your Railway project will consist of **3 separate services**:

1. **MySQL Database Service** - Stores all application data
2. **Backend Service** - Node.js/Express API server (runs on port assigned by Railway)
3. **Frontend Service** - React application (serves built static files)

Each service will have its own:
- Environment variables
- Build configuration
- Public URL (for backend and frontend)
- Logs and monitoring

---

## Step 1: Create Railway Account and Project

### 1.1 Sign Up for Railway

1. Go to [https://railway.app](https://railway.app)
2. Click **"Login"** or **"Start a New Project"** button (top right)
3. Choose your sign-up method:
   - **Recommended**: **"Login with GitHub"** (easiest for repository access)
   - Alternative: Sign up with email
4. Complete the authentication process
5. Verify your email if required

### 1.2 Create New Project

1. Once logged in, you'll see the Railway dashboard
2. Click the **"+ New Project"** button (top left or center of dashboard)
3. Select **"Deploy from GitHub repo"**
   - If this is your first time, you'll need to authorize Railway to access your GitHub repositories
   - Click **"Configure GitHub App"** and follow the prompts
   - Select which repositories Railway can access (or all repositories)
4. In the repository list, find and click on your **`skata2`** repository
5. Railway will automatically create a new project and start detecting your project structure

**Important**: At this point, Railway may try to auto-deploy. We'll configure the services properly in the next steps, so don't worry if the initial deployment fails.

---

## Step 2: Add MySQL Database Service

### 2.1 Add MySQL Service

1. In your Railway project dashboard, you should see your project name at the top
2. Click the **"+ New"** button (or **"+ Add Service"**)
3. From the dropdown menu, select **"Database"**
4. Click **"Add MySQL"**
5. Railway will create a MySQL database instance
   - This process takes approximately **1-2 minutes**
   - You'll see a new service card appear in your project

### 2.2 Note Database Service Name

1. Look at the MySQL service card in your project
2. **Remember or note down the service name** (it might be "MySQL" or something like "mysql-xxxxx")
   - You'll need this exact name for environment variable references
   - Example: If the service is named "MySQL", you'll use `${{MySQL.MYSQLHOST}}`
   - If it's named "mysql-abc123", you'll use `${{mysql-abc123.MYSQLHOST}}`

### 2.3 Get Database Connection Details

1. Click on the **MySQL service card** to open its details
2. Go to the **"Variables"** tab
3. You'll see these environment variables automatically created:
   - `MYSQLHOST` - Database hostname
   - `MYSQLPORT` - Database port (usually 3306)
   - `MYSQLUSER` - Database username
   - `MYSQLPASSWORD` - Database password
   - `MYSQLDATABASE` - Database name
   - `MYSQL_URL` - Full connection string

**Important**: You don't need to copy these values manually. We'll use Railway's service references in the next steps.

---

## Step 3: Deploy Backend Service

### 3.1 Add Backend Service from Repository

1. In your Railway project dashboard, click **"+ New"** (or **"+ Add Service"**)
2. Select **"GitHub Repo"**
3. Select your **`skata2`** repository again
4. Railway will create a new service from your repository

### 3.2 Configure Backend Service Settings

1. Click on the **backend service** (it might be named after your repo or "web")
2. Click on **"Settings"** tab
3. Configure the following:

   **Service Name** (optional but recommended):
   - Click the service name at the top to rename it
   - Rename to: **"backend"** or **"api"** (for clarity)

   **Root Directory**:
   - Scroll to **"Root Directory"** section
   - Set to: **`backend`**
   - This tells Railway to run commands from the `backend` folder

   **Build Command** (if visible):
   - Should be: **`npm install`** (or leave empty, Railway will auto-detect)
   - Railway will automatically run `npm install` in the `backend` directory

   **Start Command**:
   - Should be: **`npm start`**
   - This runs `node server.js` as defined in `backend/package.json`

### 3.3 Verify Backend Service Configuration

1. Go to the **"Deployments"** tab
2. You should see Railway attempting to build and deploy
3. The build will likely fail initially (we haven't set environment variables yet)
4. This is expected - we'll fix it in Step 5

**Note**: The backend service will get its own public URL (e.g., `https://backend-production-xxxx.up.railway.app`). We'll use this URL in the frontend configuration.

---

## Step 4: Deploy Frontend Service

### 4.1 Add Frontend Service from Repository

1. In your Railway project dashboard, click **"+ New"** again
2. Select **"GitHub Repo"**
3. Select your **`skata2`** repository (same repo, different service)
4. Railway will create another service

### 4.2 Configure Frontend Service Settings

1. Click on the **frontend service**
2. Click on **"Settings"** tab
3. Configure the following:

   **Service Name**:
   - Rename to: **"frontend"** or **"web"**

   **Root Directory**:
   - Set to: **`frontend`**
   - This tells Railway to run commands from the `frontend` folder

   **Build Command**:
   - Set to: **`npm install && npm run build`**
   - This installs dependencies and builds the React app

   **Start Command**:
   - Set to: **`npx serve -s build -l 3000`**
   - This serves the built React app using the `serve` package
   - The `-s` flag enables single-page app routing support
   - The `-l 3000` sets the port (Railway will override this with its own PORT)

   **Alternative Start Command** (if serve doesn't work):
   - You can also use: **`npm run serve`** (if you add it to package.json)
   - Or: **`npx serve -s build`** (Railway will set PORT automatically)

### 4.3 Verify Frontend Service Configuration

1. Go to the **"Deployments"** tab
2. Railway will attempt to build the frontend
3. The build should complete, but the app won't work correctly until we set `REACT_APP_API_URL` in Step 5

**Important**: If you encounter a build error about `package-lock.json` being out of sync:
- Run `npm install` in the `frontend` directory locally
- Commit the updated `package-lock.json` file
- Push to your repository
- Railway will automatically rebuild

**Note**: The frontend service will get its own public URL (e.g., `https://frontend-production-xxxx.up.railway.app`). This is the URL users will visit.

---

## Step 5: Configure Environment Variables

This is a **critical step**. Environment variables must be set correctly for all services to work.

### 5.1 Backend Service Environment Variables

1. Click on your **backend service**
2. Go to the **"Variables"** tab
3. Click **"+ New Variable"** for each variable below

   Add these variables **one by one**:

   | Variable Name | Value | Notes |
   |--------------|-------|-------|
   | `NODE_ENV` | `production` | Sets Node.js to production mode |
   | `PORT` | *(leave empty or remove)* | Railway automatically sets this - don't override |
   | `DB_HOST` | `${{MySQL.MYSQLHOST}}` | Replace `MySQL` with your actual MySQL service name |
   | `DB_PORT` | `${{MySQL.MYSQLPORT}}` | Replace `MySQL` with your actual MySQL service name |
   | `DB_USER` | `${{MySQL.MYSQLUSER}}` | Replace `MySQL` with your actual MySQL service name |
   | `DB_PASSWORD` | `${{MySQL.MYSQLPASSWORD}}` | Replace `MySQL` with your actual MySQL service name |
   | `DB_NAME` | `${{MySQL.MYSQLDATABASE}}` | Replace `MySQL` with your actual MySQL service name |
   | `JWT_SECRET` | *(generate a secure random string)* | See instructions below |
   | `FRONTEND_URL` | `https://your-frontend-url.railway.app` | Get this from frontend service settings (see below) |
   | `CORS_ORIGIN` | `https://your-frontend-url.railway.app` | Same as FRONTEND_URL (for CORS) |

   **Important Notes**:
   - For database variables, use the format `${{ServiceName.VARIABLE}}`
   - Replace `MySQL` with your actual MySQL service name (check Step 2.2)
   - Railway service references automatically update if database credentials change
   - You can find your MySQL service name by clicking on the MySQL service card

   **How to Get Your MySQL Service Name**:
   1. Look at your MySQL service card in the project dashboard
   2. The name is displayed on the card (e.g., "MySQL", "mysql-abc123")
   3. Use that exact name in the variable references

   **Generate JWT_SECRET**:
   - Option 1 (Terminal): Run `openssl rand -base64 32`
   - Option 2 (Online): Visit [https://randomkeygen.com/](https://randomkeygen.com/) and copy a CodeIgniter Encryption Keys
   - Option 3 (Node.js): Run `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`
   - Use a long, random string (at least 32 characters)

   **Get Frontend URL** (for FRONTEND_URL and CORS_ORIGIN):
   1. Click on your **frontend service**
   2. Go to **"Settings"** → **"Networking"**
   3. You'll see a **"Public Domain"** or **"Generate Domain"** button
   4. Click **"Generate Domain"** if no domain exists
   5. Copy the **full URL** including `https://` (e.g., `https://frontend-production-xxxx.up.railway.app`)
   6. Use this exact URL (without trailing slash) for `FRONTEND_URL` and `CORS_ORIGIN`
   7. **Important**: The URL must include `https://` protocol. The backend will auto-add it if missing, but it's better to include it explicitly.

### 5.2 Frontend Service Environment Variables

1. Click on your **frontend service**
2. Go to the **"Variables"** tab
3. Click **"+ New Variable"**

   Add this variable:

   | Variable Name | Value | Notes |
   |--------------|-------|-------|
   | `REACT_APP_API_URL` | `https://your-backend-url.railway.app/api` | Get backend URL from backend service settings |

   **Get Backend URL**:
   1. Click on your **backend service**
   2. Go to **"Settings"** → **"Networking"**
   3. You'll see a **"Public Domain"** or **"Generate Domain"** button
   4. Click **"Generate Domain"** if no domain exists
   5. Copy the URL (e.g., `https://backend-production-xxxx.up.railway.app`)
   6. Add `/api` at the end: `https://backend-production-xxxx.up.railway.app/api`
   7. Use this exact URL for `REACT_APP_API_URL`

   **Important**: 
   - The variable name **must** start with `REACT_APP_` for React to read it
   - After setting this variable, Railway will automatically rebuild the frontend
   - The build process embeds this URL into the React app at build time

### 5.3 MySQL Service Environment Variables

**No action needed** - Railway automatically creates all required MySQL environment variables. They are:
- `MYSQLHOST`
- `MYSQLPORT`
- `MYSQLUSER`
- `MYSQLPASSWORD`
- `MYSQLDATABASE`
- `MYSQL_URL`

These are used by the backend service via service references (the `${{MySQL.*}}` syntax).

### 5.4 Verify Environment Variables

After setting all variables:

1. **Backend Service**: Go to Variables tab, verify all 10 variables are present
2. **Frontend Service**: Go to Variables tab, verify `REACT_APP_API_URL` is present
3. **Check Service References**: 
   - In backend variables, the database variables should show as references (not actual values)
   - They should look like: `${{MySQL.MYSQLHOST}}` (with your service name)

### 5.5 Trigger Redeployment

After adding environment variables:

1. Railway **automatically redeploys** services when variables are added/modified
2. Go to **"Deployments"** tab in each service to watch the redeployment
3. Wait for builds to complete (may take 2-5 minutes)

---

## Step 6: Initialize Database

Your database is empty and needs to be initialized with tables.

### Option A: Using Railway CLI (Recommended)

#### 6.1 Install Railway CLI

1. Open your terminal/command prompt
2. Install Railway CLI globally:
   ```bash
   npm install -g @railway/cli
   ```
   Or using other package managers:
   ```bash
   # Using yarn
   yarn global add @railway/cli
   
   # Using pnpm
   pnpm add -g @railway/cli
   ```

#### 6.2 Login to Railway

1. In terminal, run:
   ```bash
   railway login
   ```
2. This will open your browser for authentication
3. Authorize Railway CLI to access your account

#### 6.3 Link to Your Project

1. Navigate to your project directory:
   ```bash
   cd path/to/your/skata2
   ```
2. Link Railway CLI to your project:
   ```bash
   railway link
   ```
3. You'll see a list of your Railway projects
4. Select the project you created (use arrow keys and press Enter)
5. Railway CLI is now linked to your project

#### 6.4 Run Database Initialization

1. Make sure you're in the project root directory (`skata2`)
2. Run the database initialization script:
   ```bash
   railway run --service MySQL mysql -h $MYSQLHOST -u $MYSQLUSER -p$MYSQLPASSWORD $MYSQLDATABASE < backend/database.sql
   ```
   
   **Alternative method** (if the above doesn't work):
   ```bash
   railway connect MySQL
   ```
   This opens an interactive MySQL session. Then:
   ```sql
   source backend/database.sql;
   ```
   Or copy and paste the contents of `backend/database.sql` into the MySQL prompt.

3. Verify tables were created:
   ```bash
   railway run --service MySQL mysql -h $MYSQLHOST -u $MYSQLUSER -p$MYSQLPASSWORD $MYSQLDATABASE -e "SHOW TABLES;"
   ```
   You should see: `users`, `work_items`, `activity_logs`

### Option B: Using MySQL Client (DBeaver, MySQL Workbench, etc.)

#### 6.1 Get Connection Details

1. In Railway dashboard, click on your **MySQL service**
2. Go to **"Variables"** tab
3. Note down these values:
   - `MYSQLHOST` - Hostname
   - `MYSQLPORT` - Port (usually 3306)
   - `MYSQLUSER` - Username
   - `MYSQLPASSWORD` - Password
   - `MYSQLDATABASE` - Database name

#### 6.2 Connect to Database

1. Open your MySQL client (DBeaver, MySQL Workbench, TablePlus, etc.)
2. Create a new connection with these details:
   - **Host**: Value from `MYSQLHOST`
   - **Port**: Value from `MYSQLPORT`
   - **Username**: Value from `MYSQLUSER`
   - **Password**: Value from `MYSQLPASSWORD`
   - **Database**: Value from `MYSQLDATABASE`
3. Connect to the database

#### 6.3 Run SQL Scripts

1. Open the file `backend/database.sql` in a text editor
2. Copy the entire contents
3. In your MySQL client, paste and execute the SQL
4. Verify tables were created:
   ```sql
   SHOW TABLES;
   ```
   You should see: `users`, `work_items`, `activity_logs`

#### 6.4 Run Migration Scripts (if needed)

If you have existing data or need to run migrations:

1. Open `backend/migration_add_name_and_source.sql`
2. Copy and execute in MySQL client
3. Open `backend/migration_add_recurrence_and_activity.sql`
4. Copy and execute in MySQL client

### Option C: Using Railway Web Interface (if available)

Some Railway plans provide a web-based database interface:

1. Click on your **MySQL service**
2. Look for **"Data"**, **"Connect"**, or **"Query"** tab
3. If available, you can run SQL directly in the web interface
4. Copy and paste contents of `backend/database.sql`
5. Execute the SQL

---

## Step 7: Verify Deployment

### 7.1 Check Service Status

1. In Railway dashboard, verify all 3 services show **"Active"** or **"Deployed"** status
2. Each service should have a green indicator

### 7.2 Test Backend API

1. Get your backend URL from backend service → Settings → Networking
2. Test the health endpoint:
   - Open: `https://your-backend-url.railway.app/api/health`
   - You should see: `{"status":"OK","message":"Server is running","timestamp":"..."}`
3. Test the database health endpoint:
   - Open: `https://your-backend-url.railway.app/api/health/db`
   - You should see: `{"status":"OK","message":"Database connection successful","timestamp":"..."}`
   - If this fails, your database connection or tables are not set up correctly
4. If you get an error, check backend service logs

### 7.3 Test Frontend

1. Get your frontend URL from frontend service → Settings → Networking
2. Open the URL in your browser: `https://your-frontend-url.railway.app`
3. You should see your React application
4. Try these actions:
   - **Register a new account** - Should create a user in the database
   - **Login** - Should authenticate and redirect
   - **Create a work item** - Should save to database
   - **View work items** - Should load from database

### 7.4 Check Service Logs

If something doesn't work:

1. **Backend Logs**:
   - Click backend service → "Deployments" → Latest deployment → "Logs"
   - Look for errors, especially database connection errors

2. **Frontend Logs**:
   - Click frontend service → "Deployments" → Latest deployment → "Logs"
   - Look for build errors or runtime errors

3. **MySQL Logs**:
   - Click MySQL service → "Logs"
   - Usually minimal, but check for connection issues

### 7.5 Verify Database Connection

1. Create a test user through the frontend
2. Check if it appears in the database:
   ```bash
   railway run --service MySQL mysql -h $MYSQLHOST -u $MYSQLUSER -p$MYSQLPASSWORD $MYSQLDATABASE -e "SELECT * FROM users;"
   ```
   Or use your MySQL client to query the `users` table

---

## Step 8: Troubleshooting

### Issue: Backend Service Won't Start

**Symptoms**: Backend deployment fails or service crashes

**Solutions**:
1. **Check Environment Variables**:
   - Verify all backend environment variables are set
   - Especially check database variables use correct service reference format
   - Example: `${{MySQL.MYSQLHOST}}` (replace `MySQL` with your service name)

2. **Check Logs**:
   - Backend service → Deployments → Latest → Logs
   - Look for specific error messages
   - Common errors:
     - "Cannot connect to database" → Check DB_* variables
     - "Port already in use" → Remove PORT variable (Railway sets it)
     - "Module not found" → Check package.json dependencies

3. **Verify Root Directory**:
   - Backend service → Settings → Root Directory should be `backend`

4. **Check Start Command**:
   - Should be: `npm start`
   - This runs `node server.js` from backend directory

### Issue: Frontend Can't Connect to Backend

**Symptoms**: Frontend loads but shows API errors, network errors, or CORS errors

**Solutions**:
1. **Verify REACT_APP_API_URL**:
   - Frontend service → Variables → Check `REACT_APP_API_URL`
   - Should be: `https://your-backend-url.railway.app/api`
   - Must include `/api` at the end
   - Must use `https://` (not `http://`)

2. **Verify Backend CORS Configuration**:
   - Backend service → Variables → Check `FRONTEND_URL` and `CORS_ORIGIN`
   - Should match your frontend URL exactly (no trailing slash)
   - **Must include `https://` protocol**: `https://frontend-production-xxxx.up.railway.app`
   - Example: `https://skata3-production-1608.up.railway.app`
   - **Common mistake**: Setting it to `skata3-production-1608.up.railway.app` (without https://)
   - The backend code will auto-add `https://` if missing, but it's better to set it correctly

3. **Check CORS Error Details**:
   - Open browser DevTools (F12) → Console tab
   - Look for error: "The 'Access-Control-Allow-Origin' header contains the invalid value..."
   - This means the CORS origin is set incorrectly (likely missing `https://`)
   - Fix: Update `FRONTEND_URL` and `CORS_ORIGIN` to include `https://`

4. **Rebuild Services**:
   - After changing `REACT_APP_API_URL`, Railway should auto-rebuild frontend
   - After changing `FRONTEND_URL` or `CORS_ORIGIN`, Railway should auto-rebuild backend
   - If not, manually trigger: Service → Deployments → Redeploy

5. **Check Browser Console**:
   - Open browser DevTools (F12)
   - Check Console tab for CORS errors
   - Check Network tab to see if API calls are being made
   - Look at the request headers to see what origin is being sent

### Issue: 500 Internal Server Error

**Symptoms**: API requests return 500 error, registration/login fails with 500 status

**Solutions**:
1. **Check Backend Logs** (Most Important):
   - Go to Railway dashboard → Backend service → "Logs" tab
   - Look for error messages, especially:
     - Database connection errors
     - "Table doesn't exist" errors
     - "Access denied" errors
   - The logs will show the exact error causing the 500

2. **Test Database Connection**:
   - Visit: `https://your-backend-url.railway.app/api/health/db`
   - If this returns an error, the database connection is the problem
   - If this returns OK, the issue is likely with missing tables

3. **Verify Database is Initialized**:
   - The 500 error is often caused by missing database tables
   - Follow Step 6 in this guide to initialize the database
   - Run `backend/database.sql` to create all required tables

4. **Check Database Environment Variables**:
   - Backend service → Variables tab
   - Verify all DB_* variables are set correctly
   - They should use service references: `${{MySQL.MYSQLHOST}}` etc.
   - Make sure the MySQL service name matches exactly

5. **Common Causes**:
   - **Database not initialized**: Tables don't exist → Run database.sql
   - **Wrong database name**: DB_NAME doesn't match actual database
   - **Connection refused**: DB_HOST or DB_PORT incorrect
   - **Access denied**: DB_USER or DB_PASSWORD incorrect
   - **Service references wrong**: MySQL service name doesn't match

### Issue: Database Connection Errors

**Symptoms**: Backend logs show "ECONNREFUSED", "Access denied", or "Unknown database"

**Solutions**:
1. **Verify Service References**:
   - Backend variables should use `${{ServiceName.VARIABLE}}` format
   - Replace `ServiceName` with your actual MySQL service name
   - Check MySQL service name: Click MySQL service → Name is at the top

2. **Verify MySQL Service is Running**:
   - MySQL service should show "Active" status
   - If not, wait a few minutes for it to start

3. **Check Variable Names**:
   - Backend should have: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
   - Case-sensitive - must match exactly

4. **Test Connection Manually**:
   ```bash
   railway connect MySQL
   ```
   If this works, the issue is with backend configuration, not database

5. **Test Database Health Endpoint**:
   - Visit: `https://your-backend-url.railway.app/api/health/db`
   - This will tell you if the database connection is working

### Issue: Frontend Shows Blank Page or 404

**Symptoms**: Frontend URL loads but shows blank page or "Cannot GET /"

**Solutions**:
1. **Check Start Command**:
   - Frontend service → Settings → Start Command
   - Should be: `npx serve -s build -l 3000`
   - The `-s` flag is critical for React Router to work

2. **Verify Build Completed**:
   - Frontend service → Deployments → Latest → Logs
   - Look for "Build successful" or "Compiled successfully"
   - If build failed, fix build errors first

3. **Check Root Directory**:
   - Frontend service → Settings → Root Directory should be `frontend`

### Issue: Environment Variables Not Working

**Symptoms**: Variables are set but application doesn't use them

**Solutions**:
1. **Frontend Variables**:
   - Must start with `REACT_APP_` prefix
   - Changes require a rebuild (Railway does this automatically)
   - Check build logs to verify variables were embedded

2. **Backend Variables**:
   - Restart service after adding variables
   - Go to Deployments → Redeploy latest

3. **Service References**:
   - Format: `${{ServiceName.VARIABLE}}`
   - No spaces, exact service name
   - Railway shows these as references (not actual values) in the UI

### Issue: Build Fails

**Symptoms**: Deployment shows "Build failed" or exits with error code

**Solutions**:
1. **Check Build Logs**:
   - Service → Deployments → Latest → Logs
   - Scroll to find the actual error

2. **Common Build Errors**:
   - **"npm ERR!"** → Dependency installation failed
     - Check package.json for syntax errors
     - Verify all dependencies are valid
   - **"Module not found"** → Missing dependency
     - Add to package.json and commit
   - **"Out of memory"** → Frontend build needs more memory
     - Railway free tier has limits
     - Try optimizing build or upgrade plan
   - **"npm ci can only install packages when your package.json and package-lock.json are in sync"** → Lock file mismatch
     - **Solution**: Run `npm install` locally in the frontend directory to regenerate package-lock.json
     - Commit the updated package-lock.json to your repository
     - Push changes and redeploy
     - The `nixpacks.toml` file should ensure `npm install` is used instead of `npm ci`

3. **Verify Configuration**:
   - Root Directory is correct
   - Build Command is correct
   - Start Command is correct
   - `nixpacks.toml` exists in the service directory (backend or frontend)

### Issue: Services Keep Restarting

**Symptoms**: Services show as "Restarting" or crash repeatedly

**Solutions**:
1. **Check Logs for Crash Reason**:
   - Service → Logs tab
   - Look for error messages before crash

2. **Common Causes**:
   - Missing environment variables
   - Database connection failing
   - Port conflicts
   - Application errors (check code)

3. **Verify All Required Variables**:
   - Use the checklist in Step 5
   - Ensure all variables are set correctly

---

## Step 9: Updating Your Application

### 9.1 Making Code Changes

1. **Make Changes Locally**:
   - Edit your code in your local development environment
   - Test changes locally if possible

2. **Commit Changes**:
   ```bash
   git add .
   git commit -m "Description of changes"
   git push origin main
   ```
   (Replace `main` with your branch name if different)

3. **Automatic Deployment**:
   - Railway automatically detects git pushes
   - It will rebuild and redeploy affected services
   - You can watch the deployment in Railway dashboard

### 9.2 Updating Environment Variables

1. **Add/Modify Variables**:
   - Go to service → Variables tab
   - Add new variable or edit existing one
   - Railway automatically redeploys the service

2. **Remove Variables**:
   - Variables tab → Click trash icon next to variable
   - Service will redeploy automatically

### 9.3 Manual Redeployment

If automatic deployment doesn't trigger:

1. Go to service → **"Deployments"** tab
2. Find the latest deployment
3. Click **"Redeploy"** button (three dots menu)
4. Service will rebuild and redeploy

### 9.4 Database Migrations

When you need to update database schema:

1. Create migration SQL file (e.g., `backend/migration_v2.sql`)
2. Run it using Railway CLI:
   ```bash
   railway run --service MySQL mysql -h $MYSQLHOST -u $MYSQLUSER -p$MYSQLPASSWORD $MYSQLDATABASE < backend/migration_v2.sql
   ```
3. Or use MySQL client to execute the migration

---

## Quick Reference Checklist

Before considering deployment complete, verify:

### MySQL Service
- [ ] Service is "Active"
- [ ] Database initialized with tables (users, work_items, activity_logs)
- [ ] Can connect to database

### Backend Service
- [ ] Service is "Active"
- [ ] Root Directory: `backend`
- [ ] Start Command: `npm start`
- [ ] Environment Variables Set:
  - [ ] `NODE_ENV=production`
  - [ ] `DB_HOST=${{MySQL.MYSQLHOST}}` (with correct service name)
  - [ ] `DB_PORT=${{MySQL.MYSQLPORT}}`
  - [ ] `DB_USER=${{MySQL.MYSQLUSER}}`
  - [ ] `DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}`
  - [ ] `DB_NAME=${{MySQL.MYSQLDATABASE}}`
  - [ ] `JWT_SECRET` (secure random string)
  - [ ] `FRONTEND_URL` (frontend service URL)
  - [ ] `CORS_ORIGIN` (frontend service URL)
- [ ] Health endpoint works: `/api/health`

### Frontend Service
- [ ] Service is "Active"
- [ ] Root Directory: `frontend`
- [ ] Build Command: `npm install && npm run build`
- [ ] Start Command: `npx serve -s build -l 3000`
- [ ] Environment Variables Set:
  - [ ] `REACT_APP_API_URL` (backend URL + `/api`)
- [ ] Frontend loads in browser
- [ ] Can register/login
- [ ] Can create/view work items

---

## Additional Resources

- **Railway Documentation**: [https://docs.railway.app](https://docs.railway.app)
- **Railway Status**: [https://status.railway.app](https://status.railway.app)
- **Railway Discord**: [https://discord.gg/railway](https://discord.gg/railway) (for community support)

---

## Summary

You've successfully deployed a 3-service application to Railway:

1. ✅ **MySQL Database** - Stores your application data
2. ✅ **Backend API** - Handles business logic and database operations
3. ✅ **Frontend** - Serves your React application to users

**Your application URLs**:
- Frontend: `https://your-frontend-url.railway.app` (users visit this)
- Backend API: `https://your-backend-url.railway.app/api` (frontend calls this)
- Database: Internal (only accessible by backend service)

**Next Steps**:
- Monitor your services in Railway dashboard
- Set up custom domains (optional)
- Configure monitoring and alerts (optional)
- Scale services if needed (Railway Pro plan)

---

**Last Updated**: This guide is current as of Railway's latest interface. Railway may update their UI, but the core deployment concepts remain the same.
