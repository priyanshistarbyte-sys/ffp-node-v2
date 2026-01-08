const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authentication');
const categoryRoutes = require('./routes/categories');
const postRoutes = require('./routes/posts');
const frameRoutes = require('./routes/frames');
const familyRoutes = require('./routes/family');
const statusRoutes = require('./routes/status');
const otherRoutes = require('./routes/others');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/frames', frameRoutes);
app.use('/api/family', familyRoutes);
app.use('/api/status', statusRoutes);
app.use('/api/others', otherRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

module.exports = app;