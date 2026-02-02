// Entry point
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors'); // [cite: 113]

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/activity-logs', require('./routes/logRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 SaaS Server running on port ${PORT}`));