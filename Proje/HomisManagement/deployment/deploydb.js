// For deploying application to server. 
// Deletes all collections then adds required super user, admin user and a user in users collection
// Use it for caution!
var DbManager = require('../util/dbutil').DbManager;
var HomisDbManager = require('../model/homisdbmodule').HomisDbManager;
var PassManager = require('../util/passutil').PassManager;
var dbManager = new DbManager("homis");
var homisDbManager = new HomisDbManager("homis");
var passManager = new PassManager();

var DeploymentManager = function()
{

  
  this.deployDb = function()
  {
    console.log("db deployment started");
    var collectionsToBeCleared = ["users","themes","playerlogs"];
    var usersToBeInserted = [
      {name:"superuser", password:"superuser", type:"admin"},
      {name:"admin", password:"admin", type:"admin"},
      {name:"user", password:"user", type:"user"}
    ]
    clearCollections(collectionsToBeCleared, function()
    {
      addUsersToDb(usersToBeInserted);
    });
  }
  var clearCollections = function(collections,callback)
  {
    var clearedCollectionCount = 0;
    for(var i = 0; i < collections.length; i++)
    {
      dbManager.removeFromCollection(collections[i],{},function()
        {
          clearedCollectionCount++;
          if(clearedCollectionCount == collections.length)
          {
            console.log(clearedCollectionCount+" collections has been removed.");
            callback();
          }
        });
    }
  }
  
  var addUsersToDb = function(users)
  {
    var savedUserCount = 0;
    for(var i = 0;i<users.length;i++)
    {
      addUserToDb(users[i], function()
      {
        savedUserCount++;
        if(savedUserCount == users.length)
        {
          console.log("successfully inserted "+users.length+" users.\n");
          console.log("Work completed!");
          process.exit(1);
        }
      });
    }
  }
  
  var addUserToDb = function(user,callback)
  {
    passManager.cryptPassword(user.password,
      function(error, encryptedPassword)
      {
        if(error)
        {
          res.json({message:error.toString()});
          return;
        }
        
        user.password = encryptedPassword;
        homisDbManager.saveUser(user,
          function(success)
          {
            console.log("Successfully saved "+user.name);
            callback();
          }
        );
      }
    );
  }
}

process.on('uncaughtException', function (err) {
	console.log(err.message);
	console.error(err.stack);
	process.exit(1);
});

var deploymentManager = new DeploymentManager();
deploymentManager.deployDb();