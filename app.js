var express = require('express');

var app = express();
var http = require('http').createServer(app);

var connection = require('./lib/connection.js')(http);

app.use(express.static('public'));
app.set('views', './views');
app.set('view engine', 'ejs');

app.get('/', function(req, res) {
    res.render('index', {});
});

var port = 9090;
http.listen(port, function() {
    console.log('Listening on ', port);
});
