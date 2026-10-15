// Register, login, the current profile, profile edits, and password changes.
const { User } = require('../models');
const { signToken } = require('../utils/auth');

// The profile returned by register, login, and /me. The hash stays on the document.
function presentUser(user) {
  const profile = user.toObject();
  delete profile.password;
  return profile;
}

// Creates the account and returns a token so the new person lands on the board.
async function registerUser(req, res) {
  try {
    const user = await User.create(req.body);
    const token = signToken(user);
    res.status(201).json({ token, user: presentUser(user) });
  } catch (err) {
    res.status(400).json(err);
  }
}

// Checks the email, then the password. The two failures use different messages.
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
    res.json({ token, user: presentUser(user) });
  } catch (err) {
    res.status(400).json(err);
  }
}

// The header reads this profile. The password hash is left out.
async function getMe(req, res) {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'No user found with this id!' });
    }
    res.json(presentUser(user));
  } catch (err) {
    res.status(400).json(err);
  }
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Name, position, username, email, and photo. Role and password stay on their own routes.
async function updateMe(req, res) {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'No user found with this id!' });
    }

    const fullName = typeof req.body.fullName === 'string' ? req.body.fullName.trim() : '';
    const position = typeof req.body.position === 'string' ? req.body.position.trim() : '';
    const username = typeof req.body.username === 'string' ? req.body.username.trim() : '';
    const email = typeof req.body.email === 'string' ? req.body.email.trim() : '';
    if (!fullName || !position || !username || !email) {
      return res.status(400).json({ message: 'Full name, position, username, and email are required.' });
    }
    if (!/.+@.+\..+/.test(email)) {
      return res.status(400).json({ message: 'Must use a valid email address' });
    }

    const usernameTaken = await User.findOne({ username, _id: { $ne: user._id } });
    if (usernameTaken) {
      return res.status(400).json({ message: 'That username is already used.' });
    }
    const emailTaken = await User.findOne({
      email: new RegExp(`^${escapeRegex(email)}$`, 'i'),
      _id: { $ne: user._id },
    });
    if (emailTaken) {
      return res.status(400).json({ message: 'That email is already used.' });
    }

    user.fullName = fullName;
    user.position = position;
    user.username = username;
    user.email = email;
    if (typeof req.body.profilePhoto === 'string') {
      user.profilePhoto = req.body.profilePhoto;
    }

    await user.save();
    const fresh = await User.findById(user._id).select('-password');
    res.json(presentUser(fresh));
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(400).json({ message: 'That username or email is already used.' });
    }
    res.status(400).json(err);
  }
}

// Requires the current password. The token issued at login remains valid.
async function changePassword(req, res) {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'No user found with this id!' });
    }

    const currentPassword = typeof req.body.currentPassword === 'string' ? req.body.currentPassword : '';
    const newPassword = typeof req.body.newPassword === 'string' ? req.body.newPassword : '';
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required.' });
    }
    if (newPassword.length < 5) {
      return res.status(400).json({ message: 'Password must be at least 5 characters.' });
    }
    if (currentPassword === newPassword) {
      return res.status(400).json({ message: 'Choose a different password.' });
    }

    const correctPw = await user.isCorrectPassword(currentPassword);
    if (!correctPw) {
      return res.status(400).json({ message: 'Wrong password!' });
    }

    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated.' });
  } catch (err) {
    res.status(400).json(err);
  }
}

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateMe,
  changePassword,
};
