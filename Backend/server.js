require('dotenv').config();

const express = require('express');
const db = require('./config/connection');
const routes = require('./routes');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(routes);

db.once('open', () => {
  app.listen(PORT, () => console.log(`App is listening on localhost:${PORT}`));
});
