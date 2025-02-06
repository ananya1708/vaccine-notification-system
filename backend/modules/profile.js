/*const mongoose = require('mongoose');

// Define the schema for profiles
const profileSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'], // Adds a custom error message
      trim: true, // Removes any leading/trailing spaces
    },
    ageCategory: {
      type: String,
      required: [true, 'Age category is required'],
      enum: {
        values: ['child', 'adolescence', 'adult', 'senior-adult'], // Corrected category for consistency
        message: 'Age category must be one of: child, adolescence, adult, senior-adult',
      },
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Reference to the User model
      required: [true, 'Parent user is required'], // Custom error message for missing parent
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Export the Profile model
module.exports = mongoose.model('Profile', profileSchema);*/
const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  ageCategory: { type: String, required: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

module.exports = mongoose.model('Profile', profileSchema);
