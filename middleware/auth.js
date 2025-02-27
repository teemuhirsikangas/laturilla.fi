const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {

  const token = req.header('token');
  
  if (!token) return res.status(401).json({ message: 'Auth Error, token missing' });

  try {

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    console.error(e);
    res.status(401).send({ message: 'Invalid Token' });
  }
};