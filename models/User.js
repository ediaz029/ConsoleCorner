const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const util = require('util');
const bcryptCompare = util.promisify(bcrypt.compare);

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: {
    type: Boolean,
    default: false
  }
});

// Hash the password before saving the user model
UserSchema.pre('save', function(next) {
  const user = this;
  if (!user.isModified('password')) return next();

  bcrypt.hash(user.password, 10, (err, hash) => {
    if (err) return next(err);
    user.password = hash;
    next();
  });
});

UserSchema.methods.comparePassword = function(candidatePassword) {
  return bcryptCompare(candidatePassword, this.password);
};

const User = mongoose.model('User', UserSchema);

module.exports = User;