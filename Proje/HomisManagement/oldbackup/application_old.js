var passwordEncryptor = require("./util/passwordencryptor");
var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');

// Connection URL
var url = 'mongodb://localhost:27017/homis';
// Use connect method to connect to the Server
MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  console.log("Connected correctly to server");

  db.close();
});
/*encryption*/
passwordEncryptor.cryptPassword("qwe123", function(err,hash)
		{
			console.log("yer hash is="+hash);
			passwordEncryptor.comparePassword("qwe123",hash,function(error,passMatch){
				console.log(passMatch);
			});
		});


