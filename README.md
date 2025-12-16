# Agency Work Management App

A full-stack web application for managing agency work items with user authentication, dashboard statistics, and shared work list management.

## Features

- **User Authentication**: Register and login with JWT-based authentication
- **Dashboard**: View statistics including total items, completion rates, video counts, and recent activity
- **Work List Management**: 
  - Add work items with required links
  - Track optional video counts
  - Add descriptions and checkpoints
  - Edit and delete any item (shared workspace)
  - Search and filter by status

## Tech Stack

- **Frontend**: React with React Router
- **Backend**: Node.js/Express REST API
- **Database**: MySQL
- **Authentication**: JWT tokens

## Prerequisites

- Node.js (v14 or higher)
- MySQL Server
- MySQL Workbench (or any MySQL client)

## Setup Instructions

### 1. Database Setup

1. Open MySQL Workbench and connect to your MySQL server
2. Run the SQL script in `backend/database.sql` to create the database and tables:
   ```sql
   -- The script creates:
   -- - Database: agency_work_db
   -- - Table: users
   -- - Table: work_items
   ```

### 2. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `backend` directory (copy from `.env.example`):
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=agency_work_db
   JWT_SECRET=your-secret-key-change-this-in-production
   ```

4. Update the `.env` file with your MySQL credentials

5. Start the backend server:
   ```bash
   npm start
   ```
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

   The backend will run on `http://localhost:5000`

### 3. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. (Optional) Create a `.env` file in the `frontend` directory if you need to change the API URL:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. Start the frontend development server:
   ```bash
   npm start
   ```

   The frontend will run on `http://localhost:3000`

## Usage

1. Open your browser and navigate to `http://localhost:3000`
2. Register a new account or login with existing credentials
3. View dashboard statistics
4. Navigate to "Work List" to manage work items
5. Add new work items with links (required), video counts, descriptions, and checkpoints
6. Edit or delete any work item (all users have full access)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics (protected)

### Work Items
- `GET /api/work-items` - Get all work items (protected)
- `POST /api/work-items` - Create a new work item (protected)
- `PUT /api/work-items/:id` - Update a work item (protected)
- `DELETE /api/work-items/:id` - Delete a work item (protected)

## Project Structure

```
skata1/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Authentication middleware
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── utils/            # Utility functions
│   ├── server.js         # Express app entry point
│   └── database.sql      # Database schema
├── frontend/
│   ├── public/           # Static files
│   └── src/
│       ├── components/   # React components
│       ├── context/      # React context (Auth)
│       ├── services/     # API service functions
│       └── App.js        # Main app component
└── README.md
```

## Security Features

- Passwords are hashed using bcrypt (10 rounds)
- JWT tokens with 24-hour expiration
- Protected API routes with authentication middleware
- Input validation on both client and server
- SQL injection prevention using parameterized queries

## Development Notes

- Backend runs on port 5000
- Frontend runs on port 3000
- CORS is enabled for development
- All users can edit/delete any work item (shared workspace model)

