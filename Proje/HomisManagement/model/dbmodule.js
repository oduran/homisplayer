//  dbmodule.js
/*
Manages db activities.
*/
var DbManager = function()
{
  /*Variables*/
  var dbName = 'homis';
  var assert = require('assert');
  var ObjectID = require('mongodb').ObjectID;
  var Db = require('mongodb').Db;
  var Connection = require('mongodb').Connection;
  var Server = require('mongodb').Server;
  var serverConnection = new Server("127.0.0.1", 27017, { auto_reconnect: true });
  var connectionInstance;
  
  /*Public Methods*/
  // Gets a user by given access token.
  this.getUserByAccessToken = function(accessToken,callback)
  {
    executeDbQuery(
      function(db)
      {
        var cursor = db.collection("users").find({ "accessToken": accessToken });
        var users = [];
        cursor.each(function(err, doc) {
          assert.equal(err, null);
          if (doc != null) {
            users.push(doc);
          } else {
            if(users.length === 0) 
            {
              callback(null);
            }
            else
            {
              callback(users[0]);
            }
          }
        });
      }
    );
  }
  
  // Gets a user by given access token.
  this.getUserByUsername = function(name,callback)
  {
    executeDbQuery(
      function(db)
      {
        var cursor = db.collection("users").find({ "name": name });
        var users = [];
        cursor.each(function(err, doc) {
          assert.equal(err, null);
          if (doc != null) {
            users.push(doc);
          } else {
            if(users.length === 0) 
            {
              callback(null);
            }
            else
            {
              callback(users[0]);
            }
          }
        });
      }
    );
  }
  
  // Adds a user to database.
  this.saveUser = function(user,callback)
  {
    updateInCollection("users",user,callback);
  }
  
  // Gets all users from database
  this.getUsers = function(callback)
  {
    getCollection("users",callback);
  }
  
  // Creates unique access token with using mongodb's ObjectID.
  this.createAccessToken = function()
  {
	  var newAccessToken = new ObjectID().toString();
  }
  
  /*Private methods*/
  // Gives db connection to client for query execution
  var executeDbQuery = function(callback) {
    //if already we have a connection, don't connect to database again
    if (connectionInstance) {
      callback(connectionInstance);
      console.log("db connection already exist");
      return;
    }

    var db = new Db(dbName, serverConnection);
    db.open(function(error, databaseConnection) {
      if (error) throw new Error(error);
      console.log("db connection created newly");
      connectionInstance = databaseConnection;
      callback(databaseConnection);
    });
  };
  
  // Inserts an object to db collection
  var insertToCollection = function(collectionName,objToBeInserted,callback)
  {
    executeDbQuery(
      function(db)
      {
        db.collection(collectionName).insert(objToBeInserted, function(err, records) {
          if (err) throw err;
          callback({ message: 'success'});
        });
      }
    );
  }
  
  // Gets collection by given name
  var getCollection = function(collectionName,callback)
  {
    executeDbQuery(
        function(db)
        {
          var collectionArray = [];
          var cursor =db.collection(collectionName).find();
          var i = 0;
          cursor.each(function(err, doc) {
            if(err)
            {
              res.json({"hata":err.toString()});
              return;
            }
            
            if(doc)
            {
              collectionArray.push(doc);
            }
            else
            {
              callback(collectionArray);
            }
          });
        }
      );
  }
  
  // Updates an object in db collection.
  var updateInCollection = function(collectionName, objectToUpdate, callback)
  {
    executeDbQuery(
        function(db)
        {
          console.log(JSON.stringify(objectToUpdate));
          db.collection(collectionName).save(objectToUpdate, callback);
        }
    );
  }
  
  var self = this;
}

module.exports = {
  DbManager: DbManager
}

