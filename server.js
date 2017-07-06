'use strict';

var express = require('express'),
    app = express(),
    mongoose = require('mongoose'),
    http = require('http').Server(app),
    routes = require('./app/routes/index.js'),
    io = require('socket.io')(http);
    
var names = [];
    
require('dotenv').load();
mongoose.connect(process.env.MONGO_URI);

io.on('connection', function(socket){
    io.emit('names', names);
    socket.on('ticker', function(ticker){
        io.emit('ticker', ticker);
    });
    socket.on('delete', function(ticker){
        io.emit('delete', ticker);
    });
});

app.use('/public', express.static(process.cwd() + '/public'));

routes(app);

var port = process.env.PORT || 8080;
http.listen(port, function () {
   console.log('Node.js listening on port ' + port + '...');
});