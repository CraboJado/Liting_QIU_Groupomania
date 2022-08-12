const express = require('express');
const app = express();
const path = require('path');
const userRoutes = require('./routes/user');
const postRoutes = require('./routes/post');
const replyRoutes = require('./routes/replies');
const errorHandler = require('./middlewares/errorHandler');


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

// error handler middleware
app.use(errorHandler);

module.exports = app;