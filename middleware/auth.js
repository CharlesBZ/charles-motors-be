const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function (req, res, next) {
  // Get token from the Authorization header
  const authHeader = req.header('Authorization');

  // Check if the header contains a token in the "Bearer <token>" format
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ msg: 'No token, authorization is denied' });
  }

  // Extract token from the header
  const token = authHeader.split(' ')[1];

  // Verify the token
  try {
    const decoded = jwt.verify(token, config.get('jwtSecret'));

    // Attach the user object to the request for access in the next middleware
    req.user = decoded.user;
    next();
  } catch (err) {
    console.error('Token validation error:', err.message); // Optional logging for debugging
    res.status(401).json({ msg: 'Your token is not valid or has expired' });
  }
};
