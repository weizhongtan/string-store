'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var app = express();

// defaults port to 8000 if one is not given in the environment
var port = process.env.PORT || 8000;

// open database and collection asyncronously
require('./model/db').initialize(function (collection) {
  var strings = collection;

  // parse all requests bodies as text
  app.use(bodyParser.text({ type: '*/*' }));

  // add routes
  app.use(require('./routes/get-all.js')(strings));
  app.use(require('./routes/get-stats.js')(strings));
  app.use(require('./routes/insert.js')(strings));
  app.use(require('./routes/get-or-delete-id.js')(strings));

  // default response
  app.use('/*', function (req, res) {
    res.end('Usage: curl $domain/messages/ -d "message"\n  or:    curl $domain/messages/id\n  or:    curl $domain/messages/id -X DELETE\n  or:    curl $domain/messages/all\n  or:    curl $domain/messages/stats\n');
  });

  // once db and collection is established, start listening
  app.listen(port, function () {
    console.log('Server listening on port ' + port + '.');
  });
});