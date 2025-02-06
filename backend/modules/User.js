const mongoose = require('mongoose');

// User Schema
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'], // Adds a custom error message
      unique: true, // Ensure no duplicate usernames
      trim: true, // Removes leading/trailing spaces
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'], // Minimum length validation
    },
    ageCategory: {
      type: String,
      required: [true, 'Age category is required'], // User's age category
      enum: {
        values: ['child', 'adolescence', 'adult', 'senior-adult'], // Consistent values with Profile
        message: 'Age category must be one of: child, adolescence, adult, senior-adult',
      },
    },
    profiles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile', // Link to Profile model
      },
    ],
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Export the User model
const User = mongoose.model('User', userSchema);
module.exports = User;
