'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var crypto = require('crypto');
var app = express();

// defaults port to 8000 if one is not given in the environment
var port = process.env.PORT || 8000;
var idLen = 32; // id string length for hex MD5 hash

// open database and collection (this must be done asyncronously)
var strings = void 0;
require('./model/db').initialize(function (collection) {
  strings = collection;

  // once db and collection is established, start listening
  app.listen(port, function () {
    console.log('Server listening on port ' + port + '.');
  });
});

// parse all application/x-www-form-urlencoded requests
app.use(bodyParser.urlencoded({ extended: true }));

/*
* route for string insertion
*/
app.post('/messages/', function (req, res) {
  // extract the text from the post body
  var text = Object.getOwnPropertyNames(req.body)[0];

  if (!text) {
    // reject invalid strings
    res.end('Invalid string.\n');
  } else if (text.length > 1000000) {
    // reject incredibly long strings
    res.end('Messages must be <1MB.\n');
  } else {
    (function () {
      // compute hash of text string
      var hash = crypto.createHash('md5').update(text).digest('hex');

      // define text document
      var doc = { _id: hash, text: text };

      // insert text doc into strings collection
      strings.insert(doc, { wtimeout: 1000 }, function (err, data) {
        if (err) {
          // catch errors due to index duplication
          if (err.code === 11000) {
            // return duplicate id to user
            res.end(JSON.stringify({ id: hash }) + '\n');
          } else {
            // deal with other errors
            console.warn('Couldn\'t insert text string into database.\n');
            res.end('Couldn\'t insert text string into database.\n');
          }
        } else {
          // return id to user
          res.end(JSON.stringify({ id: data.ops[0]._id }) + '\n');
        }
      });
    })();
  }
});

/*
* route for database stats retrieval
*/
app.get('/messages/stats', function (req, res) {
  strings.count({}, function (err, num) {
    if (err) {
      res.end('Could not retrieve stats.\n');
      return;
    }

    // return stats string
    res.end('There ' + (num === 1 ? 'is' : 'are') + ' ' + num + ' string' + (num === 1 ? '' : 's') + ' in the database.\n');
  });
});

/*
* route for string retrieval/deletion
*/
app.use('/messages/:id', function (req, res) {
  if (req.method === 'GET' || req.method === 'DELETE') {
    // extract id parameter from url
    var id = req.params.id;

    // validate id length
    if (id.length !== idLen) {
      // reject incorrect length hashes
      res.end('Id length should be ' + idLen + '.\n');
    } else {
      // process GET requests here
      if (req.method === 'GET') {
        // search for entry by index (binary tree search is very fast)
        strings.find({ _id: id })
        // convert cursor to array
        .toArray(function (err, docs) {
          if (err) {
            console.warn('Error finding text string.\n');
            res.end('Error finding text string.\n');
            return;
          }

          // send text as response
          var doc = docs[0];
          if (doc) {
            res.end('' + doc.text);
          } else {
            // reject id if not found in collection
            res.end('Id not found.\n');
          }
        });
      } else {
        // process DELETE requests
        strings.deleteOne({ _id: req.params.id }, function (err, data) {
          res.end('Text string with id: ' + req.params.id + ' was deleted.\n');
        });
      }
    }
  } else {
    res.end('Use GET or DELETE.\n');
  }
});

// default response
app.use('/*', function (req, res) {
  res.end('Usage: curl $domain/messages/ -d "message"\nor:    curl $domain/messages/id\nor:    curl $domain/messages/id -X DELETE\nor:    curl $domain/messages/stats\n');
});