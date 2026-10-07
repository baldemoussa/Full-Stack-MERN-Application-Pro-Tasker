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
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(routes);

db.once('open', () => {
  app.listen(PORT, () => console.log(`App is listening on localhost:${PORT}`));
});
