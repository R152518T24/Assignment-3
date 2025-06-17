
const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth'); 
const taskRoutes = require('./routes/tasks');
require('dotenv').config();

const app = express();

// Middlewares
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes); 

module.exports = app;
