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
   
    // get all users, passwords and access tokens are removed
    router.post('/login', login);
   
    // get all users, passwords and access tokens are removed
    router.post('/createuser', createUser);
    
    // get all users, passwords and access tokens are removed
    router.get('/updateuser', updateUser);
    
    // get all users, passwords and access tokens are removed
    router.get('/deleteuser', deleteUser);
    
    // get all users, passwords and access tokens are removed
    router.get('/getusers', getUsers);
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
  var createUser = function (req, res, next){
    var accessToken = req.body.accesstoken;
    dbManager.getUserByAccessToken(accessToken, function(user)
    {
      if(user === null)
      {
        res.json({message: "nopermission"});
      }
      
      if(user.type == "admin")
      {
        dbManager.createUser(req.body.user,
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
