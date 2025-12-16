const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const workItemRoutes = require('./routes/workItemRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const statsRoutes = require('./routes/statsRoutes');
const userRoutes = require('./routes/userRoutes');
const { checkAndRestoreRecurringItems } = require('./utils/recurringWorkItems');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/work-items', workItemRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production') {
  const frontendBuildPath = path.join(__dirname, '../frontend/build');
  app.use(express.static(frontendBuildPath));
  
  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);

  // Simple in-process scheduler for recurring work items.
  // This checks every 5 minutes for items that should be auto-restored to pending.
  const intervalMinutes = 5;
  setInterval(() => {
    checkAndRestoreRecurringItems().catch((err) => {
      console.error('Recurring work item check failed:', err);
    });
  }, intervalMinutes * 60 * 1000);

  // Run once shortly after startup as well
  setTimeout(() => {
    checkAndRestoreRecurringItems().catch((err) => {
      console.error('Initial recurring work item check failed:', err);
    });
  }, 10 * 1000);
});

