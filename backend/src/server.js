require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { testConnection } = require('./db');
const userRoutes = require('./routes/userRoutes');
const movieRoutes = require('./routes/movieRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const watchLaterRoutes = require('./routes/watchLaterRoutes');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(
  cors({
    origin: 'http://localhost:4200',
    credentials: true,
  })
);
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/watch-later', watchLaterRoutes);

app.get('/api/health', async (req, res) => {
  let database = 'disconnected';

  try {
    const isConnected = await testConnection();
    if (isConnected) {
      database = 'connected';
    }
  } catch {
    database = 'disconnected';
  }

  res.json({
    status: 'ok',
    message: 'StreamZone API funcionando correctamente',
    database,
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`StreamZone API escuchando en http://localhost:${PORT}`);
});
