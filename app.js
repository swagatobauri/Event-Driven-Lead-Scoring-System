require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Import CORS
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

app.get('/', (req, res) => {
  res.send('Backend is running!');
});

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

require('./queues/worker');

const server = require('http').createServer(app);
const io = require('./utils/socket').init(server);

io.on('connection', (socket) => {
  console.log('Client connected to Socket.IO');
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
