/*const express = require('express');
const router = express.Router();
const User = require('../modules/User'); // Correct path to User model
const Profile = require('../modules/profile'); // Correct path to Profile model
const authenticate = require('../middleware/authenticate'); // Middleware for authentication

// Fetch the logged-in user's profile
router.get('/user', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('profiles').select('-password'); // Populate profiles
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User profile fetched successfully', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching profile', error: err.message });
  }
});

// Add an additional profile for the logged-in user
router.post('/add-profile', authenticate, async (req, res) => {
  try {
    const { name, ageCategory } = req.body;

    // Validate input
    if (!name || !ageCategory) {
      return res.status(400).json({ message: 'Name and age category are required' });
    }

    // Ensure ageCategory is valid
    const validCategories = ['child', 'adolescence', 'adult', 'senior-adult'];
    if (!validCategories.includes(ageCategory)) {
      return res.status(400).json({ message: 'Invalid age category' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create a new profile
    const newProfile = new Profile({
      name,
      ageCategory,
      parent: req.user.id,
    });

    // Save profile and associate it with the user
    const savedProfile = await newProfile.save();
    user.profiles.push(savedProfile._id);
    await user.save();

    res.status(200).json({ message: 'Additional profile added successfully', profile: savedProfile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error adding profile', error: err.message });
  }
});

// Fetch vaccine notifications based on the user's profiles
router.get('/notifications', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('profiles').select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const notifications = [];

    // Fetch vaccines for each profile's age category
    for (const profile of user.profiles) {
      const categoryData = await Profile.findOne({ ageCategory: profile.ageCategory }); // Assuming vaccines are stored in Profile
      if (categoryData) {
        notifications.push({
          name: profile.name,
          ageCategory: profile.ageCategory,
          vaccines: categoryData.vaccines || [], // Assuming vaccines is an array in the Profile model
        });
      }
    }

    res.status(200).json({ message: 'Notifications fetched successfully', notifications });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching notifications', error: err.message });
  }
});

module.exports = router;*/
const express = require('express');
const router = express.Router();
const User = require('../modules/User');
const Profile = require('../modules/profile');
const jwt = require('jsonwebtoken');

// Middleware to authenticate and get the user
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Add a profile
router.post('/add-profile', authenticate, async (req, res) => {
  try {
    const { name, ageCategory } = req.body;

    // Find the logged-in user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create and save a new profile
    const profile = new Profile({ name, ageCategory, parent: user._id });
    await profile.save();

    // Associate the profile with the user
    user.profiles.push(profile._id);
    await user.save();

    res.status(201).json({ message: 'Profile added successfully', profile });
  } catch (err) {
    console.error('Error adding profile:', err);
    res.status(500).json({ message: 'Error adding profile' });
  }
});

// Get all profiles for the logged-in user
router.get('/profiles', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('profiles');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user.profiles);
  } catch (err) {
    console.error('Error fetching profiles:', err);
    res.status(500).json({ message: 'Error fetching profiles' });
  }
});

// Send notifications based on age category
router.post('/send-notifications', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('profiles');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate notifications based on profiles
    const notifications = user.profiles.map(profile => {
      return `Notification for ${profile.name} (${profile.ageCategory}): Vaccine update!`;
    });

    res.status(200).json({ notifications });
  } catch (err) {
    console.error('Error sending notifications:', err);
    res.status(500).json({ message: 'Error sending notifications' });
  }
});

module.exports = router;

