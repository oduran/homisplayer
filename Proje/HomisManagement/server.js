/*
  Önder ALTINTAŞ 03.02.2016
  Server application.
*/

// BASE SETUP
// =============================================================================
// call the packages we need
var path = require("path");
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var busboy = require('connect-busboy'); //middleware for form/file upload
var cookieParser = require('cookie-parser');
var HomisWebServiceManager = require('./webservices/homiswebservicemodule').HomisWebServiceManager;

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true, limit: '100mb'}));
app.use(bodyParser.json({limit: '100mb'}));
app.use(busboy());
app.use(cookieParser());

var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router
var webServiceManager = new HomisWebServiceManager(router);
webServiceManager.start();

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.get('/', function(req, res) {
    if(req.cookies.accessToken)
    {
      res.sendFile(path.join(__dirname + '/presentation/public/manager.html'));
    }
    else
    {
      res.sendFile(path.join(__dirname + '/presentation/public/login.html'));
    }
});
app.use('/service', router);
app.use('/', express.static('./presentation/public'));
app.use('/script', express.static('./presentation/script'));
app.use('/css', express.static('./presentation/css'));
app.use('/media', express.static('./presentation/media'));
app.use('/fonts', express.static('./presentation/fonts'));
app.use('/favicon.ico', express.static('./presentation/media/favicon.ico'));
app.use('/themes', express.static('./webservices/themes'));
app.use('/logs', express.static('./webservices/logs'));
app.use('/mediaresources', express.static('./webservices/mediaresources'));
// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);

process.on('uncaughtException', function (err) {
	console.log(err.message);
	console.error(err.stack);
	process.exit(0);
});
