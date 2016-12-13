'use strict';

var names = [];

var express = require('express'),
    app = express(),
    routes = require('./app/routes/index.js'),
    http = require('http').Server(app),
    mongoose = require('mongoose'),
    Ticker = require('./app/models/tickers'),
    io = require('socket.io')(http);
    
require('dotenv').load();

mongoose.connect(process.env.MONGO_URI);

app.use('/public', express.static(process.cwd() + '/public'));

io.on('connection', function(socket){
  io.emit('names', names);
  socket.on('ticker', function(ticker){
    io.emit('ticker', ticker);
  });
  socket.on('delete', function(ticker){
    io.emit('delete', ticker);
  });
});

var path = process.cwd();

app.get('/', function(req, res) {
    res.sendFile(path+'/public/index.html')
});

app.get('/curlist', function(req, res) {
   Ticker.find({}, function(err, tickers) {
       if (err) return err;
    var arr = [];

    tickers.forEach(function(ticker) {
      arr.push(ticker.ticker);
    });

    res.send(arr);  
  });
})
    
app.get('/addstock/:ticker', function(req, res) {
    var t = new Ticker();
    t.ticker = req.params.ticker;
    t.save(function(err) {
        if (err) return err;
    });
});

app.get('/removestock/:ticker', function(req, res) {
    Ticker.find({ ticker:req.params.ticker }).remove().exec();
});

var port = process.env.PORT || 8080;
http.listen(port, function () {
   console.log('Node.js listening on port ' + port + '...');
});