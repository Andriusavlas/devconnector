const express = require('express');
const mongoose = require('mongoose');

// route files
const users = require('./routes/api/users');
const profile = require('./routes/api/profile');
const posts = require('./routes/api/posts');

// creates a server
const app = express();

// db config
const db = require('./config/keys').mongoURI;

// connect to mongoDB
mongoose.connect(db).then(() => {
    console.log('MongoDB Connected');
}).catch(err => console.log(err));

app.get('/', (req, res) => res.send('Hello World'));

// use routes
app.use('/api/users', users);
app.use('/api/profile', profile);
app.use('/api/posts', posts);

// declaring port - either given by the server or 5000
const port = process.env.port || 5000;

// runs the server
app.listen(port, () => console.log(`Server running on port: ${port}`));