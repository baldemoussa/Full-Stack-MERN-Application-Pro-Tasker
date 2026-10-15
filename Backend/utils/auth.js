// Signs a JWT for two hours and reads it from the Authorization header. req.user is the payload data, not the full user document.
const jwt = require('jsonwebtoken');
 
const secret = process.env.JWT_SECRET;
const expiration = '2h';
 
module.exports = {
  authMiddleware: function (req, res, next) {
    let token = req.body?.token || req.query?.token || req.headers.authorization;
    if (req.headers.authorization) {
      token = token.split(' ').pop().trim();
    } 
    if (!token) {
      return res.status(401).json({ message: 'You must be logged in to do that.' });
    } 
    try {
      const { data } = jwt.verify(token, secret, { maxAge: expiration });
      req.user = data;
    } catch {
      console.log('Invalid token');
      return res.status(401).json({ message: 'Invalid token.' });
    } 
    next();
  },
  signToken: function ({ username, email, _id }) {
    const payload = { username, email, _id }; 
    return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
  },
};