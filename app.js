require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const mongoose = require('mongoose');
const User = require('./models/User');
const bodyParser = require('body-parser');
const uri = "mongodb+srv://ediazj03:rT2LNVMxD1foz2vo@cluster0.boethos.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
app.set('view engine', 'ejs');
const session = require('express-session');

mongoose.connect(uri)
  .then(() => console.log('Database connected!'))
  .catch(err => console.log(err));

app.use('/stylesheets', express.static(path.join(__dirname, 'stylesheets')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/scripts', express.static(path.join(__dirname, 'scripts')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));

app.get('/', (req, res) => {
  res.render('login');
});

app.get('/register', function(req, res) {
  res.sendFile(path.join(__dirname, 'views', 'register.html'));
});

// Registration route
app.post('/register', function(req, res) {
  const newUser = new User({
    email: req.body.email,
    password: req.body.password
  });

  newUser.save()
    .then(user => {
      console.log('User registered successfully:', user);
      res.redirect('/');
    })
    .catch(err => {
      console.log('Error saving user:', err);
      res.status(500).send('Error registering new user.');
    });
});
  
  // Login route
  app.post('/login', async function(req, res) {
    try {
      const user = await User.findOne({ email: req.body.email });
      if (!user) {
        return res.render('login', { errorMessage: 'User not found.' });
      }
  
      const isMatch = await user.comparePassword(req.body.password);
      if (!isMatch) {
        return res.render('login', { errorMessage: 'Incorrect password.' });
      }
  
      req.session.regenerate(function(err) {
        if (err) {
          return res.render('login', { errorMessage: 'Error logging in.' });
        }
  
        // Set any session data here, e.g.:
        req.session.userId = user._id;
  
        res.redirect('/index');
      });
    } catch (err) {
      res.render('login', { errorMessage: 'Error logging in.' });
    }
  });

app.get('/index', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }

  res.set('Cache-Control', 'no-store');

  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/logout', function(req, res) {
  req.session.destroy(function(err) {
    if (err) {
      console.log(err);
    } else {
      res.redirect('/');
    }
  });
});

app.get('/featured', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'featured.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin.html'));
});

app.listen(4000, () => {
    console.log("listening to port 4000");
});