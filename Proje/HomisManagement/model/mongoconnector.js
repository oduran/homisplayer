var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
//the MongoDB connection
var connectionInstance;

executeDbQuery = function(callback) {
  //if already we have a connection, don't connect to database again
  if (connectionInstance) {
    callback(connectionInstance);
    console.log("db connection already exist");
    return;
  }

  var db = new Db('homis', new Server("127.0.0.1", 27017, { auto_reconnect: true }));
  db.open(function(error, databaseConnection) {
    if (error) throw new Error(error);
    console.log("db connection created newly");
    connectionInstance = databaseConnection;
    callback(databaseConnection);
  });
};

module.exports = {
  executeDbQuery: executeDbQuery
}

/*
  //simple json record
		var document = {name:"David", title:"About MongoDB"};
	  
		//insert record
		db.collection('test').insert(document, function(err, records) {
			if (err) throw err;
			console.log("Record added as "+records[0]._id);
		});
*/
