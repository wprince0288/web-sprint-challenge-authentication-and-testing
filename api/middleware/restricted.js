const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'token required' });
  }

  const token = authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : authHeader;

  const secret = process.env.JWT_SECRET || 'shh';

  jwt.verify(token, secret, (err, decodedToken) => {
    if (err) {
      return res.status(401).json({ message: 'token invalid' });
    }
    req.user = decodedToken;
    next();
  });
};

/*
  IMPLEMENT

  1- On valid token in the Authorization header, call next.

  2- On missing token in the Authorization header,
    the response body should include a string exactly as follows: "token required".

  3- On invalid or expired token in the Authorization header,
    the response body should include a string exactly as follows: "token invalid".
*/
