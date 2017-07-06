var mongoose = require('mongoose'),
    Ticker = require('../models/tickers');
    
var path = process.cwd();

// Just use the default promise library
mongoose.Promise = global.Promise;

module.exports = function (app) { 
    
    app.get('/', function(req, res) {
        res.sendFile(path+'/public/index.html');
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
    });
    
    app.get('/addstock/:ticker', function(req, res) {
        var t = new Ticker();
        t.ticker = req.params.ticker.toUpperCase();
        t.save(function(err) {
            if (err) return err;
        });
    });

    app.get('/removestock/:ticker', function(req, res) {
        Ticker.find({ ticker:req.params.ticker.toUpperCase() }).remove().exec();
    });

};