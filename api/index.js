const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api', (req, res) => {
  res.json({ message: 'API funcionando no Vercel!' });
});

app.all('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

module.exports = app;