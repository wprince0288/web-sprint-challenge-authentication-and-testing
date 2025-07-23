const router = require('express').Router();
const bcrypt = require('bcryptjs');
const db = require('../../data/dbConfig.js')
const jwt = require('jsonwebtoken');
const validation = require('./auth-middleware.js');

router.post('/register', validation, async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ message: 'username and password required' });
    }

    const existingUser = await db('users').where({ username }).first();
    if (existingUser) {
      return res.status(400).json({ message: 'username taken' });
    }

    const hash = bcrypt.hashSync(password, 8);
    const newUser = { username, password: hash };

    await db('users').insert(newUser);

    const addedUser = await db('users')
      .select('id', 'username', 'password')
      .orderBy('id', 'desc')
      .first()

    res.status(201).json(addedUser)
  } catch (err) {
    res.status(500).json({ message: 'registration failed' });
  }

  /*
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.
    DO NOT EXCEED 2^8 ROUNDS OF HASHING!

    1- In order to register a new account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel", // must not exist already in the `users` table
        "password": "foobar"          // needs to be hashed before it's saved
      }

    2- On SUCCESSFUL registration,
      the response body should have `id`, `username` and `password`:
      {
        "id": 1,
        "username": "Captain Marvel",
        "password": "2a$08$jG.wIGR2S4hxuyWNcBf9MuoC4y0dNy7qC/LbmtuFBSdIhWks2LhpG"
      }

    3- On FAILED registration due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

    4- On FAILED registration due to the `username` being taken,
      the response body should include a string exactly as follows: "username taken".
  */
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(401).json({ message: 'username and password required' });
    }

    const user = await db('users').where({ username }).first();

    if (user && bcrypt.compareSync(password, user.password)) {
      const payload = {
        id: user.id,
        username: user.username,
      };
      const secret = process.env.JWT_SECRET || 'shh';
      const token = jwt.sign(payload, secret, { expiresIn: '1d' });

      res.status(200).json({
        message: `welcome, ${username}`,
        token,
      });
    } else {
      res.status(401).json({ message: 'invalid credentials' });
    }
  } catch (err) {
    return res.status(500).json({ message: 'login failed' });
  }
});
/*
  IMPLEMENT
  You are welcome to build additional middlewares to help with the endpoint's functionality.

  1- In order to log into an existing account the client must provide `username` and `password`:
    {
      "username": "Captain Marvel",
      "password": "foobar"
    }

  2- On SUCCESSFUL login,
    the response body should have `message` and `token`:
    {
      "message": "welcome, Captain Marvel",
      "token": "eyJhbGciOiJIUzI ... ETC ... vUPjZYDSa46Nwz8"
    }

  3- On FAILED login due to `username` or `password` missing from the request body,
    the response body should include a string exactly as follows: "username and password required".

  4- On FAILED login due to `username` not existing in the db, or `password` being incorrect,
    the response body should include a string exactly as follows: "invalid credentials".
*/
module.exports = router;
