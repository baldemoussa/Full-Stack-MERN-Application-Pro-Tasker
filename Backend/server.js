// Starts the API: loads environment variables, allows the React origin, and parses JSON bodies up to 1mb so a profile photo can be saved.
require('dotenv').config();

const express = require('express');
const db = require('./config/connection');
const routes = require('./routes');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Leave CLIENT_URL unset for local development so every origin is allowed.
// On Render, set it to the frontend site URL, with no trailing slash.
const clientUrl = process.env.CLIENT_URL;
const allowedOrigins = ['http://localhost:5173', clientUrl].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!clientUrl || !origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Not allowed by CORS'));
    },
  })
);
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(express.json({ limit: '1mb' }));
app.use(routes);

app.use((err, req, res, next) => {
  if (err.status === 413 || err.type === 'entity.too.large') {
    res.status(413).json({ message: 'That profile photo is too large. Choose a smaller image.' });
    return;
  }

  next(err);
});

db.once('open', () => {
  app.listen(PORT, () => console.log(`App is listening on localhost:${PORT}`));
});
