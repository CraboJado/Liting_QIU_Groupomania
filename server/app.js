const express = require('express');
const app = express();
const path = require('path');
const helmet = require('helmet');
const userRoutes = require('./routes/user');
const postRoutes = require('./routes/post');
const commentRoutes = require('./routes/comments')
const dptRoutes = require('./routes/departments');
const positionRoutes = require('./routes/positions')
const errorHandler = require('./middlewares/errorHandler');


// app helmet middleware to enforce security
app.use(helmet());

// handle cors problem
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
})

// body parser
app.use(express.json());

// middleware for static files
app.use(express.static(path.join(__dirname, 'public')));

// user routes
app.use('/api/auth',userRoutes);

// post routes
app.use('/api/posts',postRoutes);

// comment routes
app.use('/api/comments',commentRoutes);

// departments routes
app.use('/api/dpt', dptRoutes);

// departments routes
app.use('/api/position', positionRoutes);

// error handler middleware
app.use(errorHandler);

module.exports = app;