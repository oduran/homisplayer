/**
 * Creates an instance of HomisWebServiceManager.
 * @class
 * @classdesc Manages web services.
 * Önder ALTINTAŞ 03.02.2016
 * @param {DbManager} dbManager - Database manager object to handle database operations.
 * @param {string} rootDir - Root directory to save the media files.
 */
var HomisWebServiceManager = function(router)
{
  /* Variables */
  var router = router;
  var mediaResourceDir = __dirname + "/mediaresources/";
  var DefaultLocalization = require('../localization/tr').Localization;
  var HomisDbManager = require('../model/homisdbmodule').HomisDbManager;
  var PassManager = require('../util/passutil').PassManager;
  var HomisMediaUploadManager = require('./homismediauploadmodule').HomisMediaUploadManager;
  var dbManager = new HomisDbManager("homis");
  var mediaUploadManager = new HomisMediaUploadManager(dbManager, mediaResourceDir);
  var passManager = new PassManager();
  
  /**
   * Starts web services defined inside.
   * See webservices.txt file for usage of services on clientside.
   */
  this.start = function()
  {
    // test route to make sure everything is working (accessed at GET http://localhost:8080/service),
    setService('get','/test',test);
   
    // login to website. name, pass input, output is access token (could be as cookie in the future)
    setService('post','/login', login);router.post('/login', login);
   
    // creates user.
    setService('post', '/saveuser', saveUser);
    
    // deletes user.
    setService('post', '/deleteuser', deleteUser);
    
    // get all users, passwords and access tokens are removed.
    setService('post', '/getusers', getUsers);
	
    // get a user which access token was given.
    setService('post', '/getuser', getUser);
    
    // creates workspace for user with given access token and workspace object.
    setService('post', '/saveworkspace', saveWorkspace);
    
    // creates workspace for user with given access token and workspace object.
    setService('post', '/getworkspace', getWorkspace);
    
    // save mediaresources for user with given access token or admin with given userid
    setService('post', '/savemediaresource', mediaUploadManager.saveMediaResource);
    
    // Register player for the first time.
    setService('post', '/registerplayer', registerPlayer);
    
    // Get players with using user authority.
    setService('post', '/getplayers', getPlayers);
    
    // Get players with using user authority.
    setService('post', '/getplayer', getPlayer);
    
    //Update player with using user authority.
    setService('post', '/updateplayer', updatePlayer);
    
  };
  
  /* Private Methods */
  /**
  * Logs user in. 
  * Creates access token cookie for the user for season or for 1 month.
  * @param {Request} req - Node request object.
  * @param {Response} res - Node response object.
  * @param {Next} next - Node next object. Not being used right now, just for convention atm.
  * @param {Localization} Localization - Localization object that holds localized message strings.
  */
  var login = function (req, res, next, Localization)
  {
    var name = req.body.name;
    var password = req.body.password;
    var rememberMe = req.body.rememberMe;
    dbManager.getUserByName(name, function(user)
    {
      if(!user)
      {
        res.json({ message: Localization.userNotFoundError });
        return;
      }
	  
      passManager.comparePassword(password, user.password,function(error,passwordMatch){
        if(error)
        {
          res.json({message:error.toString()});
          return;
        }
        
        if(passwordMatch)
        {
          user.accessToken = dbManager.createUniqueId();
          dbManager.saveUser(user, function()
          {
            res.clearCookie();
            res.cookie('accessToken', user.accessToken, {});
            if(stringToBool(rememberMe))
            {
              res.clearCookie();
              res.cookie('accessToken', user.accessToken, { maxAge :  2590000000 });
            }
            
            res.json({accessToken: user.accessToken});
          });
        }
        else
        {
          res.json({message:Localization.wrongPasswordError});
        }
      });
    });
  };
  
  /**
  * Saves a user. If it doesn't exist inserts new record. If it does exist updates current user.
  * TO DO: Divide this function to atomic pieces plx. --önder
  * @param {Request} req - Node request object.
  * @param {Response} res - Node response object.
  * @param {Next} next - Node next object. Not being used right now, just for convention atm.
  * @param {Localization} Localization - Localization object that holds localized message strings.
  */
  var saveUser = function (req, res, next, Localization)
  {
    var returnObj = {message:Localization.success};
    var accessToken = req.cookies.accessToken;
    dbManager.getUserByAccessToken(accessToken, function(operator)
    {
      if(!operator)
      {
        res.json({message: Localization.noPermissionError});
        return;
      }
      var newUser = req.body.user;
      if(operator.type == "admin" || operator.name === newUser.name)
      {
        if(newUser._id)
        {
          newUser.workspaces = (newUser.workspaces)? newUser.workspaces : [];
          newUser.players = (newUser.players)? newUser.players : [];
          newUser.mediaResources = (newUser.mediaResources)? newUser.mediaResources : [];
          if(newUser.workspaces)
          {
            for(var i = 0; i< newUser.workspaces.length; i++)
            {
              if(!newUser.workspaces[i].workspaceId)
              {
                newUser.workspaces[i].workspaceId = dbManager.createUniqueId();
                returnObj = {workspaceId: newUser.workspaces[i].workspaceId};
              }
            }
          }
          
          dbManager.getUserById(newUser._id,function(existingUser)
          {
            dbManager.getPlayers(function(players)
            {
              var playersToBeUpdated = [];
              players = players ? players : [];
              for(var i = 0; i< players.length; i++)
              {
                var playerFromDb = players[i];
                for(var j = 0; j< newUser.players.length; j++)
                {
                  var playerFromUser = newUser.players[j];
                  if(playerFromDb.playerId === playerFromUser.playerId)
                  {
                    playersToBeUpdated.push(playerFromUser);
                  }
                }
              }
              
              if(playersToBeUpdated.length)
              {
                dbManager.savePlayers(playersToBeUpdated, function(numberOfUpdates)
                {
                  updateUser(newUser, existingUser, res, returnObj, Localization);
                });
              }
              else
              {
                updateUser(newUser, existingUser, res, returnObj, Localization);
              }
            });
          });
        }
        else
        {
          newUser.workspaces = [];
          newUser.players = [];
          newUser.mediaResources = [];
          insertUser(newUser,res, Localization);
        }
      }
      else
      {
        res.json({message: Localization.noPermissionError});
      }
    });
  };
  
  /**
  * Validate user's attributes with application criterias.
  * @param {User} user - User object to be validated.
  * @param {Localization} Localization - Localization object that holds localized message strings.
  */
  var validateUser = function(user, Localization)
  {
    if(!user.password)
    {
      return Localization.newUserPasswordRequiredError;
    }
    
	  if(user.name.length <= 0)
	  {
		  return Localization.nameEmptyError;
	  }
	  
	  if(user.password.length <= 0)
	  {
		  return Localization.passwordEmptyError;
	  }
	  
	  if(user.password.length < 6)
	  {
      return Localization.passwordLengthError;
	  }
	  
	  return Localization.valid;
  };
  
  /**
  * Inserts a new user. Used by saveUser method.
  * @param {User} user - User object to be validated.
  * @param {Response} res - Node response object.
  * @param {Localization} Localization - Localization object that holds localized message strings.
  */
  var insertUser = function(user, res, Localization)
  {
    var validMessage = validateUser(user, Localization);
    if(validMessage == Localization.valid)
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
          dbManager.saveUser(user,
            function(success)
            {
              res.json({message: Localization.success});
            }
          );
        }
      );
    }
    else
    {
      res.json({message: validMessage});
      return;				  
    }
  };
  
  /**
  * Update's already existing user. Used by saveUser method.
  * @param {User} user - User object to be validated.
  * @param {User} existingUser - The user which is already exist at db.
  * @param {ReturnObject} returnObj - An object which will be returned to the client. Holds "message" property and value inside.
  * @param {Localization} Localization - Localization object that holds localized message strings.
  */
  var updateUser = function(user, existingUser, res, returnObj, Localization)
  {
    var returnObj = returnObj || {message: Localization.success};
    user._id = existingUser._id;
    if(!user.accessToken && existingUser.accessToken)
    {
      user.accessToken = existingUser.accessToken;
    }
    
    if(user.password)
    {
      passManager.cryptPassword(user.password, function(error, encryptedPassword)
      {
        if(error)
        {
          res.json({message: error.toString()});
        }
        
        user.password = encryptedPassword;
        dbManager.saveUser(user,
          function(success)
          {
            res.json(returnObj);
          }
        );
      });
    }
    else
    {
      user.password = existingUser.password;
      dbManager.saveUser(user,
        function(success)
        {
          res.json(returnObj);
        }
      );
    }
  };
  
  /**
  * Deletes user.
  * @param {Request} req - Node request object.
  * @param {Response} res - Node response object.
  * @param {Next} next - Node next object. Not being used right now, just for convention atm.
  * @param {Localization} Localization - Localization object that holds localized message strings.
  */
  var deleteUser = function(req, res, next, Localization)
  {
    var accessToken = req.cookies.accessToken;
    var name = req.body.name;
    dbManager.getUserByAccessToken(accessToken, 
    function(operator)
    {
      if(!operator)
      {
        res.json({message:Localization.noAccessTokenError});  
      }
      
      if(operator.type == "admin")
      {
        dbManager.removeUserByName(name, 
        function(){
          res.json({message : Localization.success});
        });
      }
      else
      {
        res.json({message: Localization.noPermissionError});
      }
    });
  };
  
  /**
  * Brings all the users to the client.
  * @param {Request} req - Node request object.
  * @param {Response} res - Node response object.
  * @param {Next} next - Node next object. Not being used right now, just for convention atm.
  * @param {Localization} Localization - Localization object that holds localized message strings.
  */
  var getUsers = function(req, res, next, Localization) 
  {
    var accessToken = req.cookies.accessToken;
    dbManager.getUserByAccessToken(accessToken, 
    function(operator)
    {
      if(!operator)
      {
        res.json({message: Localization.noPermissionError});
        return;
      }
      
      dbManager.getUsers(
      function(users)
      {
        for(var i = 0; i< users.length; i++)
        {
          users[i] = summarizeUser(users[i]);
        }
        
        res.json(users); 
      });  
    });
  };
  
  /**
  * For using with getusers service. Removes password, accessToken, workspaces, mediaresources properties from user object.
  * @param {User} user - A user object to be summarized.
  * @returns Summarized user.
  */
  var summarizeUser = function(user)
  {
    if(user.password)
    {
      delete user.password;
    }
    
    if(user.accessToken)
    {
      delete user.accessToken;
    }
    
    if(user.workspaces)
    {
      delete user.workspaces;
    }
    
    if(user.mediaResources)
    {
      delete user.mediaResources;
    }
    
    return user;
  };
  
  /**
  * Brings user when access token is given.
  * @param {Request} req - Node request object.
  * @param {Response} res - Node response object.
  * @param {Next} next - Node next object. Not being used right now, just for convention atm.
  * @param {Localization} Localization - Localization object that holds localized message strings.
  */
  var getUser = function(req, res, next, Localization) 
  {
    var accessToken = req.cookies.accessToken;
    var requiredName = req.body.name;
    dbManager.getUserByAccessToken(accessToken, function(user)
    {
      if(!user)
      {
        console.log(Localization.userNotFoundError);
        res.json({message: Localization.userNotFoundError});
        return;
      }
      
      if(user.type == "admin")
      {
        if(requiredName)
        {
          dbManager.getUserByName(requiredName, 
           function(requiredUser)
           {
             if(!requiredUser)
             {
                res.json({message: Localization.userNotFoundError});
                return;     
             }
             
              requiredUser.accessToken="";
              requiredUser.password="";
              res.json({user:requiredUser});
              return;
          });
        }
        else
        {
            user.password = "";
            user.accessToken = "";
            res.json({user:user});
        }
      }
      else
      {
        user.password = "";
        user.accessToken = "";
        res.json({user:user});
      }
    });     
  };
  
  /**
  * Creates a workspace with given access token of the user and workspace object.
  * @param {Request} req - Node request object.
  * @param {Response} res - Node response object.
  * @param {Next} next - Node next object. Not being used right now, just for convention atm.
  * @param {Localization} Localization - Localization object that holds localized message strings.
  */
  var saveWorkspace = function (req, res, next, Localization)
  {
    var accessToken = req.cookies.accessToken;
    var workspaceToSave = req.body.workspace;
    var workspaceOwnerName = req.body.name;

    dbManager.getUserByAccessToken(accessToken, 
    function(user)
    {
      if(user === null)
      {
        res.json({message: Localization.noPermissionError});
        return;
      }
      
      if(req.body.name)
      {
        if(user.type !== "admin")
        {
          res.json({message: Localization.noPermissionError});
          return;
        }
        
        dbManager.getUserByName(workspaceOwnerName,function(workspaceOwner)
        {
          saveWorkspaceToUser(workspaceToSave,workspaceOwner,res,Localization);
        });
        
        return;
      }
      
      saveWorkspaceToUser(workspaceToSave,user,res,Localization)
    });
  };
  
  /**
  * Saves workspace to user
  * @param {Workspace} workspaceToSave - Workspace to be saved.
  * @param {User} user - Owner of workspace.
  * @param {Response} res - Node response object.
  * @param {Localization} Localization - Localization object that holds localized message strings.
  */
  var saveWorkspaceToUser = function(workspaceToSave, user, res, Localization)
  {
    var returnObj = {message: Localization.success};
    var workspaceExist = false;
    user.workspaces = (user.workspaces)? user.workspaces: [];
    user.players = (user.players)? user.players: [];
    for(var i = 0;i < user.workspaces.length; i++)
    {
      if(user.workspaces[i].workspaceId === workspaceToSave.workspaceId)
      {
        user.workspaces[i] = workspaceToSave;
        // Check if workspace is already assigned to players of user. If yes then update workspace of players.
        for(var j = 0; j < user.players.length; j++)
        {
          if(user.players[j].workspace)
          {
            if(user.players[j].workspace.workspaceId === workspaceToSave.workspaceId)
            {
              console.log("değiştirilecek olan workspace ile playerda bulunan workspace aynı");
              workspaceToSave.downloaded = false;
              user.players[j].workspace = workspaceToSave;
              dbManager.savePlayer(user.players[j],function(){
                console.log("Player workspace update edildi.");
              });
            }
          }
        }
        
        // If user type is admin, workspace could be at other users' players as well, check em.
        if(user.type === "admin")
        {
          dbManager.getUsers(
          function(users)
          {
            var usersToUpdate = [];
            for(var i = 0; i< users.length; i++)
            {
              var otherUser = users[i];
              otherUser.players = (otherUser.players)? otherUser.players: [];
              for(var j = 0; j < otherUser.players.length; j++)
              {
                if(otherUser.players[j].workspace.workspaceId === workspaceToSave.workspaceId)
                {
                  if(otherUser.name === user.name)
                  {
                    otherUser = user;
                  }
                  
                  workspaceToSave.downloaded = false;
                  otherUser.players[j].workspace = workspaceToSave;
                  dbManager.savePlayer(otherUser.players[j],function(){});
                  if(otherUser.name === user.name)
                  {
                    user = otherUser
                  }
                  else
                  {
                    dbManager.saveUser(otherUser,function(){});
                  }
                }
              }
            }
          }); 
        }
        
        workspaceExist = true;
      }
    }
        
    if(!workspaceExist)
    {
      workspaceToSave.workspaceId = dbManager.createUniqueId();
      returnObj = {workspaceId : workspaceToSave.workspaceId};
      user.workspaces.push(workspaceToSave);
    }

    dbManager.saveUser(user,
      function()
      {
        res.json(returnObj);
        return;
      }
    );
  }
  
  /**
  * Gets a workspace with given access token of the user and workspace id.
  * @param {Request} req - Node request object.
  * @param {Response} res - Node response object.
  * @param {Next} next - Node next object. Not being used right now, just for convention atm.
  * @param {Localization} Localization - Localization object that holds localized message strings.
  */
  var getWorkspace = function (req, res, next, Localization)
  {
    var accessToken = req.cookies.accessToken;
    var workspaceId = req.body.workspaceId;
    var name = req.body.name;
    dbManager.getUserByAccessToken(accessToken, 
      function(user)
      {
        if(user === null)
        {
          res.json({message: Localization.noPermissionError});
        }
        
        if(user.type === "admin" && name)
        {
          dbManager.getUserByName(name,function(anotherUser)
          {
            var result = getWorkspaceFromUser(anotherUser,workspaceId);
            res.json(result);
            return;
          });
          
          return;
        }
        
        var result = getWorkspaceFromUser(user,workspaceId)
        res.json(result);
      }
    );
  };
  
  /**
  * Gets a workspace from user object with using workspace Id.
  * @param {User} user - User object to search.
  * @param {string} workspaceId - Id of the workspace.
  * @returns {object} Json object to return as result to client.
  */
  var getWorkspaceFromUser = function(user,workspaceId)
  {
    if(typeof user.workspaces === 'undefined')
    {
      return {message: Localization.noWorkspaceError};
    }
    
    user.workspaces = (user.workspaces)? user.workspaces: [];
    for(var i = 0; i<user.workspaces.length; i++)
    {
      if(user.workspaces[i].workspaceId == workspaceId)
      {
        return user.workspaces[i];
      }
    }
    
    return {message: Localization.workspaceNotFoundError };
  }
  
  /**
  * Registers player to the system.
  * @param {Request} req - Node request object.
  * @param {Response} res - Node response object.
  * @param {Next} next - Node next object. Not being used right now, just for convention atm.
  * @param {Localization} Localization - Localization object that holds localized message strings.
  */
  var registerPlayer = function(req, res, next, Localization)
  {
    var playerName = req.body.playerName;
    var playerHardwareId = req.body.playerHardwareId;
    var playerState = req.body.playerState;
    var playerLastSeen = req.body.playerLastSeen;
    var playerId = dbManager.createUniqueId();
    var player = {
      playerName: playerName,
      playerHardwareId: playerHardwareId,
      playerId: playerId,
      playerState: playerState,
      playerLastSeen: playerLastSeen,
    }
    dbManager.getPlayerByName(playerName, function(existPlayer)
    {
      if(existPlayer)
      {
        console.log(existPlayer);
        res.json({message:Localization.playerAlreadyExistError});
        return;
      }
      
      dbManager.savePlayer(player,
        function(){
          res.json({playerId:playerId});
        });
    });
  }
  
  var updatePlayer = function(req, res, next, Localization)
  {
    var playerId = req.body.playerId;
    var playerState = req.body.playerState;
    var playerLastSeen = req.body.playerLastSeen;
    dbManager.getPlayerById(playerId, function(player)
    {
      if(player)
      {
        player.playerState = playerState;
        player.playerLastSeen = playerLastSeen;
        dbManager.savePlayer(player,
        function(){
          res.json({playerId:playerId});
        });
      }
    });
  }

  /**
  * Serves all the players with given access token. 
  * If the user is admin, then userless players will also be returned.
  * @param {Request} req - Node request object.
  * @param {Response} res - Node response object.
  * @param {Next} next - Node next object. Not being used right now, just for convention atm.
  * @param {Localization} Localization - Localization object that holds localized message strings.
  */
  var getPlayers = function(req,res,next,Localization)
  {
      var accessToken = req.cookies.accessToken;
      dbManager.getUserByAccessToken(accessToken,function(user)
      {
        var query;
        if(user.type==="user")
        {
          query={owner:user.name};
        }
        
        dbManager.getPlayers(function(players)
        {
          res.json({players:players});
        },query);
      });
  }
  
  /**
  * Serves player with given playerId. 
  * If the user is admin, then userless players will also be returned.
  * @param {Request} req - Node request object.
  * @param {Response} res - Node response object.
  * @param {Next} next - Node next object. Not being used right now, just for convention atm.
  * @param {Localization} Localization - Localization object that holds localized message strings.
  */
  var getPlayer = function (req,res,next,Localization)
  {
    var playerId = req.body.playerId;
    dbManager.getPlayerById(playerId, function(player)
    {
      if(player)
      {
        res.json({player:player});
      }
    });
  }
  

  /**
  * Sets the service with given service type, route and function. 
  * Adds localization with using request language header.
  * @param {string} serviceType - Type of the service. get,post,put,delete are valid values.
  * @param {string} serviceRoute - Route string for web service name. E.g. "/save".
  * @param {Function} serviceFunction - Function to be executed when service is called by the client
  */
  var setService = function(serviceType, serviceRoute, serviceFunction)
  {
    if(serviceType === 'get')
    {
      router.get(serviceRoute, serviceFunction);
    }
    else if(serviceType === 'post')
    {
      router.post(serviceRoute, function(req,res,next)
      {
        var acceptedLanguage = req.headers["accept-language"];
        var Localization = DefaultLocalization;
        if(acceptedLanguage.length === 2)
        {
          Localization = require('../localization/'+acceptedLanguage).Localization;
        }
        //TODO: set localization give it to function.
        serviceFunction(req,res,next,Localization);
      });
    }
  }
  
  
  /**
  * Converts string true false to bool true false. other values returned as false.
  * @param {string} boolString - String to be converted.
  * @returns {bool} Converted result value.
  */
  var stringToBool = function(boolString)
  {
    return (boolString === "true")? true : false;
  };
  
  /**
  * Just a web service test.
  * @param {Request} req - Node request object.
  * @param {Response} res - Node response object.
  * @param {Next} next - Node next object. Not being used right now, just for convention atm.
  * @param {Localization} Localization - Localization object that holds localized message strings.
  */
  var test = function(req, res, next, Localization) 
  {
    res.json({ message: Localization.working});
  };
  
  var self = this;
};

module.exports = 
{
  HomisWebServiceManager : HomisWebServiceManager
};
