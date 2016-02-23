var bcrypt = require('bcryptjs');

// Encrypts given password.
var cryptPassword = function(password, callback) {
   bcrypt.genSalt(10, function(err, salt) {
    if (err) 
      return callback(err);

    bcrypt.hash(password, salt, function(err, hash) {
      return callback(err, hash);
    });

  });
};

// Compares given password with encrypted password.
var comparePassword = function(password, encryptedPassword, callback) {
   bcrypt.compare(password, encryptedPassword, function(err, isPasswordMatch) {
      if (err) 
        return callback(err);
      return callback(null, isPasswordMatch);
   });
};

module.exports = {
  cryptPassword: cryptPassword,
  comparePassword: comparePassword
};
