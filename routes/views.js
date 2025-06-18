const express = require('express');
const User = require('../models/user');
const Task = require('../models/tasks');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const router = express.Router();

// Register Page
router.get('/register', (req, res) => res.render('register'));
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  await User.create({ username, password: hash });
  res.redirect('/login');
});

// Login Page
router.get('/login', (req, res) => res.render('login'));
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.send('Invalid login');
  }
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  res.cookie('token', token).redirect('/tasks');
});

// Middleware to protect UI
function protect(req, res, next) {
  const token = req.cookies?.token;
  if (!token) return res.redirect('/login');
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.redirect('/login');
  }
}

// Tasks Page
router.get('/tasks', protect, async (req, res) => {
  const tasks = await Task.find({ owner: req.user.id });
  res.render('tasks', { tasks });
});

router.post('/tasks', protect, async (req, res) => {
  await Task.create({ title: req.body.title, owner: req.user.id });
  res.redirect('/tasks');
});

router.post('/tasks/:id', protect, async (req, res) => {
  await Task.findOneAndUpdate({ _id: req.params.id, owner: req.user.id }, { status: req.body.status });
  res.redirect('/tasks');
});

module.exports = router;
