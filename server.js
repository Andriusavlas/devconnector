const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');

// route files
const users = require('./routes/api/users');
const profile = require('./routes/api/profile');
const posts = require('./routes/api/posts');

// creates a server
const app = express();

// Body parser middleware
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

// db config
const db = require('./config/keys').mongoURI;

// connect to mongoDB
mongoose.connect(db).then(() => {
    console.log('MongoDB Connected');
}).catch(err => console.log(err));

// Passport middleware
app.use(passport.initialize());

// Passport config
require('./config/passport')(passport);

// use routes
app.use('/api/users', users);
app.use('/api/profile', profile);
app.use('/api/posts', posts);

// declaring port - either given by the server or 5000
const port = process.env.port || 5000;

// runs the server
app.listen(port, () => console.log(`Server running on port: ${port}`));