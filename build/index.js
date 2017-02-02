'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;
var crypto = require('crypto');

var app = express();
var port = process.env.PORT || 8000;
var mongoUrl = process.env.MONGODB_URI || 'mongodb://' + ip + '/local';

// apply body parser middleware to post requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

// router for string creation
app.post('/messages/', function (req, res) {
  // extract the text from the post body
  var text = Object.getOwnPropertyNames(req.body)[0];

  // compute hash of text string
  var hash = crypto.createHash('md5').update(text).digest('hex');

  // open database
  MongoClient.connect(mongoUrl, function (err, db) {
    if (err) throw err;

    // open collection
    var strings = db.collection("strings");

    // define text document
    var doc = { _id: hash, text: text };

    strings.insert(doc, function (err, data) {
      if (err) {
        // catch errors due to index duplication
        if (err.code === 11000) {
          // return duplicate id to user
          res.end(JSON.stringify({ id: hash }));
        } else {
          // otherwise throw other errors
          throw err;
        }
      } else {
        // return id to user
        res.end(JSON.stringify({ id: data.ops[0]._id }));
      }

      // close database
      db.close();
    });
  });
});

// router for string retrieval
app.get('/messages/:id', function (req, res) {
  // extract id parameter from url
  var id = req.params.id;

  // validate id length
  if (id.length > 0) {
    // open database
    MongoClient.connect(mongoUrl, function (err, db) {
      if (err) throw err;

      // open collection
      var strings = db.collection("strings");

      // search for entry by index (binary tree search is very fast)
      strings.find({ _id: id })
      // convert cursor to array
      .toArray(function (err, docs) {
        var doc = docs[0];

        // send text as response
        if (doc) {
          res.end(doc.text);
        } else {
          // reject id
          res.end('Invalid id.');
        }
      });

      // close database
      db.close();
    });
  } else {
    // reject id
    res.end('Invalid id.');
  }
});

// default response
app.use('/*', function (req, res) {
  res.end('Usage: $domain/messages/ -d "message"\nor:    $domain/messages/id');
});

app.listen(port, function () {
  console.log('Server listening on port ' + port + '.');
});