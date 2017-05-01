var express = require('express');

var app = express();
var http = require('http').createServer(app);
var port = 9090;

app.use(express.static('public'));
app.set('views', './views');
app.set('view engine', 'ejs');

app.get('/', function(req, res) {
    res.render('index', {});
});

http.listen(port, function() {
    console.log('Listening on ', port);
});
