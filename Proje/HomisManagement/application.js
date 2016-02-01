var mongoose = require('mongoose');
var express = require('express');
mongoose.connect('mongodb://localhost/homis');
var db = mongoose.connection;
 
db.on('error', function (err) {
 console.log('connection error', err);
});
db.once('open', function () {
 console.log('connected.');
});


var Cat = mongoose.model('Cat', { name: String });

var kitty = new Cat({ name: 'Zildjian' });
kitty.save(function (err) {
  if (err) // ...
  console.log('meow');
});

console.log("done");
