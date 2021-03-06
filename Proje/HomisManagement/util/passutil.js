
var PassManager = function(){
  var bcrypt = require('bcryptjs');

  // Encrypts given password.
  this.cryptPassword = function(password, callback) {
     bcrypt.genSalt(10, function(err, salt) {
      if (err) 
        return callback(err);

      bcrypt.hash(password, salt, function(err, hash) {
        return callback(err, hash);
      });

    });
  };

  // Compares given password with encrypted password.
  this.comparePassword = function(password, encryptedPassword, callback) {
     bcrypt.compare(password, encryptedPassword, function(err, isPasswordMatch) {
        if (err) 
          return callback(err);
        return callback(null, isPasswordMatch);
     });
  };
}


module.exports = {
  PassManager: PassManager
};
