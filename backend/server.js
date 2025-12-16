const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const workItemRoutes = require('./routes/workItemRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const statsRoutes = require('./routes/statsRoutes');
const userRoutes = require('./routes/userRoutes');
const { checkAndRestoreRecurringItems } = require('./utils/recurringWorkItems');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration - allow requests from frontend service
const corsOptions = {
  origin: process.env.FRONTEND_URL || process.env.CORS_ORIGIN || '*',
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
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
  res.json({ status: 'OK', message: 'Server is running', timestamp: new Date().toISOString() });
});

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

