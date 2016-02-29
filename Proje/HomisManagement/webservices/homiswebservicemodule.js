/*
Önder ALTINTAŞ 03.02.2016
Manages web services.
*/
var HomisWebServiceManager = function(router)
{
  /* Variables */
  var router = router;
  var mediaResourceDir = __dirname + "/mediaresources/";
  var Localization = require('../localization/tr').Localization;
  var HomisDbManager = require('../model/homisdbmodule').HomisDbManager;
  var PassManager = require('../util/passutil').PassManager;
  var HomisMediaUploadManager = require('./homismediauploadmodule').HomisMediaUploadManager;
  var dbManager = new HomisDbManager("homis");
  var mediaUploadManager = new HomisMediaUploadManager(dbManager, mediaResourceDir);
  var passManager = new PassManager();
  
  /* Public Methods */
  // starts web services defined inside
  this.start = function()
  {
    // test route to make sure everything is working (accessed at GET http://localhost:8080/service)
    router.get('/test', test);
   
    // login to website. name, pass input, output is access token (could be as cookie in the future)
    router.post('/login', login);
   
    // creates user.
    router.post('/saveuser', saveUser);
    
    // deletes user.
    router.post('/deleteuser', deleteUser);
    
    // get all users, passwords and access tokens are removed.
    router.post('/getusers', getUsers);
	
    // get a user which access token was given.
    router.post('/getuser', getUser);
    
    // creates workspace for user with given access token and workspace object.
    router.post('/saveworkspace', saveWorkspace);
    
    // creates workspace for user with given access token and workspace object.
    router.post('/getworkspace', getWorkspace);
    
    // save mediaresources for user with given access token or admin with given userid
    router.post('/savemediaresource', mediaUploadManager.saveMediaResource);
    
  };
  
  /* Private Methods */
   // Creates a user.
  var login = function (req, res, next)
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
  
  // Saves a user. If it doesn't exist inserts new record. If it does exist updates current user.
  var saveUser = function (req, res, next)
  {
    var returnObj = {message:"success"};
    var accessToken = req.cookies.accessToken;
    dbManager.getUserByAccessToken(accessToken, function(operator)
    {
      if(!operator)
      {
        res.json({message: Localization.noPermissionError});
        return;
      }
      
      if(operator.type == "admin")
      {
        var newUser = req.body.user;
        if(newUser._id)
        {
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
            updateUser(newUser, existingUser, res, returnObj);
          });
        }
        else
        {
          insertUser(newUser,res);
        }
      }
      else
      {
        res.json({message: Localization.noPermissionError});
      }
    });
  };
  
  // Validate user's attributes with application criterias.
  var validateUser = function(user)
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
  
  // Inserts a new user. Used by saveUser method.
  var insertUser = function(user, res)
  {
    var validMessage = validateUser(user);
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
  
  // Update's already existing user. Used by saveUser method.
  var updateUser = function(user, existingUser, res, returnObj)
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
  
  // Deletes user.
  var deleteUser = function(req, res)
  {
    var accessToken = req.cookies.accessToken;
    var name = req.name;
    dbManager.getUserByAccessToken(accessToken, 
    function(operator)
    {
      if(!operator)
      {
        res.json({message:Localization.noAccessTokenError});  
      }
      
      if(operator == "admin")
      {
        dbManager.removeFromCollection("users",{name:name}, 
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
  
  // Brings all the users to the client
  var getUsers = function(req, res) 
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
  
  // For using with getusers service. Removes password, accessToken, workspaces, mediaresources properties from user object.
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
  
  // Brings user when access token is given.
  var getUser = function(req, res) 
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
               console.log(Localization.userNotFoundError);
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
  
  // Creates a workspace with given access token of the user and workspace object.
  var saveWorkspace = function (req, res, next)
  {
    var accessToken = req.cookies.accessToken;
    var workspaceToSave = req.body.workspace;
    var returnObj = {message: Localization.success};
    dbManager.getUserByAccessToken(accessToken, 
      function(user)
      {
        var workspaceExist = false;
        if(user === null)
        {
          res.json({message: Localization.noPermissionError});
          return;
        }
        
        if(!user.workspaces)
        {
          user.workspaces = [];
        }
        else
        {
          for(var i = 0;i < user.workspaces.length; i++)
          {
            if(user.workspaces[i].workspaceId == workspaceToSave.workspaceId)
            {
              user.workspaces[i] = req.body.workspace;
              workspaceExist = true;
            }
          }
        }
        
        if(!workspaceExist)
        {
          workspaceToSave.workspaceId = dbManager.createUniqueId();
          returnObj = {workspaceId : workspaceToSave.workspaceId};
          user.workspaces.push(req.body.workspace);
        }
        
        dbManager.saveUser(user,
          function()
          {
            res.json(returnObj);
            return;
          }
        );
      }
    );
  };
  
  // Gets a workspace with given access token of the user and workspace id.
  var getWorkspace = function (req, res, next)
  {
    var accessToken = req.cookies.accessToken;
    var workspaceId = req.body.workspaceId;
    dbManager.getUserByAccessToken(accessToken, 
      function(user)
      {
        if(user === null)
        {
          res.json({message: Localization.noPermissionError});
        }
        
        if(typeof user.workspaces === 'undefined')
        {
          res.json({message: Localization.noWorkspaceError});
          return;
        }
        
        for(var i = 0; i<user.workspaces.length; i++)
        {
          if(user.workspaces[i].workspaceId == workspaceId)
          {
            res.json(user.workspaces[i]);
            return;
          }
        }
        
        res.json({message: Localization.workspaceNotFoundError });
      }
    );
  };
  
  // Converts string true false to bool true false. other values returned as false.
  var stringToBool = function(boolString)
  {
    return (boolString === "true")? true : false;
  };
  
  // Just a web service test/
  var test = function(req, res) 
  {
    res.json({ message: Localization.working});
  };
  
  var self = this;
};

module.exports = 
{
  HomisWebServiceManager : HomisWebServiceManager
};