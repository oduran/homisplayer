// server.js

// BASE SETUP
// =============================================================================
// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var WebServiceManager = require('./webservices/webservicemodule').WebServiceManager;

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

var webServiceManager = new WebServiceManager(router);
webServiceManager.start();

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/service', router);
app.use('/', express.static('./presentation/public'));
app.use('/script', express.static('./presentation/script'));
app.use('/css', express.static('./presentation/css'));
app.use('/media', express.static('./presentation/media'));

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);