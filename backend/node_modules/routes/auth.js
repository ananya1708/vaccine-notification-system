const express = require('express');
const router = express.Router();
const argon2 = require('argon2'); // Import Argon2
const jwt = require('jsonwebtoken');

// Mock user data storage (use a real database in production)
const users = [];

// Secret key for JWT (store securely in production)
const JWT_SECRET = '7f23997fdd028f59d826bda3892be6ff3442d02b922aa555ab6644b236d3f7c247424c48d4f08de7e8b98d6ec70844b392cbc887a900cf64fac2c15915807968';

// Register route
router.post('/register', async (req, res) => {
  const { username, password, ageCategory } = req.body;

  // Validate input
  if (!username || !password || !ageCategory) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  // Check if username already exists
  const existingUser = users.find((user) => user.username === username);
  if (existingUser) {
    return res.status(409).json({ message: 'Username already exists.' });
  }

  try {
    // Hash the password using Argon2
    const hashedPassword = await argon2.hash(password);

    // Save user
    users.push({ username, password: hashedPassword, ageCategory });
    res.status(201).json({ message: 'User registered successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error registering user.' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Validate input
  if (!username || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  // Find user
  const user = users.find((user) => user.username === username);
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  try {
    // Compare password using Argon2
    const isMatch = await argon2.verify(user.password, password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Generate token
    const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ message: 'Login successful!', token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error logging in.' });
  }
});

module.exports = router;
