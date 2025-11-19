const express = require('express');
const cors = require('./config/cors');
const authRoutes = require('./routes/auth.routes');
const usersRoutes = require('./routes/users.routes');
const tasksRoutes = require('./routes/tasks.routes');
const locationsRoutes = require('./routes/locations.routes');
const tagsRoutes = require('./routes/tags.routes');
const deviceTypesRoutes = require('./routes/deviceTypes.routes');
const problemTypesRoutes = require('./routes/problemTypes.routes');
const statusesRoutes = require('./routes/statuses.routes');

const { errorHandler } = require('./middlewares/errorHandler');

const app = express();

// Global middlewares
app.use(express.json());
app.use(cors);

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/locations', locationsRoutes);
app.use('/api/tags', tagsRoutes);
app.use('/api/device-types', deviceTypesRoutes);
app.use('/api/problem-types', problemTypesRoutes);
app.use('/api/statuses', statusesRoutes);

// Error handling middleware (must be after routes)
app.use(errorHandler);

module.exports = app;