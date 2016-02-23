/*
  Önder ALTINTAŞ 03.02.2016
  Manages db activities.
*/
var DbManager = function(databaseName)
{
  console.log("DbManager instance was created");
  /*Variables*/
  var dbName = databaseName || 'homis';
  var ObjectID = require('mongodb').ObjectID;
  var Db = require('mongodb').Db;
  var Connection = require('mongodb').Connection;
  var Server = require('mongodb').Server;
  var serverConnection = new Server("127.0.0.1", 27017, { auto_reconnect: true });
  var connectionInstance;
  
  // Creates unique access token with using mongodb's ObjectID.
  this.createUniqueId = function()
  {
	  var uniqueId = new ObjectID().toString();
	  return uniqueId;
  }
  
  // Creates MongoDb object id with given id
  this.createObjectId = function(objectId)
  {
	  var objId = new ObjectID(objectId);
    return objId;
  }
  
  //Removes one or more items from collection with given query. Query as {} for removing all.
  this.removeFromCollection = function(collectionName, query, callback)
  {
    this.executeDbQuery(
    function(db)
    {
      db.collection(collectionName).remove(query,function(error,numberRemoved)
      {
        if(error)
        {
          console.log(error.toString());
          return;
        }
        
        console.log(numberRemoved+" removed from "+collectionName);
        callback();
      });
    });
  }
  
  /*Private methods*/
  // Gives db connection to client for query execution
  this.executeDbQuery = function(callback) 
  {
    //if already we have a connection, don't connect to database again
    if (connectionInstance) 
    {
      callback(connectionInstance);
      console.log("db connection already exist");
      return;
    }

    var db = new Db(dbName, serverConnection);
    db.open(
    function(error, databaseConnection) 
    {
      if (error) throw new Error(error);
      console.log("db connection created newly");
      connectionInstance = databaseConnection;
      callback(databaseConnection);
    });
  };
  
  // Inserts an object to db collection
  this.insertToCollection = function(collectionName,objToBeInserted,callback)
  {
    this.executeDbQuery(
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
  this.getCollection = function(collectionName,callback)
  {
    this.executeDbQuery(
      function(db)
      {
        var collectionArray = [];
        var cursor =db.collection(collectionName).find();
        var i = 0;
        cursor.each(function(err, doc) {
          if(err)
          {
            res.json({message:err.toString()});
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
  this.updateInCollection = function(collectionName, objectToUpdate, callback)
  {
    this.executeDbQuery(
      function(db)
      {
        db.collection(collectionName).save(objectToUpdate, callback);
      }
    );
  }
  
  var self = this;
}

module.exports = {
  DbManager: DbManager
}

