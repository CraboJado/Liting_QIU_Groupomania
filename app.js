const express = require('express');
const app = express();
const path = require('path');
const userRoutes = require('./routes/user');
const postRoutes = require('./routes/post')
const errorHandler = require('./middlewares/errorHandler');


// body parser
app.use(express.json());

// middleware for static files
app.use(express.static(path.join(__dirname, 'public')));
console.log(__dirname + '\\public');
console.log(path.join(__dirname, 'public'));

// user routes
app.use('/api/auth',userRoutes);

// post routes
app.use('/api/posts',postRoutes)

app.use(errorHandler);

module.exports = app;