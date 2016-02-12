// server.js

// BASE SETUP
// =============================================================================
// call the packages we need
var path = require("path");
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var WebServiceManager = require('./webservices/webservicemodule').WebServiceManager;

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

var webServiceManager = new WebServiceManager(router);
webServiceManager.start();

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/presentation/public/login.html'));
});
app.use('/service', router);
app.use('/', express.static('./presentation/public'));
app.use('/script', express.static('./presentation/script'));
app.use('/css', express.static('./presentation/css'));
app.use('/media', express.static('./presentation/media'));
app.use('/fonts', express.static('./presentation/fonts'));
app.use('/favicon.ico', express.static('./presentation/media/favicon.ico'));
// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);

process.on('uncaughtException', function (err) {
	console.log(err.message);
	console.error(err.stack);
	process.exit(0);
});
