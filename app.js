require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
const bodyParser = require('body-parser');
app.set('view engine', 'ejs');
const session = require('express-session');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

mongoose.connect(process.env.uri)
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
        req.session.userId = user._id;
        req.session.isAdmin = user.isAdmin;
  
        res.redirect('/index');
      });
    } catch (err) {
      res.render('login', { errorMessage: 'Error logging in.' });
    }
  });

  function checkAdmin(req, res, next) {
    if (!req.session.isAdmin) {
      return res.status(403).send('Forbidden');
    }
    next();
  }

  app.get('/index', function(req, res) {
    if (!req.session.userId) {
      return res.redirect('/login');
    }
  
    Product.find({}).then(function(products) {
      res.set('Cache-Control', 'no-store');
      res.render('index', { isAdmin: req.session.isAdmin, products: products });
    }).catch(function(err) {
      console.log(err);
    });
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

app.get('/admin/add-product', checkAdmin, function(req, res) {
  res.render('admin/add-product');
});

app.post('/admin/add-product', checkAdmin, upload.single('image'), function(req, res) {
  const product = new Product({
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    imageUrl: '/uploads/' + req.file.filename
  });

  product.save().then(function() {
    res.redirect('/index');
  }).catch(function(err) {
    console.log(err);
  });
});

app.listen(4000, () => {
    console.log("listening to port 4000");
});
