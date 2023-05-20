const fs = require('fs');
const express = require('express');
const session = require('express-session');
const redis = require('redis');
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');

const redisClient = redis.createClient({
  host: 'localhost',
  port: 6379,
});

redisClient.on('error', (err) => {
  console.error('Redis connection error:', err);
});

const app = express();

// MongoDB connection
const url = 'mongodb+srv://U1205:<kunal>@cluster0.mongodb.net/test?retryWrites=true&w=majority';

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 50,
  },
  emailAddress: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
  },
  userImage: {
    type: String,
    trim: true,
  },
});

const User = mongoose.model('User', userSchema);

// Set up EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
  })
);

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send(`
    <html>
    <head>
      <title>Home</title>
    </head>
    <body>
      <h1>Welcome to the Home Page</h1>
      <a href="/signup.html">Signup</a>
      <br>
      <a href="/login.html">Login</a>
    </body>
    </html>
  `);
});

app.post('/signup', (req, res) => {
  // ... Signup logic
});

app.post('/login', (req, res) => {
  // ... Login logic
});

app.get('/dashboard', isLoggedIn, (req, res) => {
  const { name, userImage } = req.user;
  res.render('dashboard', { name, userImage });
});

app.get('/upload-image', isLoggedIn, (req, res) => {
  res.render('upload-image');
});

app.post('/upload-image', isLoggedIn, upload.single('userImage'), (req, res) => {
  const { id } = req.user;
  const userImage = req.file.path;
  User.findByIdAndUpdate(id, { userImage }, { new: true })
    .then(user => {
      req.user = user;
      res.redirect('/dashboard');
    })
    .catch(err => console.log(err));
});

