var express = require('express');
var app = express();
var fs = require("fs");

app.get('/listUsers', function (req, res) {
       console.log( "hello" );
       res.end( "hello" );
})

var server = app.listen(86, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("Example app listening at http://%s:%s", host, port)

})
