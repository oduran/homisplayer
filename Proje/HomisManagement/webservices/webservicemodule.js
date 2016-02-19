//  webservicemodule.js
/*
Manages web services.
*/
var WebServiceManager = function(router)
{
  /* Variables */
  var router = router;
  var dbModule = require('../model/dbmodule');
  var passwordModule = require('../util/passmodule');
  var dbManager = new dbModule.DbManager();
  
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
    router.post('/savemediaresource', saveMediaResource);
    
  }
  
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
        res.json({message: "user doesn't exist"});
        return;
      }
	  
      passwordModule.comparePassword(password, user.password,function(error,passwordMatch){
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
          res.json({message:"wrong password"});
        }
      });
    });
  };
  
  // Saves a user. If it doesn't exist inserts new record. If it does exist updates current user.
  var saveUser = function (req, res, next)
  {
    var returnObj = {message:"success"};
    var accessToken = req.body.accessToken;
    dbManager.getUserByAccessToken(accessToken, function(operator)
    {
      if(!operator)
      {
        res.json({message: "nopermission"});
        return;
      }
      
      if(operator.type == "admin")
      {
        var newUser = req.body.user;
        console.log(JSON.stringify(newUser));
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
        res.json({message: "nopermission"});
      }
    });
  };
  
  // Validate user's attributes with application criterias.
  var validateUser = function(user)
  {
    if(!user.password)
    {
      return "New user must have a password";
    }
    
	  if(user.name.length <= 0)
	  {
		  return "Name cannot be empty."
	  }
	  
	  if(user.password.length <= 0)
	  {
		  return "Password cannot be empty."
	  }
	  
	  if(user.password.length < 6)
	  {
      return "Password length should be at least 6 characters."
	  }
	  
	  return "valid";
  }
  
  // Inserts a new user. Used by saveUser method.
  var insertUser = function(user, res)
  {
    var validMessage = validateUser(user);
    if(validMessage == "valid")
    {
      passwordModule.cryptPassword(user.password,
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
              res.json({message:"success"});
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
  }
  
  // Update's already existing user. Used by saveUser method.
  var updateUser = function(user, existingUser, res, returnObj)
  {
    var returnObj = returnObj || {message:"success"};
    user._id = existingUser._id;
    if(!user.accessToken && existingUser.accessToken)
    {
      user.accessToken = existingUser.accessToken;
    }
    
    if(user.password)
    {
      passwordModule.cryptPassword(user.password, function(error, encryptedPassword)
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
  }
  
  // Deletes user.
  var deleteUser = function(req, res)
  {
    var accessToken = req.accessToken;
    var name = req.name;
    dbManager.getUserByAccessToken(accessToken, 
    function(operator)
    {
      if(!operator)
      {
        res.json({message:"no access token"});  
      }
      
      if(operator == "admin")
      {
        dbManager.removeFromCollection("users",{name:name}, 
        function(){
          res.json({message:"success"});
        });
      }
      else
      {
        res.json({message:"nopermission"});
      }
    });
  };
  
  // Brings all the users to the client
  var getUsers = function(req, res) 
  {
    var accessToken = req.body.accessToken;
    dbManager.getUserByAccessToken(accessToken, 
    function(operator)
    {
      if(!operator)
      {
        res.json({message: "nopermission"});
        return;
      }
      
      dbManager.getUsers(
      function(users)
      {
        for(var i = 0; i< users.length; i++)
        {
            if(users[i].pass)
            {
              users[i].pass = "";
            }
            if(users[i].accessToken)
            {
              users[i].accessToken = "";
            }
        }
        
        res.json(users); 
      });  
    });
  }
  
  // Brings user when access token is given.
  var getUser = function(req, res) 
  {
    var accessToken = req.body.accessToken;
    var requiredName = req.body.name;
    var requiredId = req.body._id;
    dbManager.getUserByAccessToken(accessToken, function(user)
    {
      if(!user)
      {
        console.log("user doesn't exist");
        res.json({message: "user doesn't exist"});
        return;
      }
      
      if(user.type == "admin")
      {
        if(requiredId)
        {
          dbManager.getUserById(requiredId, 
           function(requiredUser)
           {
             if(!requiredUser)
             {
               console.log("user doesn't exist");
                res.json({message: "user doesn't exist"});
                return;     
             }
             
              requiredUser.accessToken="";
              requiredUser.password="";
              res.json({user:requiredUser});
              return;
          });
        }
        else if(requiredName)
        {
          dbManager.getUserByName(requiredName, 
           function(requiredUser)
           {
             if(!requiredUser)
             {
               console.log("user doesn't exist");
                res.json({message: "user doesn't exist"});
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
  }
  
  
  
  // Creates a workspace with given access token of the user and workspace object.
  var saveWorkspace = function (req, res, next)
  {
    var accessToken = req.body.accessToken;
    var workspaceToSave = req.body.workspace;
    var returnObj = {message: "success"};
    dbManager.getUserByAccessToken(accessToken, 
      function(user)
      {
        var workspaceExist = false;
        if(user === null)
        {
          res.json({message: "nopermission"});
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
          }
        );
      }
    );
  };
  
  // Gets a workspace with given access token of the user and workspace id.
  var getWorkspace = function (req, res, next)
  {
    var accessToken = req.body.accessToken;
    var workspaceId = req.body.workspaceId;
    dbManager.getUserByAccessToken(accessToken, 
      function(user)
      {
        if(user === null)
        {
          res.json({message: "nopermission"});
        }
        
        if(typeof user.workspaces === 'undefined')
        {
          res.json({message: "There is no workspace created for this user yet."});
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
        
        res.json({message: "No workspace with given id for this user."});
      }
    );
  };
  
  // Gets a workspace with given access token of the user and workspace id.
  var saveMediaResource = function (req, res)
  {
        console.log(req.body.file);
        console.log(req.body.mediaResource);
        res.json({message: "Success"});
  };
  
  // Converts string true false to bool true false. other values returned as false.
  var stringToBool = function(boolString)
  {
    return (boolString === "true")? true : false;
  }
  
  // Just a web service test/
  var test = function(req, res) 
  {
    res.json({ message: 'working'});
  }
  
  var self = this;
}

module.exports = 
{
  WebServiceManager : WebServiceManager
}
