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
    // test route to make sure everything is working (accessed at GET http://localhost:8080/api)
    router.get('/', test);
   
    // login to website. username, pass input, output is access token (could be as cookie in the future)
    router.post('/login', login);
   
    // creates user.
    router.post('/saveuser', saveUser);
    
    // deletes user.
    router.get('/deleteuser', deleteUser);
    
    // get all users, passwords and access tokens are removed.
    router.get('/getusers', getUsers);
    
    // creates workspace for user with given access token and workspace object.
    router.post('/saveworkspace', saveWorkspace);
    
    // creates workspace for user with given access token and workspace object.
    router.post('/getworkspace', getWorkspace);
  }
  
  /* Private Methods */
   // Creates a user.
  var login = function (req, res, next){
    var accessToken = req.body.username;
    var accessToken = req.body.password;
    dbManager.getUserByUsernamePass(username, password, function(user)
    {
      if(user === null)
      {
        res.json({message: "nopermission"});
      }
      
      user.accesstoken = createAccessToken(username);
      dbManager.updateUser(user, 
        function()
        {
          res.json({accesstoken: user.accesstoken});
        }
      );
      
    });
  };
  
  // Creates a user.
  var saveUser = function (req, res, next){
    var accessToken = req.body.accesstoken;
    dbManager.getUserByAccessToken(accessToken, function(user)
    {
      if(user === null)
      {
        res.json({message: "nopermission"});
      }
      
      if(user.type == "admin")
      {
        dbManager.saveUser(req.body.user,
          function(success)
          {
            res.json({message:"success"});
          }
        );
      }
      else
      {
        res.json({message: "nopermission"});
      }
    });
  };
  
  // Updates the user.
  var updateUser = function(req, res)  
  {
  
  };
  
  // Deletes user.
  var deleteUser = function(req, res)
  {
  
  };
  
  // Brings all the users to the client
  var getUsers = function(req, res) 
  {
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
      }
    );      
  }
  
  // Creates a workspace with given access token of the user and workspace object.
  var saveWorkspace = function (req, res, next){
    var accessToken = req.body.accesstoken;
    var workspaceExist = false;
    dbManager.getUserByAccessToken(accessToken, 
      function(user)
      {
        if(user === null)
        {
          res.json({message: "nopermission"});
          return;
        }
        
        if(typeof user.workspaces === 'undefined')
        {
          user.workspaces = [];
        }
        else
        {
          for(var i = 0;i < user.workspaces.length; i++)
          {
            if(user.workspaces[i].workspaceId == req.body.workspace.workspaceId)
            {
              user.workspaces[i] = req.body.workspace;
              workspaceExist = true;
            }
          }
          
          if(!workspaceExist)
          {
            user.workspaces.push(req.body.workspace);
          }
        }
        
        dbManager.updateUser(user,
          function()
          {
            res.json({message: "success"});
          }
        );
      }
    );
  };
  
  // Gets a workspace with given access token of the user and workspace id.
  var getWorkspace = function (req, res, next){
    var accessToken = req.body.accesstoken;
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
