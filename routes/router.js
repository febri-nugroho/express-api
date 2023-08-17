const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const db = require('../lib/db.js');
const userMiddleware = require('../middleware/users.js');

// http://localhost:3000/api/register
router.post('/register', userMiddleware.validateRegister, (req, res, next) => {
  db.query(
    'SELECT id FROM users WHERE name = ?',
    [req.body.name],
    (err, result) => {
      if (result && result.length) {
        // error
        return res.status(409).send({
          message: 'Name is already in use!',
        });
      } else {
        // name not in use
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(500).send({
              message: err,
            });
          } else {
            db.query(
              'INSERT INTO users (name, email, password, registered) VALUES (?, ?, ?, now());',
              [req.body.name, req.body.email, hash],
              (err, result) => {
                if (err) {
                  return res.status(400).send({
                    message: err,
                  });
                }
                return res.status(201).send({
                  message: 'Register Sucessfull!',
                });
              }
            );
          }
        });
      }
    }
  );
});

// http://localhost:3000/api/login
router.post('/login', (req, res, next) => {
  db.query(
    `SELECT * FROM users WHERE name = ?;`,
    [req.body.name],
    (err, result) => {
      if (err) {
        return res.status(400).send({
          message: err,
        });
      }
      if (!result.length) {
        return res.status(400).send({
          message: 'Name or password incorrect!',
        });
      }

      bcrypt.compare(
        req.body.password,
        result[0]['password'],
        (bErr, bResult) => {
          if (bErr) {
            return res.status(400).send({
              message: 'Name or password incorrect!',
            });
          }
          if (bResult) {
            // password match
            const token = jwt.sign(
              {
                name: result[0].name,
                userId: result[0].id,
              },
              'SECRETKEY',
              { expiresIn: '7d' }
            );
            db.query(`UPDATE users SET last_login = now() WHERE id = ?;`, [
              result[0].id,
            ]);
            return res.status(200).send({
              message: 'Logged in!',
              token,
              user: result[0],
            });
          }
          return res.status(400).send({
            message: 'Name or password incorrect!',
          });
        }
      );
    }
  );
});

// http://localhost:3000/api/me
router.get('/me', userMiddleware.isLoggedIn, (req, res, next) => {
  res.send(req.userData);
});

module.exports = router;