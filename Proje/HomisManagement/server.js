// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var mongoConnector = require('./model/mongoconnector');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
  var query = "query sent ok!";
  var user = {name:"önder", surname:"altıntaş"};
  mongoConnector.executeDbQuery(
    function(db)
    {
      db.collection('users').insert(user, function(err, records) {
		    if (err) throw err;
		    console.log("here we are");
		    res.json({ message: 'hooray! welcome to our api! and the db connection:'+(typeof db).toString()+" query:"+query+" "+"Record added as "+JSON.stringify(records)});
	    });
    }
  );
});

// more routes for our API will happen here

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
