require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// API Routes

const leadRoutes = require('./routes/leads');
const eventRoutes = require('./routes/events');
const dashboardRoutes = require('./routes/dashboard');
const simulationRoutes = require('./routes/simulation');
const ruleRoutes = require('./routes/rules');

app.use('/api/leads', leadRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/simulation', simulationRoutes);
app.use('/api/rules', ruleRoutes);
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    env: process.env.NODE_ENV,
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Worker will be initialized after Socket.IO


const server = require('http').createServer(app);
const io = require('./utils/socket').init(server);

io.on('connection', (socket) => {
  console.log('Client connected to Socket.IO');
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'frontEnd/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontEnd/dist', 'index.html'));
  });
}

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  // Start worker once server is listener and IO is ready
  require('./queues/worker');
});
