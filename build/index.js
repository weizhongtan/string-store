'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var app = (0, _express2.default)();
var port = process.env.PORT || 8000;
var ip = process.env.IP || 'localhost';
var mongoUrl = process.env.MONGODB_URI || 'mongodb://' + process.env.IP + '/local';

console.log(mongoUrl);

// apply body parser middleware to post requests
app.post(_bodyParser2.default.urlencoded({
  extended: true
}));
app.post(_bodyParser2.default.json());

// router for string creation
app.post('/messages/', function (req, res) {
  // extract the text from the post body
  var text = Object.getOwnPropertyNames(req.body);
  console.log(text);
  res.end();
});

// router for string retrieval
app.get('/messages/:id', function (req, res) {});

// default response
app.use('/*', function (req, res) {
  res.end('Usage: $domain/messages/ -d "message"');
});

app.listen(port, ip, function () {
  console.log('Server listening on ' + ip + ':' + port + '.');
});