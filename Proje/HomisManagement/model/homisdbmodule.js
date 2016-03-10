﻿/*
  Önder ALTINTAŞ 23.02.2016
  Manages homis db activities.
*/
var HomisDbManager = function(databaseName)
{
  var databaseName = databaseName || 'homis';
  var assert = require('assert');
  var DbManager = require("../util/dbutil").DbManager;
  var dbManager = new DbManager(databaseName);

  /*Public Methods*/
  // Gets a user by given access token.
  this.getUserByAccessToken = function(accessToken,callback)
  {
    dbManager.executeDbQuery(
      function(db)
      {
        var cursor = db.collection("users").find({ "accessToken": accessToken });
        var users = [];
        cursor.each(function(err, doc) {
          assert.equal(err, null);
          if (doc !== null) {
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
  };
  
  // Gets a user by given name.
  this.getUserByName = function(name,callback)
  {
    dbManager.executeDbQuery(
      function(db)
      {
        var cursor = db.collection("users").find({ "name": name });
        var users = [];
        cursor.each(function(err, doc) {
          assert.equal(err, null);
          if (doc !== null) {
            users.push(doc);
          } 
          else 
          {
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
  };
  
  // Gets a user by given user Id.
  this.getUserById = function(id,callback)
  {
    dbManager.executeDbQuery(
      function(db)
      {
        var objectId = dbManager.createObjectId(id);
        var cursor = db.collection("users").find({ "_id": objectId });
        var users = [];
        cursor.each(function(err, doc) {
          assert.equal(err, null);
          if (doc !== null) {
            users.push(doc);
          } 
          else 
          {
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
  };
  
  // Adds a user to database.
  this.saveUser = function(user,callback)
  {
    dbManager.updateInCollection("users",user,callback);
  };
  
  // Deletes user from database with given name.
  this.removeUserByName = function(name, callback)
  {
    dbManager.removeFromCollection("users",{name:name}, callback);
  }
  
  // Gets all users from database
  this.getUsers = function(callback)
  {
    dbManager.getCollection("users",callback);
  };
  
  // Adds a user to database.
  this.savePlayer = function(player,callback)
  {
    dbManager.updateInCollection("players",player,callback);
  };
  
  // Gets players who have no user.
  this.getUserlessPlayers = function(callback)
  {
    dbManager.getCollection("players",callback, {owners:{$size:0}});
  };
  
  // Gets player with given name.
  this.getPlayerByName = function(playerName, callback)
  {
    dbManager.executeDbQuery(
      function(db)
      {
        var player = db.collection("players").findOne({ "playerName": playerName },function(err,doc)
        {
          if(err)
          {
            throw err;
          }
          callback(doc);
        });
      });
  };
  
  // Creates unique access token with using mongodb's ObjectID.
  this.createUniqueId = function()
  {
	  return dbManager.createUniqueId();
  };
  
  var self = this;
};

module.exports = {
  HomisDbManager: HomisDbManager
};