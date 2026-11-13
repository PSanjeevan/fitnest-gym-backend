const express = require('express');
const lockersRouter = require('./routes/lockers');
const membersRouter = require('./routes/members');
const allotmentsRouter = require('./routes/allotments');

const app = express();

// Parse incoming JSON requests
app.use(express.json());

// Root health-check route
app.get('/', (req, res) => {
  res.status(200).json({
    system: 'FitNest Gym Locker System API',
    group: 'NU-AIAGAI2C-G01',
    endpoints: ['/members', '/lockers', '/allotments']
  });
});

// Mount routes for members, lockers, and allotments
app.use('/members', membersRouter);
app.use('/lockers', lockersRouter);
app.use('/allotments', allotmentsRouter);

// 404 Handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`FitNest Gym Server running at http://localhost:${PORT}`);
});