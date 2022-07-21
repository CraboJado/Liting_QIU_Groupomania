const express = require('express');
const app = express();
const userRoutes = require('./routes/user');
const errorHandler = require('./middlewares/errorHandler')

// body parser
app.use(express.json());

// middleware for static files
app.use(express.static(__dirname + '/public'));

// user routes
app.use('/api/auth',userRoutes);

app.use(errorHandler);

module.exports = app;