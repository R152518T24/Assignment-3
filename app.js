const path = require('path');
const methodOverride = require('method-override');
const session = require('express-session');
const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth'); 
const taskRoutes = require('./routes/tasks');
require('dotenv').config();

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public'))); // for CSS
app.use(session({ secret: 'todo_secret', resave: false, saveUninitialized: true }));


// Middlewares
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('Todo app is alive');
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes); 

module.exports = app;
