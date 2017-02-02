'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var app = (0, _express2.default)();
var port = process.env.PORT || 8000;

app.use(_bodyParser2.default.urlencoded({
  extended: true
}));

app.use(_bodyParser2.default.json());

// router for string retrieval
app.post('/messages/', function (req, res) {
  res.write(JSON.stringify(Object.getOwnPropertyNames(req.body)));
});

app.use('/*', function (req, res) {
  res.end('Usage: $domain/messages/ -d "message"');
});

// router for string creation

app.listen(port, function () {
  console.log('Server listening on port ' + port + '.');
});