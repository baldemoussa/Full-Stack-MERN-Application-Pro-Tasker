const { Schema, model } = require('mongoose');
const bcrypt = require('bcrypt');
 
const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/.+@.+\..+/, 'Must use a valid email address'],
  },
  password: {
    type: String,
    required: true,
    minlength: 5,
  },
  role: {
    type: String,
    required: true,
    enum: ['admin', 'user'],
    default: 'user',
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  position: {
    type: String,
    required: true,
    trim: true,
  },
  profilePhoto: {
    type: String,
    default: '',
    maxlength: [700000, 'Profile photo is too large'],
    validate: {
      validator(value) {
        if (!value) {
          return true;
        }
        return value.startsWith('data:image/') || /^https?:\/\/.+/i.test(value);
      },
      message: 'Profile photo must be an image',
    },
  },
}, {
  timestamps: true
});
 
// hash user password
userSchema.pre('save', async function () {
  if (this.isNew || this.isModified('password')) {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }
});
 
// custom method to compare and validate password for logging in
userSchema.methods.isCorrectPassword = async function (password) {
  return bcrypt.compare(password, this.password);
};
 
const User = model('User', userSchema);
 
module.exports = User;