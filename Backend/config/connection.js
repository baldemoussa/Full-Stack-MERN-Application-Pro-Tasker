// Opens the MongoDB connection from MONGO_URI. The server imports this before it listens.
const mongoose = require('mongoose');
 
mongoose.connect(process.env.MONGO_URI);
 
module.exports = mongoose.connection;