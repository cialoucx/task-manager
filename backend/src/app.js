const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const activityRoutes = require('./routes/activityRoutes');
const setupSwagger = require('./swagger');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

// Serve Swagger docs
setupSwagger(app);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'task-manager-backend' });
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/activity', activityRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
