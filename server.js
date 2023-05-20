const mongoose = require('mongoose');
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
    maxlength: 50
  },
  emailAddress: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    trim: true
  },
  userImage: {
    type: String,
    trim: true
  }
});

const User = mongoose.model('User', userSchema);

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

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}
