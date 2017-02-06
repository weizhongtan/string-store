'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var crypto = require('crypto');
var app = express();

// defaults port to 8000 if one is not given in the environment
var port = process.env.PORT || 8000;
var idLen = 32; // id string length for hex MD5 hash

// open database and collection asyncronously
var strings = void 0;
require('./model/db').initialize(function (collection) {
  strings = collection;

  // once db and collection is established, start listening
  app.listen(port, function () {
    console.log('Server listening on port ' + port + '.');
  });
});

// parse all requests bodies as text
app.use(bodyParser.text({ type: '*/*' }));

/*
* route for string insertion
*/
app.post('/messages/', function (req, res) {
  // extract the text from the post body
  var text = req.body;

  // reject invalid strings (eg empty)
  if (!text) {
    res.end('Invalid string.\n');
    // reject incredibly long strings
  } else if (text.length > 1000000) {
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
            console.error(err);
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
      console.error(err);
      res.end('Could not retrieve stats.\n');
      return;
    }

    // return stats string
    res.end('There ' + (num === 1 ? 'is' : 'are') + ' ' + num + ' string' + (num === 1 ? '' : 's') + ' in the database.\n');
  });
});

/*
* route for database id's retrieval
*/
app.get('/messages/all', function (req, res) {
  strings.find({}).toArray(function (err, docs) {
    if (err) {
      console.error(err);
      res.end('Error retrieving text ids.\n');
      return;
    }

    // extract ids from all documents in the database and build response string
    var response = '';
    docs.forEach(function (doc) {
      response += doc._id + '\n';
    });

    res.end(response);
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
        strings.find({ _id: id }).toArray(function (err, docs) {
          if (err) {
            console.error(err);
            res.end('Error finding text string.\n');
            return;
          }

          // send text as response
          var doc = docs[0];
          if (doc) {
            res.end(doc.text + '\n');
          } else {
            // reject id if not found in collection
            res.end('Id not found.\n');
          }
        });
      } else {
        // process DELETE requests
        strings.deleteOne({ _id: req.params.id }, function (err, data) {
          if (err) {
            console.error(err);
            res.end('Text string with id: ' + req.params.id + ' could not be deleted. (it might not exist)');
            return;
          }

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
  res.end('Usage: curl $domain/messages/ -d "message"\nor:    curl $domain/messages/id\nor:    curl $domain/messages/id -X DELETE\nor:    curl $domain/messages/all\nor:    curl $domain/messages/stats\n');
});