const { User } = require('../models');
const { signToken } = require('../utils/auth');

async function registerUser(req, res) {
  try {
    const user = await User.create(req.body);
    const token = signToken(user);
    res.status(201).json({ token, user });
  } catch (err) {
    res.status(400).json(err);
  }
}

async function loginUser(req, res) {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).json({ message: "Can't find this user" });
    }

    const correctPw = await user.isCorrectPassword(req.body.password);
    if (!correctPw) {
      return res.status(400).json({ message: 'Wrong password!' });
    }

    const token = signToken(user);
    res.json({ token, user });
  } catch (err) {
    res.status(400).json(err);
  }
}

//function that loads User.findById(req.user._id).select('-password') and returns that user. If no user is found, return 404.
async function getMe(req, res) {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'No user found with this id!' });
    }
    res.json(user);
  } catch (err) {
    res.status(400).json(err);
  }
}

module.exports = {
  registerUser,
  loginUser,
  getMe,
};
