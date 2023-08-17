const jwt = require('jsonwebtoken');
const emailvalidator = require("email-validator");

module.exports = {
  validateRegister: (req, res, next) => {
    // name min length 3
    if (!req.body.name || req.body.name.length < 3) {
      return res.status(400).send({
        message: 'Please enter a username with min. 3 chars',
      });
    }

    // email format
    if (!req.body.email || !emailvalidator.validate(req.body.email)) {
        return res.status(400).send({
            message: 'Please enter a valid email address',
        });
    }

    // password min 6 chars
    if (!req.body.password || req.body.password.length < 6) {
      return res.status(400).send({
        message: 'Please enter a password with min. 6 chars',
      });
    }

    // password (repeat) must match
    if (
      !req.body.password_repeat ||
      req.body.password != req.body.password_repeat
    ) {
      return res.status(400).send({
        message: 'Both passwords must match',
      });
    }
    next();
  },
  
  isLoggedIn: (req, res, next) => {
    if (!req.headers.authorization) {
      return res.status(400).send({
        message: 'Your session is not valid!',
      });
    }
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, 'SECRETKEY');
      req.userData = decoded;
      next();
    } catch (err) {
      return res.status(400).send({
        message: 'Your session is not valid!',
      });
    }
  },
};