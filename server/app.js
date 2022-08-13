const express = require('express');
const app = express();
const path = require('path');
const helmet = require('helmet');
const userRoutes = require('./routes/user');
const postRoutes = require('./routes/post');
const replyRoutes = require('./routes/replies');
const dptRoutes = require('./routes/departments')
const errorHandler = require('./middlewares/errorHandler');

// app helmet middleware to enforce security
app.use(helmet());

// body parser
app.use(express.json());

// middleware for static files
app.use(express.static(path.join(__dirname, 'public')));

// user routes
app.use('/api/auth',userRoutes);

// post routes
app.use('/api/posts',postRoutes);

// comment routes
app.use('/api/replies',replyRoutes);

// departments routes
app.use('/api/dpt', dptRoutes);

// error handler middleware
app.use(errorHandler);

module.exports = app;